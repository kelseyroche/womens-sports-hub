"use client";

import { useState } from "react";
import type { Team } from "@/lib/espn";
import { GROUPS, GROUP_BY_ID, type GroupId } from "@/lib/leagues";
import { teamKey, useFollow } from "./follow";

function Crest({ team }: { team: Team }) {
  return (
    <span className="crest">
      {team.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logo} alt="" />
      ) : (
        team.abbreviation
      )}
    </span>
  );
}

export function FollowingView({ teams }: { teams: Record<GroupId, Team[]> }) {
  const { followed, toggle } = useFollow();
  const [tab, setTab] = useState<GroupId>("wnba");
  const count = followed.size;
  const sport = GROUP_BY_ID[tab].sport;

  return (
    <>
      <div className="head">
        <h1 className="cd" style={{ fontSize: "clamp(88px, 17vw, 170px)" }}>
          Your
          <br />
          teams
        </h1>
        <p className="summary">
          Pick the teams you care about. Their games are pinned above everything else on Tonight.
        </p>
      </div>
      <div className="follow-grid">
        <section>
          <div className="tabs" role="group" aria-label="League">
            {GROUPS.map((g) => {
              const n = teams[g.id].filter((t) => followed.has(teamKey(g.sport, t.id))).length;
              return (
                <button key={g.id} className="tab" aria-pressed={tab === g.id} onClick={() => setTab(g.id)}>
                  <span className="dot" style={{ background: g.hue }} />
                  {g.label}
                  {n > 0 && ` ${n}`}
                </button>
              );
            })}
          </div>
          {teams[tab].length === 0 && <p className="note">Teams for this league didn’t load. Refresh to try again.</p>}
          {teams[tab].map((t) => {
            const on = followed.has(teamKey(sport, t.id));
            return (
              <div className="trow" key={t.id}>
                <Crest team={t} />
                <span className="nm">{t.name}</span>
                <button className="fbtn" aria-pressed={on} onClick={() => toggle(teamKey(sport, t.id))}>
                  {on ? "Following" : "Follow team"}
                </button>
              </div>
            );
          })}
        </section>
        <section>
          <h2 className="cd label">Following</h2>
          <p className="note" style={{ margin: "8px 0" }}>
            {count === 1 ? "1 team followed" : `${count} teams followed`}. Followed teams stay above everything
            else on Tonight, even when they play late.
          </p>
          {GROUPS.flatMap((g) =>
            teams[g.id]
              .filter((t) => followed.has(teamKey(g.sport, t.id)))
              .map((t) => (
                <div className="trow" key={`${g.id}:${t.id}`}>
                  <Crest team={t} />
                  <span className="nm">{t.name}</span>
                </div>
              )),
          )}
        </section>
      </div>
    </>
  );
}
