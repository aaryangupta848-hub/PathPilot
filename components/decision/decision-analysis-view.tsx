"use client";

import { RiskRadarChart } from "@/components/charts/risk-radar-chart";
import { SalaryGrowthChart } from "@/components/charts/salary-growth-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionAnalysis } from "@/types";

export function DecisionAnalysisView({ analysis, optionA, optionB }: { analysis: DecisionAnalysis; optionA: string; optionB: string }) {
  const criteria = Array.isArray(analysis.criteria_breakdown) ? analysis.criteria_breakdown : [];
  const opportunities = toArray(analysis.future_opportunities);
  const salaryData = Array.isArray(analysis.salary_growth) ? analysis.salary_growth : [];
  const riskData = Array.isArray(analysis.risk_level) ? analysis.risk_level : [];
  const priorities = Array.isArray(analysis.preference_profile?.priorities) ? analysis.preference_profile?.priorities : [];
  const customCriteria = Array.isArray(analysis.preference_profile?.custom_criteria) ? analysis.preference_profile?.custom_criteria : [];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Executive overview</CardTitle>
            <CardDescription>{analysis.recommendation || "A weighted comparison across priorities, constraints, and upside."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">{analysis.overview}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Time investment</p>
                <p className="mt-2">{analysis.time_investment}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Long-term outlook</p>
                <p className="mt-2">{analysis.long_term_outlook}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weighted score</CardTitle>
            <CardDescription>Higher score means the option fits your current constraints and goals better.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreRow label={optionA} value={analysis.weighted_scores?.optionA} />
            <ScoreRow label={optionB} value={analysis.weighted_scores?.optionB} />
            {analysis.weighted_scores?.recommendation ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                {analysis.weighted_scores.recommendation}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {analysis.preference_profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Decision context</CardTitle>
            <CardDescription>The constraints and priorities used to shape this simulation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <ContextRow label="Budget" value={analysis.preference_profile.budget || "Not specified"} />
              <ContextRow label="Location" value={analysis.preference_profile.location || "Flexible"} />
              <ContextRow label="Risk tolerance" value={analysis.preference_profile.risk_tolerance || "Medium"} />
              {analysis.preference_profile.context_notes ? <ContextRow label="Notes" value={analysis.preference_profile.context_notes} /> : null}
            </div>
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Priority weights</p>
                <div className="flex flex-wrap gap-2">
                  {priorities.length ? (
                    priorities.map((item, index) => <Badge key={`${item.label}-${index}`}>{item.label}: {item.weight}</Badge>)
                  ) : (
                    <span className="text-sm text-muted-foreground">No fixed priorities were supplied.</span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Custom criteria</p>
                <div className="flex flex-wrap gap-2">
                  {customCriteria.length ? (
                    customCriteria.map((item, index) => <Badge key={`${item.label}-${index}`}>{item.label}: {item.weight}</Badge>)
                  ) : (
                    <span className="text-sm text-muted-foreground">No custom criteria were supplied.</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {criteria.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Priority-weighted criteria</CardTitle>
            <CardDescription>How each option scored across the criteria you weighted most heavily.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criteria.map((item, index) => (
              <div key={`${item.label}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.rationale}</p>
                  </div>
                  <Badge>Weight {item.weight}</Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ScoreRow label={optionA} value={item.optionA} />
                  <ScoreRow label={optionB} value={item.optionB} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <ComparisonCard
          title={optionA}
          pros={toArray(analysis.optionA_pros)}
          cons={toArray(analysis.optionA_cons)}
          skills={toArray(analysis.skills_required?.optionA)}
          enhancements={toArray(analysis.future_enhancements?.optionA)}
        />
        <ComparisonCard
          title={optionB}
          pros={toArray(analysis.optionB_pros)}
          cons={toArray(analysis.optionB_cons)}
          skills={toArray(analysis.skills_required?.optionB)}
          enhancements={toArray(analysis.future_enhancements?.optionB)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Salary growth chart</CardTitle>
            <CardDescription>Illustrative trajectory generated from the comparison.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalaryGrowthChart data={salaryData} optionA={optionA} optionB={optionB} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk radar</CardTitle>
            <CardDescription>Higher values indicate higher friction or uncertainty.</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskRadarChart data={riskData} optionA={optionA} optionB={optionB} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Future opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {opportunities.length ? (
              opportunities.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                No future opportunities were generated for this analysis.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline projection</CardTitle>
            <CardDescription>How the two paths can evolve across key checkpoints.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {salaryData.length ? (
              salaryData.map((point) => (
                <div key={point.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground">{point.label}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>{optionA}</span>
                      <span className="font-medium">{point.optionA} LPA</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{optionB}</span>
                      <span className="font-medium">{point.optionB} LPA</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-4">
                No timeline projection was generated for this analysis.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value?: number }) {
  const display = typeof value === "number" ? `${value.toFixed(1)}/10` : "No score";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{display}</span>
    </div>
  );
}

function ComparisonCard({
  title,
  pros,
  cons,
  skills,
  enhancements
}: {
  title: string;
  pros: string[];
  cons: string[];
  skills: string[];
  enhancements: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionList title="Pros" tone="emerald" items={pros} emptyMessage="No pros were generated." />
        <SectionList title="Cons" tone="amber" items={cons} emptyMessage="No cons were generated." />
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Skills required</p>
          <div className="flex flex-wrap gap-2">
            {skills.length ? skills.map((skill, index) => <Badge key={`${skill}-${index}`}>{skill}</Badge>) : <span className="text-sm text-muted-foreground">No skills listed.</span>}
          </div>
        </div>
        <SectionList title="Future enhancements" tone="default" items={enhancements} emptyMessage="No enhancements were generated." />
      </CardContent>
    </Card>
  );
}

function SectionList({ title, tone, items, emptyMessage }: { title: string; tone: "emerald" | "amber" | "default"; items: string[]; emptyMessage: string }) {
  const toneClassName =
    tone === "emerald"
      ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-100"
      : tone === "amber"
        ? "border-amber-300/15 bg-amber-300/10 text-amber-50"
        : "border-white/10 bg-white/5 text-muted-foreground";

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-foreground">{title}</p>
      <div className="space-y-2">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${item}-${index}`} className={`rounded-2xl border px-4 py-3 text-sm ${toneClassName}`}>
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}

function toArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}