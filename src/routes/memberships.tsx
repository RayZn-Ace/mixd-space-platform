import { createFileRoute, Link } from "@tanstack/react-router";
import { Audience } from "@/components/site/XMark";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, PageHeader, EmptyState } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { membershipsQuery } from "@/lib/queries";
import { formatPrice, SPACE_TYPE_LABEL } from "@/lib/mixd";

export const Route = createFileRoute("/memberships")({
  head: () => ({
    meta: [
      { title: "Memberships — MIXD.SPACE Garbsen" },
      {
        name: "description",
        content:
          "MIXD.FLEX, MIXD.UNLIMITED and MIXD.BUSINESS. Monthly memberships with workspace days, member rates and business address services.",
      },
      { property: "og:title", content: "Memberships — MIXD.SPACE" },
      { property: "og:description", content: "Monthly workspace memberships in Garbsen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MembershipsPage,
});

function MembershipsPage() {
  const { data, isLoading } = useQuery(membershipsQuery);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Memberships"
        title="Work here regularly."
        intro="Monthly plans for people and teams who keep coming back. Prices are indicative while the location opens."
      />

      <Audience>Regulars · Students · Freelancers · Remote workers · Small teams</Audience>

      <section className="container-mixd">
        {isLoading && <div className="h-64 w-full animate-pulse bg-muted" />}
        {!isLoading && (data ?? []).length === 0 && (
          <EmptyState title="No plans published yet." description="Memberships are being finalised." />
        )}
        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {(data ?? []).map((m) => (
            <div key={m.id} className="flex flex-col bg-background p-8 lg:p-10">
              <p className="font-display text-xl tracking-tight">{m.name}</p>
              <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>
              <p className="mt-10 font-display text-4xl tracking-tight">
                {formatPrice(m.monthly_price_cents)}
                <span className="text-sm text-muted-foreground"> / month</span>
              </p>
              <ul className="mt-8 flex-1 space-y-3 border-t border-border pt-6 text-sm">
                {((m.highlights ?? []) as string[]).map((h) => (
                  <li key={h}>{h}</li>
                ))}
                {m.allowed_space_types.length > 0 && (
                  <li className="text-muted-foreground">
                    {m.allowed_space_types.map((t) => SPACE_TYPE_LABEL[t]).join(" · ")}
                  </li>
                )}
              </ul>
              <Button asChild className="mt-8">
                <Link to="/register">Get {m.name}</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Indicative pricing. Plans, credits and rules are managed in MIXD.OS and can change before
          opening.
        </p>
      </section>
    </SiteShell>
  );
}
