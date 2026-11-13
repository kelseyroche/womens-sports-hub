"use client";

import Link from "next/link";
import type { Game } from "@/lib/espn";
import { LEAGUE_BY_ID, GROUP_BY_ID } from "@/lib/leagues";
import { teamKey, useFollow } from "./follow";
import { GameTile } from "./game-tile";

export function TonightView({ games, dateLabel }: { games: Game[]; dateLabel: string }) {
  const { ready, followed } = useFollow();
  const isPinned = (g: Game) => {
    const { sport } = GROUP_BY_ID[LEAGUE_BY_ID[g.league].group];
    return followed.has(teamKey(sport, g.home.id)) || followed.has(teamKey(sport, g.away.id));
  };
  const pinned = games.filter(isPinned);
  const rest = games.filter((g) => !isPinned(g));
  const liveCount = games.filter((g) => g.state === "live").length;
  const leagueCount = new Set(games.map((g) => g.league)).size;

  return (
    <>
      <div className="head">
        <div>
          <div className="cd date">{dateLabel}</div>
          <h1 className="cd">Tonight</h1>
        </div>
        <p className="summary">
          {games.length} {games.length === 1 ? "game" : "games"} across {leagueCount}{" "}
          {leagueCount === 1 ? "league" : "leagues"}.{" "}
          {liveCount > 0 && <span className="live-pill">{liveCount} live now</span>} All times Eastern.
        </p>
      </div>
      {ready && (
        <section className="section">
          <h2 className="cd label">Your teams</h2>
          {pinned.length > 0 ? (
            <div className="mosaic">
              {pinned.map((g) => (
                <GameTile key={g.id} game={g} size="big" />
              ))}
            </div>
          ) : (
            <div className="invite">
              <p>Follow a team and its games pin here, above everything else.</p>
              <Link className="btn" href="/following">
                Follow teams
              </Link>
            </div>
          )}
        </section>
      )}
      {rest.length > 0 && (
        <section className="section">
          <h2 className="cd label">Everything else tonight</h2>
          <div className="mosaic">
            {rest.map((g) => (
              <GameTile key={g.id} game={g} size={g.state === "live" ? "wide" : "small"} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
