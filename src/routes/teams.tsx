import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import teamImage from "@/assets/space-team.jpg";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "MIXD for Teams — Corporate workspace accounts" },
      {
        name: "description",
        content:
          "Give employees access to professional workspaces without maintaining another office. Central billing, budgets and usage reporting.",
      },
      { property: "og:title", content: "MIXD for Teams" },
      {
        property: "og:description",
        content: "Corporate workspace accounts with central billing and budgets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamsPage,
});

const FEATURES: [string, string][] = [
  ["Central billing", "One monthly invoice for every booking your team makes."],
  ["Budgets and limits", "Set a monthly budget per employee or per company."],
  ["Self-service booking", "Employees book their own space; it lands on the company account."],
  ["Usage reporting", "See spend, bookings and utilisation per month."],
  ["Employee management", "Invite and remove people at any time."],
  ["Memberships", "Attach a company membership for member rates."],
];

function TeamsPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="MIXD for Teams"
        title="Workspace for your entire team."
        intro="Give employees access to professional workspaces without maintaining another office."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/register">Create a company account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/spaces">See the spaces</Link>
          </Button>
        </div>
      </PageHeader>

      <section className="container-mixd">
        <div className="media-zoom aspect-[16/9] bg-muted sm:aspect-[16/7]">
          <img
            src={teamImage}
            alt="A team office at MIXD.SPACE"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="container-mixd mt-20">
        <dl className="grid gap-x-12 gap-y-12 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([t, d]) => (
            <div key={t}>
              <dt className="font-display text-base tracking-tight">{t}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </SiteShell>
  );
}
