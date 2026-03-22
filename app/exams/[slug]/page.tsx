"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ExamWorkspace } from "@/components/exams/exam-workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredCustomExams } from "@/lib/custom-exams";
import { examGuides } from "@/lib/static-data";
import { getCurrentUser } from "@/services/authService";
import { getCustomExams } from "@/services/examWorkspaceService";
import type { AuthUser, ExamGuide } from "@/types";

export default function ExamDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [customExams, setCustomExams] = useState<ExamGuide[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const localCustomExams = getStoredCustomExams();
    setCustomExams(localCustomExams);

    if (!currentUser) {
      setLoaded(true);
      return;
    }

    void getCustomExams()
      .then((remoteExams) => {
        setCustomExams(remoteExams);
      })
      .catch(() => {
        setCustomExams(localCustomExams);
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  const exam = useMemo(() => {
    const allExams = [...examGuides, ...customExams];
    return allExams.find((item) => item.slug === slug) || null;
  }, [customExams, slug]);

  if (!loaded) {
    return (
      <div className="section-shell">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading exam workspace...</CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="section-shell space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">This exam does not exist yet. Create a custom exam workspace to get started.</p>
            {user ? <p className="text-xs text-muted-foreground">Logged-in mode checks your saved custom exams from MongoDB.</p> : null}
            <Button asChild>
              <Link href="/exams">Back to exams</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-10">
      <div className="space-y-4">
        <Badge variant="info" className="w-fit">
          {exam.name}
        </Badge>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-4xl font-semibold sm:text-5xl">{exam.name} prep workspace</h1>
          <Badge>{exam.difficulty}</Badge>
        </div>
        <p className="max-w-3xl text-lg text-muted-foreground">{exam.overview}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preparation roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exam.roadmap.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm text-primary">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exam.resources.map((resource) => (
              <div key={resource} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                {resource}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ExamWorkspace exam={exam} />
    </div>
  );
}
