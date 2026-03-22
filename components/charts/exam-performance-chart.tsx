"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ExamPerformanceChart({ data }: { data: { label: string; average: number; target: number }[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16
            }}
          />
          <Legend />
          <Bar dataKey="average" name="Average score" fill="#7c8cff" radius={[10, 10, 0, 0]} />
          <Bar dataKey="target" name="Target score" fill="#2dd4bf" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}