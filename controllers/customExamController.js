const CustomExam = require("../models/CustomExam");

const formatCustomExam = (exam) => ({
  slug: exam.slug,
  name: exam.name,
  difficulty: exam.difficulty,
  overview: exam.overview,
  roadmap: exam.roadmap || [],
  resources: exam.resources || [],
  syllabus: (exam.syllabus || []).map((topic) => ({
    id: topic.id,
    title: topic.title,
    category: topic.category,
    weight: topic.weight,
    description: topic.description
  })),
  mock_sections: (exam.mock_sections || []).map((section) => ({
    id: section.id,
    title: section.title,
    target_score: section.target_score,
    max_score: section.max_score
  })),
  revision_plan: (exam.revision_plan || []).map((item) => ({
    id: item.id,
    title: item.title,
    duration: item.duration,
    focus: item.focus,
    outcome: item.outcome
  }))
});

const getCustomExams = async (req, res) => {
  try {
    const exams = await CustomExam.find({ user_id: req.user.id }).sort({ createdAt: 1 });
    return res.json({ exams: exams.map(formatCustomExam) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load custom exams." });
  }
};

const createCustomExam = async (req, res) => {
  try {
    const { exam } = req.body;

    if (!exam?.slug || !exam?.name) {
      return res.status(400).json({ error: "Valid exam payload is required." });
    }

    const saved = await CustomExam.findOneAndUpdate(
      { user_id: req.user.id, slug: exam.slug },
      {
        $set: {
          name: exam.name,
          difficulty: exam.difficulty,
          overview: exam.overview,
          roadmap: exam.roadmap || [],
          resources: exam.resources || [],
          syllabus: exam.syllabus || [],
          mock_sections: exam.mock_sections || [],
          revision_plan: exam.revision_plan || []
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ exam: formatCustomExam(saved) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to save custom exam." });
  }
};

module.exports = {
  createCustomExam,
  getCustomExams
};
