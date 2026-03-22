import { apiFetch } from "@/lib/api-client";
import type { DashboardData, DecisionAnalysis, DecisionRecord, FocusSessionRecord, GoalRecord, RoadmapRecord } from "@/types";

export async function saveGoalRecord(payload: { title: string; goal_type: string }) {
  const data = await apiFetch<{ goal: GoalRecord }>(
    "/api/goals",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );

  return data.goal.id || null;
}

export async function saveRoadmapRecord(payload: RoadmapRecord) {
  const data = await apiFetch<{ roadmap: RoadmapRecord }>(
    "/api/roadmaps",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );

  return data.roadmap.id || null;
}

export async function getRoadmapRecord(id: string) {
  const data = await apiFetch<{ roadmap: RoadmapRecord }>(`/api/roadmaps/${id}`, { method: "GET" }, true);
  return data.roadmap;
}

export async function saveDecisionRecord(payload: {
  option_a: string;
  option_b: string;
  analysis: DecisionAnalysis;
}) {
  const data = await apiFetch<{ decision: DecisionRecord }>(
    "/api/decisions",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );

  return data.decision.id || null;
}

export async function getDecisionRecord(id: string) {
  const data = await apiFetch<{ decision: DecisionRecord }>(`/api/decisions/${id}`, { method: "GET" }, true);
  return data.decision;
}

export async function saveFocusSessionRecord(payload: { task: string; duration: number }) {
  const data = await apiFetch<{ focusSession: FocusSessionRecord }>(
    "/api/focus-sessions",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );

  return data.focusSession.id || null;
}

export async function getDashboardData() {
  return apiFetch<DashboardData>("/api/dashboard", { method: "GET" }, true);
}