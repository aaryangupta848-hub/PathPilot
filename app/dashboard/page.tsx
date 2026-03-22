"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrainCircuit, Goal, Milestone, Timer } from "lucide-react";

import { StatCard } from "@/components/cards/stat-card";
import { FocusStatChart } from "@/components/charts/focus-stat-chart";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardSeed } from "@/lib/static-data";
import { getCurrentUser } from "@/services/authService";
import { getDashboardData } from "@/services/userService";
import type { AuthUser, DashboardData, DecisionRecord, FocusSessionRecord, GoalRecord, RoadmapRecord } from "@/types";

type DashboardLinkItem = {
  key: string;
  label: string;
  subtitle?: string;
  href?: string;
};

const emptyDashboardData: DashboardData = {
  goals: [],
  roadmaps: [],
  decisions: [],
  focusSessions: [],
  stats: {
    goals: 0,
    roadmaps: 0,
    decisions: 0,
    focusSessions: 0,
    focusMinutes: 0
  }
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="section-shell text-sm text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>(emptyDashboardData);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    void getDashboardData()
      .then((dashboardData) => {
        setData(dashboardData);
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const goalProgress = data.stats.goals
    ? Math.min(100, Math.round((data.stats.roadmaps / data.stats.goals) * 100))
    : dashboardSeed.goalProgress;
  const focusChartData = data.focusSessions.length ? buildFocusChart(data.focusSessions) : dashboardSeed.focusStats;
  const focusHours = user ? (data.stats.focusMinutes / 60).toFixed(1) : "7.7";
  const recentRoadmaps = user
    ? data.roadmaps.map((roadmap) => ({
        key: roadmap.id || roadmap.goal_id,
        label: roadmap.goal_title || `Goal ${roadmap.goal_id}`,
        subtitle: `${roadmap.steps.length} steps saved`,
        href: roadmap.id ? `/roadmap/${roadmap.id}` : undefined
      }))
    : dashboardSeed.recentRoadmaps.map((item, index) => ({
        key: `seed-roadmap-${index}`,
        label: item.title,
        subtitle: `${item.steps} steps saved`
      }));
  const recentDecisions = user
    ? data.decisions.map((decision) => ({
        key: decision.id || `${decision.option_a}-${decision.option_b}`,
        label: `${decision.option_a} vs ${decision.option_b}`,
        subtitle: formatDate(decision.created_at),
        href: decision.id ? `/simulator/${decision.id}` : undefined
      }))
    : dashboardSeed.recentDecisions.map((item, index) => ({
        key: `seed-decision-${index}`,
        label: item
      }));

  return (
    <div className="section-shell">
      <div className="flex gap-6">
        <Sidebar />
        <div className="min-w-0 flex-1 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="info" className="w-fit">
                Dashboard
              </Badge>
              <h1 className="text-4xl font-semibold">{user ? `Welcome back, ${user.name}` : "Preview the PathPilot dashboard"}</h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                Review your goals, roadmaps, decisions, and focus data from a single operator view.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" asChild>
                <Link href="/simulator">New decision</Link>
              </Button>
              <Button asChild>
                <Link href="/roadmap">New roadmap</Link>
              </Button>
            </div>
          </div>

          {!user ? (
            <Card>
              <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">You are viewing dashboard preview data.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Sign in with JWT auth to sync real records from MongoDB.</p>
                </div>
                <Button asChild>
                  <Link href="/auth">Sign in</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Goals" value={String(user ? data.stats.goals : 4)} hint="Tracked ambitions in your workspace" icon={<Goal className="h-5 w-5" />} />
            <StatCard title="Roadmaps" value={String(user ? data.stats.roadmaps : 3)} hint="Saved step-by-step plans" icon={<Milestone className="h-5 w-5" />} />
            <StatCard title="Decisions" value={String(user ? data.stats.decisions : 7)} hint="Simulations run and stored" icon={<BrainCircuit className="h-5 w-5" />} />
            <StatCard title="Focus Hours" value={focusHours} hint="Deep work converted into progress" icon={<Timer className="h-5 w-5" />} />
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-sm text-muted-foreground">Loading dashboard...</CardContent>
            </Card>
          ) : null}

          {error ? (
            <Card>
              <CardContent className="p-8 text-sm text-rose-300">{error}</CardContent>
            </Card>
          ) : null}

          {!loading && !error && activeTab === "overview" ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Goal progress</CardTitle>
                    <CardDescription>High-level completion signal across your active goals.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{goalProgress}%</span>
                    </div>
                    <Progress value={goalProgress} />
                  </CardContent>
                </Card>

                <ItemListCard title="Recent roadmaps" items={recentRoadmaps} emptyMessage="No roadmaps saved yet. Generate one from the roadmap page." />
                <ItemListCard title="Recent decisions" items={recentDecisions} emptyMessage="No saved comparisons yet. Run the decision simulator to populate this list." />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Focus statistics</CardTitle>
                  <CardDescription>Recent session minutes by day.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FocusStatChart data={focusChartData} />
                </CardContent>
              </Card>
            </div>
          ) : null}

          {!loading && !error && activeTab === "goals" ? <GoalsPanel goals={data.goals} /> : null}
          {!loading && !error && activeTab === "roadmaps" ? <RoadmapsPanel roadmaps={data.roadmaps} /> : null}
          {!loading && !error && activeTab === "decisions" ? <DecisionsPanel decisions={data.decisions} /> : null}
          {!loading && !error && activeTab === "focus" ? <FocusPanel sessions={data.focusSessions} /> : null}
        </div>
      </div>
    </div>
  );
}

function ItemListCard({ title, items, emptyMessage }: { title: string; items: DashboardLinkItem[]; emptyMessage: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? items.map((item) => <DashboardLinkTile key={item.key} item={item} />) : <EmptyState message={emptyMessage} />}
      </CardContent>
    </Card>
  );
}

