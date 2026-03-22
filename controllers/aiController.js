const { decisionFallback, roadmapFallback } = require("../utils/aiFallbacks");
const ExamWorkspace = require("../models/ExamWorkspace");

const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const getGeminiApiKey = () => process.env.GEMINI_API_KEY || null;

function extractTextFromGeminiResponse(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
}

function parseJsonPayload(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  const fencedMatch =
    trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    return null;
  }
}

async function generateWithGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload?.error?.message || "Unable to reach Gemini API.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  return extractTextFromGeminiResponse(payload);
}

function buildExamAssistantFallback({ examName, question, progressSummary }) {
  const weakArea = progressSummary?.weakAreas?.[0] || progressSummary?.highPriorityPendingTopics?.[0] || "your highest-priority pending topic";
  const nextRevision = progressSummary?.pendingRevisionSprints?.[0] || "your next revision sprint";
  const relatedTopics = [
    ...(progressSummary?.highPriorityPendingTopics || []).slice(0, 2),
    ...(progressSummary?.weakAreas || []).slice(0, 1)
  ].filter(Boolean);

  return {
    answer: `For ${examName}, the question "${question}" should be approached through the lens of your current progress. Right now, ${weakArea} needs the most attention, so the best move is to first make the concept clear, then solve a few targeted problems or revision prompts, and finally connect it back to the broader syllabus instead of studying it in isolation.`,
    suggestedNextSteps: [
      `Revise ${weakArea} with a focused 30 to 45 minute concept-first session.`,
      `Solve one short targeted practice block related to ${weakArea} and review every mistake.`,
      `Use ${nextRevision} to reconnect this doubt with your current revision cycle.`
    ],
    relatedTopics: relatedTopics.length ? relatedTopics : ["Core concepts", "Mock analysis", "Revision planning"]
  };
}

function buildCustomExamGuideFallback({ examName, goalContext }) {
  const label = examName.trim();
  const goal = goalContext?.trim() || `Prepare for ${label}`;

  return {
    name: label,
    difficulty: "High",
    overview: `${goal}. This custom workspace is structured for consistent preparation and measurable progress.`,
    roadmap: [
      "Understand pattern, scoring logic, and past-year trends before starting deep study.",
      "Identify high-weight topics and plan weekly coverage with clear milestones.",
      "Run section-wise practice and maintain an error log to remove repeated mistakes.",
      "Shift into full-length mocks with weekly analysis and corrective revision.",
      "Use a final revision sprint focused on weak areas and exam temperament."
    ],
    resources: [
      `Official syllabus and exam handbook for ${label}`,
      "Previous year papers with trend analysis",
      "Section-wise mock test series",
      "Concise revision notes and formula sheets"
    ],
    syllabus: [
      {
        title: "Core fundamentals",
        category: "Core",
        weight: 9,
        description: "Build conceptual foundations needed for solving medium and hard questions."
      },
      {
        title: "High-weight topics",
        category: "Scoring",
        weight: 10,
        description: "Focus on topics with maximum impact on final score."
      },
      {
        title: "Timed practice",
        category: "Practice",
        weight: 8,
        description: "Improve pace, section switching, and decision-making under time pressure."
      },
      {
        title: "Revision loops",
        category: "Revision",
        weight: 8,
        description: "Repeated short revision cycles to improve retention and confidence."
      },
      {
        title: "Mock analysis",
        category: "Performance",
        weight: 9,
        description: "Track weak areas and optimize strategy using performance data."
      }
    ],
    mock_sections: [
      { title: "Section 1", target_score: 70, max_score: 100 },
      { title: "Section 2", target_score: 70, max_score: 100 },
      { title: "Section 3", target_score: 70, max_score: 100 }
    ],
    revision_plan: [
      {
        title: "Foundation reset sprint",
        duration: "5 days",
        focus: "Core concept revision and targeted concept tests",
        outcome: "Better conceptual clarity and reduced basic mistakes."
      },
      {
        title: "Weak-area correction sprint",
        duration: "4 days",
        focus: "Error log cleanup and weak topic reinforcement",
        outcome: "More stable scores in previously weak sections."
      },
      {
        title: "Final simulation sprint",
        duration: "6 days",
        focus: "Timed full-test practice and exam-day strategy",
        outcome: "Higher confidence, better pace, and cleaner execution."
      }
    ]
  };
}

