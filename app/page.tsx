"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BrainCircuit, CalendarClock, GaugeCircle, Rocket, Sparkles, Target } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Step = {
  title: string;
  description: string;
  icon: typeof Target;
};

const steps: Step[] = [
  {
    title: "Enter your goal or decision",
    description: "Type your career or exam decision in plain language.",
    icon: Target
  },
  {
    title: "AI analyzes outcomes",
    description: "PathPilot compares salary trajectory, risk, and execution timeline.",
    icon: BrainCircuit
  },
  {
    title: "Get roadmap + insights",
    description: "Receive a practical action plan with milestones and next moves.",
    icon: Rocket
  }
];

const salaryData = [
  { year: "Y1", mba: 10, engineer: 18 },
  { year: "Y2", mba: 14, engineer: 23 },
  { year: "Y3", mba: 21, engineer: 29 },
  { year: "Y4", mba: 28, engineer: 35 },
  { year: "Y5", mba: 34, engineer: 42 }
];

const sectionStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" }
  }
};

const particles = [
  { left: "7%", top: "18%", size: 5, delay: 0.3, duration: 9.2 },
  { left: "18%", top: "44%", size: 4, delay: 1.3, duration: 10.1 },
  { left: "29%", top: "22%", size: 3, delay: 0.8, duration: 8.8 },
  { left: "44%", top: "65%", size: 5, delay: 0.2, duration: 9.7 },
  { left: "59%", top: "31%", size: 4, delay: 1.7, duration: 11.4 },
  { left: "72%", top: "19%", size: 3, delay: 0.6, duration: 8.6 },
  { left: "84%", top: "56%", size: 5, delay: 1.1, duration: 10.3 },
  { left: "93%", top: "27%", size: 3, delay: 1.4, duration: 9.4 }
];

