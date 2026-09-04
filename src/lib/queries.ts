import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PricingRow, SpaceRow, SpaceType } from "@/lib/mixd";

export type SpaceWithRelations = SpaceRow & {
  locations: { id: string; name: string; slug: string; city: string | null } | null;
  pricing_rules: PricingRow[];
  space_amenities: { amenities: { name: string; slug: string } | null }[];
  space_images: { url: string; alt: string | null; sort_order: number }[];
};

const SPACE_SELECT =
  "*, locations(id,name,slug,city), pricing_rules(*), space_amenities(amenities(name,slug)), space_images(url,alt,sort_order)";

export const locationsQuery = queryOptions({
  queryKey: ["locations"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return data;
  },
});

export const locationQuery = (slug: string) =>
  queryOptions({
    queryKey: ["location", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const spacesQuery = (filters?: { type?: SpaceType; locationSlug?: string }) =>
  queryOptions({
    queryKey: ["spaces", filters?.type ?? "all", filters?.locationSlug ?? "all"],
    queryFn: async (): Promise<SpaceWithRelations[]> => {
      let q = supabase
        .from("spaces")
        .select(SPACE_SELECT)
        .eq("status", "active")
        .order("sort_order");
      if (filters?.type) q = q.eq("space_type", filters.type);
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as unknown as SpaceWithRelations[];
      return filters?.locationSlug
        ? rows.filter((s) => s.locations?.slug === filters.locationSlug)
        : rows;
    },
  });

export const spaceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["space", slug],
    queryFn: async (): Promise<SpaceWithRelations | null> => {
      const { data, error } = await supabase
        .from("spaces")
        .select(SPACE_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as SpaceWithRelations) ?? null;
    },
  });

export const membershipsQuery = queryOptions({
  queryKey: ["memberships"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const addonsQuery = queryOptions({
  queryKey: ["addons"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return data;
  },
});

export const amenitiesQuery = queryOptions({
  queryKey: ["amenities"],
  queryFn: async () => {
    const { data, error } = await supabase.from("amenities").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

/** Bookings that block a space in a given window. */
export async function fetchConflicts(spaceId: string, startsAt: Date, endsAt: Date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id,starts_at,ends_at,status")
    .eq("space_id", spaceId)
    .in("status", ["pending", "confirmed", "checked_in", "completed"])
    .lt("starts_at", endsAt.toISOString())
    .gt("ends_at", startsAt.toISOString());
  if (error) throw error;
  return data ?? [];
}

/* ------------------------------------------------------------------ */
/* Day availability (Eversports-style slot grid)                       */
/* ------------------------------------------------------------------ */

export type DayAvailability = {
  opensAt: string;
  closesAt: string;
  busy: { start: number; end: number }[];
};

export const dayAvailabilityQuery = (
  spaceId: string,
  locationId: string,
  date: string,
) =>
  queryOptions({
    queryKey: ["day-availability", spaceId, date],
    queryFn: async (): Promise<DayAvailability> => {
      const dayStart = new Date(`${date}T00:00:00`);
      const dayEnd = new Date(`${date}T23:59:59`);
      const weekday = dayStart.getDay();

      const [rules, bookings, blocked] = await Promise.all([
        supabase
          .from("availability_rules")
          .select("*")
          .eq("active", true)
          .or(`space_id.eq.${spaceId},location_id.eq.${locationId}`),
        supabase
          .from("bookings")
          .select("starts_at,ends_at")
          .eq("space_id", spaceId)
          .in("status", ["pending", "confirmed", "checked_in", "completed"])
          .lt("starts_at", dayEnd.toISOString())
          .gt("ends_at", dayStart.toISOString()),
        supabase
          .from("blocked_times")
          .select("starts_at,ends_at")
          .eq("space_id", spaceId)
          .lt("starts_at", dayEnd.toISOString())
          .gt("ends_at", dayStart.toISOString()),
      ]);

      const all = rules.data ?? [];
      const rule =
        all.find((r) => r.space_id === spaceId && r.weekday === weekday) ??
        all.find((r) => r.space_id === spaceId && r.weekday === null) ??
        all.find((r) => r.weekday === weekday) ??
        all.find((r) => r.weekday === null);

      const busy = [...(bookings.data ?? []), ...(blocked.data ?? [])].map((b) => ({
        start: new Date(b.starts_at).getTime(),
        end: new Date(b.ends_at).getTime(),
      }));

      return {
        opensAt: (rule?.opens_at ?? "08:00:00").slice(0, 5),
        closesAt: (rule?.closes_at ?? "22:00:00").slice(0, 5),
        busy,
      };
    },
  });

/* ------------------------------------------------------------------ */
/* MY MIXD.                                                            */
/* ------------------------------------------------------------------ */

export const myBookingsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-bookings", userId ?? "anon"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "*, spaces(name,slug,space_type), locations(name,address_line1,postal_code,city), access_credentials(valid_from,valid_until,status)",
        )
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const mySubscriptionsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-subscriptions", userId ?? "anon"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_subscriptions")
        .select("*, memberships(*)")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const splitsQuery = (bookingId: string) =>
  queryOptions({
    queryKey: ["splits", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_splits")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

export const mySplitsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-splits", userId ?? "anon"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_splits")
        .select("*, bookings(reference,starts_at,total_cents,spaces(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
