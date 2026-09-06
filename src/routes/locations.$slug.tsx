import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import locationImage from "@/assets/mixd-building-exterior.jpg";
import flexImage from "@/assets/mixd-building-open-interior.jpg";
import meetingImage from "@/assets/mixd-building-glass-office.jpg";
import { SiteShell, EmptyState } from "@/components/site/SiteShell";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { BookingSearch } from "@/components/booking/BookingSearch";
import { Button } from "@/components/ui/button";

import { locationQuery, spacesQuery } from "@/lib/queries";
import { amenityLabel, slugToTitle } from "@/lib/mixd";

const BUILDING_FACTS = [
  ["ca. 1.000 m²", "Bürofläche für Desks, Offices, Meetings und Projektzonen."],
  ["2 Etagen", "Flexibel teilbar für ruhige Arbeit, Teams und Events."],
  ["Modernisiert", "Gehobene Ausstattung mit Parkett, Teppich und fugenlosem Gussboden."],
  ["Barrierefrei", "Das Obergeschoss ist per Fahrstuhl erreichbar."],
] as const;

const WEEKDAY_LABELS: Record<string, string> = {
  mon_fri: "Mo - Fr",
  sat: "Sa",
  sun: "So",
};

export const Route = createFileRoute("/locations/$slug")({
  head: ({ params }) => {
    const city = slugToTitle(params.slug);
    return {
      meta: [
        { title: `MIXD.SPACE ${city} — Coworking, Büro & Meetingraum` },
        {
          name: "description",
          content: `MIXD.SPACE ${city}: flexible Desks, Private Offices, Team Offices und Meeting Rooms für Arbeit, Meetings und Projekte.`,
        },
        { property: "og:title", content: `MIXD.SPACE ${city}` },
        {
          property: "og:description",
          content: `Flexible Spaces in ${city}. work. meet. create.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LocationPage,
});

function LocationPage() {
  const { slug } = Route.useParams();
  const { data: location, isLoading } = useQuery(locationQuery(slug));
  const { data: spaces, isLoading: spacesLoading } = useQuery(spacesQuery({ locationSlug: slug }));

  if (isLoading) {
    return (
      <SiteShell>
        <div className="container-mixd pt-14 pb-24">
          <div className="h-3 w-24 animate-pulse bg-muted" />
          <div className="mt-6 h-10 w-2/3 max-w-xl animate-pulse bg-muted" />
          <div className="mt-6 h-4 w-48 animate-pulse bg-muted" />
          <div className="mt-12 aspect-[16/9] w-full animate-pulse bg-muted sm:aspect-[16/7]" />
        </div>
      </SiteShell>
    );
  }

  if (!location) {
    return (
      <SiteShell>
        <div className="container-mixd py-24">
          <EmptyState title="Diesen Standort gibt es nicht." />
        </div>
      </SiteShell>
    );
  }

  const hours = (location.opening_hours ?? {}) as Record<string, string>;
  const locationAmenities = (location.amenities ?? []) as string[];
  const amenities =
    slug === "garbsen"
      ? Array.from(new Set([...locationAmenities, "Lift access", "Flexible units"]))
      : locationAmenities;
  const parkingInfo =
    slug === "garbsen"
      ? "Parken direkt am Gebäude auf dem großzügigen Grundstück."
      : location.parking_info;
  const gettingThere =
    slug === "garbsen"
      ? "Gut erreichbarer Standort in Garbsen mit schneller Anbindung in Richtung Hannover, A2, A352 und regionale Gewerbestandorte."
      : location.getting_there;
  const mapsQuery = encodeURIComponent(
    `${location.address_line1 ?? ""} ${location.postal_code ?? ""} ${location.city ?? ""}`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: location.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address_line1,
      postalCode: location.postal_code,
      addressLocality: location.city,
      addressCountry: "DE",
    },
    email: location.contact_email,
    telephone: location.contact_phone,
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="container-mixd pt-14">
        <p className="eyebrow">Standort</p>
        <h1 className="display-xl mt-6">{location.name}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Ein modernes, ca. 1.000 m² großes Bürohaus in Garbsen: groß genug für Teams und
          Unternehmen, zugänglich genug für Studierende, Freelancer und Remote Worker, flexibel
          genug für alles dazwischen.
        </p>
        <address className="mt-8 text-lg not-italic text-muted-foreground">
          {location.address_line1}
          <br />
          {location.postal_code} {location.city}
        </address>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/spaces" search={{ location: slug }}>
              Verfügbarkeit prüfen
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
            >
              Route öffnen
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/book">Space anfragen</Link>
          </Button>
        </div>
      </section>

      <section className="container-mixd mt-12">
        <div className="media-zoom aspect-[16/9] bg-muted sm:aspect-[16/7]">
          <img
            src={location.hero_image_url ?? locationImage}
            alt={location.name}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="container-mixd mt-12">
        <BookingSearch />
      </section>

      <section className="container-mixd mt-24 border-y border-border py-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <div>
            <p className="eyebrow">Das Gebäude</p>
            <h2 className="display-md mt-4">Ein echtes Bürohaus für den MIXD Alltag.</h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              Der Standort ist kein Showroom und kein klassisches Business Center. Er gibt MIXD die
              richtige Basis: professionelle Räume, flexible Flächen und genug Platz, damit Fokus,
              Meetings, Projektarbeit und Community nebeneinander funktionieren.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {BUILDING_FACTS.map(([value, label]) => (
              <div key={value} className="rounded-lg border border-border bg-card p-6">
                <p className="font-display text-2xl tracking-tight">{value}</p>
                <p className="mt-3 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-mixd mt-24 grid gap-12 border-t border-border pt-12 lg:grid-cols-3">
        <div>
          <p className="eyebrow">Öffnungszeiten</p>
          <ul className="mt-5 space-y-2 text-sm">
            {Object.entries(hours).map(([k, v]) => (
              <li key={k} className="flex justify-between gap-4">
                <span className="text-muted-foreground">{WEEKDAY_LABELS[k] ?? k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
          {parkingInfo && (
            <>
              <p className="eyebrow mt-10">Parken</p>
              <p className="mt-4 text-sm text-muted-foreground">{parkingInfo}</p>
            </>
          )}
          {gettingThere && (
            <>
              <p className="eyebrow mt-10">Anfahrt</p>
              <p className="mt-4 text-sm text-muted-foreground">{gettingThere}</p>
            </>
          )}
        </div>

        <div>
          <p className="eyebrow">Ausstattung</p>
          <ul className="mt-5 grid gap-2 text-sm">
            {amenities.map((a) => (
              <li key={a}>{amenityLabel(a)}</li>
            ))}
          </ul>
          {(location.contact_email || location.contact_phone) && (
            <>
              <p className="eyebrow mt-10">Kontakt</p>
              <p className="mt-4 text-sm text-muted-foreground">
                {location.contact_email}
                <br />
                {location.contact_phone}
              </p>
            </>
          )}
        </div>

        <div>
          <p className="eyebrow">Karte</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex aspect-[4/3] flex-col items-center justify-center border border-dashed border-border bg-surface text-center text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <span className="font-display text-base tracking-tight text-foreground">
              {location.address_line1}
            </span>
            <span className="mt-1">
              {location.postal_code} {location.city}
            </span>
            <span className="mt-4 text-xs uppercase tracking-[0.16em]">In Maps öffnen</span>
          </a>
        </div>
      </section>

      <section className="container-mixd mt-24">
        <div className="grid gap-2 sm:grid-cols-2">
          {[flexImage, meetingImage].map((src, i) => (
            <div key={i} className="media-zoom aspect-[4/3] bg-muted">
              <img
                src={src}
                alt={`${location.name} interior ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="container-mixd mt-24 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-md">Spaces in Garbsen</h2>
          <Link
            to="/spaces"
            search={{ location: slug }}
            className="link-underline text-sm text-muted-foreground"
          >
            Verfügbarkeit prüfen
          </Link>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {spacesLoading
            ? Array.from({ length: 3 }).map((_, i) => <SpaceCardSkeleton key={i} />)
            : (spaces ?? []).map((s) => <SpaceCard key={s.id} space={s} />)}
        </div>
      </section>
    </SiteShell>
  );
}
