import { createFileRoute } from "@tanstack/react-router";
import { SpaceTypePage } from "@/components/spaces/SpaceTypePage";

export const Route = createFileRoute("/team-offices")({
  head: () => ({
    meta: [
      { title: "Team Office Garbsen — Büro flexibel mieten | MIXD.SPACE" },
      {
        name: "description",
        content:
          "Team offices in Garbsen-Berenbostel for whole teams, projects and workshops. Bookable by the day or month.",
      },
      { property: "og:title", content: "Team offices in Garbsen — MIXD.SPACE" },
      {
        property: "og:description",
        content: "Rooms for whole teams, projects and workshops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SpaceTypePage
      type="team_office"
      eyebrow="Team Offices"
      title={
        <>
          CREATE
          <br />
          without limits.
        </>
      }
      intro="Room for a whole team, a project sprint or a workshop week — without signing a lease."
      points={[
        ["Team-sized", "Space for four to twelve people."],
        ["Project-ready", "Set up for focused work and workshops."],
        ["Monthly rates", "Scale up or down as the team changes."],
      ]}
    />
  ),
});
