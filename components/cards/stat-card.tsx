import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

export function StatCard({ title, value, hint, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
