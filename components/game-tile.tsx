"use client";

import type { Game, Side } from "@/lib/espn";
import { LEAGUE_BY_ID, type LeagueId } from "@/lib/leagues";
import { clockTime } from "@/lib/time";
import { teamKey, useFollow } from "./follow";

const INK = "#0C3B2E";
const CHALK = "#F8F3E9";

const ORNAMENTS: Record<LeagueId, string> = {
  wnba: '<rect x="65" y="100" width="70" height="100"/><path d="M65 100a35 35 0 0 1 70 0"/><path d="M15 200v-50a85 85 0 0 1 170 0v50"/>',
  ncaaw: '<circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="24"/><path d="M100 0v200"/>',
  nwsl: '<rect x="20" y="40" width="160" height="170"/><rect x="62" y="40" width="76" height="52"/><path d="M68 150a44 44 0 0 0 64 0"/><circle cx="100" cy="132" r="2.5"/>',
  wsl: '<path d="M20 60a60 60 0 0 1 60 -60"/><rect x="20" y="60" width="110" height="140"/><rect x="20" y="100" width="44" height="60"/>',
};

export type TileSize = "big" | "wide" | "small";

function Crest({ side }: { side: Side }) {
  return (
    <span className="crest">
      {side.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={side.logo} alt="" />
      ) : (
        side.abbreviation
      )}
    </span>
  );
}

export function GameTile({ game, size }: { game: Game; size: TileSize }) {
  const { followed, toggle } = useFollow();
  const league = LEAGUE_BY_ID[game.league];
  const live = game.state === "live";
  const final = game.state === "final";
  const upcoming = game.state === "upcoming";

  const background = live ? INK : final ? CHALK : league.hue;
  const color = live ? CHALK : INK;
  const borderColor = live ? INK : league.hue;
  const ornamentStroke = live || final ? league.hue : INK;
  const ornamentOpacity = live ? 0.95 : final ? 0.5 : 0.32;

  const sides = [game.away, game.home];
  const scores = sides.map((s) => s.score ?? 0);
  const { tm, ap } = clockTime(game.startsAt);

  return (
    <article className={`tile s-${size}`} style={{ background, color, borderColor }}>
      <svg
        className="orn"
        aria-hidden="true"
        viewBox="0 0 200 200"
        style={{ stroke: ornamentStroke, opacity: ornamentOpacity }}
        dangerouslySetInnerHTML={{ __html: ORNAMENTS[game.league] }}
      />
      <div className="t-top">
        <span>{league.name}</span>
        {live ? (
          <span className="status live n">
            <i />
            {game.statusText}
          </span>
        ) : (
          <span className="status n" style={{ borderColor: color }}>
            {final ? "Final" : "Upcoming"}
          </span>
        )}
      </div>
      <div className="t-body">
        {sides.map((side, i) => (
          <div className="team" key={side.id} style={{ gridRow: i + 1 }}>
            <Crest side={side} />
            <b>{side.name}</b>
          </div>
        ))}
        {upcoming ? (
          <div className="ko cd n">
            {tm}
            <small>{ap}</small>
          </div>
        ) : (
          sides.map((side, i) => (
            <div
              key={side.id}
              className="score cd n"
              style={{ gridRow: i + 1, opacity: scores[i] >= Math.max(...scores) ? 1 : 0.55 }}
            >
              {side.score ?? "–"}
            </div>
          ))
        )}
      </div>
      <div className="t-foot">
        <span>
          {tm} {ap}
          {game.venue ? ` · ${game.venue}` : ""}
        </span>
        <span className="acts">
          {sides.map((side) => {
            const on = followed.has(teamKey(game.league, side.id));
            return (
              <button
                key={side.id}
                className="lnk"
                aria-pressed={on}
                style={{ color }}
                onClick={() => toggle(teamKey(game.league, side.id))}
              >
                {on ? "Following" : "Follow"} {side.abbreviation}
              </button>
            );
          })}
        </span>
      </div>
    </article>
  );
}