async function storeExamAssistantExchange({ userId, examSlug, workspaceState, reply, question }) {
  const workspace = await ExamWorkspace.findOneAndUpdate(
    { user_id: userId, exam_slug: examSlug },
    {
      $set: {
        syllabus: workspaceState?.syllabus || {},
        revision: workspaceState?.revision || {},
        mock_history: (workspaceState?.mockHistory || []).map((entry) => ({
          id: entry.id,
          taken_at: entry.taken_at,
          scores: entry.scores,
          overall: entry.overall
        })),
        notes: workspaceState?.notes || ""
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  workspace.assistant_history.push({
    question,
    answer: reply.answer,
    suggestedNextSteps: reply.suggestedNextSteps || [],
    relatedTopics: reply.relatedTopics || [],
    created_at: new Date()
  });

  if (workspace.assistant_history.length > 20) {
    workspace.assistant_history = workspace.assistant_history.slice(-20);
  }

  await workspace.save();
}

const analyzeDecision = async (req, res) => {
  try {
    const {
      optionA,
      optionB,
      budget = "",
      location = "",
      riskTolerance = "Medium",
      priorities = [],
      customCriteria = [],
      contextNotes = ""
    } = req.body;

    if (!optionA || !optionB) {
      return res.status(400).json({ error: "Both decision options are required." });
    }

    const decisionSettings = {
      budget,
      location,
      riskTolerance,
      priorities,
      customCriteria,
      contextNotes
    };

    const fallback = decisionFallback(optionA, optionB, decisionSettings);
    if (!getGeminiApiKey()) {
      return res.json({ analysis: fallback });
    }

    const prompt = `You are helping a user compare two life or career decisions. Return valid JSON only with this exact structure: { overview, recommendation, preference_profile: { budget, location, risk_tolerance, priorities: [{ label, weight, note }], custom_criteria: [{ label, weight, note }], context_notes }, criteria_breakdown: [{ label, weight, optionA, optionB, rationale }], weighted_scores: { optionA, optionB, recommendation }, optionA_pros, optionA_cons, optionB_pros, optionB_cons, salary_growth, risk_level, time_investment, future_opportunities, skills_required, long_term_outlook, future_enhancements }. Use arrays of strings where appropriate. criteria_breakdown optionA/optionB scores should be numeric from 1 to 10. weighted_scores optionA/optionB should also be numeric from 1 to 10. salary_growth should contain 4 objects with label, optionA, optionB numeric values. risk_level should contain 5 objects with category, optionA, optionB numeric values from 1 to 10. Compare: ${optionA} versus ${optionB}. User preference profile: ${JSON.stringify(decisionSettings)}. Keep the answer practical, nuanced, and student-friendly.`;

    const raw = await generateWithGemini(prompt);
    const parsed = parseJsonPayload(raw || "");
    return res.json({ analysis: parsed && parsed.overview ? parsed : fallback });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to analyze decision." });
  }
};

const examAssistant = async (req, res) => {
  try {
    const { examSlug, examName, question, workspaceState, progressSummary, syllabusTopics = [] } = req.body;

    if (!examSlug || !examName || !question) {
      return res.status(400).json({ error: "Exam slug, exam name, and question are required." });
    }

    const fallback = buildExamAssistantFallback({ examName, question, progressSummary });
    let reply = fallback;

    if (getGeminiApiKey()) {
      const prompt = `You are PathPilot Exam Assistant. You are helping a student preparing for ${examName}. Answer only in the context of this exam and its syllabus. Be student-friendly, practical, and concise. If the student asks something outside the exam syllabus, say that clearly. Use the student's current progress to personalize the answer. Do not ignore their weak areas, mock performance, or pending revision tasks. Student question: ${question}. Student progress: ${JSON.stringify(progressSummary)}. Syllabus snapshot: ${JSON.stringify(syllabusTopics)}. Return valid JSON only with this exact shape: { answer, suggestedNextSteps, relatedTopics }.`;
      const raw = await generateWithGemini(prompt);
      const parsed = parseJsonPayload(raw || "");
      if (parsed?.answer) {
        reply = {
          answer: parsed.answer,
          suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) ? parsed.suggestedNextSteps : fallback.suggestedNextSteps,
          relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : fallback.relatedTopics
        };
      }
    }

    await storeExamAssistantExchange({
      userId: req.user.id,
      examSlug,
      workspaceState,
      reply,
      question
    });

    return res.json({ reply });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to answer exam question." });
  }
};

const generateRoadmap = async (req, res) => {
  try {
    const { goal, goalType } = req.body;
    if (!goal) {
      return res.status(400).json({ error: "Goal is required." });
    }

    const fallback = roadmapFallback(goal);
    if (!getGeminiApiKey()) {
      return res.json({ steps: fallback });
    }

    const prompt = `You are generating a roadmap for a user goal. Return valid JSON only with this exact structure: { steps: [{ title, description, estimated_time, skills }] }. Generate 6 to 8 steps for the goal "${goal}". Goal type: ${goalType || "general"}. Make the roadmap actionable, realistic, and suitable for a student or professional. skills must be an array of concise strings.`;

    const raw = await generateWithGemini(prompt);
    const parsed = parseJsonPayload(raw || "");
    return res.json({ steps: Array.isArray(parsed?.steps) ? parsed.steps : fallback });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to generate roadmap." });
  }
};

const generateCustomExamGuide = async (req, res) => {
  try {
    const { examName, goalContext = "" } = req.body;

    if (!examName || !examName.trim()) {
      return res.status(400).json({ error: "Exam name is required." });
    }

    const fallback = buildCustomExamGuideFallback({ examName, goalContext });

    if (!getGeminiApiKey()) {
      return res.json({ guide: fallback });
    }

    const prompt = `You generate a custom exam-prep blueprint for a student. Return valid JSON only with this exact shape: { name, difficulty, overview, roadmap, resources, syllabus, mock_sections, revision_plan }. Rules: difficulty should be one of [Moderate, High, Very High]. roadmap should contain 4 to 6 concise strings. resources should contain 3 to 6 concise strings. syllabus should contain 5 to 8 objects with { title, category, weight, description } and weight from 1 to 10. mock_sections should contain 3 objects with { title, target_score, max_score } where target_score and max_score are numbers and max_score should be 100. revision_plan should contain 3 objects with { title, duration, focus, outcome }. Exam name: ${examName}. Goal context: ${goalContext || "Not provided"}. Keep it practical and realistic.`;

    const raw = await generateWithGemini(prompt);
    const parsed = parseJsonPayload(raw || "");

    if (!parsed?.name || !Array.isArray(parsed?.syllabus) || !Array.isArray(parsed?.mock_sections) || !Array.isArray(parsed?.revision_plan)) {
      return res.json({ guide: fallback });
    }

    return res.json({
      guide: {
        name: parsed.name,
        difficulty: parsed.difficulty || fallback.difficulty,
        overview: parsed.overview || fallback.overview,
        roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : fallback.roadmap,
        resources: Array.isArray(parsed.resources) ? parsed.resources : fallback.resources,
        syllabus: parsed.syllabus,
        mock_sections: parsed.mock_sections,
        revision_plan: parsed.revision_plan
      }
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to generate custom exam guide." });
  }
};

module.exports = {
  analyzeDecision,
  examAssistant,
  generateCustomExamGuide,
  generateRoadmap
};
