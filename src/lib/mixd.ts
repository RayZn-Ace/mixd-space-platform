import type { Database } from "@/integrations/supabase/types";

export type SpaceType = Database["public"]["Enums"]["space_type"];
export type RateType = Database["public"]["Enums"]["rate_type"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
export type SpaceRow = Database["public"]["Tables"]["spaces"]["Row"];
export type PricingRow = Database["public"]["Tables"]["pricing_rules"]["Row"];
export type AddonRow = Database["public"]["Tables"]["addons"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type MembershipRow = Database["public"]["Tables"]["memberships"]["Row"];

export const SPACE_TYPE_LABEL: Record<SpaceType, string> = {
  flex_desk: "Flex Desk",
  dedicated_desk: "Dedicated Desk",
  private_office: "Private Office",
  team_office: "Team Office",
  meeting_room: "Meeting Room",
  workshop_space: "Workshop Space",
  other: "Other",
};

export const BOOKABLE_SPACE_TYPES: SpaceType[] = [
  "flex_desk",
  "private_office",
  "meeting_room",
  "team_office",
];

export const RATE_LABEL: Record<RateType, string> = {
  hourly: "hour",
  daily: "day",
  weekly: "week",
  monthly: "month",
  weekend: "weekend",
  evening: "evening",
  member: "member",
  corporate: "corporate",
};

export function formatPrice(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function hoursBetween(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

/**
 * Pricing engine. Rates come from the database only — nothing is hardcoded.
 * Picks the cheapest sensible combination between hourly and day rates and
 * leaves room for future dynamic rules (weekend/evening/member/corporate).
 */
export function quote(rates: Pick<PricingRow, "rate_type" | "price_cents">[], hours: number) {
  const byType = new Map<string, number>();
  for (const r of rates) {
    const existing = byType.get(r.rate_type);
    if (existing === undefined || r.price_cents < existing) byType.set(r.rate_type, r.price_cents);
  }
  const hourly = byType.get("hourly");
  const daily = byType.get("daily");
  const monthly = byType.get("monthly");

  const options: { rate_type: RateType; total: number }[] = [];
  if (hourly !== undefined) options.push({ rate_type: "hourly", total: Math.ceil(hours) * hourly });
  if (daily !== undefined)
    options.push({ rate_type: "daily", total: Math.max(1, Math.ceil(hours / 9)) * daily });
  if (monthly !== undefined && hours >= 160)
    options.push({ rate_type: "monthly", total: monthly });

  if (options.length === 0) return null;
  return options.reduce((best, o) => (o.total < best.total ? o : best));
}

/** The headline "from" price used on cards. */
export function fromPrice(rates: Pick<PricingRow, "rate_type" | "price_cents">[]) {
  const daily = rates.find((r) => r.rate_type === "daily");
  const hourly = rates.find((r) => r.rate_type === "hourly");
  const chosen = daily ?? hourly ?? rates[0];
  if (!chosen) return null;
  return { label: RATE_LABEL[chosen.rate_type], price_cents: chosen.price_cents };
}

export function slugToTitle(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
