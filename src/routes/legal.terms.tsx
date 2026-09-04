import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { LegalNote, LegalSection } from "@/components/site/Legal";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Booking conditions — MIXD.SPACE" },
      {
        name: "description",
        content:
          "Booking conditions for desks, offices and meeting rooms at MIXD.SPACE Garbsen: access, cancellation, house rules.",
      },
      { property: "og:title", content: "Booking conditions — MIXD.SPACE" },
      { property: "og:description", content: "Access, cancellation and house rules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Legal"
        title="Booking conditions."
        intro="The short version of how booking, access and cancellation work."
      />
      <div className="container-mixd max-w-2xl pb-24">
        <LegalNote />
        <LegalSection title="Booking">
          A booking covers one space for the time you selected. Prices shown during pre-launch are
          example rates and are confirmed by us before anything is charged.
        </LegalSection>
        <LegalSection title="Requests">
          While booking runs in request mode, a request is a reservation intent. It becomes binding
          only once we confirm availability and price by email.
        </LegalSection>
        <LegalSection title="Access">
          Access is valid shortly before your booking starts until shortly after it ends. Access is
          personal and not transferable.
        </LegalSection>
        <LegalSection title="Cancellation">
          Cancellation windows per space type will be added before launch. Until then, cancel by
          replying to your confirmation email.
        </LegalSection>
        <LegalSection title="House rules">
          Keep calls out of quiet zones, leave the space as you found it, and respect the other
          people working here. Different people, different work, one space.
        </LegalSection>
      </div>
    </SiteShell>
  );
}
