import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatTime } from "@/lib/mixd";
import { spacesQuery, locationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function AdminOverview() {
  const { data: locations } = useQuery(locationsQuery);
  const { data: spaces } = useQuery(spacesQuery());
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, spaces(name), locations(name)")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = bookings ?? [];
  const today = startOfToday();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const isToday = (d: string) => new Date(d).toDateString() === today.toDateString();
  const paid = (b: (typeof rows)[number]) => b.status !== "cancelled";

  const revenueToday = rows
    .filter((b) => isToday(b.starts_at) && paid(b))
    .reduce((s, b) => s + b.total_cents, 0);
  const revenueMonth = rows
    .filter((b) => new Date(b.starts_at) >= monthStart && paid(b))
    .reduce((s, b) => s + b.total_cents, 0);
  const bookingsToday = rows.filter((b) => isToday(b.starts_at) && paid(b)).length;
  const spaceCount = (spaces ?? []).length;
  const occupancy = spaceCount ? Math.round((bookingsToday / spaceCount) * 100) : 0;

  const now = Date.now();
  const statusFor = (spaceId: string) => {
    const relevant = rows.filter((b) => b.space_id === spaceId && b.status !== "cancelled");
    if (relevant.some((b) => new Date(b.starts_at).getTime() <= now && new Date(b.ends_at).getTime() >= now))
      return "Occupied";
    if (relevant.some((b) => isToday(b.starts_at) && new Date(b.starts_at).getTime() > now))
      return "Upcoming";
    return "Available";
  };

  const allSpaces = spaces ?? [];
  const totalSpaces = allSpaces.length;
  const spacesWithImage = allSpaces.filter((s) => Boolean(s.hero_image_url)).length;
  const spacesWithDescription = allSpaces.filter((s) => Boolean(s.description)).length;
  const locationsReady = (locations ?? []).filter(
    (l) => Boolean(l.address_line1) && Boolean(l.contact_email),
  ).length;

  return (

    <div>
      <p className="eyebrow">Overview</p>
      <h1 className="display-md mt-3">Today at MIXD.</h1>

      <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Revenue today" value={formatPrice(revenueToday)} loading={isLoading} />
        <Kpi label="Revenue this month" value={formatPrice(revenueMonth)} loading={isLoading} />
        <Kpi label="Bookings today" value={String(bookingsToday)} loading={isLoading} />
        <Kpi label="Occupancy today" value={`${occupancy}%`} loading={isLoading} />
      </div>

      <h2 className="display-md mt-16">Go-live checklist</h2>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        The platform is running in pre-launch mode: spaces, rates and photos on the website are
        example data until you replace them here.
      </p>
      <ul className="mt-6 divide-y divide-border border-y border-border">
        <ChecklistItem
          label="Spaces with a photo"
          done={spacesWithImage}
          total={totalSpaces}
          to="/admin/spaces"
        />
        <ChecklistItem
          label="Spaces with a description"
          done={spacesWithDescription}
          total={totalSpaces}
          to="/admin/spaces"
        />
        <ChecklistItem
          label="Locations with address and contact"
          done={locationsReady}
          total={(locations ?? []).length}
          to="/admin/locations"
        />
        <li className="flex items-center justify-between gap-4 py-4 text-sm">
          <span>Online payment</span>
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Demo — bookings arrive as requests
          </span>
        </li>
      </ul>


      <h2 className="display-md mt-16">Location performance</h2>
      <div className="mt-6 grid gap-px border border-border bg-border md:grid-cols-2">
        {(locations ?? []).map((l) => {
          const locSpaces = (spaces ?? []).filter((s) => s.location_id === l.id);
          const locBookings = rows.filter((b) => b.location_id === l.id && isToday(b.starts_at));
          const occ = locSpaces.length
            ? Math.round((locBookings.length / locSpaces.length) * 100)
            : 0;
          return (
            <div key={l.id} className="bg-background p-8">
              <p className="font-display text-lg tracking-tight uppercase">{l.city ?? l.name}</p>
              <p className="mt-6 font-display text-4xl tracking-tight">{occ}% occupied</p>
              <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="eyebrow">Revenue</dt>
                  <dd className="mt-1">
                    {formatPrice(locBookings.reduce((s, b) => s + b.total_cents, 0))}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Bookings</dt>
                  <dd className="mt-1">{locBookings.length}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Spaces</dt>
                  <dd className="mt-1">{locSpaces.length}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <h2 className="display-md mt-16">Live space status</h2>
      <ul className="mt-6 divide-y divide-border border-y border-border">
        {(spaces ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.locations?.name}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {statusFor(s.id)}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="display-md mt-16">Next bookings</h2>
      <ul className="mt-6 divide-y divide-border border-y border-border">
        {rows.filter((b) => new Date(b.ends_at).getTime() >= now).slice(0, 8).map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-4 py-4 text-sm">
            <span>{b.spaces?.name}</span>
            <span className="text-muted-foreground">
              {new Date(b.starts_at).toLocaleDateString("en-GB")} · {formatTime(b.starts_at)}
            </span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="py-8 text-sm text-muted-foreground">No bookings yet.</li>
        )}
      </ul>
    </div>
  );
}

function Kpi({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="bg-background p-6">
      <p className="eyebrow">{label}</p>
      {loading ? (
        <div className="mt-4 h-8 w-24 animate-pulse bg-muted" />
      ) : (
        <p className="mt-4 font-display text-3xl tracking-tight">{value}</p>
      )}
    </div>
  );
}

function ChecklistItem({
  label,
  done,
  total,
  to,
}: {
  label: string;
  done: number;
  total: number;
  to: string;
}) {
  const complete = total > 0 && done === total;
  return (
    <li className="flex items-center justify-between gap-4 py-4 text-sm">
      <Link to={to} className="link-underline">
        {label}
      </Link>
      <span
        className={
          "text-xs uppercase tracking-[0.14em] " +
          (complete ? "text-muted-foreground" : "text-accent")
        }
      >
        {done} / {total} ready
      </span>
    </li>
  );
}
