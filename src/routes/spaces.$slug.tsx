import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, EmptyState } from "@/components/site/SiteShell";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { spaceQuery, spacesQuery } from "@/lib/queries";
import { SPACE_TYPE_LABEL, RATE_LABEL, formatPrice } from "@/lib/mixd";
import { spaceImage } from "@/lib/space-images";
import { SpaceCode } from "@/components/site/XMark";

export const Route = createFileRoute("/spaces/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — MIXD.SPACE Garbsen` },
        {
          name: "description",
          content: `Book ${name} at MIXD.SPACE Garbsen. Flexible workspace by the hour, day or month.`,
        },
        { property: "og:title", content: `${name} — MIXD.SPACE` },
        {
          property: "og:description",
          content: `Book ${name} at MIXD.SPACE Garbsen, Erlenweg 18.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SpaceDetail,
  notFoundComponent: () => (
    <SiteShell>
      <div className="container-mixd py-24">
        <EmptyState title="This space doesn't exist." description="It may have been removed." />
      </div>
    </SiteShell>
  ),
});

function SpaceDetail() {
  const { slug } = Route.useParams();
  const { data: space, isLoading } = useQuery(spaceQuery(slug));
  const { data: all } = useQuery(spacesQuery());

  if (isLoading) {
    return (
      <SiteShell>
        <div className="container-mixd py-20">
          <div className="aspect-[16/8] w-full animate-pulse bg-muted" />
        </div>
      </SiteShell>
    );
  }
  if (!space) throw notFound();

  const images =
    (space.space_images ?? []).length > 0
      ? space.space_images.sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url)
      : [spaceImage(space.space_type, (space as { code?: string | null }).code ?? null)];
  const amenities = (space.space_amenities ?? []).map((a) => a.amenities?.name).filter(Boolean);
  const related = (all ?? []).filter((s) => s.id !== space.id && s.space_type === space.space_type);

  return (
    <SiteShell>
      <section className="container-mixd pt-10">
        <Link to="/spaces" className="link-underline text-sm text-muted-foreground">
          ← All spaces
        </Link>
        <div className="mt-6 grid gap-2 md:grid-cols-3">
          {images.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className={
                "media-zoom bg-muted " +
                (i === 0 ? "md:col-span-2 aspect-[16/10]" : "hidden aspect-[4/3] md:block")
              }
            >
              <img
                src={src}
                alt={`${space.name} — view ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="container-mixd mt-14 grid grid-cols-[minmax(0,1fr)] gap-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">{SPACE_TYPE_LABEL[space.space_type]}</p>
            <SpaceCode code={(space as { code?: string | null }).code ?? null} />
          </div>
          <h1 className="display-lg mt-4">{space.name}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{space.description}</p>

          <dl className="mt-12 grid gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-3">
            <Fact label="Capacity" value={space.capacity ? `${space.capacity} people` : "On request"} />
            <Fact label="Size" value={space.size_sqm ? `${space.size_sqm} m²` : "On request"} />
            <Fact
              label="Location"
              value={space.locations?.name ?? "—"}
              href={space.locations ? `/locations/${space.locations.slug}` : undefined}
            />
          </dl>

          <div className="mt-12 border-t border-border pt-8">
            <p className="eyebrow">Ideal for</p>
            <ul className="mt-5 grid gap-y-3 sm:grid-cols-2">
              {IDEAL_FOR[space.space_type].map((line) => (
                <li key={line} className="flex gap-3 text-sm">
                  <span className="text-primary">✕</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>



          {amenities.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <p className="eyebrow">Equipment</p>
              <ul className="mt-5 grid gap-y-3 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="text-sm">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 border-t border-border pt-8">
            <p className="eyebrow">Rates</p>
            <ul className="mt-5 divide-y divide-border">
              {(space.pricing_rules ?? [])
                .filter((r) => r.active)
                .map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="capitalize text-muted-foreground">{r.rate_type}</span>
                    <span>
                      {formatPrice(r.price_cents, r.currency)} / {RATE_LABEL[r.rate_type]}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          {space.rules && (
            <div className="mt-12 border-t border-border pt-8">
              <p className="eyebrow">House rules</p>
              <p className="mt-4 text-sm text-muted-foreground">{space.rules}</p>
            </div>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
          <BookingWidget space={space} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-mixd mt-28 pb-24">
          <h2 className="display-md">Related spaces</h2>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((s) => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}

function Fact({ label, value, href }: { label: string; value: string; href?: string | undefined }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-base">
        {href ? (
          <a href={href} className="link-underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
