import { Link } from "@tanstack/react-router";
import { SPACE_TYPE_LABEL, formatPrice, fromPrice } from "@/lib/mixd";
import type { SpaceWithRelations } from "@/lib/queries";
import { spaceImage } from "@/lib/space-images";

export function SpaceCard({ space }: { space: SpaceWithRelations }) {
  const price = fromPrice(space.pricing_rules ?? []);
  const amenities = (space.space_amenities ?? [])
    .map((a) => a.amenities?.name)
    .filter(Boolean)
    .slice(0, 3) as string[];

  return (
    <Link
      to="/spaces/$slug"
      params={{ slug: space.slug }}
      className="group flex flex-col"
      aria-label={space.name}
    >
      <div className="media-zoom aspect-[4/3] w-full bg-muted">
        <img
          src={space.hero_image_url ?? spaceImage(space.space_type)}
          alt={space.name}
          loading="lazy"
          width={1280}
          height={960}
          className="media-zoom-img h-full w-full object-cover group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg tracking-tight">{space.name}</h3>
          {price && (
            <span className="shrink-0 text-sm text-muted-foreground">
              from {formatPrice(price.price_cents)} / {price.label}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
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
