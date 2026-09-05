import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SiteShell, PageHeader, EmptyState } from "@/components/site/SiteShell";
import { BookingSearch } from "@/components/booking/BookingSearch";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { Button } from "@/components/ui/button";
import { spaceQuery, spacesQuery } from "@/lib/queries";
import { spaceMarketingCopy, type SpaceType } from "@/lib/mixd";

const searchSchema = z.object({
  space: z.string().optional(),
  date: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  people: z.number().optional(),
});

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book a space — MIXD.SPACE Garbsen" },
      {
        name: "description",
        content:
          "Space bei MIXD.SPACE Garbsen anfragen: Desk, Private Office, Team Office oder Meeting Room digital auswählen.",
      },
      { property: "og:title", content: "Book a space — MIXD.SPACE" },
      { property: "og:description", content: "Verfügbarkeit prüfen und Space digital anfragen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const search = Route.useSearch();
  const [type, setType] = useState<SpaceType | "all">("all");
  const { data: spaces, isLoading } = useQuery(spacesQuery());
  const { data: selected } = useQuery({
    ...spaceQuery(search.space ?? ""),
    enabled: Boolean(search.space),
  });

  const visible = (spaces ?? []).filter((s) => (type === "all" ? true : s.space_type === type));

  if (selected) {
    return (
      <SiteShell>
        <PageHeader eyebrow="Booking" title={selected.name} intro={spaceMarketingCopy(selected)} />
        <section className="container-mixd grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="order-2 min-w-0 lg:order-1">
            <SpaceCard space={selected} />
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <BookingWidget
              space={selected}
              defaults={{
                date: search.date,
                start: search.start,
                end: search.end,
                people: search.people,
              }}
            />
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Booking"
        title={
          <>
            Find your space.
            <br />
            Für eine Stunde. Einen Tag. Oder ein Projekt.
          </>
        }
        intro="Wähle Datum, Uhrzeit und Space. Solange Online-Zahlung noch nicht aktiv ist, wird deine Auswahl als Anfrage gesendet und persönlich bestätigt."
      />
      <section className="container-mixd">
        <BookingSearch />
      </section>

      <section className="container-mixd mt-14">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-background p-6">
              <p className="eyebrow">0{i + 1}</p>
              <p className="mt-3 font-display text-lg tracking-tight">{s.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-mixd mt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-md">Space auswählen</h2>
          <div className="no-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setType(f.value)}
                className={
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors " +
                  (type === f.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground")
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SpaceCardSkeleton key={i} />)
          ) : visible.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                title="In dieser Kategorie ist noch nichts gelistet."
                description="Wähle einen anderen Space-Typ oder sieh dir alles in Garbsen an."
                action={
                  <Button asChild variant="outline">
                    <Link to="/spaces">Alle Spaces ansehen</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            visible.map((s) => <SpaceCard key={s.id} space={s} />)
          )}
        </div>
      </section>
    </SiteShell>
  );
}

const STEPS = [
  { title: "Zeit wählen", body: "Stunde, halber Tag, ganzer Tag oder regelmäßiger Slot." },
  { title: "Extras dazu", body: "Catering, Screen, Kaffee oder Setup transparent mit anfragen." },
  {
    title: "Bestätigung erhalten",
    body: "Wir prüfen die Anfrage und bestätigen Preis, Raum und Zugang.",
  },
];

const FILTERS: { label: string; value: SpaceType | "all" }[] = [
  { label: "Alles", value: "all" },
  { label: "Desks", value: "flex_desk" },
  { label: "Private offices", value: "private_office" },
  { label: "Team offices", value: "team_office" },
  { label: "Meeting rooms", value: "meeting_room" },
];
