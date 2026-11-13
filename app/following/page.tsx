import { FollowingView } from "@/components/following-view";
import { getGroupTeams, type Team } from "@/lib/espn";
import { GROUPS, type GroupId } from "@/lib/leagues";

export const metadata = { title: "Your teams · Rally" };

export default async function Page() {
  const lists = await Promise.all(GROUPS.map((g) => getGroupTeams(g.id)));
  const teams = Object.fromEntries(GROUPS.map((g, i) => [g.id, lists[i]])) as Record<GroupId, Team[]>;
  return <FollowingView teams={teams} />;
}
