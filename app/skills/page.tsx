import { skillRoadmaps } from "@/lib/static-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkillsPage() {
  return (
    <div className="section-shell space-y-10">
      <div className="space-y-4">
        <Badge variant="info" className="w-fit">
          Skill learning tracks
        </Badge>
        <h1 className="text-4xl font-semibold sm:text-5xl">Skill roadmaps built for modern, compounding careers.</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Choose a lane, understand the milestones, and use the roadmap generator when you want a personalized step-by-step plan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {skillRoadmaps.map((roadmap) => (
          <Card key={roadmap.title}>
            <CardHeader>
              <CardTitle>{roadmap.title}</CardTitle>
              <CardDescription>{roadmap.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roadmap.milestones.map((milestone, index) => (
                  <div key={milestone} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-sm text-primary">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
