import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SiteShell, PageHeader, EmptyState } from "@/components/site/SiteShell";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { Button } from "@/components/ui/button";
import { amenitiesQuery, locationsQuery, spacesQuery } from "@/lib/queries";
import {
  BOOKABLE_SPACE_TYPES,
  SPACE_TYPE_LABEL,
  amenityLabel,
  fromPrice,
  type SpaceType,
} from "@/lib/mixd";

const searchSchema = z.object({
  location: z.string().optional(),
  date: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  people: z.number().optional(),
  type: z.string().optional(),
  amenity: z.string().optional(),
  maxPrice: z.number().optional(),
});

export const Route = createFileRoute("/spaces/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "All spaces — MIXD.SPACE Garbsen" },
      {
        name: "description",
        content:
          "Alle Spaces bei MIXD.SPACE Garbsen: Desks, Private Offices, Team Offices und Meeting Rooms nach Datum, Uhrzeit, Personen und Preis filtern.",
      },
      { property: "og:title", content: "All spaces — MIXD.SPACE" },
      {
        property: "og:description",
        content: "Flexible Spaces in Garbsen, buchbar nach Stunde, Tag oder Monat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpacesPage,
});

const FIELD =
  "h-10 w-full border-0 border-b border-border bg-transparent px-0 text-sm outline-none focus:border-foreground";

function SpacesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/spaces/" });
  const { data: locations } = useQuery(locationsQuery);
  const { data: amenities } = useQuery(amenitiesQuery);
  const { data: spaces, isLoading, error } = useQuery(spacesQuery());

  type SpaceSearch = z.infer<typeof searchSchema>;
  const set = (patch: Partial<SpaceSearch>) =>
    navigate({ search: (prev: SpaceSearch) => ({ ...prev, ...patch }) });

  const filtered = (spaces ?? []).filter((s) => {
    if (search.location && s.locations?.slug !== search.location) return false;
    if (search.type && s.space_type !== search.type) return false;
    if (search.people && s.capacity && s.capacity < search.people) return false;
    if (
      search.amenity &&
      !(s.space_amenities ?? []).some((a) => a.amenities?.slug === search.amenity)
    )
      return false;
    if (search.maxPrice) {
      const p = fromPrice(s.pricing_rules ?? []);
      if (p && p.price_cents > search.maxPrice * 100) return false;
    }
    return true;
  });

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Discovery"
        title="Find your space."
        intro="Alle Desks, Offices und Meeting Rooms in Garbsen. Filtere nach deinem Anlass, deiner Zeit und der passenden Größe."
      />

      <section className="container-mixd">
        <div className="grid gap-x-8 gap-y-6 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-6">
          <label className="block">
            <span className="eyebrow">Standort</span>
            {(locations ?? []).length === 1 ? (
              <span className={FIELD + " flex items-center"}>{locations?.[0]?.name}</span>
            ) : (
              <select
                className={FIELD}
                value={search.location ?? ""}
                onChange={(e) => set({ location: e.target.value || undefined })}
              >
                <option value="">Alle</option>
                {(locations ?? []).map((l) => (
                  <option key={l.id} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <span className="eyebrow">Datum</span>
            <input
              type="date"
              className={FIELD}
              value={search.date ?? ""}
              onChange={(e) => set({ date: e.target.value || undefined })}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Von</span>
            <input
              type="time"
              disabled={!search.date}
              className={FIELD + (search.date ? "" : " opacity-40")}
              value={search.start ?? ""}
              onChange={(e) => set({ start: e.target.value || undefined })}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Bis</span>
            <input
              type="time"
              disabled={!search.date}
              className={FIELD + (search.date ? "" : " opacity-40")}
              value={search.end ?? ""}
              onChange={(e) => set({ end: e.target.value || undefined })}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Personen</span>
            <input
              type="number"
              min={1}
              placeholder="Alle"
              className={FIELD}
              value={search.people ?? ""}
              onChange={(e) => set({ people: Number(e.target.value) || undefined })}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Max. Preis / Tag</span>
            <input
              type="number"
              min={0}
              step={5}
              placeholder="Kein Limit"
              className={FIELD}
              value={search.maxPrice ?? ""}
              onChange={(e) => set({ maxPrice: Number(e.target.value) || undefined })}
            />
          </label>
        </div>

        <p className="pt-3 text-xs text-muted-foreground">
          {search.date
            ? "Uhrzeiten sind optional - ohne Zeitfenster siehst du alles für diesen Tag."
            : "Wähle ein Datum, um gezielter zu suchen. Ohne Filter siehst du alle MIXD Spaces."}
        </p>

        <div className="flex flex-wrap items-center gap-2 py-5">
          <FilterChip active={!search.type} onClick={() => set({ type: undefined })}>
            Alle Typen
          </FilterChip>
          {BOOKABLE_SPACE_TYPES.map((t) => (
            <FilterChip key={t} active={search.type === t} onClick={() => set({ type: t })}>
              {SPACE_TYPE_LABEL[t as SpaceType]}
            </FilterChip>
          ))}
          <span className="mx-2 hidden h-4 w-px bg-border sm:block" />
          {(amenities ?? []).slice(0, 6).map((a) => (
            <FilterChip
              key={a.id}
              active={search.amenity === a.slug}
              onClick={() =>
                set({ amenity: search.amenity === a.slug ? undefined : (a.slug as string) })
              }
            >
              {amenityLabel(a.name)}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="container-mixd pb-10">
        {error && (
          <EmptyState
            title="Spaces konnten nicht geladen werden."
            description="Bitte lade die Seite neu und versuche es noch einmal."
          />
        )}
        {isLoading && (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SpaceCardSkeleton key={i} />
            ))}
          </div>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState
            title="Kein Space passt zu diesen Filtern."
            description="Probiere ein anderes Datum, einen anderen Space-Typ oder weniger Filter."
            action={
              <Button variant="outline" onClick={() => navigate({ search: () => ({}) })}>
                Filter zurücksetzen
              </Button>
            }
          />
        )}
        {!isLoading && filtered.length > 0 && (
          <>
            <p className="mb-8 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "Space" : "Spaces"}
            </p>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <SpaceCard key={s.id} space={s} />
              ))}
            </div>
          </>
        )}
      </section>
    </SiteShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
