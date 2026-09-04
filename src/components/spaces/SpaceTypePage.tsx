import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SiteShell, PageHeader, EmptyState } from "@/components/site/SiteShell";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { Button } from "@/components/ui/button";
import { spacesQuery } from "@/lib/queries";
import type { SpaceType } from "@/lib/mixd";

export function SpaceTypePage({
  type,
  eyebrow,
  title,
  intro,
  points,
}: {
  type: SpaceType;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  points: [string, string][];
}) {
  const { data, isLoading } = useQuery(spacesQuery({ type }));

  return (
    <SiteShell>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro}>
        <Button asChild>
          <Link to="/spaces" search={{ type }}>
            Check availability
          </Link>
        </Button>
      </PageHeader>

      <section className="container-mixd">
        <dl className="grid gap-x-12 gap-y-10 border-y border-border py-12 sm:grid-cols-3">
          {points.map(([t, d]) => (
            <div key={t}>
              <dt className="font-display text-base tracking-tight">{t}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-mixd mt-16">
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SpaceCardSkeleton key={i} />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            title="Nothing listed here yet."
            description="These spaces are being prepared. Ask us what's coming."
            action={
              <Button asChild variant="outline">
                <Link to="/spaces">Browse all spaces</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((s) => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
