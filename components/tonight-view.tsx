"use client";

import Link from "next/link";
import type { Game } from "@/lib/espn";
import { useFollow } from "./follow";
import { CompactRow, usePartition } from "./game-list";
import { GameTile } from "./game-tile";

export function TonightView({ games, dateLabel, title }: { games: Game[]; dateLabel: string; title: "Today" | "Tomorrow" }) {
  const when = title.toLowerCase();
  const { ready, followed } = useFollow();
  const { pinned, featured, more } = usePartition(games);
  const liveCount = games.filter((g) => g.state === "live").length;
  const leagueCount = new Set(games.map((g) => g.league)).size;

  return (
    <>
      <div className="head">
        <div>
          <div className="cd date">{dateLabel}</div>
          <h1 className="cd">{title}</h1>
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
          ) : followed.size > 0 ? (
            <div className="invite">
              <p>None of your teams play {when}. Their next games are on the Upcoming tab.</p>
              <Link className="btn ghost" href="/upcoming">
                See upcoming games
              </Link>
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
      {featured.length > 0 && (
        <section className="section">
          <h2 className="cd label">Everything else {when}</h2>
          <div className="mosaic">
            {featured.map((g) => (
              <GameTile key={g.id} game={g} size={g.state === "live" ? "wide" : "small"} />
            ))}
          </div>
        </section>
      )}
      {more.length > 0 && (
        <details className="more">
          <summary>All other college games ({more.length})</summary>
          {more.map((g) => (
            <CompactRow key={g.id} game={g} />
          ))}
        </details>
      )}
    </>
  );
}
