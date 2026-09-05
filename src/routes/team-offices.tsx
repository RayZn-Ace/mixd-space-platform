import { createFileRoute } from "@tanstack/react-router";
import { SpaceTypePage } from "@/components/spaces/SpaceTypePage";

export const Route = createFileRoute("/team-offices")({
  head: () => ({
    meta: [
      { title: "Team Office Garbsen — Büro flexibel mieten | MIXD.SPACE" },
      {
        name: "description",
        content:
          "Team Offices in Garbsen-Berenbostel für Projektteams, Startups und Unternehmen. Flexibel für Tage, Wochen oder Monate anfragen.",
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
          mit deinem Team.
        </>
      }
      intro="Raum für ein ganzes Team, einen Projekt-Sprint oder mehrere Wochen Zusammenarbeit - ohne klassischen Mietvertrag."
      audience="Startups · Projektteams · Corporate Teams · temporäre Projektbüros"
      points={[
        ["Teamgröße", "Platz für mehrere Personen, je nach Raum und Setup."],
        ["Projektbereit", "Ausgelegt auf Zusammenarbeit, Fokus und Workshops."],
        ["Skalierbar", "Hoch oder runter, wenn sich dein Team verändert."],
      ]}
    />
  ),
});
