"use client";

import Link from "next/link";
import type { Game } from "@/lib/espn";
import { GROUP_BY_ID, LEAGUE_BY_ID } from "@/lib/leagues";
import { clockTime } from "@/lib/time";
import { teamKey, useFollow } from "./follow";

export function usePartition(games: Game[]) {
  const { followed } = useFollow();
  const groupOf = (g: Game) => GROUP_BY_ID[LEAGUE_BY_ID[g.league].group];
  const isPinned = (g: Game) => {
    const { sport } = groupOf(g);
    return followed.has(teamKey(sport, g.home.id)) || followed.has(teamKey(sport, g.away.id));
  };
  const isFeatured = (g: Game) => !groupOf(g).crowded || g.home.rank !== null || g.away.rank !== null;
  const unpinned = games.filter((g) => !isPinned(g));
  return {
    pinned: games.filter(isPinned),
    featured: unpinned.filter(isFeatured),
    more: unpinned.filter((g) => !isFeatured(g)),
  };
}

export function CompactRow({ game, pinned = false }: { game: Game; pinned?: boolean }) {
  const { tm, ap } = clockTime(game.startsAt);
  const hue = GROUP_BY_ID[LEAGUE_BY_ID[game.league].group].hue;
  const score = game.state === "upcoming" ? "" : `${game.away.score ?? 0}–${game.home.score ?? 0}`;
  const right = game.state === "live" ? `${score} · ${game.statusText}` : score;
  const style = { borderLeft: `6px solid ${hue}` };
  const content = (
    <>
      <span className="n">
        {tm} {ap}
      </span>
      <span className="who">
        <span>
          {game.away.name} at {game.home.name}
        </span>
        <span className="lg">
          {LEAGUE_BY_ID[game.league].name}
          {pinned ? " · Your team" : ""}
        </span>
      </span>
      <span className="sc n">{right}</span>
    </>
  );
  if (game.state === "upcoming") {
    return (
      <div className="more-row" style={style}>
        {content}
      </div>
    );
  }
  return (
    <Link className="more-row" style={style} href={`/game/${game.league}/${game.eventId}`}>
      {content}
    </Link>
  );
}
