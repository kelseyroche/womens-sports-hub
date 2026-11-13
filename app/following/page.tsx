import { FollowingView } from "@/components/following-view";
import { getTeams } from "@/lib/espn";
import { LEAGUES, type LeagueId } from "@/lib/leagues";

export const metadata = { title: "Your teams · Rally" };

export default async function Page() {
  const lists = await Promise.all(LEAGUES.map((l) => getTeams(l.id)));
  const teams = Object.fromEntries(LEAGUES.map((l, i) => [l.id, lists[i]])) as Record<LeagueId, Awaited<ReturnType<typeof getTeams>>>;
  return <FollowingView teams={teams} />;
}