function InteractiveMetricCard({
  title,
  value,
  tone
}: {
  title: string;
  value: string;
  tone: "primary" | "accent" | "neutral";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary border-primary/30"
      : tone === "accent"
        ? "text-sky-300 border-sky-400/30"
        : "text-foreground border-white/20";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      className="rounded-2xl border border-white/20 bg-white/[0.08] p-4 shadow-[0_20px_56px_-34px_rgba(0,0,0,1)]"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <p className={`mt-2 text-xl font-semibold ${toneClass}`}>{value}</p>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="relative">
      <section className="section-shell relative overflow-hidden pt-20 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[linear-gradient(125deg,rgba(235,167,85,0.16),rgba(97,154,246,0.14),rgba(184,128,255,0.12),rgba(235,167,85,0.16))] bg-[length:220%_220%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.16]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,215,150,0.22),transparent_42%),radial-gradient(circle_at_84%_20%,rgba(122,181,255,0.2),transparent_40%)]" />
        </div>
        <div className="absolute left-1/2 top-24 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/35 blur-[120px]" />
        {particles.map((particle) => (
          <motion.span
            key={`${particle.left}-${particle.top}`}
            className="pointer-events-none absolute rounded-full bg-white/35"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size
            }}
            animate={{ y: [0, -14, 0], opacity: [0.14, 0.65, 0.14] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}

        <div className="grid gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72 }}
            className="space-y-7"
          >
            <Badge variant="info" className="w-fit border-white/25 bg-white/10 px-4 py-1.5 tracking-[0.2em]">
              Premium AI Decision Workspace
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl">
                Stop guessing your future.
                <span className="block bg-gradient-to-r from-[#ffd99f] via-[#cfe0ff] to-[#f2b7ff] bg-[length:220%_220%] bg-clip-text text-transparent animate-shimmer">
                  Start simulating it.
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                PathPilot shows likely outcomes for major choices, then turns the winning path into an actionable roadmap.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  asChild
                  className="border border-white/25 bg-gradient-to-r from-[#e9ab64] via-[#f7cc8d] to-[#7dc4ff] text-slate-950 shadow-[0_22px_66px_-24px_rgba(231,168,94,0.95)]"
                >
                  <Link href="/simulator">
                    Simulate Your Future
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  asChild
                  variant="secondary"
                  className="border-white/20 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:border-white/35 hover:bg-white/[0.14]"
                >
                  <Link href="/roadmap">Generate Roadmap</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <Card className="overflow-hidden border-white/20 bg-white/[0.07] shadow-[0_45px_120px_-70px_rgba(0,0,0,1)]">
              <CardHeader className="space-y-3">
                <Badge className="w-fit border-white/25 bg-white/10">Live AI Simulation Preview</Badge>
                <CardTitle className="text-2xl md:text-3xl">MBA vs Software Engineer</CardTitle>
                <div className="rounded-xl border border-white/20 bg-[#11131a]/70 px-4 py-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Input:</span> MBA vs Software Engineer
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <InteractiveMetricCard title="Salary Difference" value="+₹8L by Year 5" tone="accent" />
                  <InteractiveMetricCard title="Risk Level" value="Low-Medium" tone="neutral" />
                  <InteractiveMetricCard title="Timeline" value="18 months transition" tone="primary" />
                </div>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#1c1712]/95 to-[#172231]/95 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Expected salary growth</p>
                    <p className="text-xs text-muted-foreground">₹ LPA</p>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salaryData} margin={{ left: -10, right: 8, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="mbaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f5c279" stopOpacity={0.62} />
                            <stop offset="95%" stopColor="#f5c279" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="engFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7dc4ff" stopOpacity={0.62} />
                            <stop offset="95%" stopColor="#7dc4ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.14)" />
                        <XAxis dataKey="year" tickLine={false} axisLine={false} stroke="rgba(242,242,245,0.72)" />
                        <YAxis tickLine={false} axisLine={false} stroke="rgba(242,242,245,0.72)" />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(13,12,18,0.95)",
                            border: "1px solid rgba(255,255,255,0.14)",
                            borderRadius: "14px"
                          }}
                        />
                        <Area type="monotone" dataKey="mba" stroke="#f5c279" strokeWidth={2.2} fill="url(#mbaFill)" />
                        <Area type="monotone" dataKey="engineer" stroke="#7dc4ff" strokeWidth={2.2} fill="url(#engFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="rounded-[2rem] border border-white/20 bg-gradient-to-br from-white/[0.11] to-white/[0.04] p-6 shadow-[0_40px_100px_-64px_rgba(0,0,0,1)] md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.28em] text-primary">Try Demo</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Try a real simulation</h2>
              <p className="text-muted-foreground">Run the MBA vs Software Engineer scenario inside the simulator.</p>
            </div>
            <Button
              asChild
              size="lg"
              className="border border-white/20 bg-gradient-to-r from-[#e9ab64] via-[#f6c787] to-[#7dc4ff] text-slate-950 shadow-[0_20px_58px_-26px_rgba(233,171,100,0.95)]"
            >
              <Link href="/simulator">
                Run Simulation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="section-shell pt-0">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">How It Works</p>
          <h2 className="text-3xl font-semibold md:text-4xl">Three steps to confident decisions</h2>
        </div>
        <motion.div
          variants={sectionStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative grid gap-5 md:grid-cols-3"
        >
          <div className="pointer-events-none absolute left-12 right-12 top-8 hidden h-px bg-gradient-to-r from-primary/0 via-white/35 to-primary/0 md:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                whileHover={{ y: -7, scale: 1.014 }}
                className="rounded-[1.6rem] border border-white/20 bg-white/[0.08] p-6 shadow-[0_26px_72px_-46px_rgba(0,0,0,1)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-primary/35 to-accent/30">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Step {index + 1}</p>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="section-shell pt-0 pb-20 md:pb-28">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Core Modules</p>
          <h2 className="text-3xl font-semibold md:text-4xl">Everything focused on your next big move</h2>
        </div>
        <motion.div
          variants={sectionStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <motion.div variants={fadeUp} whileHover={{ y: -8, scale: 1.012, rotateY: -1.5 }} style={{ transformPerspective: 1000 }}>
            <Card className="h-full border-white/20 bg-white/[0.08] shadow-[0_34px_96px_-62px_rgba(0,0,0,1)]">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-primary/35 to-primary/15">
                  <GaugeCircle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-3xl">Decision Simulator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Compare outcomes with salary, risk, and timeline clarity before you commit.</p>
                <Button asChild className="border border-white/20 bg-gradient-to-r from-[#e8aa63] to-[#7bc4ff] text-slate-950">
                  <Link href="/simulator">Simulate Your Future</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ y: -8, scale: 1.012, rotateY: 1.5 }} style={{ transformPerspective: 1000 }}>
            <Card className="h-full border-white/20 bg-white/[0.08] shadow-[0_34px_96px_-62px_rgba(0,0,0,1)]">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-sky-300/35 to-sky-500/18">
                  <CalendarClock className="h-5 w-5 text-sky-300" />
                </div>
                <CardTitle className="text-3xl">Roadmap Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Turn your chosen path into concrete milestones, priorities, and execution phases.</p>
                <Button asChild variant="secondary" className="border-white/20 bg-white/[0.12] hover:bg-white/[0.17]">
                  <Link href="/roadmap">Generate Roadmap</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="mt-10 rounded-[1.75rem] border border-white/20 bg-white/[0.07] p-6 text-center shadow-[0_30px_80px_-58px_rgba(0,0,0,1)]"
        >
          <p className="text-sm uppercase tracking-[0.28em] text-primary">Ready to decide with confidence?</p>
          <h3 className="mt-3 text-2xl font-semibold md:text-3xl">See your future before you choose it.</h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button asChild className="border border-white/20 bg-gradient-to-r from-[#e9ab64] via-[#f7ca8a] to-[#7dc4ff] text-slate-950">
              <Link href="/simulator">
                Simulate Your Future
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="border-white/20 bg-white/[0.1] hover:bg-white/[0.16]">
              <Link href="/roadmap">Generate Roadmap</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
