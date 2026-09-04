import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import locationImage from "@/assets/location-garbsen.jpg";
import peopleStudent from "@/assets/people-student.jpg";
import peopleProfessional from "@/assets/people-professional.jpg";
import peopleCall from "@/assets/people-call.jpg";
import peopleTeam from "@/assets/people-team.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingSearch } from "@/components/booking/BookingSearch";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { XMark, XDivider } from "@/components/site/XMark";
import { Button } from "@/components/ui/button";
import { membershipsQuery, spacesQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/mixd";
import { LeadBand } from "@/components/site/LeadDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIXD.SPACE Garbsen — work. meet. create." },
      {
        name: "description",
        content:
          "Different people. Different work. One space. Flexible desks, private offices and meeting rooms in Garbsen. Book by the hour, day or month.",
      },
      { property: "og:title", content: "MIXD.SPACE — work. meet. create." },
      {
        property: "og:description",
        content: "Different people. Different work. One space. Book by the hour, day or month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const USES = [
  {
    word: "WORK",
    line: "Focus, without the kitchen table.",
    to: "/coworking",
    cta: "Desks",
  },
  {
    word: "MEET",
    line: "A room that makes the meeting easy.",
    to: "/meeting-rooms",
    cta: "Meeting rooms",
  },
  {
    word: "CREATE",
    line: "Space for the projects in between.",
    to: "/team-offices",
    cta: "Team offices",
  },
] as const;

const SPACE_TYPES = [
  { code: "DESK", label: "Desks", desc: "By the hour, day or month.", to: "/coworking" },
  { code: "OFFICE", label: "Private Offices", desc: "Your own door.", to: "/private-offices" },
  { code: "MEET", label: "Meeting Rooms", desc: "2 to 12 people.", to: "/meeting-rooms" },
  { code: "TEAM", label: "Team Offices", desc: "For teams and projects.", to: "/team-offices" },
] as const;

const HOW = [
  ["Find", "Pick a space and a time."],
  ["Book", "Pay online. Done."],
  ["Enter", "Your booking is your key."],
  ["Work", "That's it."],
] as const;

const NEEDS = [
  { need: "I need a desk today.", to: "/coworking" },
  { need: "I need somewhere to study.", to: "/coworking" },
  { need: "I need a quiet place for calls.", to: "/private-offices" },
  { need: "I need a meeting room.", to: "/meeting-rooms" },
  { need: "I need an office for my team.", to: "/team-offices" },
  { need: "I need a project office.", to: "/teams" },
  { need: "I need a business address.", to: "/business-address" },
] as const;

const PEOPLE = [
  {
    img: peopleStudent,
    w: 1200,
    h: 1500,
    alt: "A student working on a thesis at a quiet desk",
    label: "Bachelor thesis. Third coffee.",
    tag: "DESK.04",
  },
  {
    img: peopleProfessional,
    w: 1200,
    h: 1500,
    alt: "A professional working on a laptop by the window",
    label: "Remote day. Not at home.",
    tag: "DESK.01",
  },
  {
    img: peopleCall,
    w: 1200,
    h: 1500,
    alt: "A consultant taking a call between appointments",
    label: "Two appointments. One hour between.",
    tag: "OFFICE.02",
  },
] as const;

const AUDIENCES = [
  "Students",
  "Remote workers",
  "Freelancers",
  "Founders",
  "Creatives",
  "Professionals",
  "Startups",
  "Small businesses",
  "Project teams",
  "Corporate teams",
  "Consultants",
  "Researchers",
];

