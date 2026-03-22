"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { examGuides, skillRoadmaps } from "@/lib/static-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  {
    title: "Decision Simulator",
    description: "Compare two futures side by side with AI-generated tradeoffs, salary growth, and risk profiles.",
    href: "/simulator"
  },
  {
    title: "Goal Roadmap Generator",
    description: "Convert a big ambition into sequenced milestones, skills, and estimated time horizons.",
    href: "/roadmap"
  },
  {
    title: "Focus Mode",
    description: "Protect deep work with a focused Pomodoro flow and persistent MongoDB-backed session history.",
    href: "/focus"
  },
  {
    title: "Dashboard",
    description: "Review goals, decisions, roadmaps, and focus statistics inside a modern operator view.",
    href: "/dashboard"
  }
];

export default function ExplorePage() {
  return (
    <div className="section-shell space-y-12">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <Badge variant="info" className="w-fit">
          Explore the platform
        </Badge>
        <h1 className="text-4xl font-semibold sm:text-5xl">A guided stack for life planning, career moves, and execution.</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          PathPilot combines AI reasoning, structured roadmaps, exam prep guides, and productivity tools so you can move from confusion to clear next steps.
        </p>
      </motion.div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module, index) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" asChild>
                  <Link href={module.href}>Open module</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Competitive exam hub</CardTitle>
            <CardDescription>Browse curated high-level preparation guides for the most requested competitive exams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {examGuides.map((exam) => (
              <div key={exam.slug} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium">{exam.name}</p>
                  <p className="text-sm text-muted-foreground">Difficulty: {exam.difficulty}</p>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/exams/${exam.slug}`}>View guide</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill roadmaps</CardTitle>
            <CardDescription>Follow structured learning paths across high-demand skill stacks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillRoadmaps.map((roadmap) => (
              <div key={roadmap.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium">{roadmap.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{roadmap.summary}</p>
              </div>
            ))}
            <Button asChild>
              <Link href="/skills">See skill roadmaps</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

