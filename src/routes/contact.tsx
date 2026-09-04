import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { LeadDialog } from "@/components/site/LeadDialog";
import { Button } from "@/components/ui/button";
import { XMark, XDivider } from "@/components/site/XMark";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact MIXD.SPACE Garbsen — work. meet. create." },
      {
        name: "description",
        content:
          "Talk to the MIXD.SPACE team in Garbsen: desks, offices, meeting rooms, team setups and business address enquiries.",
      },
      { property: "og:title", content: "Contact MIXD.SPACE" },
      {
        property: "og:description",
        content: "Questions about a space, a date or a longer stay? Talk to us.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const TOPICS = [
  {
    kind: "early_access" as const,
    title: "Get early access.",
    line: "Be first when booking opens in Garbsen.",
  },
  {
    kind: "team_setup" as const,
    title: "Request a team setup.",
    line: "Offices, desks and budgets for your team.",
  },
  {
    kind: "business_address" as const,
    title: "Business address.",
    line: "Register your interest in a Garbsen address.",
  },
  {
    kind: "contact" as const,
    title: "Something else.",
    line: "Ask us anything about the space.",
  },
];

function Contact() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us."
        intro="We're a local team in Garbsen-Berenbostel. Write to us and you get a person, not a ticket."
      >
        <LeadDialog kind="contact" />
      </PageHeader>

      <section className="container-mixd">
        <XDivider />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <div
              key={t.kind}
              className="flex flex-col justify-between gap-6 rounded-[1.5rem] border border-border bg-card p-7"
            >
              <div>
                <XMark className="size-3 text-accent" />
                <p className="mt-5 font-display text-2xl tracking-tight">{t.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.line}</p>
              </div>
              <LeadDialog
                kind={t.kind}
                trigger={
                  <Button variant="outline" className="w-full sm:w-auto">
                    Write to us
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="container-mixd mt-20 grid gap-10 border-t border-border pt-12 sm:grid-cols-2 lg:mt-28">
        <div>
          <p className="eyebrow">Where we are</p>
          <address className="mt-4 text-lg not-italic leading-relaxed">
            MIXD.SPACE Garbsen
            <br />
            Erlenweg 18
            <br />
            30827 Garbsen-Berenbostel
          </address>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Erlenweg%2018%2030827%20Garbsen"
                target="_blank"
                rel="noreferrer"
              >
                Get directions
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/locations/$slug" params={{ slug: "garbsen" }}>
                Location details
              </Link>
            </Button>
          </div>
        </div>
        <div>
          <p className="eyebrow">Good to know</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>Parking directly at the building.</li>
            <li>Opening hours and access hours are listed on the location page.</li>
            <li>
              Phone and email are published before launch — until then this form reaches us fastest.
            </li>
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
