import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Zap, Plug, Leaf } from "lucide-react";
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
      { title: "MIXD.SPACE Garbsen — One mixed space for study, work, meet & create" },
      {
        name: "description",
        content:
          "Study, work, meet and create at MIXD.SPACE Garbsen. Flexible desks, offices and meeting rooms for every use — book by the hour, day or month.",
      },
      { property: "og:title", content: "MIXD.SPACE — One mixed space for everything." },
      {
        property: "og:description",
        content:
          "Study, work, meet and create at MIXD.SPACE Garbsen. Flexible spaces for every use.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const MANIFESTO = [
  {
    word: "STUDY",
    line: "without the library stress.",
    text: "Quiet desks, fast WiFi and enough coffee to get through that chapter.",
    to: "/coworking",
    cta: "Flex desks",
  },
  {
    word: "WORK",
    line: "when you want.",
    text: "Freelance, side hustle, thesis or deep focus — no contract, just the hours you need.",
    to: "/coworking",
    cta: "Flex desks",
  },
  {
    word: "MEET",
    line: "where ideas actually flow.",
    text: "Rooms for group work, thesis sessions or your next side-project kickoff.",
    to: "/meeting-rooms",
    cta: "Meeting rooms",
  },
  {
    word: "CREATE",
    line: "without limits.",
    text: "Workshops, content shoots, hackathons — spaces that keep up with your energy.",
    to: "/team-offices",
    cta: "Team offices",
  },
];

const MIXED_USES = [
  { label: "Study", desc: "Solo focus & group sessions", to: "/coworking" },
  { label: "Work", desc: "Freelance & deep work", to: "/coworking" },
  { label: "Meet", desc: "Teams & client calls", to: "/meeting-rooms" },
  { label: "Create", desc: "Workshops & projects", to: "/team-offices" },
];

const BENEFITS = [
  ["Fast WiFi", "Business-grade connection in every room."],
  ["Flexible booking", "By the hour, the day or the month."],
  ["Digital access", "Your booking is your key."],
  ["Professional rooms", "Designed for work, not for show."],
  ["Coffee & water", "Included with every booking."],
  ["Easy parking", "Free parking at the door."],
];

const HERO_TAGS = [
  { icon: Zap, label: "Coffee included" },
  { icon: Plug, label: "Outlets guaranteed" },
  { icon: Leaf, label: "Chill atmosphere" },
];

function Home() {
  const { data: spaces, isLoading } = useQuery(spacesQuery());
  const { data: memberships } = useQuery(membershipsQuery);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="container-mixd pt-6 lg:pt-10">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="A bright, relaxed workspace at MIXD.SPACE"
              width={1920}
              height={1200}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/25 to-foreground/10" />
          </div>

          {/* Sticker badge */}
          <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-8">
            <div className="rotate-6 rounded-full bg-accent px-3 py-1.5 text-xs font-bold tracking-tight text-accent-foreground shadow-lg ring-2 ring-white/20 sm:px-4 sm:py-2 sm:text-sm">
              One space, mixed use
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end px-5 pb-8 pt-32 sm:px-10 sm:pb-12 sm:pt-44 lg:px-16 lg:pb-16 lg:pt-56">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              study. work. meet. create.
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
              One{" "}
              <span className="relative inline-block">
                MIXD
                <svg
                  className="absolute -bottom-1 left-0 w-full text-accent/80 sm:-bottom-2"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  style={{ height: "0.45em" }}
                >
                  <path
                    d="M0 5 Q 25 0, 50 5 T 100 5"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              space for everything.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
              Study sessions, deep work, team meetings, creative sprints — book the room that fits right now.
            </p>

            <div className="mt-8 max-w-4xl">
              <BookingSearch variant="hero" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {HERO_TAGS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Icon className="size-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="mt-12 overflow-hidden border-y border-border bg-foreground py-3 text-background lg:mt-16">
        <div className="ticker flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex gap-10 text-sm tracking-[0.18em] uppercase">
              <span>Study</span>
              <span className="text-accent">✳</span>
              <span>Work</span>
              <span className="text-accent">✳</span>
              <span>Meet</span>
              <span className="text-accent">✳</span>
              <span>Create</span>
              <span className="text-accent">✳</span>
              <span>MIXD.SPACE</span>
              <span className="text-accent">✳</span>
            </span>
          ))}
        </div>
      </div>

      {/* MIXED uses */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-md">
            MIXD means
            <br />
            <span className="text-muted-foreground">mixed.</span>
          </h2>
          <p className="max-w-md text-muted-foreground">
            The same room can be your study spot at noon, your meeting room at 4 PM and your creative studio after
            dinner.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MIXED_USES.map((use, i) => (
            <Link
              key={use.label}
              to={use.to}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 transition-colors hover:border-foreground"
            >
              <span
                className="absolute right-4 top-4 font-display text-5xl font-medium text-muted/50 transition-colors group-hover:text-accent/30"
                aria-hidden
              >
                0{i + 1}
              </span>
              <p className="font-display text-2xl tracking-tight">{use.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{use.desc}</p>
              <span className="link-underline mt-6 inline-flex items-center gap-2 text-sm group-hover:link-underline-active">
                Book it <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Manifesto */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="divide-y divide-border rounded-[2rem] border border-border bg-card p-6 sm:p-10 lg:p-14">
          {MANIFESTO.map((item) => (
            <div
              key={item.word}
              className="grid gap-6 py-12 first:pt-0 last:pb-0 md:grid-cols-[1fr_1fr] md:items-end lg:py-16"
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
      <section className="mt-28 rounded-[2rem] border border-border bg-surface py-20 lg:mt-40 lg:py-28">
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
        <div className="grid gap-10 overflow-hidden rounded-[2rem] border border-border lg:grid-cols-2 lg:items-center">
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
          <div className="p-6 sm:p-10 lg:p-14">
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
        <div className="grid gap-10 rounded-[2rem] border border-border p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div>
            <p className="eyebrow">Students &amp; young founders</p>
            <h2 className="display-md mt-4 max-w-lg">
              A desk that beats the
              <br />
              kitchen table.
            </h2>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Thesis weeks, group projects, side hustles, first clients. Book an hour between lectures or a room for the
              whole study group — no contract, no membership required.
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
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm transition-colors hover:border-foreground"
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
        <div className="rounded-[2rem] border border-border p-8 lg:p-14">
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
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(memberships ?? []).map((m) => (
            <div key={m.id} className="rounded-[2rem] border border-border bg-card p-8">
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
