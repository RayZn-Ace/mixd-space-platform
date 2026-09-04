import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { addonsQuery, fetchConflicts, type SpaceWithRelations } from "@/lib/queries";
import { formatPrice, hoursBetween, quote } from "@/lib/mixd";
import { accessWindow } from "@/lib/access-provider";
import { paymentProvider } from "@/lib/payment-provider";
import { Button } from "@/components/ui/button";

const FIELD =
  "h-10 w-full border-0 border-b border-border bg-transparent px-0 text-sm outline-none focus:border-foreground";

type Availability = "unknown" | "checking" | "available" | "taken";

export function BookingWidget({
  space,
  defaults,
}: {
  space: SpaceWithRelations;
  defaults?: {
    date?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
    people?: number | undefined;
  };
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: addons } = useQuery(addonsQuery);

  const [date, setDate] = useState(defaults?.date ?? new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState(defaults?.start ?? "09:00");
  const [end, setEnd] = useState(defaults?.end ?? "17:00");
  const [people, setPeople] = useState(defaults?.people ?? 1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [submitting, setSubmitting] = useState(false);

  const startsAt = useMemo(() => new Date(`${date}T${start}`), [date, start]);
  const endsAt = useMemo(() => new Date(`${date}T${end}`), [date, end]);
  const hours = hoursBetween(startsAt, endsAt);
  const priced = quote(space.pricing_rules ?? [], hours);

  const relevantAddons = (addons ?? []).filter(
    (a) =>
      (a.location_id === null || a.location_id === space.location_id) &&
      (a.allowed_space_types.length === 0 || a.allowed_space_types.includes(space.space_type)),
  );

  const addonTotal = relevantAddons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => {
      switch (a.price_type) {
        case "per_hour":
          return sum + a.price_cents * Math.ceil(hours);
        case "per_day":
          return sum + a.price_cents * Math.max(1, Math.ceil(hours / 9));
        case "per_person":
          return sum + a.price_cents * people;
        default:
          return sum + a.price_cents;
      }
    }, 0);

  const total = (priced?.total ?? 0) + addonTotal;

  async function check() {
    if (!(hours > 0)) {
      toast.error("The end time has to be after the start time.");
      return;
    }
    setAvailability("checking");
    try {
      const conflicts = await fetchConflicts(space.id, startsAt, endsAt);
      setAvailability(conflicts.length > 0 ? "taken" : "available");
    } catch {
      setAvailability("unknown");
      toast.error("Availability couldn't be checked. Please try again.");
    }
  }

  async function book() {
    if (!user) {
      navigate({ to: "/login", search: { next: `/spaces/${space.slug}` } });
      return;
    }
    if (!priced) {
      toast.error("No rate is configured for this space yet.");
      return;
    }
    setSubmitting(true);
    try {
      const conflicts = await fetchConflicts(space.id, startsAt, endsAt);
      if (conflicts.length > 0) {
        setAvailability("taken");
        toast.error("This space was just booked for that time.");
        return;
      }

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          space_id: space.id,
          location_id: space.location_id,
          user_id: user.id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          people,
          rate_type: priced.rate_type,
          subtotal_cents: priced.total,
          addons_cents: addonTotal,
          total_cents: total,
          status: "confirmed",
        })
        .select("*")
        .single();

      if (error || !booking) {
        toast.error(
          error?.message.includes("bookings_no_overlap")
            ? "This space is already booked for that time."
            : "The booking couldn't be created.",
        );
        return;
      }

      const chosen = relevantAddons.filter((a) => selectedAddons.includes(a.id));
      if (chosen.length > 0) {
        await supabase.from("booking_addons").insert(
          chosen.map((a) => ({
            booking_id: booking.id,
            addon_id: a.id,
            quantity: 1,
            unit_price_cents: a.price_cents,
            total_cents: a.price_cents,
          })),
        );
      }

      const charge = await paymentProvider.charge({
        bookingId: booking.id,
        amountCents: total,
        currency: "EUR",
        description: `${space.name} · ${date}`,
      });
      await supabase.from("payments").insert({
        booking_id: booking.id,
        user_id: user.id,
        amount_cents: total,
        provider: charge.provider,
        provider_reference: charge.reference,
        status: charge.status === "paid" ? "paid" : "pending",
      });

      const win = accessWindow(startsAt, endsAt);
      await supabase.from("access_credentials").insert({
        booking_id: booking.id,
        user_id: user.id,
        provider: "demo",
        method: "mobile_web",
        valid_from: win.validFrom.toISOString(),
        valid_until: win.validUntil.toISOString(),
      });

      navigate({ to: "/bookings/$reference", params: { reference: booking.reference } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Book this space</p>
        {priced && (
          <p className="text-sm text-muted-foreground">
            {priced.rate_type === "hourly" ? "Hourly rate" : "Day rate"}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="eyebrow">Date</span>
          <input
            type="date"
            className={FIELD}
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => {
              setDate(e.target.value);
              setAvailability("unknown");
            }}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="eyebrow">From</span>
            <input
              type="time"
              className={FIELD}
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setAvailability("unknown");
              }}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Until</span>
            <input
              type="time"
              className={FIELD}
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setAvailability("unknown");
              }}
            />
          </label>
        </div>
        <label className="block">
          <span className="eyebrow">People</span>
          <input
            type="number"
            min={1}
            max={space.capacity ?? 50}
            className={FIELD}
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
          />
        </label>
      </div>

      {relevantAddons.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="eyebrow">Extras</p>
          <ul className="mt-4 space-y-3">
            {relevantAddons.map((a) => {
              const active = selectedAddons.includes(a.id);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAddons((prev) =>
                        active ? prev.filter((id) => id !== a.id) : [...prev, a.id],
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 text-left text-sm"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={
                          "flex size-4 items-center justify-center border " +
                          (active ? "border-foreground bg-foreground" : "border-border")
                        }
                      >
                        {active && <Check className="size-3 text-background" />}
                      </span>
                      {a.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatPrice(a.price_cents)} / {a.price_type.replace("per_", "")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-2xl tracking-tight">
            {priced ? formatPrice(total) : "On request"}
          </span>
        </div>
        {hours > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {hours.toFixed(hours % 1 === 0 ? 0 : 1)} hours · {people}{" "}
            {people === 1 ? "person" : "people"}
          </p>
        )}
      </div>

      {availability !== "unknown" && (
        <p
          className={
            "mt-4 text-sm " + (availability === "taken" ? "text-destructive" : "text-muted-foreground")
          }
        >
          {availability === "checking" && "Checking availability…"}
          {availability === "available" && "Available for this time."}
          {availability === "taken" && "Already booked for this time. Try another slot."}
        </p>
      )}

      <div className="mt-6 space-y-3">
        <Button variant="outline" className="w-full" onClick={check} disabled={availability === "checking"}>
          Check availability
        </Button>
        <Button
          className="w-full"
          onClick={book}
          disabled={submitting || availability === "taken" || !(hours > 0)}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : user ? "Book now" : "Sign in to book"}
        </Button>
        <p className="text-xs text-muted-foreground">
          No payment provider is connected yet — your booking is reserved and payable on site.
        </p>
      </div>
    </div>
  );
}
