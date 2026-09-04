import flex from "@/assets/space-flex.jpg";
import office from "@/assets/space-office.jpg";
import meeting from "@/assets/space-meeting.jpg";
import team from "@/assets/space-team.jpg";
import type { SpaceType } from "@/lib/mixd";

/** Fallback imagery per space type until real photography is uploaded per space. */
export function spaceImage(type: SpaceType) {
  switch (type) {
    case "private_office":
      return office;
    case "meeting_room":
    case "workshop_space":
      return meeting;
    case "team_office":
      return team;
    default:
      return flex;
  }
}
