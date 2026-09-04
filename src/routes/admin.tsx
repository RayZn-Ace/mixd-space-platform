import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth, useIsStaff } from "@/hooks/use-auth";
import { Wordmark } from "@/components/site/Header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "MIXD.OS — Operations" },
      { name: "description", content: "MIXD.OS: locations, spaces, bookings and performance." },
      { property: "og:title", content: "MIXD.OS" },
      { property: "og:description", content: "MIXD.SPACE operations console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

type AdminPath =
  | "/admin"
  | "/admin/locations"
  | "/admin/spaces"
  | "/admin/bookings"
  | "/admin/customers"
  | "/admin/memberships"
  | "/admin/addons"
  | "/admin/billing";

const NAV: { to: AdminPath; label: string; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/locations", label: "Locations" },
  { to: "/admin/spaces", label: "Spaces" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/memberships", label: "Memberships" },
  { to: "/admin/addons", label: "Add-ons" },
  { to: "/admin/billing", label: "Payments" },
];

const PLANNED = ["Companies", "Access control", "Analytics", "Settings"];


function AdminLayout() {
  const { user, loading } = useAuth();
  const isStaff = useIsStaff(user?.id);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { next: "/admin" } });
  }, [loading, user, navigate]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-sidebar lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center px-6">
          <Link to="/">
            <Wordmark className="h-7" />
          </Link>
          <span className="ml-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">OS</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "whitespace-nowrap px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
          <div className="hidden pt-6 lg:block">
            <p className="px-3 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              Planned
            </p>
            <ul className="mt-2 space-y-1">
              {PLANNED.map((p) => (
                <li key={p} className="px-3 py-1 text-sm text-muted-foreground/50">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      <main className="flex-1 px-6 py-10 lg:px-12">
        {!loading && user && !isStaff && (
          <div className="mb-8 border border-border bg-surface p-5 text-sm text-muted-foreground">
            You're signed in without an operations role, so data below is limited to what your
            account may see. Ask an administrator to grant you staff access.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
