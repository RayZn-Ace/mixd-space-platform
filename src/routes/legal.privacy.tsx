import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { LegalNote, LegalSection } from "@/components/site/Legal";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — MIXD.SPACE" },
      {
        name: "description",
        content: "How MIXD.SPACE handles your data when you book a space or contact us.",
      },
      { property: "og:title", content: "Privacy — MIXD.SPACE" },
      { property: "og:description", content: "How MIXD.SPACE handles your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy."
        intro="What we store, why we store it, and how to get it removed."
      />
      <div className="container-mixd max-w-2xl pb-24">
        <LegalNote />
        <LegalSection title="What we store">
          Account details (name, email), bookings you make, payment status and messages you send us
          through the contact and request forms.
        </LegalSection>
        <LegalSection title="Why">
          To run your booking, give you access to the space, invoice correctly and answer your
          questions.
        </LegalSection>
        <LegalSection title="Who can see it">
          You, and the MIXD.SPACE team members who operate the location. Nothing is sold or shared
          for advertising.
        </LegalSection>
        <LegalSection title="Your rights">
          You can ask for a copy of your data, a correction or deletion at any time via the contact
          form. Full GDPR wording, retention periods and processor list will be added before launch.
        </LegalSection>
      </div>
    </SiteShell>
  );
}
