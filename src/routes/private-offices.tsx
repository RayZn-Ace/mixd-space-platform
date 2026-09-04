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
          A door
          <br />
          that shuts.
        </>
      }
      intro="A furnished, closed office for focused work or confidential calls. Yours for a day or a year."
      audience="Founders · Professionals · Confidential calls · Project work"
      points={[
        ["Fully furnished", "Desk, chair, monitor, light."],
        ["Private", "Closed door, no open-plan noise."],
        ["Flexible term", "Day, week or month rates."],
      ]}
    />
  ),
});
