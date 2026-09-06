import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import locationImage from "@/assets/mixd-building-exterior.jpg";
import { SiteShell, PageHeader, EmptyState } from "@/components/site/SiteShell";
import { locationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "Locations — MIXD.SPACE" },
      {
        name: "description",
        content: "MIXD.SPACE locations. Currently open in Garbsen-Berenbostel, more to follow.",
      },
      { property: "og:title", content: "Locations — MIXD.SPACE" },
      { property: "og:description", content: "Flexible workspace locations by MIXD.SPACE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const { data, isLoading } = useQuery(locationsQuery);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Locations"
        title="Where we are."
        intro="One location open today. The platform is built for many."
      />
      <section className="container-mixd">
        {isLoading && <div className="aspect-[16/7] w-full animate-pulse bg-muted" />}
        {!isLoading && (data ?? []).length === 0 && (
          <EmptyState title="No locations published yet." />
        )}
        <div className="grid gap-14">
          {(data ?? []).map((l) => (
            <Link
              key={l.id}
              to="/locations/$slug"
              params={{ slug: l.slug }}
              className="group grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center"
            >
              <div className="media-zoom aspect-[16/9] bg-muted">
                <img
                  src={l.hero_image_url ?? locationImage}
                  alt={l.name}
                  loading="lazy"
                  className="media-zoom-img h-full w-full object-cover group-hover:scale-[1.03]"
                />
              </div>
              <div>
                <h2 className="display-md">{l.name}</h2>
                <address className="mt-4 not-italic text-muted-foreground">
                  {l.address_line1}
                  <br />
                  {l.postal_code} {l.city}
                </address>
                <p className="mt-6 max-w-md text-sm text-muted-foreground">{l.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