function Home() {
  const { data: spaces, isLoading } = useQuery(spacesQuery());
  const { data: memberships } = useQuery(membershipsQuery);
  const [need, setNeed] = useState(0);

  return (
    <SiteShell>
      {/* 01 — Hero */}
      <section className="container-mixd pt-6 lg:pt-10">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="A workspace at MIXD.SPACE Garbsen"
              width={1920}
              height={1200}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/10" />
          </div>

          <div className="relative z-10 flex flex-col justify-end px-5 pb-8 pt-32 sm:px-10 sm:pb-12 sm:pt-44 lg:px-16 lg:pb-16 lg:pt-56">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              <XMark className="size-3 text-accent" />
              work. meet. create.
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Different people.
              <br />
              Different work.
              <br />
              <span className="text-white/60">One space.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
              Flexible desks, private offices and meeting spaces in Garbsen. Book by the hour, day or month.
            </p>
            <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.625rem] uppercase tracking-[0.2em] text-white/70">
              {MIX.map((m, i) => (
                <li key={m} className="flex items-center gap-3">
                  {i > 0 && <XMark className="size-2 text-accent" />}
                  {m}
                </li>
              ))}
            </ul>

            <div className="mt-8 max-w-4xl">
              <BookingSearch variant="hero" />
            </div>

          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="mt-12 overflow-hidden border-y border-border bg-foreground py-3 text-background lg:mt-16">
        <div className="ticker flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex gap-10 text-sm uppercase tracking-[0.18em]">
              <span>work.</span>
              <span className="text-accent">✕</span>
              <span>meet.</span>
              <span className="text-accent">✕</span>
              <span>create.</span>
              <span className="text-accent">✕</span>
              <span>MIXD.SPACE</span>
              <span className="text-accent">✕</span>
            </span>
          ))}
        </div>
      </div>

      {/* 02 — Available */}
      <section className="container-mixd mt-24 lg:mt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-md">Available now.</h2>
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

      {/* 03 — work / meet / create */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="divide-y divide-border border-y border-border">
          {USES.map((u) => (
            <Link
              key={u.word}
              to={u.to}
              className="group grid gap-4 py-10 md:grid-cols-[0.9fr_1fr_auto] md:items-baseline lg:py-14"
            >
              <h2 className="display-lg transition-colors group-hover:text-accent">{u.word}</h2>
              <p className="max-w-sm text-lg text-muted-foreground">{u.line}</p>
              <span className="link-underline inline-flex items-center gap-2 text-sm">
                {u.cta} <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 04 — MIXD means mixed */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="rounded-[2rem] border border-border bg-card px-6 py-16 sm:px-12 lg:px-20 lg:py-28">
          <p className="eyebrow">MIXD means mixed.</p>
          <h2 className="display-lg mt-8 max-w-4xl">
            MIXD isn&apos;t made for one type of person.
            <br />
            <span className="text-muted-foreground">That&apos;s the point.</span>
          </h2>

          <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_1fr]">
            <p className="font-display text-3xl leading-[1.15] tracking-tight sm:text-4xl">
              Students.
              <br />
              Founders.
              <br />
              Freelancers.
              <br />
              Teams.
              <br />
              Businesses.
            </p>
            <div className="max-w-md text-lg text-muted-foreground">
              <p>Different people come here for different reasons.</p>
              <p className="mt-6 text-foreground">
                Some need focus.
                <br />
                Some need a meeting room.
                <br />
                Some need an office for three months.
                <br />
                Some just need a desk for today.
              </p>
              <p className="mt-6 flex items-center gap-2 text-foreground">
                <XMark className="size-3 text-accent" /> That&apos;s MIXD.
              </p>
            </div>
          </div>

          <XDivider className="mt-16" />

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {AUDIENCES.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 — Space types */}
      <section className="container-mixd mt-24 lg:mt-36">
        <h2 className="display-md">Pick what fits today.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPACE_TYPES.map((t) => (
            <Link
              key={t.code}
              to={t.to}
              className="group flex flex-col justify-between rounded-[1.75rem] border border-border bg-card p-8 transition-colors hover:border-foreground"
            >
              <span className="inline-flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.24em] text-muted-foreground">
                <XMark className="size-2.5 text-accent" />
                {t.code}.01
              </span>
              <div className="mt-16">
                <p className="font-display text-2xl tracking-tight">{t.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 06 — How it works */}
      <section className="mt-24 border-y border-border bg-foreground py-20 text-background lg:mt-36 lg:py-28">
        <div className="container-mixd">
          <h2 className="display-md max-w-2xl">Your booking is your key.</h2>
          <p className="mt-6 max-w-md text-background/70">
            Book online, get digital access automatically. No request. No waiting.
          </p>
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {HOW.map(([step, text], i) => (
              <li key={step}>
                <span className="text-[0.625rem] uppercase tracking-[0.24em] text-accent">
                  0{i + 1}
                </span>
                <p className="mt-4 font-display text-2xl tracking-tight">{step}</p>
                <p className="mt-2 text-sm text-background/60">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 07 — What brings you to MIXD */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow">What brings you to MIXD?</p>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {NEEDS.map((n, i) => (
                <li key={n.need}>
                  <button
                    type="button"
                    onMouseEnter={() => setNeed(i)}
                    onFocus={() => setNeed(i)}
                    onClick={() => setNeed(i)}
                    className={
                      "flex w-full items-center justify-between gap-4 py-4 text-left font-display text-xl tracking-tight transition-colors sm:text-2xl " +
                      (need === i ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {n.need}
                    <XMark
                      className={
                        "size-3 shrink-0 transition-opacity " +
                        (need === i ? "text-accent opacity-100" : "opacity-0")
                      }
                    />
                  </button>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8">
              <Link to={NEEDS[need]!.to}>Show me the space</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {PEOPLE.map((p, i) => (
              <figure
                key={p.label}
                className={
                  "media-zoom relative overflow-hidden rounded-[1.5rem] bg-muted " +
                  (i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]")
                }
              >
                <img
                  src={p.img}
                  alt={p.alt}
                  loading="lazy"
                  width={p.w}
                  height={p.h}
                  className="media-zoom-img h-full w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4 text-xs text-white">
                  <span className="block text-[0.625rem] uppercase tracking-[0.2em] text-white/60">
                    {p.tag}
                  </span>
                  {p.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — Garbsen */}
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
                See the location
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 09 — Memberships */}
      <section className="container-mixd mt-24 lg:mt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-md">Here often?</h2>
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

      {/* 10 — Teams */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="grid gap-10 overflow-hidden rounded-[2rem] border border-border lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="p-8 lg:p-14">
            <p className="eyebrow">MIXD for Teams</p>
            <h2 className="display-md mt-4 max-w-md">Workspace when your team needs it.</h2>
            <p className="mt-6 max-w-sm text-lg text-muted-foreground">
              Private offices. Project spaces. Meeting rooms. Flexible terms.
            </p>
            <Button asChild className="mt-8">
              <Link to="/teams">For teams</Link>
            </Button>
          </div>
          <div className="media-zoom aspect-[16/10] bg-muted">
            <img
              src={peopleTeam}
              alt="A team meeting in a MIXD.SPACE meeting room"
              loading="lazy"
              width={1500}
              height={1000}
              className="media-zoom-img h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 11 — Final CTA */}
      <section className="container-mixd mt-24 lg:mt-36">
        <div className="rounded-[2rem] border border-border bg-surface px-6 py-20 text-center lg:py-28">
          <XMark className="mx-auto size-5 text-accent" />
          <h2 className="display-lg mx-auto mt-8 max-w-2xl">Find your space.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/spaces">See all spaces</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/book">Book now</Link>
            </Button>
          </div>
        </div>
      </section>

      <LeadBand
        title="Want in before we open the doors?"
        line="Get early access to MIXD.SPACE Garbsen: first dates, first desks, first rates."
        kind="early_access"
      />

    </SiteShell>
  );
}
