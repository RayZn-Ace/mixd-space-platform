import { createFileRoute } from "@tanstack/react-router";
import { SpaceTypePage } from "@/components/spaces/SpaceTypePage";

export const Route = createFileRoute("/coworking")({
  head: () => ({
    meta: [
      { title: "Coworking Garbsen — Flex desks by the hour or day | MIXD.SPACE" },
      {
        name: "description",
        content:
          "Flexible Desks in Garbsen-Berenbostel für Studierende, Remote Worker, Freelancer und Professionals. Stundenweise, tageweise oder regelmäßig anfragen.",
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
          wann es für dich passt.
        </>
      }
      intro="Ein ruhiger, gut gestalteter Desk für Fokus, Lernen, Remote Work oder den produktiven Tag zwischen Terminen."
      audience="Studierende · Remote Worker · Freelancer · Consultants zwischen Terminen"
      points={[
        ["Flexibel", "Stundenweise, tageweise oder regelmäßig nutzbar."],
        ["Alles da", "WiFi, Kaffee, Wasser und Parken vor Ort."],
        ["Kein Vertrag", "Heute anfragen, morgen arbeiten."],
      ]}
    />
  ),
});
