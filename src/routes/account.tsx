import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteShell, EmptyState } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, formatTime } from "@/lib/mixd";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "MY MIXD. — Your bookings and access" },
      {
        name: "description",
        content: "Your MIXD.SPACE dashboard: bookings, digital access, invoices and profile.",
      },
      { property: "og:title", content: "MY MIXD." },
      { property: "og:description", content: "Your workspace dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { next: "/account" } });
  }, [loading, user, navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, spaces(name,slug), locations(name), access_credentials(valid_from,valid_until)")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["my-invoices", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const now = Date.now();
  const upcoming = (bookings ?? []).filter(
    (b) => new Date(b.ends_at).getTime() >= now && b.status !== "cancelled",
  );
  const past = (bookings ?? []).filter((b) => new Date(b.ends_at).getTime() < now);
  const current = upcoming.find((b) => new Date(b.starts_at).getTime() <= now);

  async function cancel(id: string) {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (!error) window.location.reload();
  }

  if (loading || !user) {
    return (
      <SiteShell>
        <div className="container-mixd py-24">
          <div className="h-40 w-full animate-pulse bg-muted" />
        </div>
      </SiteShell>
    );
  }

  const name = (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "there";

  return (
    <SiteShell>
      <section className="container-mixd pt-16 lg:pt-24">
        <p className="eyebrow">MY MIXD.</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h1 className="display-lg">Welcome back, {name}.</h1>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/book">Book a space</Link>
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </section>

      {current && (
        <section className="container-mixd mt-14">
          <div className="border border-foreground p-8">
            <p className="eyebrow">Current booking</p>
            <h2 className="display-md mt-3">{current.spaces?.name}</h2>
            <p className="mt-2 text-muted-foreground">
              {formatDate(current.starts_at)} · {formatTime(current.starts_at)} –{" "}
              {formatTime(current.ends_at)} · {current.locations?.name}
            </p>
            <Button className="mt-6" disabled>
              {current.access_credentials?.[0]
                ? `Access available from ${formatTime(current.access_credentials[0].valid_from)}`
                : "Access not connected yet"}
            </Button>
          </div>
        </section>
      )}

      <section className="container-mixd mt-16">
        <h2 className="display-md">Upcoming bookings</h2>
        <div className="mt-8">
          {isLoading && <div className="h-24 w-full animate-pulse bg-muted" />}
          {!isLoading && upcoming.length === 0 && (
            <EmptyState
              title="No bookings yet."
              description="Your next workspace is waiting."
              action={
                <Button asChild>
                  <Link to="/book">Book a space</Link>
                </Button>
              }
            />
          )}
          <ul className="divide-y divide-border border-y border-border">
            {upcoming.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 py-6">
                <div>
                  <p className="font-display text-lg tracking-tight">{b.spaces?.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(b.starts_at)} · {formatTime(b.starts_at)} – {formatTime(b.ends_at)}{" "}
                    · {b.locations?.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(b.total_cents, b.currency)}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/bookings/$reference" params={{ reference: b.reference }}>
                      View
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => cancel(b.id)}>
                    Cancel
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-mixd mt-20 grid gap-16 lg:grid-cols-2">
        <div>
          <h2 className="display-md">Past bookings</h2>
          {past.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {past.slice(0, 8).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span>{b.spaces?.name}</span>
                  <span className="text-muted-foreground">{formatDate(b.starts_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="display-md">Invoices</h2>
          {(invoices ?? []).length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No invoices yet. They appear here once payments are connected.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {(invoices ?? []).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span>{i.number}</span>
                  <span className="text-muted-foreground">{formatPrice(i.amount_cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="container-mixd mt-20">
        <h2 className="display-md">Profile</h2>
        <dl className="mt-6 grid gap-x-10 gap-y-6 border-t border-border pt-6 sm:grid-cols-3">
          <div>
            <dt className="eyebrow">Name</dt>
            <dd className="mt-2">{name}</dd>
          </div>
          <div>
            <dt className="eyebrow">Email</dt>
            <dd className="mt-2">{user.email}</dd>
          </div>
          <div>
            <dt className="eyebrow">Membership</dt>
            <dd className="mt-2 text-muted-foreground">None yet</dd>
          </div>
        </dl>
      </section>
    </SiteShell>
  );
}
