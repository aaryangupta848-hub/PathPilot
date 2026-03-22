import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/[0.05] text-foreground/90",
        success: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
        info: "border-amber-200/20 bg-amber-200/10 text-amber-100"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}