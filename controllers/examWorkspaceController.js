const ExamWorkspace = require("../models/ExamWorkspace");

const formatWorkspace = (workspace) => ({
  exam_slug: workspace.exam_slug,
  syllabus: workspace.syllabus || {},
  revision: workspace.revision || {},
  mockHistory: (workspace.mock_history || []).map((entry) => ({
    id: entry.id,
    taken_at: new Date(entry.taken_at).toISOString(),
    scores: entry.scores || {},
    overall: entry.overall
  })),
  notes: workspace.notes || "",
  assistantHistory: (workspace.assistant_history || []).map((entry) => ({
    question: entry.question,
    answer: entry.answer,
    suggestedNextSteps: entry.suggestedNextSteps || [],
    relatedTopics: entry.relatedTopics || [],
    created_at: new Date(entry.created_at).toISOString()
  }))
});

const buildEmptyWorkspace = (examSlug) => ({
  exam_slug: examSlug,
  syllabus: {},
  revision: {},
  mockHistory: [],
  notes: "",
  assistantHistory: []
});

const getExamWorkspace = async (req, res) => {
  try {
    const workspace = await ExamWorkspace.findOne({ user_id: req.user.id, exam_slug: req.params.slug });
    return res.json({ workspace: workspace ? formatWorkspace(workspace) : buildEmptyWorkspace(req.params.slug) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load exam workspace." });
  }
};

const saveExamWorkspace = async (req, res) => {
  try {
    const { syllabus = {}, revision = {}, mockHistory = [], notes = "" } = req.body;

    const workspace = await ExamWorkspace.findOneAndUpdate(
      { user_id: req.user.id, exam_slug: req.params.slug },
      {
        $set: {
          syllabus,
          revision,
          mock_history: mockHistory.map((entry) => ({
            id: entry.id,
            taken_at: entry.taken_at,
            scores: entry.scores,
            overall: entry.overall
          })),
          notes
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ workspace: formatWorkspace(workspace) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to save exam workspace." });
  }
};

module.exports = {
  buildEmptyWorkspace,
  formatWorkspace,
  getExamWorkspace,
  saveExamWorkspace
};