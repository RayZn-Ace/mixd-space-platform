import { Link } from "@tanstack/react-router";
import { SPACE_TYPE_LABEL, formatPrice, fromPrice } from "@/lib/mixd";
import type { SpaceWithRelations } from "@/lib/queries";
import { spaceImage } from "@/lib/space-images";
import { SpaceCode, XMark } from "@/components/site/XMark";

/** Generic house amenities sit behind the ones that make a space distinctive. */
const GENERIC = ["High-speed WiFi", "Coffee included", "Parking", "Natural light"];

export function SpaceCard({ space }: { space: SpaceWithRelations }) {
  const price = fromPrice(space.pricing_rules ?? []);
  const code = (space as { code?: string | null }).code ?? null;
  const all = (space.space_amenities ?? [])
    .map((a) => a.amenities?.name)
    .filter(Boolean) as string[];
  const amenities = [...all]
    .sort((a, b) => Number(GENERIC.includes(a)) - Number(GENERIC.includes(b)))
    .slice(0, 3);

  return (
    <Link
      to="/spaces/$slug"
      params={{ slug: space.slug }}
      className="group flex flex-col"
      aria-label={space.name}
    >
      <div className="media-zoom aspect-[4/3] w-full bg-muted">
        <img
          src={space.hero_image_url ?? spaceImage(space.space_type, code)}
          alt={space.name}
          loading="lazy"
          width={1280}
          height={960}
          className="media-zoom-img h-full w-full object-cover group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <SpaceCode code={code} className="mb-3 self-start" />
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="flex items-center gap-2 font-display text-lg tracking-tight">
            {space.name}
            <XMark className="size-3 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
          </h3>
          {price && (
            <span className="shrink-0 text-sm text-muted-foreground">
              from {formatPrice(price.price_cents)} / {price.label}
            </span>
          )}
        </div>
        {space.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{space.description}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {SPACE_TYPE_LABEL[space.space_type]}
          {space.capacity ? ` · up to ${space.capacity} ${space.capacity === 1 ? "person" : "people"}` : ""}
          {space.locations ? ` · ${space.locations.name}` : ""}
        </p>
        {amenities.length > 0 && (
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {amenities.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}

export function SpaceCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] w-full bg-muted" />
      <div className="mt-5 h-4 w-2/3 bg-muted" />
      <div className="mt-3 h-3 w-1/2 bg-muted" />
    </div>
  );
}
