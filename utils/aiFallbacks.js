const defaultPriorities = [
  { label: "Salary growth", weight: 8 },
  { label: "Stability", weight: 7 },
  { label: "Learning curve", weight: 6 },
  { label: "Work-life balance", weight: 6 }
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const seededNumber = (seed, min, max) => {
  const total = Array.from(seed).reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 3), 0);
  const span = max - min + 1;
  return min + (total % span);
};

const normalizeCriteria = (items = []) =>
  items
    .filter((item) => item && typeof item.label === "string" && item.label.trim())
    .map((item) => ({
      label: item.label.trim(),
      weight: clamp(Number(item.weight) || 5, 1, 10),
      note: item.note || ""
    }));

const buildPreferenceProfile = (settings = {}) => {
  const priorities = normalizeCriteria(settings.priorities);
  const customCriteria = normalizeCriteria(settings.customCriteria);

  return {
    budget: settings.budget?.trim() || "Not specified",
    location: settings.location?.trim() || "Flexible",
    riskTolerance: settings.riskTolerance?.trim() || "Medium",
    priorities: priorities.length ? priorities : defaultPriorities,
    customCriteria,
    contextNotes: settings.contextNotes?.trim() || ""
  };
};

const buildOptionProfile = (option) => ({
  salary: seededNumber(`${option}-salary`, 5, 9),
  stability: seededNumber(`${option}-stability`, 4, 9),
  flexibility: seededNumber(`${option}-flexibility`, 4, 9),
  learning: seededNumber(`${option}-learning`, 5, 10),
  capital: seededNumber(`${option}-capital`, 3, 9),
  mobility: seededNumber(`${option}-mobility`, 4, 9),
  risk: seededNumber(`${option}-risk`, 3, 9),
  upside: seededNumber(`${option}-upside`, 5, 10)
});

const scoreCriterion = (profile, criterionLabel, preferenceProfile) => {
  const label = criterionLabel.toLowerCase();
  let score = 6;

  if (label.includes("salary") || label.includes("income") || label.includes("earn")) {
    score = profile.salary;
  } else if (label.includes("stability") || label.includes("security")) {
    score = profile.stability;
  } else if (label.includes("learning") || label.includes("growth") || label.includes("skill")) {
    score = Math.round((profile.learning + profile.upside) / 2);
  } else if (label.includes("work") || label.includes("balance") || label.includes("lifestyle")) {
    score = Math.round((profile.flexibility + profile.stability) / 2);
  } else if (label.includes("risk") || label.includes("certainty")) {
    const tolerance = preferenceProfile.riskTolerance.toLowerCase();
    if (tolerance.includes("high")) {
      score = Math.round((profile.upside + (11 - profile.risk)) / 2);
    } else if (tolerance.includes("low")) {
      score = 11 - profile.risk;
    } else {
      score = Math.round(((11 - profile.risk) + profile.stability) / 2);
    }
  } else if (label.includes("budget") || label.includes("cost") || label.includes("capital")) {
    score = 11 - profile.capital;
    if (preferenceProfile.budget.toLowerCase().includes("high") || preferenceProfile.budget.toLowerCase().includes("flex")) {
      score = Math.round((score + profile.upside) / 2);
    }
  } else if (label.includes("location") || label.includes("remote") || label.includes("relocation")) {
    score = Math.round((profile.mobility + profile.flexibility) / 2);
  } else if (label.includes("network") || label.includes("brand") || label.includes("leadership")) {
    score = Math.round((profile.upside + profile.mobility) / 2);
  } else {
    score = Math.round((profile.stability + profile.learning + profile.upside) / 3);
  }

  return clamp(score, 1, 10);
};

const buildCriteriaBreakdown = (optionA, optionB, preferenceProfile) => {
  const criteria = [...preferenceProfile.priorities, ...preferenceProfile.customCriteria];
  const profileA = buildOptionProfile(optionA);
  const profileB = buildOptionProfile(optionB);

  return criteria.map((criterion) => {
    const optionAScore = scoreCriterion(profileA, criterion.label, preferenceProfile);
    const optionBScore = scoreCriterion(profileB, criterion.label, preferenceProfile);
    const betterLabel = optionAScore === optionBScore ? "both options remain close" : optionAScore > optionBScore ? optionA : optionB;

    return {
      label: criterion.label,
      weight: criterion.weight,
      optionA: optionAScore,
      optionB: optionBScore,
      rationale: `${betterLabel} is the stronger fit on ${criterion.label.toLowerCase()} once your current budget, location, and risk tolerance are factored in.`
    };
  });
};

