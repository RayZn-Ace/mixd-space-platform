import { createFileRoute } from "@tanstack/react-router";
import { SpaceTypePage } from "@/components/spaces/SpaceTypePage";

export const Route = createFileRoute("/meeting-rooms")({
  head: () => ({
    meta: [
      { title: "Meetingraum Garbsen — Meeting rooms by the hour | MIXD.SPACE" },
      {
        name: "description",
        content:
          "Book a meeting room in Garbsen-Berenbostel by the hour or day. Screen, whiteboard, video conferencing and catering on request.",
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
          where it matters.
        </>
      }
      intro="Rooms for conversations that need a room. Screen, whiteboard and coffee, ready when you arrive."
      audience="Companies · Workshops · Client meetings · Team sessions"
      points={[
        ["By the hour", "Book one hour or the whole day."],
        ["Equipped", "Screen, whiteboard, video conferencing."],
        ["Catering", "Add drinks and lunch at checkout."],
      ]}
    />
  ),
});
