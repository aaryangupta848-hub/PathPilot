import type { ExamBlueprint, ExamGuide } from "@/types";

const CUSTOM_EXAMS_STORAGE_KEY = "pathpilot-custom-exams";

type CustomExamInput = {
  name: string;
  goal: string;
  difficulty: string;
  existingSlugs: string[];
};

function toSlug(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "custom-exam";
}

function uniqueSlug(baseSlug: string, existingSlugs: string[]) {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  while (existingSlugs.includes(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

function clampWeight(value: number) {
  return Math.min(10, Math.max(1, Math.round(value || 5)));
}

function clampScore(value: number) {
  return Math.min(100, Math.max(1, Math.round(value || 70)));
}

function ensureExamShape(exam: ExamGuide): ExamGuide {
  const slug = toSlug(exam.slug || exam.name);

  return {
    ...exam,
    slug,
    name: exam.name?.trim() || "Custom Exam",
    difficulty: exam.difficulty?.trim() || "Custom",
    overview: exam.overview?.trim() || "Custom exam workspace generated for your target.",
    roadmap: Array.isArray(exam.roadmap) ? exam.roadmap.slice(0, 6) : [],
    resources: Array.isArray(exam.resources) ? exam.resources.slice(0, 6) : [],
    syllabus: Array.isArray(exam.syllabus)
      ? exam.syllabus.map((topic, index) => ({
          id: topic.id || `${slug}-topic-${index + 1}`,
          title: topic.title,
          category: topic.category || "Core",
          weight: clampWeight(topic.weight),
          description: topic.description || "Core topic for this exam."
        }))
      : [],
    mock_sections: Array.isArray(exam.mock_sections)
      ? exam.mock_sections.map((section, index) => ({
          id: section.id || `${slug}-section-${index + 1}`,
          title: section.title || `Section ${index + 1}`,
          target_score: clampScore(section.target_score),
          max_score: clampScore(section.max_score || 100)
        }))
      : [],
    revision_plan: Array.isArray(exam.revision_plan)
      ? exam.revision_plan.map((item, index) => ({
          id: item.id || `${slug}-revision-${index + 1}`,
          title: item.title || `Revision sprint ${index + 1}`,
          duration: item.duration || "5 days",
          focus: item.focus || "Focused revision",
          outcome: item.outcome || "Better retention and accuracy."
        }))
      : []
  };
}

export function buildCustomExamGuide({ name, goal, difficulty, existingSlugs }: CustomExamInput): ExamGuide {
  const slug = uniqueSlug(toSlug(name), existingSlugs);
  const label = name.trim();
  const goalSummary = goal.trim();

  return {
    slug,
    name: label,
    difficulty,
    overview: goalSummary || `Custom plan focused on cracking ${label} with a practical strategy.`,
    roadmap: [
      `Define your target for ${label} and split it into weekly measurable milestones.`,
      "Build a priority-first subject list and schedule high-impact topics first.",
      "Track mocks, analyze weak areas, and adjust your revision loop every week.",
      "Use a final exam simulation phase for pace, confidence, and consistency."
    ],
    resources: [
      `Official syllabus and pattern resources for ${label}`,
      "Topic-wise concept notes and revision sheets",
      "Sectional mocks with post-test analysis",
      "Previous year papers and mistake log"
    ],
    syllabus: [
      {
        id: `${slug}-foundation`,
        title: "Foundation concepts",
        category: "Core",
        weight: 9,
        description: "Strengthen essential concepts and baseline understanding for this exam."
      },
      {
        id: `${slug}-highweight`,
        title: "High-weight topics",
        category: "Scoring",
        weight: 10,
        description: "Prioritize topics that can shift your score fastest."
      },
      {
        id: `${slug}-practice`,
        title: "Timed problem practice",
        category: "Practice",
        weight: 8,
        description: "Improve speed, accuracy, and section switching under pressure."
      },
      {
        id: `${slug}-revision`,
        title: "Revision and retention",
        category: "Revision",
        weight: 8,
        description: "Run repeated short revision loops to improve recall and consistency."
      },
      {
        id: `${slug}-analysis`,
        title: "Mock analysis",
        category: "Performance",
        weight: 9,
        description: "Use mock review data to identify weak areas and optimize your strategy."
      }
    ],
    mock_sections: [
      { id: `${slug}-section-1`, title: "Section 1", target_score: 70, max_score: 100 },
      { id: `${slug}-section-2`, title: "Section 2", target_score: 70, max_score: 100 },
      { id: `${slug}-section-3`, title: "Section 3", target_score: 70, max_score: 100 }
    ],
    revision_plan: [
      {
        id: `${slug}-revision-1`,
        title: "Concept reset sprint",
        duration: "5 days",
        focus: "Core concept revision and rapid practice loops",
        outcome: "Stronger concept recall and fewer basic mistakes."
      },
      {
        id: `${slug}-revision-2`,
        title: "Mock review sprint",
        duration: "4 days",
        focus: "Error log cleanup and weak-area correction",
        outcome: "Higher confidence in previously low-scoring sections."
      },
      {
        id: `${slug}-revision-3`,
        title: "Final simulation sprint",
        duration: "6 days",
        focus: "Timed full-test simulation and recovery plan",
        outcome: "Better test-day pace, accuracy, and decision-making."
      }
    ]
  };
}

export function buildCustomExamGuideFromBlueprint({
  blueprint,
  goal,
  existingSlugs
}: {
  blueprint: ExamBlueprint;
  goal: string;
  existingSlugs: string[];
}) {
  const baseName = blueprint.name?.trim() || "Custom Exam";
  const slug = uniqueSlug(toSlug(baseName), existingSlugs);

  const exam: ExamGuide = {
    slug,
    name: baseName,
    difficulty: blueprint.difficulty || "Custom",
    overview: blueprint.overview || goal || `Custom plan for ${baseName}.`,
    roadmap: (blueprint.roadmap || []).slice(0, 6),
    resources: (blueprint.resources || []).slice(0, 6),
    syllabus: (blueprint.syllabus || []).slice(0, 8).map((topic, index) => ({
      id: `${slug}-topic-${index + 1}`,
      title: topic.title,
      category: topic.category || "Core",
      weight: clampWeight(topic.weight),
      description: topic.description || "Priority topic for this exam."
    })),
    mock_sections: (blueprint.mock_sections || []).slice(0, 4).map((section, index) => ({
      id: `${slug}-section-${index + 1}`,
      title: section.title || `Section ${index + 1}`,
      target_score: clampScore(section.target_score),
      max_score: clampScore(section.max_score || 100)
    })),
    revision_plan: (blueprint.revision_plan || []).slice(0, 4).map((item, index) => ({
      id: `${slug}-revision-${index + 1}`,
      title: item.title || `Revision sprint ${index + 1}`,
      duration: item.duration || "5 days",
      focus: item.focus || "Focused revision",
      outcome: item.outcome || "Improved consistency."
    }))
  };

  return ensureExamShape(exam);
}

export function getStoredCustomExams() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CUSTOM_EXAMS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ExamGuide[]).map(ensureExamShape) : [];
  } catch {
    return [];
  }
}

export function saveCustomExams(exams: ExamGuide[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CUSTOM_EXAMS_STORAGE_KEY, JSON.stringify(exams));
}
