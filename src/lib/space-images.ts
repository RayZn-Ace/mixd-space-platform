import flex from "@/assets/mixd-building-open-interior.jpg";
import office from "@/assets/mixd-building-glass-office.jpg";
import quietDeskAsset from "@/assets/mixd-space-quiet-desk.jpg.asset.json";
import meetingAsset from "@/assets/mixd-space-meeting-room.jpg.asset.json";
import teamAsset from "@/assets/mixd-space-team-office.jpg.asset.json";
import type { SpaceType } from "@/lib/mixd";

const quietDesk = quietDeskAsset.url;
const meeting = meetingAsset.url;
const team = teamAsset.url;

/** Per-code imagery so no two neighbouring spaces look identical. Editable per space later. */
const BY_CODE: Record<string, string> = {
  "DESK.01": quietDesk,
  "DESK.02": quietDesk,
  "DESK.03": flex,
  "DESK.04": quietDesk,
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
