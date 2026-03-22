"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ClipboardList, MessageSquareText, NotebookPen, Target } from "lucide-react";

import { ExamPerformanceChart } from "@/components/charts/exam-performance-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/services/authService";
import { askExamAssistant, getExamWorkspace, saveExamWorkspace } from "@/services/examWorkspaceService";
import type { AuthUser, ExamAssistantExchange, ExamGuide, ExamProgressSummary, ExamWorkspaceRecord, ExamWorkspaceState } from "@/types";

type SyncState = "idle" | "saving" | "saved" | "error";

export function ExamWorkspace({ exam }: { exam: ExamGuide }) {
  const storageKey = `pathpilot-exam-workspace-${exam.slug}`;
  const initialState = useMemo(() => buildInitialState(exam), [exam]);
  const [workspace, setWorkspace] = useState<ExamWorkspaceRecord>(() => ({
    exam_slug: exam.slug,
    ...initialState,
    assistantHistory: []
  }));
  const [draftScores, setDraftScores] = useState<Record<string, string>>(() => buildDraftScores(exam));
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const localWorkspace = loadLocalWorkspace(storageKey, exam, initialState);
    setWorkspace({
      exam_slug: exam.slug,
      ...localWorkspace,
      assistantHistory: localWorkspace.assistantHistory || []
    });
    setDraftScores(buildDraftScores(exam));

    if (!currentUser) {
      setLoaded(true);
      return;
    }

    void getExamWorkspace(exam.slug)
      .then((remoteWorkspace) => {
        setWorkspace((current) => ({
          exam_slug: exam.slug,
          ...mergeWorkspaceState(initialState, current, remoteWorkspace)
        }));
        setSyncState("saved");
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load exam workspace.");
        setSyncState("error");
      })
      .finally(() => {
        setLoaded(true);
      });
  }, [exam, initialState, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [workspace, storageKey]);

  useEffect(() => {
    if (!loaded || !user) {
      return;
    }

    setSyncState("saving");
    const timer = window.setTimeout(() => {
      void saveExamWorkspace(exam.slug, {
        syllabus: workspace.syllabus,
        revision: workspace.revision,
        mockHistory: workspace.mockHistory,
        notes: workspace.notes
      })
        .then((savedWorkspace) => {
          setWorkspace((current) => ({
            ...current,
            assistantHistory: savedWorkspace.assistantHistory
          }));
          setSyncState("saved");
        })
        .catch((saveError) => {
          setError(saveError instanceof Error ? saveError.message : "Unable to save exam workspace.");
          setSyncState("error");
        });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [exam.slug, loaded, user, workspace.mockHistory, workspace.notes, workspace.revision, workspace.syllabus]);

  const progressSummary = useMemo(() => buildProgressSummary(exam, workspace), [exam, workspace]);
  const syllabusProgress = Math.round((countCompleted(workspace.syllabus) / exam.syllabus.length) * 100);
  const revisionProgress = Math.round((countCompleted(workspace.revision) / exam.revision_plan.length) * 100);
  const performanceData = progressSummary.mockAverages;
  const weakMockAreas = performanceData.filter((section) => section.average > 0 && section.average < section.target).sort((left, right) => right.gap - left.gap);
  const syllabusGaps = [...exam.syllabus].filter((topic) => !workspace.syllabus[topic.id]).sort((left, right) => right.weight - left.weight).slice(0, 3);
  const revisionRecommendation = exam.revision_plan.find((item) => !workspace.revision[item.id]) || exam.revision_plan[0];

  const nextFocusList = useMemo(() => {
    const actions: string[] = [];

    weakMockAreas.slice(0, 2).forEach((area) => {
      actions.push(`Raise ${area.label} from ${area.average.toFixed(1)} toward the ${area.target}% target.`);
    });

    syllabusGaps.slice(0, 2).forEach((topic) => {
      actions.push(`Finish ${topic.title} because it carries a weight of ${topic.weight}/10 in your workspace.`);
    });

    if (revisionRecommendation) {
      actions.push(`Run the next revision sprint: ${revisionRecommendation.title}.`);
    }

    return actions.length ? actions : ["Keep solving mocks and marking syllabus topics complete to unlock tailored guidance."];
  }, [revisionRecommendation, syllabusGaps, weakMockAreas]);

  function toggleSyllabus(topicId: string) {
    setWorkspace((current) => ({
      ...current,
      syllabus: {
        ...current.syllabus,
        [topicId]: !current.syllabus[topicId]
      }
    }));
  }

  function toggleRevision(itemId: string) {
    setWorkspace((current) => ({
      ...current,
      revision: {
        ...current.revision,
        [itemId]: !current.revision[itemId]
      }
    }));
  }

  function updateDraftScore(sectionId: string, value: string) {
    setDraftScores((current) => ({
      ...current,
      [sectionId]: value
    }));
  }

  function saveMock() {
    const nextScores: Record<string, number> = {};

    for (const section of exam.mock_sections) {
      const rawValue = draftScores[section.id];
      const parsed = Number(rawValue);

      if (rawValue === "" || Number.isNaN(parsed)) {
        setError(`Enter a valid score for ${section.title}.`);
        return;
      }

      nextScores[section.id] = clamp(parsed, 0, section.max_score);
    }

    const overall = Number((Object.values(nextScores).reduce((sum, value) => sum + value, 0) / exam.mock_sections.length).toFixed(1));

    setWorkspace((current) => ({
      ...current,
      mockHistory: [
        {
          id: `${exam.slug}-${Date.now()}`,
          taken_at: new Date().toISOString(),
          scores: nextScores,
          overall
        },
        ...current.mockHistory
      ]
    }));
    setDraftScores(buildDraftScores(exam));
    setError(null);
  }

  async function handleAskAssistant() {
    if (!assistantQuestion.trim()) {
      setAssistantError("Enter a question for the assistant.");
      return;
    }

    if (!user) {
      setAssistantError("Sign in to use the exam assistant and save your progress in MongoDB.");
      return;
    }

    setAssistantLoading(true);
    setAssistantError(null);

    try {
      const reply = await askExamAssistant({
        exam,
        question: assistantQuestion.trim(),
        workspaceState: {
          syllabus: workspace.syllabus,
          revision: workspace.revision,
          mockHistory: workspace.mockHistory,
          notes: workspace.notes
        },
        progressSummary
      });

      setWorkspace((current) => ({
        ...current,
        assistantHistory: [
          {
            question: assistantQuestion.trim(),
            answer: reply.answer,
            suggestedNextSteps: reply.suggestedNextSteps,
            relatedTopics: reply.relatedTopics,
            created_at: new Date().toISOString()
          },
          ...current.assistantHistory
        ].slice(0, 20)
      }));
      setAssistantQuestion("");
    } catch (askError) {
      setAssistantError(askError instanceof Error ? askError.message : "Unable to get an assistant response.");
    } finally {
      setAssistantLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard icon={<ClipboardList className="h-5 w-5" />} label="Syllabus progress" value={`${syllabusProgress}%`} hint={`${countCompleted(workspace.syllabus)} of ${exam.syllabus.length} topics checked`} />
        <SummaryCard icon={<Target className="h-5 w-5" />} label="Mocks logged" value={String(workspace.mockHistory.length)} hint="Track section averages and target gaps" />
        <SummaryCard icon={<NotebookPen className="h-5 w-5" />} label="Revision sprints" value={`${revisionProgress}%`} hint={`${countCompleted(workspace.revision)} of ${exam.revision_plan.length} sprints completed`} />
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-rose-300">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 text-sm text-muted-foreground">
          <span>{user ? `Workspace sync: ${syncState}` : `Progress is stored locally in this browser for ${exam.name}. Sign in to sync with MongoDB and use the assistant.`}</span>
          {user ? <Badge variant="info">MongoDB sync enabled</Badge> : <Badge>Guest mode</Badge>}
        </CardContent>
      </Card>

      <Tabs defaultValue="syllabus" className="space-y-6">
        <TabsList>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="mocks">Mocks</TabsTrigger>
          <TabsTrigger value="revision">Revision</TabsTrigger>
        </TabsList>

        <TabsContent value="syllabus">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Syllabus tracking</CardTitle>
                <CardDescription>Check topics as you complete them and keep the highest-weight topics visible.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Overall completion</span>
                    <span>{syllabusProgress}%</span>
                  </div>
                  <Progress value={syllabusProgress} />
                </div>
                <div className="space-y-3">
                  {exam.syllabus.map((topic) => (
                    <label key={topic.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <input
                        type="checkbox"
                        checked={Boolean(workspace.syllabus[topic.id])}
                        onChange={() => toggleSyllabus(topic.id)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-current"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{topic.title}</p>
                          <Badge>{topic.category}</Badge>
                          <Badge variant="info">Weight {topic.weight}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{topic.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weak-area detection</CardTitle>
                <CardDescription>These are the sections and topics still pulling your prep down.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {weakMockAreas.length ? (
                  weakMockAreas.slice(0, 3).map((area) => (
                    <div key={area.label} className="rounded-2xl border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
                      <p className="font-medium">{area.label}</p>
                      <p className="mt-1">Average {area.average.toFixed(1)} vs target {area.target}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-muted-foreground">
                    Add mock scores to unlock section-level weak-area detection.
                  </div>
                )}

                {syllabusGaps.map((topic) => (
                  <div key={topic.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{topic.title}</p>
                    <p className="mt-1">Highest incomplete syllabus topic with weight {topic.weight}/10.</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mocks">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Log a mock</CardTitle>
                <CardDescription>Record one score per section to keep averages and weak areas current.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exam.mock_sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm text-muted-foreground">{section.title}</label>
                      <span className="text-xs text-muted-foreground">Target {section.target_score}%</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={section.max_score}
                      value={draftScores[section.id]}
                      onChange={(event) => updateDraftScore(section.id, event.target.value)}
                      placeholder={`0 to ${section.max_score}`}
                    />
                  </div>
                ))}
                <Button type="button" onClick={saveMock}>Save mock analysis</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mock analysis</CardTitle>
                <CardDescription>Average performance versus target by section.</CardDescription>
              </CardHeader>
              <CardContent>
                <ExamPerformanceChart data={performanceData.map(({ label, average, target }) => ({ label, average, target }))} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent mock history</CardTitle>
              <CardDescription>Use the history to spot if your scores are actually improving or just fluctuating.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.mockHistory.length ? (
                workspace.mockHistory.map((entry, index) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium">Mock {workspace.mockHistory.length - index}</p>
                      <Badge variant="info">Overall {entry.overall}%</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {exam.mock_sections.map((section) => (
                        <div key={section.id} className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">{section.title}</p>
                          <p className="mt-1">{entry.scores[section.id]} / {section.max_score}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  No mocks saved yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revision">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Revision plan</CardTitle>
                <CardDescription>Mark each sprint complete once you have actually done the work.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exam.revision_plan.map((item) => (
                  <label key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <input
                      type="checkbox"
                      checked={Boolean(workspace.revision[item.id])}
                      onChange={() => toggleRevision(item.id)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-current"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.title}</p>
                        <Badge>{item.duration}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Focus: {item.focus}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Outcome: {item.outcome}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended next actions</CardTitle>
                  <CardDescription>Use your syllabus and mock data to decide what to work on next.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {nextFocusList.map((item, index) => (
                    <div key={`${item}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                  {revisionRecommendation ? (
                    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                      Next sprint: {revisionRecommendation.title}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revision notes</CardTitle>
                  <CardDescription>Keep one place for recurring mistakes, reminders, and last-week insights.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={workspace.notes}
                    onChange={(event) => setWorkspace((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Example: Physics accuracy drops in the second half of full mocks. Revisit formula recall before the next test."
                  />
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                    {user ? `Your ${exam.name} progress is syncing to MongoDB.` : `Sign in to sync ${exam.name} progress and assistant history to MongoDB.`}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Ask Assistant</CardTitle>
              <CardDescription>Ask syllabus doubts, study-order questions, or mock-review questions with your current progress in context.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Textarea
            value={assistantQuestion}
            onChange={(event) => setAssistantQuestion(event.target.value)}
            placeholder={`Ask a ${exam.name} doubt. Example: Based on my current progress, what should I do to improve ${progressSummary.weakAreas[0] || "my weakest section"}?`}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void handleAskAssistant()} disabled={assistantLoading || !assistantQuestion.trim()}>
              {assistantLoading ? "Thinking..." : "Ask assistant"}
            </Button>
            {assistantError ? <span className="text-sm text-rose-300">{assistantError}</span> : null}
          </div>

          <div className="space-y-4">
            {workspace.assistantHistory.length ? (
              workspace.assistantHistory.map((entry, index) => (
                <div key={`${entry.created_at}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium text-foreground">Q: {entry.question}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.answer}</p>
                  {entry.suggestedNextSteps.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-foreground">Suggested next steps</p>
                      {entry.suggestedNextSteps.map((step, stepIndex) => (
                        <div key={`${step}-${stepIndex}`} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-muted-foreground">
                          {step}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {entry.relatedTopics.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.relatedTopics.map((topic, topicIndex) => (
                        <Badge key={`${topic}-${topicIndex}`} variant="info">{topic}</Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                No assistant questions yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function loadLocalWorkspace(storageKey: string, exam: ExamGuide, initialState: ExamWorkspaceState) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { ...initialState, assistantHistory: [] };
    }

    const parsed = JSON.parse(raw) as Partial<ExamWorkspaceRecord>;
    return {
      syllabus: { ...initialState.syllabus, ...(parsed.syllabus || {}) },
      revision: { ...initialState.revision, ...(parsed.revision || {}) },
      mockHistory: Array.isArray(parsed.mockHistory) ? parsed.mockHistory : [],
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      assistantHistory: Array.isArray(parsed.assistantHistory) ? parsed.assistantHistory : []
    };
  } catch (error) {
    return { ...initialState, assistantHistory: [] };
  }
}

function mergeWorkspaceState(initialState: ExamWorkspaceState, localWorkspace: ExamWorkspaceRecord, remoteWorkspace: ExamWorkspaceRecord) {
  return {
    syllabus: { ...initialState.syllabus, ...(localWorkspace.syllabus || {}), ...(remoteWorkspace.syllabus || {}) },
    revision: { ...initialState.revision, ...(localWorkspace.revision || {}), ...(remoteWorkspace.revision || {}) },
    mockHistory: Array.isArray(remoteWorkspace.mockHistory) && remoteWorkspace.mockHistory.length ? remoteWorkspace.mockHistory : localWorkspace.mockHistory,
    notes: remoteWorkspace.notes || localWorkspace.notes || "",
    assistantHistory: Array.isArray(remoteWorkspace.assistantHistory) ? remoteWorkspace.assistantHistory : []
  };
}

function buildInitialState(exam: ExamGuide): ExamWorkspaceState {
  return {
    syllabus: exam.syllabus.reduce<Record<string, boolean>>((state, topic) => {
      state[topic.id] = false;
      return state;
    }, {}),
    revision: exam.revision_plan.reduce<Record<string, boolean>>((state, item) => {
      state[item.id] = false;
      return state;
    }, {}),
    mockHistory: [],
    notes: ""
  };
}

function buildDraftScores(exam: ExamGuide) {
  return exam.mock_sections.reduce<Record<string, string>>((scores, section) => {
    scores[section.id] = "";
    return scores;
  }, {});
}

function buildProgressSummary(exam: ExamGuide, workspace: ExamWorkspaceRecord): ExamProgressSummary {
  const completedTopics = exam.syllabus.filter((topic) => workspace.syllabus[topic.id]).map((topic) => topic.title);
  const pendingTopics = exam.syllabus.filter((topic) => !workspace.syllabus[topic.id]).map((topic) => topic.title);
  const highPriorityPendingTopics = [...exam.syllabus]
    .filter((topic) => !workspace.syllabus[topic.id])
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3)
    .map((topic) => topic.title);
  const mockAverages = exam.mock_sections.map((section) => {
    const attempts = workspace.mockHistory.map((entry) => entry.scores[section.id]).filter((value): value is number => typeof value === "number");
    const average = attempts.length ? Number((attempts.reduce((sum, value) => sum + value, 0) / attempts.length).toFixed(1)) : 0;
    return {
      label: section.title,
      average,
      target: section.target_score,
      gap: Number((section.target_score - average).toFixed(1))
    };
  });
  const weakAreas = [
    ...mockAverages.filter((section) => section.average > 0 && section.average < section.target).sort((left, right) => right.gap - left.gap).map((section) => section.label),
    ...highPriorityPendingTopics
  ].slice(0, 5);
  const completedRevisionSprints = exam.revision_plan.filter((item) => workspace.revision[item.id]).map((item) => item.title);
  const pendingRevisionSprints = exam.revision_plan.filter((item) => !workspace.revision[item.id]).map((item) => item.title);

  return {
    completedTopics,
    pendingTopics,
    highPriorityPendingTopics,
    mockAverages,
    weakAreas,
    completedRevisionSprints,
    pendingRevisionSprints,
    notes: workspace.notes
  };
}

function countCompleted(items: Record<string, boolean>) {
  return Object.values(items).filter(Boolean).length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}