import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, KeyRound, Users, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteShell, EmptyState } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { SplitBill } from "@/components/booking/SplitBill";
import {
  membershipsQuery,
  myBookingsQuery,
  mySplitsQuery,
  mySubscriptionsQuery,
} from "@/lib/queries";
import { formatDate, formatPrice, formatTime } from "@/lib/mixd";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "MY MIXD. — Your bookings, plans and splits" },
      {
        name: "description",
        content:
          "Your MIXD.SPACE dashboard: bookings, digital access, memberships, shared costs and invoices.",
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

const TABS = ["Overview", "Bookings", "Membership", "Splits", "Profile"] as const;
type Tab = (typeof TABS)[number];

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("Overview");
  const [openSplit, setOpenSplit] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { next: "/account" } });
  }, [loading, user, navigate]);

  const { data: bookings, isLoading } = useQuery({
    ...myBookingsQuery(user?.id),
    enabled: Boolean(user),
  });
  const { data: subs } = useQuery({ ...mySubscriptionsQuery(user?.id), enabled: Boolean(user) });
  const { data: plans } = useQuery(membershipsQuery);
  const { data: splits } = useQuery({ ...mySplitsQuery(user?.id), enabled: Boolean(user) });
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
  const list = bookings ?? [];
  const upcoming = list.filter(
    (b) => new Date(b.ends_at).getTime() >= now && b.status !== "cancelled",
  );
  const past = list.filter((b) => new Date(b.ends_at).getTime() < now);
  const current = upcoming.find((b) => new Date(b.starts_at).getTime() <= now);
  const activeSub = (subs ?? []).find((s) => s.status === "active");
  const openSplits = (splits ?? []).filter((s) => s.status === "pending");
  const spentCents = list
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.total_cents, 0);

  async function cancel(id: string) {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error("Couldn't cancel that booking.");
    else {
      toast.success("Booking cancelled.");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    }
  }

  async function subscribe(membershipId: string) {
    if (!user) return;
    const plan = (plans ?? []).find((p) => p.id === membershipId);
    const { error } = await supabase.from("membership_subscriptions").insert({
      user_id: user.id,
      membership_id: membershipId,
      status: "active",
      credits_remaining: plan?.included_credits ?? 0,
    });
    if (error) toast.error("Couldn't start that plan.");
    else {
      toast.success(`${plan?.name ?? "Plan"} activated.`);
      qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
    }
  }

  async function cancelSub(id: string) {
    const { error } = await supabase
      .from("membership_subscriptions")
      .update({ status: "cancelled", ends_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error("Couldn't cancel the plan.");
    else {
      toast.success("Plan cancelled.");
      qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
    }
  }

  if (loading || !user) {
    return (
      <SiteShell>
        <div className="container-mixd py-24">
          <div className="h-40 w-full animate-pulse rounded-3xl bg-muted" />
        </div>
      </SiteShell>
    );
  }

  const name =
    (user.user_metadata?.["full_name"] as string) ?? user.email?.split("@")[0] ?? "there";

  return (
    <SiteShell>
      <section className="container-mixd pt-10 lg:pt-20">
        <p className="eyebrow">MY MIXD.</p>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <h1 className="display-md min-w-0 truncate">Hey {name}.</h1>
          <div className="flex shrink-0 gap-2">
            <Button asChild size="sm">
              <Link to="/book">Book</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="no-scrollbar -mx-6 mt-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={
                "shrink-0 rounded-full px-4 py-2 text-sm transition-colors " +
                (tab === t ? "bg-foreground text-background" : "border border-border bg-card")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="container-mixd mt-8 pb-24">
        {tab === "Overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={CalendarDays} label="Upcoming" value={String(upcoming.length)} />
              <Stat
                icon={Wallet}
                label="Spent"
                value={formatPrice(spentCents)}
              />
              <Stat
                icon={KeyRound}
                label="Plan"
                value={activeSub?.memberships?.name ?? "None"}
              />
              <Stat icon={Users} label="Open splits" value={String(openSplits.length)} />
            </div>

            {current ? (
              <div className="rounded-3xl border border-foreground p-6">
                <p className="eyebrow">Happening now</p>
                <h2 className="display-md mt-3">{current.spaces?.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatTime(current.starts_at)} – {formatTime(current.ends_at)} ·{" "}
                  {current.locations?.name}
                </p>
                <Button className="mt-5 w-full sm:w-auto" disabled>
                  {current.access_credentials?.[0]
                    ? `Access open from ${formatTime(current.access_credentials[0].valid_from)}`
                    : "Access not connected yet"}
                </Button>
              </div>
            ) : (
              <NextBooking booking={upcoming[0]} />
            )}

            <div>
              <h2 className="display-md">Invoices</h2>
              {(invoices ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No invoices yet — they show up here after payment.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border rounded-3xl border border-border">
                  {(invoices ?? []).map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                      <span>{i.number}</span>
                      <span className="text-muted-foreground">{formatPrice(i.amount_cents)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "Bookings" && (
          <div className="space-y-10">
            {isLoading && <div className="h-24 w-full animate-pulse rounded-3xl bg-muted" />}
            {!isLoading && upcoming.length === 0 && (
              <EmptyState
                title="No bookings yet."
                description="Grab a desk, a booth or a room — by the hour."
                action={
                  <Button asChild>
                    <Link to="/book">Book a space</Link>
                  </Button>
                }
              />
            )}
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li key={b.id} className="rounded-3xl border border-border bg-card p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg tracking-tight">
                        {b.spaces?.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(b.starts_at)} · {formatTime(b.starts_at)} –{" "}
                        {formatTime(b.ends_at)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{b.locations?.name}</p>
                    </div>
                    <span className="shrink-0 text-sm">
                      {formatPrice(b.total_cents, b.currency)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/bookings/$reference" params={{ reference: b.reference }}>
                        Details
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenSplit(openSplit === b.id ? null : b.id)}
                    >
                      Split cost
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => cancel(b.id)}>
                      Cancel
                    </Button>
                  </div>
                  {openSplit === b.id && (
                    <div className="mt-4">
                      <SplitBill
                        bookingId={b.id}
                        totalCents={b.total_cents}
                        reference={b.reference}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div>
              <h2 className="display-md">Past</h2>
              {past.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Nothing here yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-border rounded-3xl border border-border">
                  {past.slice(0, 10).map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
                    >
                      <span className="truncate">{b.spaces?.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatDate(b.starts_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "Membership" && (
          <div className="space-y-8">
            {activeSub ? (
              <div className="rounded-3xl border border-foreground p-6">
                <p className="eyebrow">Active plan</p>
                <h2 className="display-md mt-3">{activeSub.memberships?.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatPrice(activeSub.memberships?.monthly_price_cents ?? 0)} / month ·{" "}
                  {activeSub.credits_remaining} credits left
                  {(activeSub.memberships?.discount_percent ?? 0) > 0 &&
                    ` · ${activeSub.memberships?.discount_percent}% off bookings`}
                </p>
                <Button variant="outline" className="mt-5" onClick={() => cancelSub(activeSub.id)}>
                  Cancel plan
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No plan yet. Pick one and your bookings get cheaper right away.
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              {(plans ?? []).map((p) => (
                <div key={p.id} className="rounded-3xl border border-border bg-card p-6">
                  <p className="font-display text-lg tracking-tight">{p.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  <p className="mt-6 font-display text-3xl tracking-tight">
                    {formatPrice(p.monthly_price_cents)}
                    <span className="text-sm text-muted-foreground"> / month</span>
                  </p>
                  <Button
                    className="mt-6 w-full"
                    disabled={activeSub?.membership_id === p.id}
                    onClick={() => subscribe(p.id)}
                  >
                    {activeSub?.membership_id === p.id ? "Current plan" : `Choose ${p.name}`}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Splits" && (
          <div className="space-y-4">
            {(splits ?? []).length === 0 ? (
              <EmptyState
                title="Nothing shared yet."
                description="Open a booking and split the cost with your crew."
              />
            ) : (
              <ul className="divide-y divide-border rounded-3xl border border-border">
                {(splits ?? []).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{s.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.bookings?.spaces?.name} ·{" "}
                        {s.bookings?.starts_at ? formatDate(s.bookings.starts_at) : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm">
                      {formatPrice(s.amount_cents)}{" "}
                      <span
                        className={
                          "ml-2 rounded-full px-2 py-0.5 text-xs " +
                          (s.status === "paid"
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {s.status}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "Profile" && (
          <dl className="grid gap-x-10 gap-y-6 rounded-3xl border border-border p-6 sm:grid-cols-3">
            <div>
              <dt className="eyebrow">Name</dt>
              <dd className="mt-2 break-words">{name}</dd>
            </div>
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-2 break-words">{user.email}</dd>
            </div>
            <div>
              <dt className="eyebrow">Membership</dt>
              <dd className="mt-2 text-muted-foreground">
                {activeSub?.memberships?.name ?? "None yet"}
              </dd>
            </div>
          </dl>
        )}
      </section>
    </SiteShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <Icon className="size-4 text-muted-foreground" />
      <p className="mt-3 truncate font-display text-xl tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function NextBooking({ booking }: { booking?: { spaces: { name: string } | null; starts_at: string; ends_at: string; locations: { name: string } | null; reference: string } | undefined }) {
  if (!booking) {
    return (
      <EmptyState
        title="Nothing booked."
        description="Your next desk, booth or room is one tap away."
        action={
          <Button asChild>
            <Link to="/book">Book a space</Link>
          </Button>
        }
      />
    );
  }
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <p className="eyebrow">Next up</p>
      <h2 className="display-md mt-3 break-words">{booking.spaces?.name}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatDate(booking.starts_at)} · {formatTime(booking.starts_at)} –{" "}
        {formatTime(booking.ends_at)} · {booking.locations?.name}
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link to="/bookings/$reference" params={{ reference: booking.reference }}>
          View booking
        </Link>
      </Button>
    </div>
  );
}
