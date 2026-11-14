import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GameDetailView } from "@/components/game-detail-view";
import { getGameDetail } from "@/lib/game-detail";
import { LEAGUE_BY_ID, type LeagueId } from "@/lib/leagues";

async function Game({ params }: { params: PageProps<"/game/[league]/[id]">["params"] }) {
  const { league, id } = await params;
  if (!(league in LEAGUE_BY_ID) || !/^\d+$/.test(id)) notFound();
  const detail = await getGameDetail(league as LeagueId, id);
  if (!detail) notFound();
  return <GameDetailView detail={detail} />;
}

export default function Page(props: PageProps<"/game/[league]/[id]">) {
  return (
    <Suspense fallback={<p className="note">Loading game…</p>}>
      <Game params={props.params} />
    </Suspense>
  );
}
