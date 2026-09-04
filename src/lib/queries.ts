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
