import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SiteShell, PageHeader, EmptyState } from "@/components/site/SiteShell";
import { BookingSearch } from "@/components/booking/BookingSearch";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { Button } from "@/components/ui/button";
import { spaceQuery, spacesQuery } from "@/lib/queries";

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
          "Check availability and book a desk, private office or meeting room at MIXD.SPACE Garbsen in a few steps.",
      },
      { property: "og:title", content: "Book a space — MIXD.SPACE" },
      { property: "og:description", content: "Check availability and book online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const search = Route.useSearch();
  const { data: spaces, isLoading } = useQuery(spacesQuery());
  const { data: selected } = useQuery({
    ...spaceQuery(search.space ?? ""),
    enabled: Boolean(search.space),
  });

  if (selected) {
    return (
      <SiteShell>
        <PageHeader eyebrow="Booking" title={selected.name} intro={selected.description ?? undefined} />
        <section className="container-mixd grid gap-12 lg:grid-cols-[1fr_26rem]">
          <div className="order-2 lg:order-1">
            <SpaceCard space={selected} />
          </div>
          <div className="order-1 lg:order-2">
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
            Stay for an hour. Or a month.
          </>
        }
        intro="Pick a day and a time, choose the space that fits, confirm. Your booking is your key."
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
          <h2 className="display-md">Choose a space</h2>
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
                title="Nothing in this category yet."
                description="Try another space type — or see everything we run in Garbsen."
                action={
                  <Button asChild variant="outline">
                    <Link to="/spaces">See all spaces</Link>
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
  { title: "Pick your time", body: "Hourly, half day, full day or a desk for the month." },
  { title: "Add what you need", body: "Parking, coffee, screens or catering — priced upfront." },
  { title: "Walk in", body: "Your confirmation is your key. No front desk queue." },
];

const FILTERS: { label: string; value: SpaceType | "all" }[] = [
  { label: "Everything", value: "all" },
  { label: "Desks", value: "flex_desk" },
  { label: "Private offices", value: "private_office" },
  { label: "Team offices", value: "team_office" },
  { label: "Meeting rooms", value: "meeting_room" },
];

