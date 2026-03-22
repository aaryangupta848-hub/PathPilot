import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  ctaLabel?: string;
};

export function FeatureCard({ eyebrow, title, description, href, ctaLabel = "Open module" }: FeatureCardProps) {
  const content = (
    <Card className={cn("group h-full transition hover:border-white/20 hover:bg-white/[0.07]", href && "cursor-pointer") }>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-28 rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
        {href ? <p className="text-sm font-medium text-foreground">{ctaLabel}</p> : null}
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}