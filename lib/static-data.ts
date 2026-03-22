import { ExamGuide, SkillRoadmap } from "@/types";

export const examGuides: ExamGuide[] = [
  {
    slug: "upsc",
    name: "UPSC",
    difficulty: "Very High",
    overview:
      "India's most competitive civil services exam with a broad syllabus covering polity, economy, ethics, optional subjects, and current affairs.",
    roadmap: [
      "Build NCERT fundamentals across history, geography, polity, and economics.",
      "Create a current affairs system with daily notes and weekly revisions.",
      "Practice answer writing early for Mains while running a parallel prelims MCQ track.",
      "Reserve the final months for mocks, optional subject mastery, and interview prep."
    ],
    resources: [
      "NCERT textbooks",
      "Laxmikanth for Polity",
      "The Hindu or Indian Express",
      "Previous year UPSC papers"
    ],
    syllabus: [
      { id: "polity", title: "Polity and governance", category: "GS", weight: 9, description: "Constitution, governance, rights, parliament, and public administration basics." },
      { id: "economy", title: "Economy and budgeting", category: "GS", weight: 8, description: "Macro economy, banking, schemes, fiscal policy, and budget literacy." },
      { id: "history", title: "Modern history", category: "GS", weight: 8, description: "Freedom struggle, reform movements, and modern India timeline mastery." },
      { id: "geography", title: "Geography and environment", category: "GS", weight: 7, description: "Physical geography, mapping, ecosystems, and climate-linked topics." },
      { id: "ethics", title: "Ethics and essay writing", category: "Mains", weight: 7, description: "Ethics frameworks, case studies, answer writing, and essay structure." }
    ],
    mock_sections: [
      { id: "prelims-gs", title: "Prelims GS", target_score: 70, max_score: 100 },
      { id: "csat", title: "CSAT", target_score: 65, max_score: 100 },
      { id: "mains-answers", title: "Mains answer writing", target_score: 60, max_score: 100 }
    ],
    revision_plan: [
      { id: "upsc-revision-1", title: "Static foundation sprint", duration: "2 weeks", focus: "NCERTs, polity, history, and geography basics", outcome: "Tighter recall on high-frequency static topics." },
      { id: "upsc-revision-2", title: "Current affairs consolidation", duration: "10 days", focus: "Schemes, editorials, economy, and issue-based notes", outcome: "Sharper linking of news with mains-ready arguments." },
      { id: "upsc-revision-3", title: "Mains writing reset", duration: "7 days", focus: "Essay flow, ethics case studies, and answer structure", outcome: "Higher scoring and more structured written responses." }
    ]
  },
  {
    slug: "cat",
    name: "CAT",
    difficulty: "High",
    overview:
      "A fast-paced management entrance exam focused on quant, verbal ability, and logical reasoning with high competition and percentile-based outcomes.",
    roadmap: [
      "Diagnose your baseline in Quant, VARC, and DILR using a full-length mock.",
      "Focus on concept repair in weak areas while maintaining timed practice.",
      "Increase mock frequency and review every error log deeply.",
      "Refine section strategy, pacing, and question selection in the final phase."
    ],
    resources: [
      "Arun Sharma series",
      "IMS or TIME mock tests",
      "Aeon essays for reading comprehension",
      "Past CAT papers"
    ],
    syllabus: [
      { id: "quant-arithmetic", title: "Arithmetic and algebra", category: "Quant", weight: 9, description: "Percentages, ratios, TSD, algebra, inequalities, and word problems." },
      { id: "quant-number", title: "Number systems and geometry", category: "Quant", weight: 7, description: "Number properties, divisibility, geometry, mensuration, and coordinate basics." },
      { id: "varc-rc", title: "Reading comprehension", category: "VARC", weight: 9, description: "Passage understanding, inference, tone, and elimination-based solving." },
      { id: "varc-verbal", title: "Verbal logic", category: "VARC", weight: 7, description: "Para jumbles, summary, odd sentence out, and grammar sensitivity." },
      { id: "dilr", title: "Data interpretation and logical reasoning", category: "DILR", weight: 10, description: "Sets, arrangements, Venn diagrams, tables, games, and puzzle selection." }
    ],
    mock_sections: [
      { id: "quant", title: "Quant", target_score: 75, max_score: 100 },
      { id: "varc", title: "VARC", target_score: 75, max_score: 100 },
      { id: "dilr", title: "DILR", target_score: 70, max_score: 100 }
    ],
    revision_plan: [
      { id: "cat-revision-1", title: "Quant repair sprint", duration: "7 days", focus: "Arithmetic, algebra, and speed drills", outcome: "Improved question selection and lower silly-error rate." },
      { id: "cat-revision-2", title: "VARC consistency block", duration: "6 days", focus: "Daily RC sets, para jumbles, and summaries", outcome: "More stable verbal accuracy across mocks." },
      { id: "cat-revision-3", title: "DILR set selection camp", duration: "5 days", focus: "Timed set picking and post-mock pattern review", outcome: "Better judgment on which sets to attempt and skip." }
    ]
  },
  {
    slug: "gate",
    name: "GATE",
    difficulty: "High",
    overview:
      "A technical graduate-level engineering exam that rewards conceptual clarity, formula retention, and disciplined problem solving.",
    roadmap: [
      "Map the syllabus and prioritize high-weight subjects first.",
      "Create concise revision notes for formulas, exceptions, and standard results.",
      "Solve topic-wise PYQs and then move to timed mixed tests.",
      "Use the final stretch for formula revision and full-length simulations."
    ],
    resources: [
      "Made Easy or ACE notes",
      "Previous year GATE papers",
      "NPTEL lectures",
      "Subject-wise practice books"
    ],
    syllabus: [
      { id: "core-subjects", title: "Core technical subjects", category: "Core", weight: 10, description: "Primary engineering subjects with the highest scoring potential." },
      { id: "engineering-math", title: "Engineering mathematics", category: "Math", weight: 8, description: "Linear algebra, calculus, differential equations, and probability." },
      { id: "aptitude", title: "General aptitude", category: "Aptitude", weight: 6, description: "English usage, numerical reasoning, and basic logical problems." },
      { id: "formula-recall", title: "Formula revision and shortcuts", category: "Revision", weight: 7, description: "Revision sheets, derivations, and memory recall for fast solving." },
      { id: "pyq", title: "Previous year question mastery", category: "Practice", weight: 9, description: "Pattern recognition, topic coverage, and exam-level familiarity." }
    ],
    mock_sections: [
      { id: "core", title: "Core subjects", target_score: 78, max_score: 100 },
      { id: "math", title: "Engineering math", target_score: 72, max_score: 100 },
      { id: "aptitude", title: "General aptitude", target_score: 80, max_score: 100 }
    ],
    revision_plan: [
      { id: "gate-revision-1", title: "Core subject reset", duration: "8 days", focus: "High-weight core units and formula-linked concepts", outcome: "Stronger core-subject hit rate in mixed mocks." },
      { id: "gate-revision-2", title: "Math compression block", duration: "5 days", focus: "Repeated engineering math drills and formula recap", outcome: "Faster and more accurate math execution." },
      { id: "gate-revision-3", title: "PYQ and mock review", duration: "6 days", focus: "Error log review, PYQs, and timed practice", outcome: "Better exam temperament and question triage." }
    ]
  },
  {
    slug: "jee",
    name: "JEE",
    difficulty: "Very High",
    overview:
      "A rigorous engineering entrance exam demanding strong PCM fundamentals, speed, and sustained practice over a long preparation arc.",
    roadmap: [
      "Strengthen foundational theory in physics, chemistry, and mathematics.",
      "Alternate between concept study and daily problem sets.",
      "Track mistakes chapter-wise and revisit weak patterns weekly.",
      "Simulate the real paper frequently and optimize exam temperament."
    ],
    resources: [
      "HC Verma",
      "Cengage series",
      "NCERT chemistry",
      "NTA Abhyas and PYQs"
    ],
    syllabus: [
      { id: "physics", title: "Physics problem solving", category: "Physics", weight: 9, description: "Mechanics, electromagnetism, modern physics, and numerical rigor." },
      { id: "chemistry", title: "Chemistry retention", category: "Chemistry", weight: 8, description: "Physical, organic, and inorganic chemistry with revision-heavy recall." },
      { id: "math", title: "Mathematics speed", category: "Math", weight: 9, description: "Calculus, algebra, coordinate geometry, and question selection speed." },
      { id: "mixed-tests", title: "Mixed chapter testing", category: "Mocks", weight: 7, description: "Blend topics together to improve switching and exam pacing." },
      { id: "error-log", title: "Error log and revision", category: "Revision", weight: 8, description: "Mistake patterns, formula slips, and repeated weak topics." }
    ],
    mock_sections: [
      { id: "physics", title: "Physics", target_score: 72, max_score: 100 },
      { id: "chemistry", title: "Chemistry", target_score: 75, max_score: 100 },
      { id: "math", title: "Mathematics", target_score: 72, max_score: 100 }
    ],
    revision_plan: [
      { id: "jee-revision-1", title: "PCM balance sprint", duration: "7 days", focus: "Top-priority chapters across physics, chemistry, and math", outcome: "More balanced scoring across all three subjects." },
      { id: "jee-revision-2", title: "Formula and error log loop", duration: "5 days", focus: "Quick revision sheets and mistake clusters", outcome: "Reduced repeat errors in time-bound mocks." },
      { id: "jee-revision-3", title: "Full-paper simulation block", duration: "6 days", focus: "Paper temperament, accuracy, and stamina", outcome: "Stronger actual-test execution under pressure." }
    ]
  },
  {
    slug: "ssc",
    name: "SSC",
    difficulty: "Moderate",
    overview:
      "A popular government exam pathway with strong emphasis on aptitude, English, reasoning, and general awareness.",
    roadmap: [
      "Build arithmetic speed and shortcut familiarity.",
      "Practice English grammar, vocabulary, and reading accuracy daily.",
      "Solve section tests for reasoning and general awareness.",
      "Run timed mocks and improve question ordering strategy."
    ],
    resources: [
      "Kiran SSC PYQs",
      "Lucent GK",
      "Plinth to Paramount",
      "Online sectional mock tests"
    ],
    syllabus: [
      { id: "quant", title: "Quantitative aptitude", category: "Quant", weight: 9, description: "Arithmetic, algebra basics, simplification, and calculation speed." },
      { id: "english", title: "English language", category: "English", weight: 8, description: "Grammar, vocabulary, cloze test, and comprehension practice." },
      { id: "reasoning", title: "Reasoning ability", category: "Reasoning", weight: 8, description: "Analogy, coding-decoding, series, and puzzle-style questions." },
      { id: "gk", title: "General awareness", category: "GK", weight: 7, description: "Static GK, current affairs, and fact retention through quick revision." },
      { id: "speed", title: "Section timing strategy", category: "Mocks", weight: 6, description: "Question ordering, speed, and attempt discipline in timed papers." }
    ],
    mock_sections: [
      { id: "quant", title: "Quant", target_score: 75, max_score: 100 },
      { id: "english", title: "English", target_score: 78, max_score: 100 },
      { id: "reasoning-gk", title: "Reasoning + GK", target_score: 72, max_score: 100 }
    ],
    revision_plan: [
      { id: "ssc-revision-1", title: "Quant and speed drill", duration: "5 days", focus: "Arithmetic sets, shortcuts, and timing discipline", outcome: "Higher attempt count with controlled error rate." },
      { id: "ssc-revision-2", title: "English cleanup sprint", duration: "4 days", focus: "Grammar rules, vocab review, and short RC practice", outcome: "More consistent English accuracy." },
      { id: "ssc-revision-3", title: "GK and reasoning polish", duration: "5 days", focus: "Static GK revision, current affairs, and reasoning sets", outcome: "Fewer careless misses in the easier scoring sections." }
    ]
  },
  {
    slug: "neet",
    name: "NEET",
    difficulty: "Very High",
    overview:
      "A high-pressure medical entrance exam that demands strong biology recall, accurate chemistry fundamentals, and disciplined physics problem solving.",
    roadmap: [
      "Lock in NCERT-heavy biology and chemistry foundations before expanding to advanced problem practice.",
      "Build a chapter-wise error log across physics, chemistry, and biology to catch repeat weak spots early.",
      "Run regular mixed-topic tests so recall and pacing improve together instead of in isolation.",
      "Use the final phase for full-length mock analysis, revision cycles, and high-yield topic compression."
    ],
    resources: [
      "NCERT Biology and Chemistry",
      "MTG NCERT at Your Fingertips",
      "Previous year NEET papers",
      "Allen or Aakash mock tests"
    ],
    syllabus: [
      { id: "neet-botany", title: "Botany", category: "Biology", weight: 10, description: "Plant physiology, genetics, ecology, and NCERT-based factual recall." },
      { id: "neet-zoology", title: "Zoology", category: "Biology", weight: 10, description: "Human physiology, reproduction, biotechnology, and animal kingdom coverage." },
      { id: "neet-chemistry", title: "Chemistry", category: "Chemistry", weight: 8, description: "Physical chemistry, organic mechanisms, inorganic trends, and NCERT revision." },
      { id: "neet-physics", title: "Physics", category: "Physics", weight: 8, description: "Mechanics, modern physics, electricity, and calculation-heavy problem solving." },
      { id: "neet-revision", title: "NCERT revision and diagrams", category: "Revision", weight: 7, description: "Repeated NCERT reading, diagrams, labeled processes, and factual reinforcement." }
    ],
    mock_sections: [
      { id: "neet-biology", title: "Biology", target_score: 82, max_score: 100 },
      { id: "neet-chemistry", title: "Chemistry", target_score: 75, max_score: 100 },
      { id: "neet-physics", title: "Physics", target_score: 70, max_score: 100 }
    ],
    revision_plan: [
      { id: "neet-revision-1", title: "Biology retention sprint", duration: "6 days", focus: "NCERT line-by-line revision, diagrams, and high-yield biology chapters", outcome: "Stronger factual recall and fewer avoidable biology misses." },
      { id: "neet-revision-2", title: "Physics accuracy block", duration: "5 days", focus: "Formula revision, timed numericals, and error log cleanup", outcome: "Better physics confidence under exam pressure." },
      { id: "neet-revision-3", title: "Full-paper correction loop", duration: "7 days", focus: "Mock review, topic clustering, and rapid weak-area revision", outcome: "Improved paper temperament and more stable all-subject performance." }
    ]
  }
];

