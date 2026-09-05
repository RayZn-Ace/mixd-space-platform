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
  flex_desk: "Desk",
  dedicated_desk: "Fix Desk",
  private_office: "Private Office",
  team_office: "Team Office",
  meeting_room: "Meeting Room",
  workshop_space: "Workshop Space",
  other: "Sonstiges",
};

export const BOOKABLE_SPACE_TYPES: SpaceType[] = [
  "flex_desk",
  "private_office",
  "meeting_room",
  "team_office",
];

export const RATE_LABEL: Record<RateType, string> = {
  hourly: "Stunde",
  daily: "Tag",
  weekly: "Woche",
  monthly: "Monat",
  weekend: "Wochenende",
  evening: "Abend",
  member: "Member",
  corporate: "Corporate",
};

export function formatPrice(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
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
  if (monthly !== undefined && hours >= 160) options.push({ rate_type: "monthly", total: monthly });

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

const SPACE_COPY_BY_SLUG: Record<string, string> = {
  "focus-desk":
    "Ein fokussierter Desk für konzentrierte Arbeit, Lernphasen und produktive Remote Days.",
  "quiet-desk":
    "Ein ruhiger Arbeitsplatz für lange Sessions, Deep Work und Aufgaben, die Kopf brauchen.",
  "coffee-bar-desk":
    "Ein unkomplizierter Desk nahe Kaffee und Austausch - ideal für kurze produktive Slots.",
  "study-lounge-desk":
    "Ein ruhiger Einzelplatz für Hausarbeiten, Abschlussarbeiten und fokussiertes Lernen.",
  "window-desk":
    "Ein heller Arbeitsplatz am Fenster für Remote Work, Schreibarbeit und konzentrierte Tage.",
  "call-office": "Ein geschlossenes Office für Calls, Interviews und vertrauliche Arbeit zu zweit.",
  "project-office":
    "Ein möbliertes Private Office für Projektarbeit über Tage, Wochen oder Monate.",
  "focus-booth":
    "Ein kompakter Rückzugsort für Calls, Bewerbungsgespräche und fokussierte Einzelarbeit.",
  "studio-office": "Ein privates Office für Founder, Freelancer und kleine Teams mit fester Base.",
  "team-office":
    "Ein Team Office für gemeinsame Arbeit, Projektphasen und flexible Unternehmensnutzung.",
  "creative-lab":
    "Ein variabler Raum für Workshops, Ideenarbeit, Content und kreative Projektformate.",
  boardroom:
    "Ein professioneller Meeting Room für Kundentermine, Entscheidungen und Präsentationen.",
  "huddle-room":
    "Ein kleiner Meeting Room für Abstimmungen, hybride Calls und schnelle Team-Sessions.",
  "workshop-loft":
    "Ein offener Raum für Workshops, Trainings, Offsites und größere Gruppenformate.",
};

const SPACE_COPY_BY_TYPE: Partial<Record<SpaceType, string>> = {
  flex_desk: "Ein flexibler Desk für Fokus, Lernen, Remote Work und produktive Tage in Garbsen.",
  private_office:
    "Ein geschlossenes Office für konzentrierte Arbeit, Calls und Projekte mit mehr Ruhe.",
  team_office: "Ein flexibles Office für Teams, Unternehmen und Projektphasen ohne lange Bindung.",
  meeting_room: "Ein Meeting Room für Kundentermine, Workshops, hybride Calls und Team-Sessions.",
  workshop_space: "Ein größerer Space für Workshops, Trainings, Offsites und kreative Formate.",
};

export function spaceMarketingCopy(space: Pick<SpaceRow, "slug" | "space_type" | "description">) {
  return (
    SPACE_COPY_BY_SLUG[space.slug] ??
    SPACE_COPY_BY_TYPE[space.space_type] ??
    space.description ??
    ""
  );
}

const AMENITY_LABELS: Record<string, string> = {
  "High-speed WiFi": "Highspeed WLAN",
  "Coffee included": "Kaffee inklusive",
  "Coffee & water": "Kaffee & Wasser",
  Parking: "Parken",
  "Natural light": "Tageslicht",
  "Quiet zone": "Ruhezone",
  Monitor: "Monitor",
  Lockable: "Abschließbar",
  Whiteboard: "Whiteboard",
  "Video conferencing": "Video-Setup",
  Projector: "Projektor",
  Catering: "Catering",
  Printing: "Drucken",
  "Phone booths": "Phone Booths",
  Kitchen: "Küche",
  "Lift access": "Aufzug",
  "Flexible units": "Flexible Einheiten",
  "Standing desk": "Stehschreibtisch",
  "Window seat": "Fensterplatz",
  Soundproofed: "Schallgedämmt",
  "Movable furniture": "Flexible Möbel",
};

export function amenityLabel(name: string) {
  return AMENITY_LABELS[name] ?? name;
}
