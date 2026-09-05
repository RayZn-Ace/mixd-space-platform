import { createFileRoute } from "@tanstack/react-router";
import { SpaceTypePage } from "@/components/spaces/SpaceTypePage";

export const Route = createFileRoute("/meeting-rooms")({
  head: () => ({
    meta: [
      { title: "Meetingraum Garbsen — Meeting rooms by the hour | MIXD.SPACE" },
      {
        name: "description",
        content:
          "Meeting Room in Garbsen-Berenbostel anfragen: für Kundentermine, Workshops, Team-Sessions und hybride Meetings.",
      },
      { property: "og:title", content: "Meeting rooms in Garbsen — MIXD.SPACE" },
      {
        property: "og:description",
        content: "Meeting spaces for two people or entire teams, bookable by the hour.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SpaceTypePage
      type="meeting_room"
      eyebrow="Meeting Rooms"
      title={
        <>
          MEET
          <br />
          wenn der Raum zählt.
        </>
      }
      intro="Räume für Gespräche, die nicht zwischen Tür und Angel stattfinden sollten. Screen, Whiteboard und Kaffee stehen bereit."
      audience="Unternehmen · Workshops · Kundentermine · Team-Sessions"
      points={[
        ["Stundenweise", "Eine Stunde, halber Tag oder ganzer Workshop-Tag."],
        ["Ausgestattet", "Screen, Whiteboard und Video-Setup je nach Raum."],
        ["Extras", "Getränke, Kaffee oder Catering mit anfragen."],
      ]}
    />
  ),
});
