"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart3, BookOpenCheck, BrainCircuit, CalendarDays, Goal, LayoutDashboard, ListChecks, Timer } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tab: null },
  { href: "/dashboard?tab=goals", label: "My Goals", icon: Goal, tab: "goals" },
  { href: "/dashboard?tab=roadmaps", label: "Roadmaps", icon: ListChecks, tab: "roadmaps" },
  { href: "/dashboard?tab=decisions", label: "Decisions", icon: BrainCircuit, tab: "decisions" },
  { href: "/dashboard?tab=focus", label: "Focus Sessions", icon: Timer, tab: "focus" },
  { href: "/exams", label: "Exams", icon: BookOpenCheck, tab: null },
  { href: "/timetable", label: "TimeTable", icon: CalendarDays, tab: null },
  { href: "/explore", label: "Explore", icon: BarChart3, tab: null }
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  return (
    <aside className="glass-panel sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 rounded-[1.75rem] p-4 lg:block">
      <div className="mb-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-muted-foreground">Workspace</p>
        <h2 className="mt-2 text-xl font-semibold">Decision command center</h2>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isDashboardRoute = pathname === "/dashboard" && item.tab === activeTab;
          const active = pathname === item.href || (item.tab === null ? pathname === item.href : isDashboardRoute);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground",
                active && "bg-white text-slate-950"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}