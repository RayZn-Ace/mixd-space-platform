import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  addonsQuery,
  fetchConflicts,
  mySubscriptionsQuery,
  type SpaceWithRelations,
} from "@/lib/queries";
import { formatDate, formatPrice, hoursBetween, quote } from "@/lib/mixd";
import { accessWindow } from "@/lib/access-provider";
import { paymentProvider } from "@/lib/payment-provider";
import { Button } from "@/components/ui/button";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { PaymentSheet, type MockMethod } from "@/components/booking/PaymentSheet";

type Step = "when" | "extras" | "pay";

const STEPS: { id: Step; label: string }[] = [
  { id: "when", label: "When" },
  { id: "extras", label: "Extras" },
  { id: "pay", label: "Pay" },
];

function nextDays(count: number) {
  const out: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}

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
  const { data: subs } = useQuery({ ...mySubscriptionsQuery(user?.id), enabled: Boolean(user) });

  const [step, setStep] = useState<Step>("when");
  const [date, setDate] = useState(defaults?.date ?? new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState(defaults?.start ?? "09:00");
  const [end, setEnd] = useState(defaults?.end ?? "12:00");
  const [people, setPeople] = useState(defaults?.people ?? 1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const startsAt = useMemo(() => new Date(`${date}T${start}`), [date, start]);
  const endsAt = useMemo(() => new Date(`${date}T${end}`), [date, end]);
  const hours = hoursBetween(startsAt, endsAt);
  const priced = quote(space.pricing_rules ?? [], hours);

  const activeSub = (subs ?? []).find((s) => s.status === "active");
  const discountPercent = activeSub?.memberships?.discount_percent ?? 0;

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

  const gross = (priced?.total ?? 0) + addonTotal;
  const discountCents = Math.round((gross * discountPercent) / 100);
  const total = gross - discountCents;

  async function pay(method: MockMethod) {
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
        toast.error("This space was just booked for that time.");
        setStep("when");
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
          discount_cents: discountCents,
          total_cents: total,
          status: "confirmed",
          payment_status: method === "on_site" ? "pending" : "paid",
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

      // Simulated provider round-trip so the flow feels real.
      await new Promise((r) => setTimeout(r, 900));
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
        method,
        provider_reference: charge.reference,
        status: method === "on_site" ? "pending" : "paid",
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

      toast.success("Booked. See you there.");
      navigate({ to: "/bookings/$reference", params: { reference: booking.reference } });
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance = hours > 0 && Boolean(priced);
  const activeIdx = STEPS.findIndex((x) => x.id === step);
  const chosenAddons = relevantAddons.filter((a) => selectedAddons.includes(a.id));

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = i < activeIdx;
          const reachable = i <= activeIdx || canAdvance;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!reachable}
              aria-current={step === s.id ? "step" : undefined}
              onClick={() => (reachable ? setStep(s.id) : undefined)}
              className={
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors " +
                (step === s.id
                  ? "bg-foreground text-background"
                  : done
                    ? "bg-surface text-foreground"
                    : reachable
                      ? "bg-muted text-muted-foreground hover:text-foreground"
                      : "cursor-not-allowed bg-muted text-muted-foreground/50")
              }
            >
              {step === s.id && <XMark className="size-2.5" />}
              {s.label}
            </button>
          );
        })}
      </div>
      {!canAdvance && step === "when" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Pick a day and a time to continue.
        </p>
      )}


      {step === "when" && (
        <div className="mt-6">
          <p className="eyebrow">Pick a day</p>
          <div className="no-scrollbar -mx-1 mt-3 flex min-w-0 max-w-full gap-2 overflow-x-auto px-1 pb-1">
            {nextDays(14).map((d) => {
              const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              const active = value === date;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDate(value)}
                  className={
                    "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border text-xs transition-colors " +
                    (active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background")
                  }
                >
                  <span className="opacity-70">
                    {d.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  <span className="mt-1 text-base">{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          <p className="eyebrow mt-6">Pick your time</p>
          <div className="mt-3">
            <SlotPicker
              spaceId={space.id}
              locationId={space.location_id}
              date={date}
              start={start}
              end={end}
              onChange={(next) => {
                setStart(next.start);
                setEnd(next.end);
              }}
            />
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-border px-4 py-3">
            <span className="text-sm">People</span>
            <span className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Fewer people"
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="grid size-8 place-items-center rounded-full border border-border"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center text-sm">{people}</span>
              <button
                type="button"
                aria-label="More people"
                onClick={() => setPeople((p) => Math.min(space.capacity ?? 50, p + 1))}
                className="grid size-8 place-items-center rounded-full border border-border"
              >
                <Plus className="size-4" />
              </button>
            </span>
          </div>
        </div>
      )}

      {step === "extras" && (
        <div className="mt-6">
          <p className="eyebrow">Add extras</p>
          {relevantAddons.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No extras available for this space.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
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
                      className={
                        "flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left text-sm " +
                        (active ? "border-foreground bg-surface" : "border-border bg-background")
                      }
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={
                            "grid size-5 shrink-0 place-items-center rounded-md border " +
                            (active ? "border-foreground bg-foreground" : "border-border")
                          }
                        >
                          {active && <Check className="size-3 text-background" />}
                        </span>
                        <span className="truncate">{a.name}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatPrice(a.price_cents)} / {a.price_type.replace("per_", "")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {step === "pay" && (
        <div className="mt-6">
          <div className="rounded-2xl bg-surface p-4 text-sm">
            <p className="font-display text-lg tracking-tight">{space.name}</p>
            <p className="mt-1 text-muted-foreground">
              {formatDate(date)} · {start} – {end} · {people} {people === 1 ? "person" : "people"}
            </p>
          </div>
          <div className="mt-5">
            <PaymentSheet
              amountCents={total}
              busy={submitting}
              creditsAvailable={activeSub?.credits_remaining ?? 0}
              onPay={pay}
            />
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-2xl tracking-tight">
            {priced ? formatPrice(total) : "On request"}
          </span>
        </div>
        {hours > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {hours.toFixed(hours % 1 === 0 ? 0 : 1)} hours
            {discountCents > 0 && ` · ${discountPercent}% member discount applied`}
          </p>
        )}

        {step !== "pay" && (
          <Button
            className="mt-5 w-full"
            disabled={!(hours > 0)}
            onClick={() => {
              if (!user) {
                navigate({ to: "/login", search: { next: `/spaces/${space.slug}` } });
                return;
              }
              setStep(step === "when" ? "extras" : "pay");
            }}
          >
            {!user ? "Sign in to book" : step === "when" ? "Continue" : "Go to payment"}
          </Button>
        )}
        {submitting && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Confirming your booking…
          </p>
        )}
      </div>
    </div>
  );
}
