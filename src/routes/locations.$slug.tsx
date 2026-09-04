import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import locationImage from "@/assets/location-garbsen.jpg";
import flexImage from "@/assets/space-flex.jpg";
import meetingImage from "@/assets/space-meeting.jpg";
import { SiteShell, EmptyState } from "@/components/site/SiteShell";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { BookingSearch } from "@/components/booking/BookingSearch";
import { Button } from "@/components/ui/button";

import { locationQuery, spacesQuery } from "@/lib/queries";
import { slugToTitle } from "@/lib/mixd";

export const Route = createFileRoute("/locations/$slug")({
  head: ({ params }) => {
    const city = slugToTitle(params.slug);
    return {
      meta: [
        { title: `MIXD.SPACE ${city} — Coworking, Büro & Meetingraum` },
        {
          name: "description",
          content: `MIXD.SPACE ${city}: flexible desks, private offices and meeting rooms. Book by the hour, day or month.`,
        },
        { property: "og:title", content: `MIXD.SPACE ${city}` },
        {
          property: "og:description",
          content: `Flexible workspace in ${city}. Book by the hour, day or month.`,
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
          <EmptyState title="This location doesn't exist." />
        </div>
      </SiteShell>
    );
  }

  const hours = (location.opening_hours ?? {}) as Record<string, string>;
  const amenities = (location.amenities ?? []) as string[];
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="container-mixd pt-14">
        <p className="eyebrow">Location</p>
        <h1 className="display-xl mt-6">{location.name}</h1>
        <address className="mt-8 text-lg not-italic text-muted-foreground">
          {location.address_line1}
          <br />
          {location.postal_code} {location.city}
        </address>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/spaces" search={{ location: slug }}>
              Check availability
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/book">Find a space</Link>
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

      <section className="container-mixd mt-24 grid gap-12 border-t border-border pt-12 lg:grid-cols-3">
        <div>
          <p className="eyebrow">Opening hours</p>
          <ul className="mt-5 space-y-2 text-sm">
            {Object.entries(hours).map(([k, v]) => (
              <li key={k} className="flex justify-between gap-4">
                <span className="text-muted-foreground capitalize">{k.replace("_", " – ")}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
          {location.parking_info && (
            <>
              <p className="eyebrow mt-10">Parking</p>
              <p className="mt-4 text-sm text-muted-foreground">{location.parking_info}</p>
            </>
          )}
          {location.getting_there && (
            <>
              <p className="eyebrow mt-10">Getting there</p>
              <p className="mt-4 text-sm text-muted-foreground">{location.getting_there}</p>
            </>
          )}
        </div>

        <div>
          <p className="eyebrow">Amenities</p>
          <ul className="mt-5 grid gap-2 text-sm">
            {amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          {(location.contact_email || location.contact_phone) && (
            <>
              <p className="eyebrow mt-10">Contact</p>
              <p className="mt-4 text-sm text-muted-foreground">
                {location.contact_email}
                <br />
                {location.contact_phone}
              </p>
            </>
          )}
        </div>

        <div>
          <p className="eyebrow">Map</p>
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
            <span className="mt-4 text-xs uppercase tracking-[0.16em]">Open in maps</span>
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
          <h2 className="display-md">Spaces here</h2>
          <Link to="/spaces" search={{ location: slug }} className="link-underline text-sm text-muted-foreground">
            Check availability
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