export const skillRoadmaps: SkillRoadmap[] = [
  {
    title: "Machine Learning",
    summary:
      "Move from math and Python fundamentals into classical ML, deployment, and applied AI systems.",
    milestones: [
      "Python, NumPy, pandas, and visualization",
      "Statistics, probability, and linear algebra",
      "Supervised and unsupervised learning",
      "Model evaluation, feature engineering, and experimentation",
      "MLOps basics, APIs, and portfolio projects"
    ]
  },
  {
    title: "Web Development",
    summary:
      "Build full-stack fluency across frontend systems, backend APIs, data storage, and production deployment.",
    milestones: [
      "HTML, CSS, JavaScript, and responsive design",
      "React, Next.js, and component architecture",
      "APIs, authentication, and databases",
      "Testing, observability, and performance",
      "Deployment on Vercel with real-world projects"
    ]
  },
  {
    title: "Product Management",
    summary:
      "Learn to identify user pain, prioritize bets, align teams, and drive business outcomes through product thinking.",
    milestones: [
      "Customer discovery and problem framing",
      "Metrics, analytics, and experimentation",
      "Roadmapping and prioritization",
      "Stakeholder communication and execution",
      "Case studies, PRDs, and portfolio artifacts"
    ]
  },
  {
    title: "UI/UX Design",
    summary:
      "Develop the craft of user-centered design from research through interaction detail and polished systems thinking.",
    milestones: [
      "Design principles, typography, and color",
      "User research and journey mapping",
      "Wireframing, prototyping, and usability testing",
      "Design systems and accessibility",
      "Portfolio-ready case studies"
    ]
  }
];

export const dashboardSeed = {
  goalProgress: 68,
  recentRoadmaps: [
    {
      title: "Become Product Manager",
      steps: 5
    },
    {
      title: "Become Data Scientist",
      steps: 4
    },
    {
      title: "Crack UPSC",
      steps: 6
    }
  ],
  recentDecisions: [
    "MBA vs Software Engineer",
    "Data Scientist vs Product Analyst",
    "Startup vs Corporate Role"
  ],
  focusStats: [
    { label: "Mon", minutes: 60 },
    { label: "Tue", minutes: 95 },
    { label: "Wed", minutes: 80 },
    { label: "Thu", minutes: 120 },
    { label: "Fri", minutes: 105 }
  ]
};