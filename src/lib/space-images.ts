import flex from "@/assets/mixd-building-open-interior.jpg";
import office from "@/assets/mixd-building-glass-office.jpg";
import meeting from "@/assets/mixd-building-open-interior.jpg";
import team from "@/assets/mixd-building-open-interior.jpg";
import study from "@/assets/space-study.jpg";
import booth from "@/assets/space-booth.jpg";
import workshop from "@/assets/space-workshop.jpg";
import huddle from "@/assets/space-huddle.jpg";
import coffee from "@/assets/space-coffee.jpg";
import type { SpaceType } from "@/lib/mixd";

/** Per-code imagery so no two neighbouring spaces look identical. Editable per space later. */
const BY_CODE: Record<string, string> = {
  "DESK.02": study,
  "DESK.03": coffee,
  "DESK.04": study,
  "DESK.05": flex,
  "OFFICE.03": booth,
  "OFFICE.04": office,
  "TEAM.02": workshop,
  "MEET.02": huddle,
  "CREATE.01": workshop,
};

/** Fallback imagery per space type until real photography is uploaded per space. */
export function spaceImage(type: SpaceType, code?: string | null) {
  if (code && BY_CODE[code]) return BY_CODE[code];
  switch (type) {
    case "private_office":
      return office;
    case "meeting_room":
      return meeting;
    case "workshop_space":
      return workshop;
    case "team_office":
      return team;
    default:
      return flex;
  }
}
