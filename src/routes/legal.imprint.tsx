import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { LegalNote, LegalSection } from "@/components/site/Legal";

export const Route = createFileRoute("/legal/imprint")({
  head: () => ({
    meta: [
      { title: "Imprint — MIXD.SPACE Garbsen" },
      {
        name: "description",
        content:
          "Imprint and legal information for MIXD.SPACE in Garbsen-Berenbostel, Erlenweg 18.",
      },
      { property: "og:title", content: "Imprint — MIXD.SPACE" },
      { property: "og:description", content: "Legal information for MIXD.SPACE Garbsen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Imprint,
});

function Imprint() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Legal" title="Imprint." intro="Who runs MIXD.SPACE and how to reach us." />
      <div className="container-mixd max-w-2xl pb-24">
        <LegalNote />
        <LegalSection title="Address">
          MIXD.SPACE Garbsen
          <br />
          Erlenweg 18
          <br />
          30827 Garbsen-Berenbostel
          <br />
          Deutschland
        </LegalSection>
        <LegalSection title="Contact">
          Email and phone are published here before launch. Until then, use the contact form on{" "}
          <a className="link-underline" href="/contact">
            /contact
          </a>
          .
        </LegalSection>
        <LegalSection title="Company details">
          Legal entity, represented by, commercial register, register number and VAT ID will be
          added here before launch.
        </LegalSection>
        <LegalSection title="Responsible for content">
          To be added before launch.
        </LegalSection>
      </div>
    </SiteShell>
  );
}
