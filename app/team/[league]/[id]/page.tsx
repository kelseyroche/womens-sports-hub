import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TeamView } from "@/components/team-view";
import { LEAGUE_BY_ID, type LeagueId } from "@/lib/leagues";
import { getTeam } from "@/lib/team";

async function Team({ params }: { params: PageProps<"/team/[league]/[id]">["params"] }) {
  const { league, id } = await params;
  if (!(league in LEAGUE_BY_ID) || !/^\d+$/.test(id)) notFound();
  const team = await getTeam(league as LeagueId, id);
  if (!team) notFound();
  return <TeamView team={team} league={league as LeagueId} />;
}

export default function Page(props: PageProps<"/team/[league]/[id]">) {
  return (
    <Suspense fallback={<p className="note">Loading team…</p>}>
      <Team params={props.params} />
    </Suspense>
  );
}
