"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, Clock3, Sparkles, Table2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { examGuides } from "@/lib/static-data";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/services/authService";
import { createTimetablePlan, getTimetablePlans } from "@/services/timetableService";
import type { AuthUser, TimetableAvailability, TimetableCommitment, TimetableInput, TimetableRecord, TimetableSubject } from "@/types";

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const slotOptions = ["Morning", "Afternoon", "Evening", "Night"];
const examOptions = [{ slug: "custom", name: "Custom goal" }, ...examGuides.map((exam) => ({ slug: exam.slug, name: exam.name }))];

export default function TimetablePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<TimetableRecord[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [planName, setPlanName] = useState("Weekly study plan");
  const [examSlug, setExamSlug] = useState("custom");
  const [subjects, setSubjects] = useState<TimetableSubject[]>(buildDefaultSubjects());
  const [availability, setAvailability] = useState<TimetableAvailability[]>(buildDefaultAvailability());
  const [commitments, setCommitments] = useState<TimetableCommitment[]>([]);
  const [sessionLength, setSessionLength] = useState("60");
  const [revisionStyle, setRevisionStyle] = useState("both");
  const [mockFrequency, setMockFrequency] = useState("weekly");
  const [examDate, setExamDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser) {
      setLoadingPlans(false);
      return;
    }

    void getTimetablePlans()
      .then((plans) => {
        setSavedPlans(plans);
        setSelectedPlanId(plans[0]?.id || null);
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load saved timetables.");
      })
      .finally(() => {
        setLoadingPlans(false);
      });
  }, []);

  const activePlan = useMemo(() => {
    if (!savedPlans.length) {
      return null;
    }

    return savedPlans.find((plan) => plan.id === selectedPlanId) || savedPlans[0];
  }, [savedPlans, selectedPlanId]);

  const groupedSessions = useMemo(() => {
    if (!activePlan) {
      return [] as { day: string; sessions: TimetableRecord["generated_plan"]["sessions"] }[];
    }

    return dayOptions
      .map((day) => ({
        day,
        sessions: activePlan.generated_plan.sessions.filter((session) => session.day === day)
      }))
      .filter((entry) => entry.sessions.length);
  }, [activePlan]);

  function updateSubject(index: number, patch: Partial<TimetableSubject>) {
    setSubjects((current) => current.map((subject, subjectIndex) => (subjectIndex === index ? { ...subject, ...patch } : subject)));
  }

  function addSubject() {
    setSubjects((current) => [...current, createSubject()]);
  }

  function removeSubject(index: number) {
    setSubjects((current) => (current.length === 1 ? current : current.filter((_, subjectIndex) => subjectIndex !== index)));
  }

  function updateAvailability(day: string, patch: Partial<TimetableAvailability>) {
    setAvailability((current) => current.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)));
  }

  function toggleSlot(day: string, slot: string) {
    setAvailability((current) => current.map((entry) => {
      if (entry.day !== day) {
        return entry;
      }

      const nextSlots = entry.preferred_slots.includes(slot)
        ? entry.preferred_slots.filter((item) => item !== slot)
        : [...entry.preferred_slots, slot];

      return {
        ...entry,
        preferred_slots: nextSlots.length ? nextSlots : ["Evening"]
      };
    }));
  }

  function addCommitment() {
    setCommitments((current) => [...current, { day: "Monday", label: "", hours: 1 }]);
  }

  function updateCommitment(index: number, patch: Partial<TimetableCommitment>) {
    setCommitments((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function removeCommitment(index: number) {
    setCommitments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function applyExamDefaults() {
    const exam = examGuides.find((item) => item.slug === examSlug);
    if (!exam) {
      return;
    }

    setSubjects(exam.syllabus.map((topic) => ({
      name: topic.title,
      priority: topic.weight >= 9 ? 5 : topic.weight >= 7 ? 4 : 3,
      strength: "medium"
    })));
    setPlanName(`${exam.name} weekly plan`);
  }

  async function handleGenerate() {
    if (!user) {
      setError("Sign in to generate and save timetables in MongoDB.");
      return;
    }

    const payload: TimetableInput = {
      plan_name: planName.trim() || "Weekly study plan",
      exam_slug: examSlug,
      subjects: subjects.filter((subject) => subject.name.trim()),
      availability: availability.map((entry) => ({
        ...entry,
        hours: clampNumber(entry.hours, 0, 12),
        preferred_slots: entry.preferred_slots.length ? entry.preferred_slots : ["Evening"]
      })),
      fixed_commitments: commitments.filter((item) => item.label.trim() && item.hours > 0),
      session_length: clampNumber(sessionLength, 30, 180),
      revision_style: revisionStyle as "daily" | "weekly" | "both" | "none",
      mock_frequency: mockFrequency as "weekly" | "biweekly" | "none",
      exam_date: examDate || undefined,
      notes: notes.trim() || undefined
    };

    setSubmitting(true);
    setError(null);

    try {
      const nextPlan = await createTimetablePlan(payload);
      setSavedPlans((current) => [nextPlan, ...current.filter((plan) => plan.id !== nextPlan.id)]);
      setSelectedPlanId(nextPlan.id || null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to generate timetable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section-shell space-y-10">
      <div className="space-y-4">
        <Badge variant="info" className="w-fit">
          TimeTable
        </Badge>
        <h1 className="text-4xl font-semibold sm:text-5xl">Turn free hours into a realistic weekly study timetable.</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Tell PathPilot what you are preparing for, where you are strong or weak, and when you are actually free. The planner turns that into a weekly schedule and stores it in MongoDB.
        </p>
      </div>

      {!user ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">Sign in to save timetable plans.</p>
              <p className="mt-1 text-sm text-muted-foreground">This planner stores generated timetables in MongoDB under your account.</p>
            </div>
            <Button asChild>
              <Link href="/auth">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-rose-300">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Planner inputs</CardTitle>
            <CardDescription>Keep the inputs realistic so the generated schedule remains usable throughout the week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Plan name">
                <Input value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="NEET sprint plan" />
              </Field>
              <Field label="Exam or goal">
                <select value={examSlug} onChange={(event) => setExamSlug(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none">
                  {examOptions.map((option) => (
                    <option key={option.slug} value={option.slug} className="bg-slate-950">
                      {option.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Subjects</p>
                  <p className="text-sm text-muted-foreground">Set priority and strength so weak subjects receive more attention.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {examSlug !== "custom" ? (
                    <Button type="button" variant="secondary" onClick={applyExamDefaults}>
                      Use exam defaults
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" onClick={addSubject}>
                    Add subject
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={`subject-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.3fr_0.45fr_0.55fr_auto]">
                    <Input value={subject.name} onChange={(event) => updateSubject(index, { name: event.target.value })} placeholder="Physics" />
                    <select value={String(subject.priority)} onChange={(event) => updateSubject(index, { priority: clampNumber(event.target.value, 1, 5) })} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value} className="bg-slate-950">
                          Priority {value}
                        </option>
                      ))}
                    </select>
                    <select value={subject.strength} onChange={(event) => updateSubject(index, { strength: event.target.value as TimetableSubject["strength"] })} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none">
                      <option value="weak" className="bg-slate-950">Weak</option>
                      <option value="medium" className="bg-slate-950">Medium</option>
                      <option value="strong" className="bg-slate-950">Strong</option>
                    </select>
                    <Button type="button" variant="ghost" onClick={() => removeSubject(index)} disabled={subjects.length === 1}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-medium">Free time by day</p>
                <p className="text-sm text-muted-foreground">Add the hours you can genuinely protect for study and mark the slots you prefer.</p>
              </div>
              <div className="space-y-4">
                {availability.map((entry) => (
                  <div key={entry.day} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-4 md:grid-cols-[0.6fr_0.4fr] md:items-end">
                      <Field label={entry.day}>
                        <div className="flex flex-wrap gap-2">
                          {slotOptions.map((slot) => (
                            <button
                              key={`${entry.day}-${slot}`}
                              type="button"
                              onClick={() => toggleSlot(entry.day, slot)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm transition",
                                entry.preferred_slots.includes(slot)
                                  ? "border-primary bg-primary/15 text-primary"
                                  : "border-white/10 bg-black/10 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Free hours">
                        <Input
                          type="number"
                          min={0}
                          max={12}
                          step={0.5}
                          value={String(entry.hours)}
                          onChange={(event) => updateAvailability(entry.day, { hours: clampNumber(event.target.value, 0, 12) })}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Fixed commitments</p>
                  <p className="text-sm text-muted-foreground">Subtract coaching, school, commute, or job blocks before the planner allocates sessions.</p>
                </div>
                <Button type="button" variant="outline" onClick={addCommitment}>
                  Add commitment
                </Button>
              </div>
              {commitments.length ? (
                <div className="space-y-3">
                  {commitments.map((item, index) => (
                    <div key={`commitment-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[0.55fr_1fr_0.35fr_auto]">
                      <select value={item.day} onChange={(event) => updateCommitment(index, { day: event.target.value })} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none">
                        {dayOptions.map((day) => (
                          <option key={day} value={day} className="bg-slate-950">
                            {day}
                          </option>
                        ))}
                      </select>
                      <Input value={item.label} onChange={(event) => updateCommitment(index, { label: event.target.value })} placeholder="Coaching class" />
                      <Input type="number" min={0} max={12} step={0.5} value={String(item.hours)} onChange={(event) => updateCommitment(index, { hours: clampNumber(event.target.value, 0, 12) })} />
                      <Button type="button" variant="ghost" onClick={() => removeCommitment(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  No fixed commitments added yet.
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Session length">
                <select value={sessionLength} onChange={(event) => setSessionLength(event.target.value)} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none">
                  {[45, 60, 90, 120].map((value) => (
                    <option key={value} value={value} className="bg-slate-950">
                      {value} min
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Revision style">
                <select value={revisionStyle} onChange={(event) => setRevisionStyle(event.target.value)} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none">
                  <option value="daily" className="bg-slate-950">Daily</option>
                  <option value="weekly" className="bg-slate-950">Weekly</option>
                  <option value="both" className="bg-slate-950">Both</option>
                  <option value="none" className="bg-slate-950">None</option>
                </select>
              </Field>
              <Field label="Mock frequency">
                <select value={mockFrequency} onChange={(event) => setMockFrequency(event.target.value)} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none">
                  <option value="weekly" className="bg-slate-950">Weekly</option>
                  <option value="biweekly" className="bg-slate-950">Biweekly</option>
                  <option value="none" className="bg-slate-950">None</option>
                </select>
              </Field>
              <Field label="Exam date">
                <Input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} />
              </Field>
            </div>

            <Field label="Additional notes">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Example: Physics needs more morning sessions because my accuracy drops after coaching."
              />
            </Field>

            <Button type="button" onClick={() => void handleGenerate()} disabled={submitting}>
              {submitting ? "Generating..." : "Generate and save timetable"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planner snapshot</CardTitle>
              <CardDescription>Use this quick summary to sanity-check what the planner is optimizing for.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <StatTile icon={<CalendarDays className="h-5 w-5" />} label="Exam" value={formatExamName(examSlug)} />
              <StatTile icon={<Clock3 className="h-5 w-5" />} label="Session length" value={`${clampNumber(sessionLength, 30, 180)} min`} />
              <StatTile icon={<Sparkles className="h-5 w-5" />} label="Subjects" value={String(subjects.filter((subject) => subject.name.trim()).length)} />
              <StatTile icon={<Table2 className="h-5 w-5" />} label="Saved plans" value={String(savedPlans.length)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved plans</CardTitle>
              <CardDescription>{user ? "Select any saved MongoDB timetable to review it." : "Sign in to save plans here."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingPlans ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading saved timetables...
                </div>
              ) : savedPlans.length ? (
                savedPlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id || null)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      activePlan?.id === plan.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    <p className="font-medium text-foreground">{plan.input.plan_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatExamName(plan.input.exam_slug)} - {plan.generated_plan.weekly_hours} hrs/week</p>
                    <p className="mt-2 text-xs text-muted-foreground">Saved {formatDate(plan.created_at)}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  No saved timetable plans yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activePlan ? activePlan.input.plan_name : "Generated timetable"}</CardTitle>
          <CardDescription>
            {activePlan ? activePlan.generated_plan.summary : "Your generated weekly schedule will appear here after you save a plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {activePlan ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <PlanMetric label="Weekly hours" value={`${activePlan.generated_plan.weekly_hours}`} />
                <PlanMetric label="Subjects covered" value={`${activePlan.generated_plan.subject_hours.length}`} />
                <PlanMetric label="Revision mode" value={activePlan.input.revision_style} />
                <PlanMetric label="Mock cadence" value={activePlan.input.mock_frequency} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Card className="border border-white/10 bg-white/5 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg">Why this plan was made</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activePlan.generated_plan.rationale.map((item, index) => (
                      <div key={`${item}-${index}`} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                      {activePlan.generated_plan.subject_hours.map((item) => (
                        <div key={item.subject} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">{item.subject}</p>
                          <p className="mt-1">{item.hours} hrs allocated</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {groupedSessions.map((entry) => (
                    <div key={entry.day} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">{entry.day}</h3>
                        <Badge variant="info">{entry.sessions.length} blocks</Badge>
                      </div>
                      <div className="mt-4 space-y-3">
                        {entry.sessions.map((session, index) => (
                          <div key={`${entry.day}-${session.slot}-${index}`} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-foreground">{session.slot} - {session.subject}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{session.focus}</p>
                              </div>
                              <Badge>{session.duration_minutes} min</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-muted-foreground">
              Generate your first timetable to see the day-wise schedule here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3 text-primary">
        {icon}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold capitalize">{value}</p>
    </div>
  );
}

function createSubject(): TimetableSubject {
  return {
    name: "",
    priority: 3,
    strength: "medium"
  };
}

function buildDefaultSubjects() {
  return [createSubject(), createSubject(), createSubject()];
}

function buildDefaultAvailability(): TimetableAvailability[] {
  return dayOptions.map((day) => ({
    day,
    hours: day === "Saturday" ? 4 : day === "Sunday" ? 3 : 2,
    preferred_slots: day === "Saturday" || day === "Sunday" ? ["Morning", "Evening"] : ["Evening"]
  }));
}

function clampNumber(value: string | number, min: number, max: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return min;
  }

  return Math.min(max, Math.max(min, numeric));
}

function formatExamName(slug: string) {
  return examOptions.find((item) => item.slug === slug)?.name || slug || "Custom goal";
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Recently" : parsed.toLocaleDateString();
}