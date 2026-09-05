import { createFileRoute } from "@tanstack/react-router";
import { SpaceTypePage } from "@/components/spaces/SpaceTypePage";

export const Route = createFileRoute("/private-offices")({
  head: () => ({
    meta: [
      { title: "Private Office Garbsen — Tagesbüro flexibel mieten | MIXD.SPACE" },
      {
        name: "description",
        content:
          "Private offices in Garbsen-Berenbostel. A closed office with a door that shuts, bookable by the day or month.",
      },
      { property: "og:title", content: "Private Office Garbsen — MIXD.SPACE" },
      {
        property: "og:description",
        content: "A closed, furnished office in Garbsen. By the day or the month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SpaceTypePage
      type="private_office"
      eyebrow="Private Offices"
      title={
        <>
          Dein Raum
          <br />
          mit Tür.
        </>
      }
      intro="Ein möbliertes, geschlossenes Office für Fokus, vertrauliche Calls, Interviews oder Arbeit, die nicht in den offenen Bereich gehoert."
      audience="Founder · Professionals · vertrauliche Calls · Projektarbeit"
      points={[
        ["Möbliert", "Desk, Stuhl, Monitor und Licht sind bereit."],
        ["Privat", "Tür zu, Fokus an."],
        ["Flexibel", "Tag, Woche oder Monat statt langer Mietbindung."],
      ]}
    />
  ),
});
