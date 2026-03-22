export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  createdAt?: string;
};

export type RoadmapStep = {
  title: string;
  description: string;
  estimated_time: string;
  skills: string[];
};

export type DecisionPriorityInput = {
  label: string;
  weight: number;
  note?: string;
};

export type DecisionPreferenceProfile = {
  budget: string;
  location: string;
  risk_tolerance: string;
  priorities: DecisionPriorityInput[];
  custom_criteria: DecisionPriorityInput[];
  context_notes?: string;
};

export type DecisionCriterionBreakdown = {
  label: string;
  weight: number;
  optionA: number;
  optionB: number;
  rationale: string;
};

export type DecisionWeightedScores = {
  optionA: number;
  optionB: number;
  recommendation: string;
};

export type DecisionAnalysis = {
  overview: string;
  recommendation?: string;
  preference_profile?: DecisionPreferenceProfile;
  criteria_breakdown?: DecisionCriterionBreakdown[];
  weighted_scores?: DecisionWeightedScores;
  optionA_pros: string[];
  optionA_cons: string[];
  optionB_pros: string[];
  optionB_cons: string[];
  salary_growth: {
    label: string;
    optionA: number;
    optionB: number;
  }[];
  risk_level: {
    category: string;
    optionA: number;
    optionB: number;
  }[];
  time_investment: string;
  future_opportunities: string[];
  skills_required: {
    optionA: string[];
    optionB: string[];
  };
  long_term_outlook: string;
  future_enhancements: {
    optionA: string[];
    optionB: string[];
  };
};

export type GoalRecord = {
  id?: string;
  user_id: string;
  title: string;
  goal_type: string;
  created_at: string;
};

export type RoadmapRecord = {
  id?: string;
  goal_id: string;
  goal_title?: string | null;
  goal_type?: string | null;
  steps: RoadmapStep[];
  created_at?: string;
};

export type DecisionRecord = {
  id?: string;
  user_id: string;
  option_a: string;
  option_b: string;
  analysis: DecisionAnalysis;
  created_at: string;
};

export type FocusSessionRecord = {
  id?: string;
  user_id: string;
  task: string;
  duration: number;
  created_at: string;
};

export type DashboardStats = {
  goals: number;
  roadmaps: number;
  decisions: number;
  focusSessions: number;
  focusMinutes: number;
};

export type DashboardData = {
  goals: GoalRecord[];
  roadmaps: RoadmapRecord[];
  decisions: DecisionRecord[];
  focusSessions: FocusSessionRecord[];
  stats: DashboardStats;
};

export type ExamSyllabusTopic = {
  id: string;
  title: string;
  category: string;
  weight: number;
  description: string;
};

export type ExamMockSection = {
  id: string;
  title: string;
  target_score: number;
  max_score: number;
};

export type ExamRevisionSprint = {
  id: string;
  title: string;
  duration: string;
  focus: string;
  outcome: string;
};

export type ExamGuide = {
  slug: string;
  name: string;
  difficulty: string;
  overview: string;
  roadmap: string[];
  resources: string[];
  syllabus: ExamSyllabusTopic[];
  mock_sections: ExamMockSection[];
  revision_plan: ExamRevisionSprint[];
};

export type ExamBlueprint = {
  name: string;
  difficulty: string;
  overview: string;
  roadmap: string[];
  resources: string[];
  syllabus: {
    title: string;
    category: string;
    weight: number;
    description: string;
  }[];
  mock_sections: {
    title: string;
    target_score: number;
    max_score: number;
  }[];
  revision_plan: {
    title: string;
    duration: string;
    focus: string;
    outcome: string;
  }[];
};

export type ExamWorkspaceMockEntry = {
  id: string;
  taken_at: string;
  scores: Record<string, number>;
  overall: number;
};

export type ExamWorkspaceState = {
  syllabus: Record<string, boolean>;
  revision: Record<string, boolean>;
  mockHistory: ExamWorkspaceMockEntry[];
  notes: string;
};

export type ExamProgressSummary = {
  completedTopics: string[];
  pendingTopics: string[];
  highPriorityPendingTopics: string[];
  mockAverages: {
    label: string;
    average: number;
    target: number;
    gap: number;
  }[];
  weakAreas: string[];
  completedRevisionSprints: string[];
  pendingRevisionSprints: string[];
  notes: string;
};

export type ExamAssistantExchange = {
  question: string;
  answer: string;
  suggestedNextSteps: string[];
  relatedTopics: string[];
  created_at: string;
};

export type ExamWorkspaceRecord = ExamWorkspaceState & {
  exam_slug: string;
  assistantHistory: ExamAssistantExchange[];
};

export type ExamAssistantResponse = {
  answer: string;
  suggestedNextSteps: string[];
  relatedTopics: string[];
};

export type TimetableSubject = {
  name: string;
  priority: number;
  strength: "strong" | "medium" | "weak";
};

export type TimetableAvailability = {
  day: string;
  hours: number;
  preferred_slots: string[];
};

export type TimetableCommitment = {
  day: string;
  label: string;
  hours: number;
};

export type TimetableInput = {
  plan_name: string;
  exam_slug: string;
  subjects: TimetableSubject[];
  availability: TimetableAvailability[];
  fixed_commitments: TimetableCommitment[];
  session_length: number;
  revision_style: "daily" | "weekly" | "both" | "none";
  mock_frequency: "weekly" | "biweekly" | "none";
  exam_date?: string;
  notes?: string;
};

export type TimetableSession = {
  day: string;
  slot: string;
  duration_minutes: number;
  subject: string;
  type: "study" | "revision" | "mock" | "break";
  focus: string;
};

export type TimetablePlan = {
  summary: string;
  weekly_hours: number;
  subject_hours: {
    subject: string;
    hours: number;
  }[];
  rationale: string[];
  sessions: TimetableSession[];
};

export type TimetableRecord = {
  id?: string;
  user_id: string;
  created_at: string;
  input: TimetableInput;
  generated_plan: TimetablePlan;
};
export type SkillRoadmap = {
  title: string;
  summary: string;
  milestones: string[];
};
