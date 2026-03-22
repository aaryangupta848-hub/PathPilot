"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DecisionAnalysisView } from "@/components/decision/decision-analysis-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/services/authService";
import { getDecisionRecord } from "@/services/userService";
import type { DecisionRecord } from "@/types";

export default function DecisionDetailPage() {
  const params = useParams<{ id: string }>();
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) {
      setError("Decision id is missing.");
      setLoading(false);
      return;
    }

    if (!getCurrentUser()) {
      setError("Please sign in to view saved decisions.");
      setLoading(false);
      return;
    }

    void getDecisionRecord(params.id)
      .then((savedDecision) => {
        setDecision(savedDecision);
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load decision.");
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
            Saved decision
          </Badge>
          <h1 className="text-4xl font-semibold sm:text-5xl">{decision ? `${decision.option_a} vs ${decision.option_b}` : "Decision details"}</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Review the saved weighted analysis, tradeoffs, charts, and long-term outlook from your simulator run.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard?tab=decisions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Loading decision analysis...</CardContent>
        </Card>
      ) : null}

      {!loading && error ? (
        <Card>
          <CardContent className="p-8 text-sm text-rose-300">{error}</CardContent>
        </Card>
      ) : null}

      {!loading && !error && decision ? <DecisionAnalysisView analysis={decision.analysis} optionA={decision.option_a} optionB={decision.option_b} /> : null}
    </div>
  );
}