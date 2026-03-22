import { apiFetch } from "@/lib/api-client";
import type {
  ExamAssistantResponse,
  ExamBlueprint,
  ExamGuide,
  ExamProgressSummary,
  ExamWorkspaceRecord,
  ExamWorkspaceState
} from "@/types";

export async function getExamWorkspace(slug: string) {
  const data = await apiFetch<{ workspace: ExamWorkspaceRecord }>(`/api/exam-workspaces/${slug}`, { method: "GET" }, true);
  return data.workspace;
}

export async function saveExamWorkspace(slug: string, workspace: ExamWorkspaceState) {
  const data = await apiFetch<{ workspace: ExamWorkspaceRecord }>(
    `/api/exam-workspaces/${slug}`,
    {
      method: "PUT",
      body: JSON.stringify(workspace)
    },
    true
  );

  return data.workspace;
}

export async function askExamAssistant(payload: {
  exam: ExamGuide;
  question: string;
  workspaceState: ExamWorkspaceState;
  progressSummary: ExamProgressSummary;
}) {
  const data = await apiFetch<{ reply: ExamAssistantResponse }>(
    "/api/exam-assistant",
    {
      method: "POST",
      body: JSON.stringify({
        examSlug: payload.exam.slug,
        examName: payload.exam.name,
        question: payload.question,
        workspaceState: payload.workspaceState,
        progressSummary: payload.progressSummary,
        syllabusTopics: payload.exam.syllabus.map((topic) => ({
          title: topic.title,
          category: topic.category,
          weight: topic.weight,
          description: topic.description,
          completed: Boolean(payload.workspaceState.syllabus[topic.id])
        }))
      })
    },
    true
  );

  return data.reply;
}

export async function generateCustomExamGuide(payload: { examName: string; goalContext: string }) {
  const data = await apiFetch<{ guide: ExamBlueprint }>(
    "/api/generate-custom-exam-guide",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    false
  );

  return data.guide;
}

export async function getCustomExams() {
  const data = await apiFetch<{ exams: ExamGuide[] }>("/api/custom-exams", { method: "GET" }, true);
  return data.exams;
}

export async function saveCustomExam(exam: ExamGuide) {
  const data = await apiFetch<{ exam: ExamGuide }>(
    "/api/custom-exams",
    {
      method: "POST",
      body: JSON.stringify({ exam })
    },
    true
  );

  return data.exam;
}
