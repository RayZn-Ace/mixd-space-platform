import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, CalendarPlus, Ticket, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type TabItem = {
  to: "/" | "/spaces" | "/book" | "/memberships";
  label: string;
  icon: typeof Home;
  exact?: boolean;
  center?: boolean;
};

const TABS: TabItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/spaces", label: "Spaces", icon: Search },
  { to: "/book", label: "Buchen", icon: CalendarPlus, center: true },
  { to: "/memberships", label: "Pläne", icon: Ticket },
];

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="App navigation"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[0.625rem] tracking-wide",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-2xl transition-colors",
                    t.center
                      ? "bg-accent text-accent-foreground"
                      : active
                        ? "bg-surface"
                        : "bg-transparent",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            to={user ? "/account" : "/login"}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 text-[0.625rem] tracking-wide",
              pathname.startsWith("/account") ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-2xl",
                pathname.startsWith("/account") ? "bg-surface" : "",
              )}
            >
              <User className="size-5" />
            </span>
            {user ? "My MIXD" : "Login"}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
