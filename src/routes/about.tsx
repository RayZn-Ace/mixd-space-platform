import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MIXD.SPACE — Flexible workspace, completely digital" },
      {
        name: "description",
        content:
          "MIXD.SPACE makes high-quality workspace as easy to book as a hotel room. Find a space, book it, pay, arrive, work.",
      },
      { property: "og:title", content: "About MIXD.SPACE" },
      {
        property: "og:description",
        content: "Flexible workspace, completely digital. work. meet. create.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const STEPS = [
  ["01", "Find", "Search by date, time, people and space type."],
  ["02", "Book", "Live availability, clear rates, instant confirmation."],
  ["03", "Arrive", "Digital access opens shortly before your booking."],
  ["04", "Work", "Coffee, WiFi and a room that's ready."],
];

function AboutPage() {
  return (
    <SiteShell>
      <section className="container-mixd pt-16 lg:pt-24">
        <p className="eyebrow">About</p>
        <h1 className="display-xl mt-6 max-w-4xl">
          Space when
          <br />
          you need it.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          MIXD.SPACE is a flexible workspace brand built around one idea: booking a professional
          room should be as simple as booking a hotel room. No viewings, no negotiations, no
          five-year leases.
        </p>
      </section>

      <section className="container-mixd mt-16">
        <div className="media-zoom aspect-[16/9] bg-muted sm:aspect-[16/7]">
          <img src={heroImage} alt="MIXD.SPACE interior" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="container-mixd mt-24">
        <div className="divide-y divide-border border-y border-border">
          {STEPS.map(([n, t, d]) => (
            <div key={n} className="grid gap-4 py-10 md:grid-cols-[6rem_1fr_1.4fr] md:items-baseline">
              <span className="eyebrow">{n}</span>
              <h2 className="display-md">{t}</h2>
              <p className="text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-mixd mt-24">
        <h2 className="display-lg max-w-3xl">Designed for work. Built for flexibility.</h2>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          The first MIXD.SPACE opens in Garbsen-Berenbostel. The platform behind it is built for
          many locations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/spaces">Find your space</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/locations/$slug" params={{ slug: "garbsen" }}>
              Explore Garbsen
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
