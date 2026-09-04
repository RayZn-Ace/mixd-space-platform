import { createFileRoute } from "@tanstack/react-router";
import { SpaceTypePage } from "@/components/spaces/SpaceTypePage";

export const Route = createFileRoute("/coworking")({
  head: () => ({
    meta: [
      { title: "Coworking Garbsen — Flex desks by the hour or day | MIXD.SPACE" },
      {
        name: "description",
        content:
          "Flexible coworking desks in Garbsen-Berenbostel. Book a flex desk by the hour, day or month. Fast WiFi, coffee and parking included.",
      },
      { property: "og:title", content: "Coworking Garbsen — MIXD.SPACE" },
      {
        property: "og:description",
        content: "Flexible desks in Garbsen. Book by the hour, day or month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SpaceTypePage
      type="flex_desk"
      eyebrow="Coworking"
      title={
        <>
          WORK
          <br />
          when you want.
        </>
      }
      intro="An open desk in a quiet, well-designed workspace. Arrive, plug in, get on with it."
      points={[
        ["By the hour", "Pay for the time you actually use."],
        ["Everything included", "WiFi, coffee, water, parking."],
        ["No contract", "Book today, leave tomorrow."],
      ]}
    />
  ),
});
