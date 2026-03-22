"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Sparkles, X } from "lucide-react";

import { DecisionAnalysisView } from "@/components/decision/decision-analysis-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/services/authService";
import { analyzeDecision } from "@/services/decisionService";
import { saveDecisionRecord } from "@/services/userService";
import type { AuthUser, DecisionAnalysis, DecisionPriorityInput } from "@/types";

const defaultPriorities: DecisionPriorityInput[] = [
  { label: "Salary growth", weight: 8 },
  { label: "Stability", weight: 7 },
  { label: "Learning curve", weight: 6 },
  { label: "Work-life balance", weight: 6 }
];

const riskOptions = ["Low", "Medium", "High"];

export default function SimulatorPage() {
  const [optionA, setOptionA] = useState("MBA");
  const [optionB, setOptionB] = useState("Software Engineer");
  const [budget, setBudget] = useState("Up to 10 lakh upfront");
  const [location, setLocation] = useState("Metro city or flexible");
  const [riskTolerance, setRiskTolerance] = useState("Medium");
  const [contextNotes, setContextNotes] = useState("I want faster upside without creating unnecessary financial stress.");
  const [priorities, setPriorities] = useState<DecisionPriorityInput[]>(defaultPriorities);
  const [customCriteria, setCustomCriteria] = useState<DecisionPriorityInput[]>([{ label: "Brand / network effect", weight: 5 }]);
  const [analysis, setAnalysis] = useState<DecisionAnalysis | null>(null);
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
      const normalizedCustomCriteria = customCriteria.filter((item) => item.label.trim());
      const result = await analyzeDecision({
        optionA,
        optionB,
        budget,
        location,
        riskTolerance,
        priorities,
        customCriteria: normalizedCustomCriteria,
        contextNotes
      });
      setAnalysis(result);

      if (user?.id) {
        await saveDecisionRecord({
          option_a: optionA,
          option_b: optionB,
          analysis: result
        });
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to run analysis.");
    } finally {
      setLoading(false);
    }
  }

  function updatePriority(index: number, weight: number) {
    setPriorities((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, weight: clampWeight(weight) } : item)));
  }

  function updateCustomCriterion(index: number, patch: Partial<DecisionPriorityInput>) {
    setCustomCriteria((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function addCustomCriterion() {
    setCustomCriteria((current) => [...current, { label: "", weight: 5 }]);
  }

  function removeCustomCriterion(index: number) {
    setCustomCriteria((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="section-shell space-y-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Badge variant="info" className="w-fit">
          AI Decision Simulator
        </Badge>
        <h1 className="text-4xl font-semibold sm:text-5xl">Run a weighted simulation before you commit.</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Compare two career or life paths using weighted priorities, budget, location, risk tolerance, and custom criteria instead of relying on a plain option-vs-option text prompt.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Build your decision context</CardTitle>
          <CardDescription>Set constraints, choose what matters most, and then ask the simulator to score both paths against your priorities.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Option A</label>
                <Input value={optionA} onChange={(event) => setOptionA(event.target.value)} placeholder="MBA" />
              </div>
              <div className="hidden pb-3 text-center text-muted-foreground md:block">vs</div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Option B</label>
                <Input value={optionB} onChange={(event) => setOptionB(event.target.value)} placeholder="Software Engineer" />
              </div>
              <Button type="submit" disabled={loading || !optionA.trim() || !optionB.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Budget</label>
                <Input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Up to 10 lakh upfront" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Preferred location</label>
                <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Metro city, remote, hometown, abroad..." />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Risk tolerance</label>
              <div className="flex flex-wrap gap-3">
                {riskOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRiskTolerance(option)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${riskTolerance === option ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Priority weights</p>
                <p className="mt-1 text-sm text-muted-foreground">Use a 1 to 10 weight to show what matters most in this decision.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {priorities.map((priority, index) => (
                  <div key={priority.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{priority.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Higher weight means the simulator will care more about this criterion.</p>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={priority.weight}
                        onChange={(event) => updatePriority(index, Number(event.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Custom criteria</p>
                  <p className="mt-1 text-sm text-muted-foreground">Add any personal rule the default weights do not capture.</p>
                </div>
                <Button type="button" variant="secondary" onClick={addCustomCriterion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add criterion
                </Button>
              </div>
              <div className="space-y-3">
                {customCriteria.map((criterion, index) => (
                  <div key={`custom-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_120px_auto] md:items-center">
                    <Input
                      value={criterion.label}
                      onChange={(event) => updateCustomCriterion(index, { label: event.target.value })}
                      placeholder="Example: brand/network effect"
                    />
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={criterion.weight}
                      onChange={(event) => updateCustomCriterion(index, { weight: clampWeight(Number(event.target.value)) })}
                    />
                    <Button type="button" variant="ghost" onClick={() => removeCustomCriterion(index)} disabled={customCriteria.length === 1}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Extra context</label>
              <Textarea value={contextNotes} onChange={(event) => setContextNotes(event.target.value)} placeholder="Add any special situation, timeline, family context, or non-negotiable here." />
            </div>
          </form>

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
          {!user ? <p className="mt-4 text-sm text-muted-foreground">Sign in to save this comparison to your MongoDB-backed dashboard.</p> : null}
        </CardContent>
      </Card>

      {analysis ? (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <DecisionAnalysisView analysis={analysis} optionA={optionA} optionB={optionB} />
        </motion.div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 p-10 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <p className="text-lg font-medium">Your weighted comparison will appear here</p>
              <p className="mt-2 text-sm text-muted-foreground">Run the simulator to see how each option performs against your priorities, constraints, salary trajectory, and risk profile.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function clampWeight(value: number) {
  if (Number.isNaN(value)) {
    return 5;
  }

  return Math.min(10, Math.max(1, value));
}