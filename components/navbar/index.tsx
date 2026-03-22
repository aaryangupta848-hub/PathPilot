"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { subscribeToAuthChanges } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getCurrentUser, logout } from "@/services/authService";
import type { AuthUser } from "@/types";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/simulator", label: "Simulator" },
  { href: "/roadmap", label: "Roadmaps" },
  { href: "/exams", label: "Exams" },
  { href: "/timetable", label: "TimeTable" },
  { href: "/dashboard", label: "Dashboard" }
];

export function Navbar() {
  const [pathname, setPathname] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    const syncUser = () => setUser(getCurrentUser());
    const syncPath = () => setPathname(window.location.pathname);

    syncUser();
    syncPath();

    const unsubscribeAuth = subscribeToAuthChanges(syncUser);
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function pushState(...args) {
      const result = originalPushState(...args);
      syncPath();
      return result;
    };

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState(...args);
      syncPath();
      return result;
    };

    window.addEventListener("popstate", syncPath);

    return () => {
      unsubscribeAuth();
      window.removeEventListener("popstate", syncPath);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    setUser(null);
    setMobileOpen(false);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,12,8,0.84),rgba(15,12,8,0.62))] backdrop-blur-2xl">
      <div className="container relative flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-primary via-[#f4c078] to-accent text-lg font-bold text-slate-950 shadow-glow">
            P
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">PathPilot</p>
            <p className="text-xs text-muted-foreground">AI decision intelligence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/12 bg-white/[0.07] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground",
                pathname === item.href && "bg-gradient-to-r from-primary to-[#f0bc77] text-slate-950 shadow-glow"
              )}
            >
              <span>{item.label}</span>
              <span
                className={cn(
                  "absolute bottom-1 left-4 right-4 h-px origin-left scale-x-0 bg-gradient-to-r from-primary via-[#f4c078] to-accent transition-transform duration-300 group-hover:scale-x-100",
                  pathname === item.href && "scale-x-100 bg-slate-950/45"
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button variant="ghost" type="button" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/auth">Login</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/dashboard">Open App</Link>
          </Button>
        </div>

        <Button
          variant="secondary"
          size="icon"
          type="button"
          className="border-white/20 bg-white/[0.07] md:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {mobileOpen ? (
          <div className="absolute inset-x-0 top-full z-50 mt-3 rounded-[1.75rem] border border-white/12 bg-[rgba(17,13,10,0.94)] p-4 shadow-panel backdrop-blur-2xl md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground",
                    pathname === item.href && "bg-gradient-to-r from-primary to-[#f0bc77] text-slate-950 shadow-glow"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              {user ? (
                <Button variant="ghost" type="button" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link href="/auth">Login</Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/dashboard">Open App</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
