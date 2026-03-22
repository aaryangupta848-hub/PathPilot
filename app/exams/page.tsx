"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildCustomExamGuide, buildCustomExamGuideFromBlueprint, getStoredCustomExams, saveCustomExams } from "@/lib/custom-exams";
import { examGuides } from "@/lib/static-data";
import { getCurrentUser } from "@/services/authService";
import { generateCustomExamGuide, getCustomExams, saveCustomExam } from "@/services/examWorkspaceService";
import type { AuthUser, ExamGuide } from "@/types";

export default function ExamsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [customExams, setCustomExams] = useState<ExamGuide[]>([]);
  const [examName, setExamName] = useState("");
  const [examGoal, setExamGoal] = useState("");
  const [difficulty, setDifficulty] = useState("Custom");
  const [error, setError] = useState<string | null>(null);
  const [autoGenerating, setAutoGenerating] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const localCustomExams = getStoredCustomExams();
    setCustomExams(localCustomExams);

    if (!currentUser) {
      return;
    }

    void getCustomExams()
      .then((remoteExams) => {
        setCustomExams(remoteExams);
        saveCustomExams(remoteExams);
      })
      .catch(() => {
        setCustomExams(localCustomExams);
      });
  }, []);

  const existingSlugs = useMemo(() => [...examGuides, ...customExams].map((item) => item.slug), [customExams]);

  async function persistAndOpen(exam: ExamGuide) {
    let savedExam = exam;

    if (user) {
      savedExam = await saveCustomExam(exam);
    }

    const nextExams = [...customExams, savedExam];
    setCustomExams(nextExams);
    saveCustomExams(nextExams);
    setExamName("");
    setExamGoal("");
    setDifficulty("Custom");
    setError(null);
    router.push(`/exams/${savedExam.slug}`);
  }

  async function handleCreateCustomExam() {
    if (!examName.trim()) {
      setError("Enter a custom exam name.");
      return;
    }

    try {
      const customExam = buildCustomExamGuide({
        name: examName,
        goal: examGoal,
        difficulty,
        existingSlugs
      });

      await persistAndOpen(customExam);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to create custom workspace.");
    }
  }

  async function handleAutoGenerateCustomExam() {
    if (!examName.trim()) {
      setError("Enter an exam name before auto-generating.");
      return;
    }

    setAutoGenerating(true);
    setError(null);

    try {
      const guide = await generateCustomExamGuide({
        examName: examName.trim(),
        goalContext: examGoal.trim()
      });

      const customExam = buildCustomExamGuideFromBlueprint({
        blueprint: guide,
        goal: examGoal.trim(),
        existingSlugs
      });

      await persistAndOpen(customExam);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to auto-generate exam details.");
    } finally {
      setAutoGenerating(false);
    }
  }

  return (
    <div className="section-shell space-y-10">
      <div className="space-y-4">
        <Badge variant="info" className="w-fit">
          Competitive exam workspace
        </Badge>
        <h1 className="text-4xl font-semibold sm:text-5xl">Strategic exam workspaces for high-stakes goals.</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Pick a built-in exam or create your own custom exam goal to get a dedicated workspace with syllabus tracking, mocks, and revision planning.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {examGuides.map((exam) => (
          <Card key={exam.slug}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>{exam.name}</CardTitle>
                <Badge>{exam.difficulty}</Badge>
              </div>
              <CardDescription>{exam.overview}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" asChild>
                <Link href={`/exams/${exam.slug}`}>Open workspace</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {customExams.map((exam) => (
          <Card key={exam.slug}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>{exam.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="info">Custom</Badge>
                  <Badge>{exam.difficulty}</Badge>
                </div>
              </div>
              <CardDescription>{exam.overview}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" asChild>
                <Link href={`/exams/${exam.slug}`}>Open workspace</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Add custom exam or goal</CardTitle>
            <CardDescription>Create a custom workspace manually or auto-generate with AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Exam name</p>
              <Input value={examName} onChange={(event) => setExamName(event.target.value)} placeholder="Example: GRE, CDS, CFA Level 1" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Goal context</p>
              <Textarea
                value={examGoal}
                onChange={(event) => setExamGoal(event.target.value)}
                placeholder="Your target score, timeline, strengths, and weak areas."
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Difficulty label (manual mode)</p>
              <Input value={difficulty} onChange={(event) => setDifficulty(event.target.value)} placeholder="Custom / High / Moderate" />
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={handleCreateCustomExam}>
                Create manually
              </Button>
              <Button type="button" onClick={handleAutoGenerateCustomExam} disabled={autoGenerating}>
                {autoGenerating ? "Generating..." : "Auto-generate with AI"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
