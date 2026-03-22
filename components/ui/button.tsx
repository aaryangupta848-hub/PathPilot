import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium tracking-[0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-[#f1bb74] to-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:brightness-105",
        secondary:
          "border border-white/10 bg-white/[0.06] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:bg-white/[0.1]",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        outline:
          "border border-white/12 bg-transparent text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5 hover:bg-white/[0.04]"
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };