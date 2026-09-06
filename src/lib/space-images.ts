import flex from "@/assets/mixd-building-open-interior.jpg";
import office from "@/assets/mixd-building-glass-office.jpg";
import meeting from "@/assets/mixd-building-open-interior.jpg";
import team from "@/assets/mixd-building-open-interior.jpg";
import type { SpaceType } from "@/lib/mixd";

/** Per-code imagery so no two neighbouring spaces look identical. Editable per space later. */
const BY_CODE: Record<string, string> = {
  "DESK.02": flex,
  "DESK.03": flex,
  "DESK.04": flex,
  "DESK.05": flex,
  "OFFICE.03": office,
  "OFFICE.04": office,
  "TEAM.02": team,
  "MEET.02": meeting,
  "CREATE.01": team,
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
      return team;
    case "team_office":
      return team;
    default:
      return flex;
  }
}