const buildWeightedScores = (criteriaBreakdown, optionA, optionB) => {
  const totalWeight = criteriaBreakdown.reduce((sum, criterion) => sum + criterion.weight, 0) || 1;
  const optionATotal = criteriaBreakdown.reduce((sum, criterion) => sum + criterion.optionA * criterion.weight, 0) / totalWeight;
  const optionBTotal = criteriaBreakdown.reduce((sum, criterion) => sum + criterion.optionB * criterion.weight, 0) / totalWeight;
  const roundedA = Number(optionATotal.toFixed(1));
  const roundedB = Number(optionBTotal.toFixed(1));
  const recommendation =
    roundedA === roundedB
      ? `${optionA} and ${optionB} are nearly tied, so the final call should depend on which tradeoff feels more energizing in daily life.`
      : roundedA > roundedB
        ? `${optionA} edges ahead on your weighted priorities.`
        : `${optionB} edges ahead on your weighted priorities.`;

  return {
    optionA: roundedA,
    optionB: roundedB,
    recommendation
  };
};

const buildSalaryGrowth = (optionA, optionB, weightedScores) => {
  const baseA = 6 + Math.round(weightedScores.optionA);
  const baseB = 6 + Math.round(weightedScores.optionB);

  return [
    { label: "Year 1", optionA: baseA, optionB: baseB },
    { label: "Year 3", optionA: baseA + 6, optionB: baseB + 6 },
    { label: "Year 5", optionA: baseA + 14, optionB: baseB + 14 },
    { label: "Year 8", optionA: baseA + 24, optionB: baseB + 24 }
  ];
};

const buildRiskLevel = (optionA, optionB) => {
  const profileA = buildOptionProfile(optionA);
  const profileB = buildOptionProfile(optionB);

  return [
    { category: "Entry Barrier", optionA: clamp(profileA.learning - 1, 1, 10), optionB: clamp(profileB.learning - 1, 1, 10) },
    { category: "Market Volatility", optionA: profileA.risk, optionB: profileB.risk },
    { category: "Learning Curve", optionA: profileA.learning, optionB: profileB.learning },
    { category: "Outcome Uncertainty", optionA: clamp(Math.round((profileA.risk + (11 - profileA.stability)) / 2), 1, 10), optionB: clamp(Math.round((profileB.risk + (11 - profileB.stability)) / 2), 1, 10) },
    { category: "Capital Required", optionA: profileA.capital, optionB: profileB.capital }
  ];
};

