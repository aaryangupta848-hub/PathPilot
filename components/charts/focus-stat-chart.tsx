"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FocusStatChart({ data }: { data: { label: string; minutes: number }[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
          <Bar dataKey="minutes" fill="url(#focusGradient)" radius={[12, 12, 0, 0]} />
          <defs>
            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c8cff" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
