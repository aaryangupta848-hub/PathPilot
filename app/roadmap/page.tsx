"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Milestone } from "lucide-react";

import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/services/authService";
import { generateRoadmap } from "@/services/roadmapService";
import { saveGoalRecord, saveRoadmapRecord } from "@/services/userService";
import type { AuthUser, RoadmapStep } from "@/types";

const suggestedGoals = ["Become Product Manager", "Become Data Scientist", "Crack UPSC"];

export default function RoadmapPage() {
  const [goal, setGoal] = useState("Become Product Manager");
  const [goalType, setGoalType] = useState("Career");
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const roadmapSteps = await generateRoadmap({ goal, goalType });
      setSteps(roadmapSteps);

      if (user?.id) {
        const goalId = await saveGoalRecord({
          title: goal,
          goal_type: goalType
        });

        if (goalId) {
          await saveRoadmapRecord({
            goal_id: goalId,
            steps: roadmapSteps
          });
        }
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to generate roadmap.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-shell space-y-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Badge variant="info" className="w-fit">
          Goal roadmap generator
        </Badge>
        <h1 className="text-4xl font-semibold sm:text-5xl">Generate an execution roadmap for your next big goal.</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Start with a goal like becoming a product manager, data scientist, or clearing a competitive exam. PathPilot turns that into a structured timeline with milestones and skills.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Describe the goal</CardTitle>
          <CardDescription>Add a title and optional goal type to shape the roadmap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {suggestedGoals.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGoal(item)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
              >
                {item}
              </button>
            ))}
          </div>
          <form className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Goal</label>
              <Input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Become Product Manager" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Goal type</label>
              <Input value={goalType} onChange={(event) => setGoalType(event.target.value)} placeholder="Career" />
            </div>
            <Button type="submit" disabled={loading || !goal.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </form>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {!user ? <p className="text-sm text-muted-foreground">Sign in if you want this roadmap stored in MongoDB and surfaced on your dashboard.</p> : null}
        </CardContent>
      </Card>

      {steps.length ? (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <RoadmapTimeline steps={steps} />
        </motion.div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 p-10 text-center">
            <Milestone className="h-8 w-8 text-primary" />
            <div>
              <p className="text-lg font-medium">A personalized roadmap will appear here</p>
              <p className="mt-2 text-sm text-muted-foreground">Generate a roadmap to see sequenced steps, estimated time, and skills to focus on.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
