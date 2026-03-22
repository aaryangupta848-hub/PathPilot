import { apiFetch } from "@/lib/api-client";
import type { TimetableInput, TimetableRecord } from "@/types";

export async function createTimetablePlan(payload: TimetableInput) {
  const data = await apiFetch<{ timetable: TimetableRecord }>(
    "/api/timetables",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );

  return data.timetable;
}

export async function getTimetablePlans() {
  const data = await apiFetch<{ timetables: TimetableRecord[] }>("/api/timetables", { method: "GET" }, true);
  return data.timetables;
}