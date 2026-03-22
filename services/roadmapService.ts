import { RoadmapStep } from "@/types";

export async function generateRoadmap(payload: {
  goal: string;
  goalType?: string;
}): Promise<RoadmapStep[]> {
  const response = await fetch("/api/generate-roadmap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unable to generate roadmap." }));
    throw new Error(error.error || "Unable to generate roadmap.");
  }

  const data = (await response.json()) as { steps: RoadmapStep[] };
  return data.steps;
}
