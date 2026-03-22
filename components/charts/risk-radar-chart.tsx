"use client";

import { Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import type { DecisionAnalysis } from "@/types";

type RiskRadarChartProps = {
  data: DecisionAnalysis["risk_level"];
  optionA: string;
  optionB: string;
};

export function RiskRadarChart({ data, optionA, optionB }: RiskRadarChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="category" stroke="rgba(255,255,255,0.55)" />
          <Legend />
          <Radar name={optionA} dataKey="optionA" stroke="#7c8cff" fill="#7c8cff" fillOpacity={0.35} />
          <Radar name={optionB} dataKey="optionB" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