function DashboardLinkTile({ item }: { item: DashboardLinkItem }) {
  const content = (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground transition hover:border-white/20 hover:bg-white/10">
      <p className="font-medium text-foreground">{item.label}</p>
      {item.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p> : null}
    </div>
  );

  if (!item.href) {
    return content;
  }

  return (
    <Link href={item.href} className="block">
      {content}
    </Link>
  );
}

function GoalsPanel({ goals }: { goals: GoalRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.length ? (
          goals.map((goal) => (
            <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-medium">{goal.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{goal.goal_type}</p>
            </div>
          ))
        ) : (
          <EmptyState message="No goals saved yet. Generate a roadmap to create your first goal record." />
        )}
      </CardContent>
    </Card>
  );
}

function RoadmapsPanel({ roadmaps }: { roadmaps: RoadmapRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roadmaps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {roadmaps.length ? (
          roadmaps.map((roadmap) => (
            <Link key={roadmap.id} href={`/roadmap/${roadmap.id}`} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10">
              <p className="font-medium">{roadmap.goal_title || `Goal ${roadmap.goal_id}`}</p>
              <p className="mt-1 text-sm text-muted-foreground">{roadmap.steps.length} steps saved</p>
              {roadmap.created_at ? <p className="mt-2 text-xs text-muted-foreground">Updated {formatDate(roadmap.created_at)}</p> : null}
            </Link>
          ))
        ) : (
          <EmptyState message="No roadmaps saved yet. Generate one from the roadmap page." />
        )}
      </CardContent>
    </Card>
  );
}

function DecisionsPanel({ decisions }: { decisions: DecisionRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Decisions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {decisions.length ? (
          decisions.map((decision) => (
            <Link key={decision.id} href={`/simulator/${decision.id}`} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10">
              <p className="font-medium">{decision.option_a} vs {decision.option_b}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(decision.created_at)}</p>
            </Link>
          ))
        ) : (
          <EmptyState message="No saved comparisons yet. Run the decision simulator to populate this list." />
        )}
      </CardContent>
    </Card>
  );
}

function FocusPanel({ sessions }: { sessions: FocusSessionRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length ? (
          sessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{session.task}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(session.created_at)}</p>
                </div>
                <Badge>{session.duration} min</Badge>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No focus history yet. Complete a Pomodoro session to see it here." />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">{message}</div>;
}

function buildFocusChart(sessions: FocusSessionRecord[]) {
  const grouped = new Map<string, number>();
  sessions.forEach((session) => {
    const label = new Date(session.created_at).toLocaleDateString("en-US", { weekday: "short" });
    grouped.set(label, (grouped.get(label) || 0) + session.duration);
  });

  return Array.from(grouped.entries()).map(([label, minutes]) => ({ label, minutes }));
}

function formatDate(value?: string) {
  if (!value) {
    return "Recently saved";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Recently saved" : parsed.toLocaleDateString();
}