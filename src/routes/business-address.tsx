import { createFileRoute, Link } from "@tanstack/react-router";
import { Audience } from "@/components/site/XMark";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/business-address")({
  head: () => ({
    meta: [
      { title: "Business Address Garbsen — MIXD.SPACE" },
      {
        name: "description",
        content:
          "A professional business address in Garbsen with mail reception, notification and forwarding, plus workspace credits.",
      },
      { property: "og:title", content: "Business Address — MIXD.SPACE Garbsen" },
      {
        property: "og:description",
        content: "Business address with mail service and workspace credits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusinessAddressPage,
});

const SERVICES: [string, string][] = [
  ["Business address", "Use Erlenweg 18 as your business address."],
  ["Mail reception", "We receive your post at reception."],
  ["Mail notification", "A message whenever something arrives."],
  ["Mail forwarding", "Forwarded to you on a schedule you choose."],
  ["Workspace credits", "Included credits for desks and meeting rooms."],
];

function BusinessAddressPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Business Address"
        title={
          <>
            Your office.
            <br />
            Without the office.
          </>
        }
        intro="A professional address in Garbsen, with mail handled and workspace when you need it."
      >
        <Button asChild>
          <Link to="/register">Request the service</Link>
        </Button>
      </PageHeader>

      <Audience>Founders · Solo businesses · Consultants · Remote companies</Audience>

      <section className="container-mixd">
        <dl className="divide-y divide-border border-y border-border">
          {SERVICES.map(([t, d]) => (
            <div key={t} className="grid gap-2 py-8 md:grid-cols-[1fr_1.4fr]">
              <dt className="font-display text-xl tracking-tight">{t}</dt>
              <dd className="text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-xl text-xs text-muted-foreground">
          Exact terms, availability and pricing are confirmed individually before the service
          starts.
        </p>
      </section>
    </SiteShell>
  );
}
