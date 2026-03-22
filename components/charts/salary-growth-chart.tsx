"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DecisionAnalysis } from "@/types";

type SalaryGrowthChartProps = {
  data: DecisionAnalysis["salary_growth"];
  optionA: string;
  optionB: string;
};

export function SalaryGrowthChart({ data, optionA, optionB }: SalaryGrowthChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="optionA" name={optionA} stroke="#7c8cff" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="optionB" name={optionB} stroke="#2dd4bf" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
