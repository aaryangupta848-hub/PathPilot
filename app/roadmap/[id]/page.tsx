"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarClock, ListChecks, Milestone } from "lucide-react";

import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/services/authService";
import { getRoadmapRecord } from "@/services/userService";
import type { RoadmapRecord } from "@/types";

export default function RoadmapDetailPage() {
  const params = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<RoadmapRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) {
      setError("Roadmap id is missing.");
      setLoading(false);
      return;
    }

    if (!getCurrentUser()) {
      setError("Please sign in to view saved roadmaps.");
      setLoading(false);
      return;
    }

    void getRoadmapRecord(params.id)
      .then((savedRoadmap) => {
        setRoadmap(savedRoadmap);
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load roadmap.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params?.id]);

  return (
    <div className="section-shell space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Badge variant="info" className="w-fit">
            Saved roadmap
          </Badge>
          <h1 className="text-4xl font-semibold sm:text-5xl">{roadmap?.goal_title || "Roadmap details"}</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Review the saved plan, each roadmap step, and the timeline view generated for this goal.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard?tab=roadmaps">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Loading roadmap...</CardContent>
        </Card>
      ) : null}

      {!loading && error ? (
        <Card>
          <CardContent className="p-8 text-sm text-rose-300">{error}</CardContent>
        </Card>
      ) : null}

      {!loading && !error && roadmap ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <SummaryCard icon={<Milestone className="h-5 w-5" />} label="Goal" value={roadmap.goal_title || "Untitled goal"} />
            <SummaryCard icon={<ListChecks className="h-5 w-5" />} label="Steps" value={`${roadmap.steps.length} milestones`} />
            <SummaryCard icon={<CalendarClock className="h-5 w-5" />} label="Saved" value={formatDate(roadmap.created_at)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timeline view</CardTitle>
              <CardDescription>
                {roadmap.goal_type ? `${roadmap.goal_type} roadmap with sequenced steps, estimated time, and focus skills.` : "Sequenced steps, estimated time, and focus skills."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roadmap.steps.length ? (
                <RoadmapTimeline steps={roadmap.steps} />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  No roadmap steps were saved for this item.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Recently saved";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Recently saved" : parsed.toLocaleDateString();
}