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
        title="Book. Work. Move on."
        intro="Pick a date and time, choose a space, confirm. Your access opens 15 minutes before you start."
      />
      <section className="container-mixd">
        <BookingSearch />
      </section>
      <section className="container-mixd mt-20">
        <h2 className="display-md">Choose a space</h2>
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SpaceCardSkeleton key={i} />)
          ) : (spaces ?? []).length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                title="No spaces available yet."
                action={
                  <Button asChild variant="outline">
                    <Link to="/locations">See locations</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            (spaces ?? []).map((s) => <SpaceCard key={s.id} space={s} />)
          )}
        </div>
      </section>
    </SiteShell>
  );
}
