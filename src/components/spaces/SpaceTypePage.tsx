import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SiteShell, PageHeader, EmptyState } from "@/components/site/SiteShell";
import { SpaceCard, SpaceCardSkeleton } from "@/components/spaces/SpaceCard";
import { Button } from "@/components/ui/button";
import { spacesQuery } from "@/lib/queries";
import { XMark } from "@/components/site/XMark";
import type { SpaceType } from "@/lib/mixd";

export function SpaceTypePage({
  type,
  eyebrow,
  title,
  intro,
  points,
  audience,
}: {
  type: SpaceType;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  points: [string, string][];
  audience: string;
}) {
  const { data, isLoading } = useQuery(spacesQuery({ type }));

  return (
    <SiteShell>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro}>
        <Button asChild>
          <Link to="/spaces" search={{ type }}>
            Verfügbarkeit pruefen
          </Link>
        </Button>
      </PageHeader>

      <section className="container-mixd">
        <div className="flex items-start gap-3 border-t border-border pt-8">
          <XMark className="mt-1 size-3 shrink-0 text-accent" />
          <p className="max-w-2xl text-sm uppercase tracking-[0.14em] text-muted-foreground">
            {audience}
          </p>
        </div>
        <dl className="mt-8 grid gap-x-12 gap-y-10 border-y border-border py-12 sm:grid-cols-3">
          {points.map(([t, d]) => (
            <div key={t}>
              <dt className="font-display text-base tracking-tight">{t}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-mixd mt-16 pb-24">
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SpaceCardSkeleton key={i} />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            title="Nothing listed here yet."
            description="Diese Spaces werden vorbereitet. Frag uns gern, was als Nächstes kommt."
            action={
              <Button asChild variant="outline">
                <Link to="/spaces">Alle Spaces ansehen</Link>
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