const decisionFallback = (optionA, optionB, settings = {}) => {
  const preferenceProfile = buildPreferenceProfile(settings);
  const criteriaBreakdown = buildCriteriaBreakdown(optionA, optionB, preferenceProfile);
  const weightedScores = buildWeightedScores(criteriaBreakdown, optionA, optionB);

  return {
    overview: `${optionA} and ${optionB} were compared against your budget (${preferenceProfile.budget}), location preference (${preferenceProfile.location}), and ${preferenceProfile.riskTolerance.toLowerCase()} risk tolerance. The weighted scoring favors the path that best balances upside, day-to-day fit, and execution friction for your current season.`,
    recommendation: weightedScores.recommendation,
    preference_profile: {
      budget: preferenceProfile.budget,
      location: preferenceProfile.location,
      risk_tolerance: preferenceProfile.riskTolerance,
      priorities: preferenceProfile.priorities,
      custom_criteria: preferenceProfile.customCriteria,
      context_notes: preferenceProfile.contextNotes
    },
    criteria_breakdown: criteriaBreakdown,
    weighted_scores: weightedScores,
    optionA_pros: [
      `${optionA} aligns well if you want a sharper execution path with clearer milestones.`,
      `The weighted model gives ${optionA} credit where it better matches your highest-priority criteria.`,
      `${optionA} can feel more compelling if you want focused compounding over time.`
    ],
    optionA_cons: [
      `${optionA} may create tradeoffs if your budget or location constraints tighten suddenly.`,
      `The path can feel less flexible when your priorities change midstream.`,
      `Success still depends on disciplined execution rather than only choosing the option.`
    ],
    optionB_pros: [
      `${optionB} performs better wherever flexibility, adaptability, or optionality matter more.`,
      `${optionB} can open wider adjacent opportunities if your long-term plans are still evolving.`,
      `The weighted criteria keep ${optionB} competitive where your custom constraints favor it.`
    ],
    optionB_cons: [
      `${optionB} may involve more uncertainty in the early phase.`,
      `Some of your higher-weight criteria may require extra tradeoffs to make ${optionB} work well.`,
      `The path can demand stronger self-direction when outcomes are less structured.`
    ],
    salary_growth: buildSalaryGrowth(optionA, optionB, weightedScores),
    risk_level: buildRiskLevel(optionA, optionB),
    time_investment: `${optionA} may reward steady long-horizon effort, while ${optionB} may require more experimentation, positioning, and adaptation based on your chosen criteria.`,
    future_opportunities: [
      `Use the winning path as a primary lane and keep the losing option as a strategic hedge rather than abandoning it completely.`,
      `Re-run this simulator after a major budget, location, or career-priority shift to see if the recommendation changes.`,
      `Build projects, mentors, or certifications that strengthen whichever of ${optionA} or ${optionB} scored highest on your weighted criteria.`
    ],
    skills_required: {
      optionA: ["Structured planning", "Consistency", "Execution discipline", "Reflection"],
      optionB: ["Adaptability", "Decision-making", "Communication", "Opportunity scouting"]
    },
    long_term_outlook: `${optionA} and ${optionB} can both work, but the better long-term choice is the one you can sustain through real-world constraints. The weighted view is meant to reduce ambiguity, not replace judgment.`,
    future_enhancements: {
      optionA: [
        `Stress-test ${optionA} with a tighter budget or stricter location constraint.`,
        "Talk to someone already 3 to 5 years ahead on this path.",
        "Map the first 90 days so the choice becomes actionable quickly."
      ],
      optionB: [
        `Stress-test ${optionB} with a lower risk tolerance scenario.`,
        "Identify one concrete milestone that proves the path is working.",
        "Build a fallback plan so experimentation does not become drift."
      ]
    }
  };
};

const roadmapFallback = (goal) => [
  {
    title: "Clarify the target",
    description: `Define what success for ${goal} looks like, the timeline you want, and the constraints you need to respect.`,
    estimated_time: "Week 1",
    skills: ["Goal setting", "Research", "Self-assessment"]
  },
  {
    title: "Build the fundamentals",
    description: "Identify the core concepts, credentials, and baseline knowledge required to enter the path confidently.",
    estimated_time: "Weeks 2-6",
    skills: ["Foundations", "Consistency", "Learning strategy"]
  },
  {
    title: "Create a study or project system",
    description: "Turn the goal into weekly checkpoints, measurable outcomes, and visible outputs that prove progress.",
    estimated_time: "Month 2",
    skills: ["Planning", "Execution", "Time management"]
  },
  {
    title: "Practice in realistic conditions",
    description: "Simulate interviews, exams, projects, or real-world scenarios so your preparation becomes performance-ready.",
    estimated_time: "Months 3-4",
    skills: ["Application", "Feedback", "Problem solving"]
  },
  {
    title: "Refine and specialize",
    description: "Double down on weak spots, strengthen your differentiators, and shape a sharper positioning narrative.",
    estimated_time: "Months 4-5",
    skills: ["Iteration", "Positioning", "Skill depth"]
  },
  {
    title: "Launch and review",
    description: "Apply, attempt, or ship your goal milestone, then use the results to plan the next growth cycle.",
    estimated_time: "Month 6",
    skills: ["Execution", "Reflection", "Adaptability"]
  }
];

module.exports = {
  decisionFallback,
  roadmapFallback
};