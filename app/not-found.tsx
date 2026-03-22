import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">404</p>
      <h1 className="text-4xl font-semibold">This route does not exist in PathPilot.</h1>
      <p className="max-w-xl text-muted-foreground">Head back to the landing page or explore one of the main product surfaces from there.</p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
