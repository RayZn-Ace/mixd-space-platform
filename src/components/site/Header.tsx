import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoDark from "@/assets/mixd-logo-dark.png.asset.json";


const NAV = [
  { to: "/coworking", label: "Desks" },
  { to: "/private-offices", label: "Private Offices" },
  { to: "/team-offices", label: "Team Offices" },
  { to: "/meeting-rooms", label: "Meeting Rooms" },
  { to: "/memberships", label: "Memberships" },
  { to: "/business-address", label: "Business Address" },
] as const;

export function Wordmark({ className }: { className?: string }) {
  return (
    <img
      src={logoDark.url}
      alt="MIXD.SPACE"
      className={cn("h-9 w-auto object-contain", className)}
    />
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

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "link-underline text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(item.to) && "link-underline-active text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to={user ? "/account" : "/login"}>{user ? "MY MIXD." : "Sign in"}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/spaces">Find your space</Link>
          </Button>
        </div>

        <button
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
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
              <Link to="/spaces" onClick={() => setOpen(false)}>
                Find your space
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
