import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import locationImage from "@/assets/location-garbsen.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingSearch } from "@/components/booking/BookingSearch";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { Button } from "@/components/ui/button";
import { membershipsQuery, spacesQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/mixd";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIXD.SPACE Garbsen — Flexible workspace, by the hour or month" },
      {
        name: "description",
        content:
          "Flexible desks, private offices and meeting rooms in Garbsen. Book by the hour, day or month. work. meet. create.",
      },
      { property: "og:title", content: "MIXD.SPACE — work. meet. create." },
      {
        property: "og:description",
        content: "Flexible desks, private offices and meeting rooms in Garbsen-Berenbostel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const MANIFESTO = [
  {
    word: "WORK",
    line: "when you want.",
    text: "Flexible desks and private offices for whenever work needs a place.",
    to: "/coworking",
    cta: "Flex desks",
  },
  {
    word: "MEET",
    line: "where it matters.",
    text: "Meeting spaces for two people or entire teams.",
    to: "/meeting-rooms",
    cta: "Meeting rooms",
  },
  {
    word: "CREATE",
    line: "without limits.",
    text: "Rooms designed for workshops, projects and ideas.",
    to: "/team-offices",
    cta: "Team offices",
  },
];

const BENEFITS = [
  ["Fast WiFi", "Business-grade connection in every room."],
  ["Flexible booking", "By the hour, the day or the month."],
  ["Digital access", "Your booking is your key."],
  ["Professional rooms", "Designed for work, not for show."],
  ["Coffee & water", "Included with every booking."],
  ["Easy parking", "Free parking at the door."],
];

function Home() {
  const { data: spaces, isLoading } = useQuery(spacesQuery());
  const { data: memberships } = useQuery(membershipsQuery);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative">
        <div className="container-mixd pt-14 lg:pt-20">
          <p className="eyebrow rise">work. meet. create.</p>
          <h1 className="display-xl rise mt-6 max-w-5xl">
            A new way to work
            <br />
            in Garbsen.
          </h1>
          <p className="mt-8 max-w-md text-lg text-muted-foreground">
            Flexible desks, private offices and meeting spaces. Book by the hour, day or month.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/spaces">Find your space</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/locations/$slug" params={{ slug: "garbsen" }}>
                Explore Garbsen
              </Link>
            </Button>
          </div>
        </div>

        <div className="container-mixd mt-14">
          <div className="media-zoom aspect-[16/10] w-full bg-muted sm:aspect-[16/7]">
            <img
              src={heroImage}
              alt="A quiet, light-filled workspace at MIXD.SPACE"
              width={1920}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="container-mixd relative z-10 -mt-10 lg:-mt-16">
          <BookingSearch className="shadow-none" />
        </div>
      </section>

      {/* Ticker */}
      <div className="mt-16 overflow-hidden border-y border-border bg-foreground py-3 text-background lg:mt-24">
        <div className="ticker flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex gap-10 text-sm tracking-[0.18em] uppercase">
              <span>Study sessions</span>
              <span className="text-accent">✳</span>
              <span>Deep work</span>
              <span className="text-accent">✳</span>
              <span>Team sprints</span>
              <span className="text-accent">✳</span>
              <span>Late-night edits</span>
              <span className="text-accent">✳</span>
              <span>Client meetings</span>
              <span className="text-accent">✳</span>
            </span>
          ))}
        </div>
      </div>

      {/* Manifesto */}
      <section className="container-mixd mt-28 lg:mt-40">
        <div className="divide-y divide-border border-y border-border">
          {MANIFESTO.map((item) => (
            <div
              key={item.word}
              className="grid gap-6 py-14 md:grid-cols-[1fr_1fr] md:items-end lg:py-20"
            >
              <h2 className="display-lg">
                {item.word}
                <br />
                <span className="text-muted-foreground">{item.line}</span>
              </h2>
              <div className="md:pb-3">
                <p className="max-w-sm text-lg">{item.text}</p>
                <Link
                  to={item.to}
                  className="link-underline mt-6 inline-flex items-center gap-2 text-sm hover:link-underline-active"
                >
                  {item.cta} <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spaces */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-md">Available today</h2>
          <Link to="/spaces" className="link-underline text-sm text-muted-foreground">
            All spaces
          </Link>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SpaceCardSkeleton key={i} />)
            : (spaces ?? []).slice(0, 6).map((s) => <SpaceCard key={s.id} space={s} />)}
        </div>
      </section>

      {/* Why */}
      <section className="mt-28 border-y border-border bg-surface py-20 lg:mt-40 lg:py-28">
        <div className="container-mixd grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="display-md">Why MIXD.</h2>
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {BENEFITS.map(([title, text]) => (
              <div key={title}>
                <dt className="font-display text-base tracking-tight">{title}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Location */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="media-zoom aspect-[4/3] bg-muted">
            <img
              src={locationImage}
              alt="MIXD.SPACE Garbsen, Erlenweg 18"
              loading="lazy"
              width={1600}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">Location</p>
            <h2 className="display-md mt-4">MIXD.SPACE Garbsen</h2>
            <address className="mt-6 text-lg not-italic text-muted-foreground">
              Erlenweg 18
              <br />
              30827 Garbsen-Berenbostel
            </address>
            <Button asChild variant="outline" className="mt-8">
              <Link to="/locations/$slug" params={{ slug: "garbsen" }}>
                Explore the location
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Students & founders */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="grid gap-10 border border-border p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div>
            <p className="eyebrow">Students &amp; young founders</p>
            <h2 className="display-md mt-4 max-w-lg">
              A desk that beats the
              <br />
              kitchen table.
            </h2>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Thesis weeks, group projects, side hustles, first clients. Book an hour between
              lectures or a room for the whole study group — no contract, no membership required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/coworking">Grab a desk</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/memberships">See plans</Link>
              </Button>
            </div>
          </div>
          <ul className="grid content-start gap-3 self-center sm:grid-cols-2 lg:grid-cols-1">
            {[
              "Pay by the hour",
              "Group rooms for project work",
              "Quiet enough to actually focus",
              "Coffee & fast WiFi included",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-3 border border-border px-4 py-3 text-sm transition-colors hover:border-foreground"
              >
                <span className="text-accent">✳</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Teams */}
      <section className="container-mixd mt-28 lg:mt-40">
        <div className="border-t border-border pt-14">
          <h2 className="display-lg max-w-3xl">Workspace for your entire team.</h2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Give employees access to professional workspaces without maintaining another office.
          </p>
          <Button asChild className="mt-8">
            <Link to="/teams">MIXD for Teams</Link>
          </Button>
        </div>
      </section>

      {/* Memberships */}
      <section className="container-mixd mt-24 lg:mt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-md">Memberships</h2>
          <Link to="/memberships" className="link-underline text-sm text-muted-foreground">
            Compare plans
          </Link>
        </div>
        <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
          {(memberships ?? []).map((m) => (
            <div key={m.id} className="bg-background p-8">
              <p className="font-display text-lg tracking-tight">{m.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
              <p className="mt-8 text-2xl">
                {formatPrice(m.monthly_price_cents)}
                <span className="text-sm text-muted-foreground"> / month</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
