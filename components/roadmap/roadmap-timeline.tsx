import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoadmapStep } from "@/types";

export function RoadmapTimeline({ steps }: { steps: RoadmapStep[] }) {
  return (
    <div className="relative space-y-6">
      <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-primary via-accent to-transparent" />
      {steps.map((step, index) => (
        <div key={`${step.title}-${index}`} className="relative pl-14">
          <div className="absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-sm font-semibold text-primary">
            {index + 1}
          </div>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle>{step.title}</CardTitle>
                <Badge variant="info">{step.estimated_time}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <div className="flex flex-wrap gap-2">
                {step.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
