"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/services/authService";
import { getDashboardData, saveFocusSessionRecord } from "@/services/userService";
import type { AuthUser, FocusSessionRecord } from "@/types";

const presets = [25, 50, 90];

export default function FocusPage() {
  const [task, setTask] = useState("Deep work sprint");
  const [duration, setDuration] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Ready to focus.");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [recentSessions, setRecentSessions] = useState<FocusSessionRecord[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser) {
      return;
    }

    void loadFocusHistory();
  }, []);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (secondsLeft !== 0 || savingSession) {
      return;
    }

    void finalizeFocusSession("completed");
  }, [secondsLeft, savingSession]);

  async function loadFocusHistory() {
    setLoadingHistory(true);

    try {
      const dashboardData = await getDashboardData();
      setRecentSessions(dashboardData.focusSessions.slice(0, 5));
      setCompletedToday(dashboardData.stats.focusSessions);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load focus history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function finalizeFocusSession(reason: "completed" | "stopped") {
    if (mode !== "focus") {
      setRunning(false);
      setMode("focus");
      setSecondsLeft(duration * 60);
      setStatus("Break stopped. Ready for the next focus session.");
      return;
    }

    const elapsedSeconds = duration * 60 - secondsLeft;
    if (reason === "stopped" && elapsedSeconds <= 0) {
      setRunning(false);
      setStatus("Timer stopped before any focus time was logged.");
      return;
    }

    const sessionDuration = reason === "completed" ? duration : Math.max(1, Math.round(elapsedSeconds / 60));

    setSavingSession(true);
    setRunning(false);

    try {
      if (user?.id && task.trim()) {
        await saveFocusSessionRecord({
          task: task.trim(),
          duration: sessionDuration
        });
        await loadFocusHistory();
      } else {
        setCompletedToday((current) => current + 1);
      }

      setError(null);

      if (reason === "completed") {
        setStatus(user ? "Focus session complete. Break time." : "Focus session complete. Sign in to save session history.");
        setMode("break");
        setSecondsLeft(5 * 60);
      } else {
        setStatus(user ? "Focus session stopped and saved." : "Focus session stopped. Sign in to save session history.");
        setMode("focus");
        setSecondsLeft(duration * 60);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save focus session.");
      setStatus("Focus session finished, but saving failed.");
      setMode(reason === "completed" ? "break" : "focus");
      setSecondsLeft(reason === "completed" ? 5 * 60 : duration * 60);
    } finally {
      setSavingSession(false);
    }
  }

  function selectDuration(nextDuration: number) {
    if (running || savingSession) {
      return;
    }

    setDuration(nextDuration);
    if (mode === "focus") {
      setSecondsLeft(nextDuration * 60);
    }
  }

  function handleStart() {
    setRunning(true);
    setStatus(mode === "focus" ? `Focused on ${task.trim() || "your task"}.` : "Break in progress.");
  }

  function resetTimer() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(duration * 60);
    setStatus("Timer reset. Ready to focus.");
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="section-shell space-y-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Badge variant="info" className="w-fit">
          Focus mode
        </Badge>
        <h1 className="text-4xl font-semibold sm:text-5xl">Protect deep work with a clean Pomodoro command center.</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Choose a focus duration, lock onto one task, and save finished sessions to MongoDB so your dashboard reflects real execution.
        </p>
      </motion.div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-rose-300">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pomodoro timer</CardTitle>
            <CardDescription>{status}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Current task</label>
              <Input value={task} onChange={(event) => setTask(event.target.value)} placeholder="Revise system design" disabled={running || savingSession} />
            </div>
            <div className="flex flex-wrap gap-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => selectDuration(preset)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${duration === preset ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}
                  disabled={running || savingSession}
                >
                  {preset} min
                </button>
              ))}
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{mode}</p>
              <div className="mt-4 text-6xl font-semibold tracking-tight">{minutes}:{seconds}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleStart} disabled={running || savingSession || !task.trim()}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
              <Button variant="secondary" onClick={() => void finalizeFocusSession("stopped")} disabled={!running || savingSession}>
                <Pause className="mr-2 h-4 w-4" />
                Stop
              </Button>
              <Button variant="outline" onClick={resetTimer} disabled={savingSession}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session tracking</CardTitle>
            <CardDescription>{user ? "Saved focus sessions sync to MongoDB." : "Sign in to persist sessions to your dashboard."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-muted-foreground">Completed sessions</p>
                <p className="mt-3 text-4xl font-semibold">{completedToday}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-muted-foreground">Active duration</p>
                <p className="mt-3 text-4xl font-semibold">{duration}m</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Recent sessions</p>
              {loadingHistory ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading focus history...
                </div>
              ) : recentSessions.length ? (
                recentSessions.map((session) => (
                  <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between gap-4">
                      <span>{session.task}</span>
                      <span>{session.duration} min</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  No saved sessions yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}