import type { DecisionAnalysis, DecisionPriorityInput } from "@/types";

export type DecisionAnalysisPayload = {
  optionA: string;
  optionB: string;
  budget: string;
  location: string;
  riskTolerance: string;
  priorities: DecisionPriorityInput[];
  customCriteria: DecisionPriorityInput[];
  contextNotes?: string;
};

export async function analyzeDecision(payload: DecisionAnalysisPayload): Promise<DecisionAnalysis> {
  const response = await fetch("/api/analyze-decision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unable to analyze decision." }));
    throw new Error(error.error || "Unable to analyze decision.");
  }

  const data = (await response.json()) as { analysis: DecisionAnalysis };
  return data.analysis;
}