import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell, EmptyState } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, formatTime } from "@/lib/mixd";

export const Route = createFileRoute("/bookings/$reference")({
  head: () => ({
    meta: [
      { title: "Your booking — MIXD.SPACE" },
      { name: "description", content: "Your MIXD.SPACE booking details, access and directions." },
      { property: "og:title", content: "Your booking — MIXD.SPACE" },
      { property: "og:description", content: "Booking confirmation for MIXD.SPACE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingSuccess,
});

function BookingSuccess() {
  const { reference } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["booking", reference],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "*, spaces(name,slug,space_type), locations(name,address_line1,postal_code,city), access_credentials(valid_from,valid_until,status,method)",
        )
        .eq("reference", reference)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <SiteShell>
        <div className="container-mixd py-24">
          <div className="h-40 w-full animate-pulse bg-muted" />
        </div>
      </SiteShell>
    );
  }

  if (!data) {
    return (
      <SiteShell>
        <div className="container-mixd py-24">
          <EmptyState
            title="Booking not found."
            description="Sign in with the account used for the booking to see it."
            action={
              <Button asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            }
          />
        </div>
      </SiteShell>
    );
  }

  const start = new Date(data.starts_at);
  const end = new Date(data.ends_at);
  const access = data.access_credentials?.[0];
  const location = data.locations;
  const mapsQuery = encodeURIComponent(
    `${location?.address_line1 ?? ""} ${location?.postal_code ?? ""} ${location?.city ?? ""}`,
  );

  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${data.spaces?.name} — MIXD.SPACE\nDTSTART:${start.toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z\nDTEND:${end.toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z\nLOCATION:${location?.address_line1 ?? ""}, ${location?.postal_code ?? ""} ${location?.city ?? ""}\nEND:VEVENT\nEND:VCALENDAR`;

  return (
    <SiteShell>
      <section className="container-mixd py-20 lg:py-28">
        <p className="eyebrow">Booking {data.reference}</p>
        <h1 className="display-xl mt-6">You're in.</h1>

        <div className="mt-14 grid gap-12 border-t border-border pt-10 lg:grid-cols-[1.2fr_1fr]">
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <Item label="Location" value={location?.name ?? "—"} />
            <Item label="Space" value={data.spaces?.name ?? "—"} />
            <Item label="Date" value={formatDate(start)} />
            <Item label="Time" value={`${formatTime(start)} – ${formatTime(end)}`} />
            <Item
              label="Address"
              value={`${location?.address_line1 ?? ""}, ${location?.postal_code ?? ""} ${location?.city ?? ""}`}
            />
            <Item label="Total" value={formatPrice(data.total_cents, data.currency)} />
          </dl>

          <div className="border border-border p-6">
            <p className="eyebrow">Access</p>
            {access ? (
              <>
                <p className="mt-4 font-display text-xl tracking-tight">
                  Access available from {formatTime(access.valid_from)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Digital access will appear here before your booking starts.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Digital access will appear here before your booking starts.
              </p>
            )}
            <Button className="mt-6 w-full" disabled>
              Access space
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/account">View booking</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download={`${data.reference}.ics`}>
              Add to calendar
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-base">{value}</dd>
    </div>
  );
}
