"use client";

import Link from "next/link";
import type { Game, Side } from "@/lib/espn";
import { GROUP_BY_ID, LEAGUE_BY_ID, type GroupId } from "@/lib/leagues";
import { clockTime } from "@/lib/time";
import { teamKey, useFollow } from "./follow";

const INK = "#0C3B2E";
const CHALK = "#F8F3E9";

const ORNAMENTS: Record<GroupId, string> = {
  wnba: '<rect x="65" y="100" width="70" height="100"/><path d="M65 100a35 35 0 0 1 70 0"/><path d="M15 200v-50a85 85 0 0 1 170 0v50"/>',
  ncaaw: '<circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="24"/><path d="M100 0v200"/>',
  nwsl: '<rect x="20" y="40" width="160" height="170"/><rect x="62" y="40" width="76" height="52"/><path d="M68 150a44 44 0 0 0 64 0"/><circle cx="100" cy="132" r="2.5"/>',
  ncaav: '<rect x="15" y="40" width="170" height="130"/><path d="M100 40v130"/><path d="M45 40v130M155 40v130"/>',
  england: '<path d="M20 60a60 60 0 0 1 60 -60"/><rect x="20" y="60" width="110" height="140"/><rect x="20" y="100" width="44" height="60"/>',
  europe: '<circle cx="100" cy="100" r="44"/><path d="M0 100h200"/><circle cx="100" cy="100" r="2.5"/><path d="M60 0v30h80V0"/>',
  national: '<circle cx="100" cy="100" r="80"/><path d="M20 100h160"/><path d="M100 20c-42 32-42 128 0 160"/><path d="M100 20c42 32 42 128 0 160"/>',
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
  const group = GROUP_BY_ID[league.group];
  const live = game.state === "live";
  const final = game.state === "final";
  const upcoming = game.state === "upcoming";

  const background = live ? INK : final ? CHALK : group.hue;
  const color = live ? CHALK : INK;
  const borderColor = live ? INK : group.hue;
  const ornamentStroke = live || final ? group.hue : INK;
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
        dangerouslySetInnerHTML={{ __html: ORNAMENTS[group.id] }}
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
            <Link href={`/team/${game.league}/${side.id}`} className="team-link">
              <b>
                {side.rank && <span className="rank n">{side.rank}</span>}
                {side.name}
              </b>
            </Link>
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
          {!upcoming && (
            <Link className="lnk" href={`/game/${game.league}/${game.eventId}`} style={{ color }}>
              Game details
            </Link>
          )}
          {sides.map((side) => {
            const on = followed.has(teamKey(group.sport, side.id));
            return (
              <button
                key={side.id}
                className="lnk"
                aria-pressed={on}
                style={{ color }}
                onClick={() => toggle(teamKey(group.sport, side.id))}
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
