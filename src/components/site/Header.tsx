import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/spaces", label: "Spaces" },
  { to: "/locations", label: "Locations" },
  { to: "/memberships", label: "Memberships" },
  { to: "/teams", label: "Teams" },
  { to: "/about", label: "About" },
] as const;

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-display text-[0.95rem] font-semibold tracking-[0.02em]", className)}
      style={{ fontFamily: "var(--font-display)" }}
    >
      MIXD<span className="text-accent">.</span>SPACE
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-mixd flex h-16 items-center justify-between gap-6">
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "link-underline text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(item.to) && "link-underline-active text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to={user ? "/account" : "/login"}>{user ? "MY MIXD." : "Sign in"}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/book">Book a space</Link>
          </Button>
        </div>

        <button
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-mixd flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-lg"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3 text-lg"
            >
              {user ? "MY MIXD." : "Sign in"}
            </Link>
            <Button asChild className="mt-4">
              <Link to="/book" onClick={() => setOpen(false)}>
                Book a space
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
