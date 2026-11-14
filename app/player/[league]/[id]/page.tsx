import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PlayerView } from "@/components/player-view";
import { LEAGUE_BY_ID, type LeagueId } from "@/lib/leagues";
import { getPlayer } from "@/lib/player";

async function Player({ params }: { params: PageProps<"/player/[league]/[id]">["params"] }) {
  const { league, id } = await params;
  if (!(league in LEAGUE_BY_ID) || !/^\d+$/.test(id)) notFound();
  const player = await getPlayer(league as LeagueId, id);
  if (!player) notFound();
  return <PlayerView player={player} league={league as LeagueId} />;
}

export default function Page(props: PageProps<"/player/[league]/[id]">) {
  return (
    <Suspense fallback={<p className="note">Loading player…</p>}>
      <Player params={props.params} />
    </Suspense>
  );
}
