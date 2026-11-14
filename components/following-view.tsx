"use client";

import { useState } from "react";
import type { Team } from "@/lib/espn";
import { GROUPS, GROUP_BY_ID, type GroupId } from "@/lib/leagues";
import Link from "next/link";
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

const PAGE_SIZE = 60;

export function FollowingView({ teams }: { teams: Record<GroupId, Team[]> }) {
  const { followed, toggle, syncAvailable, user } = useFollow();
  const [tab, setTab] = useState<GroupId>("wnba");
  const count = followed.size;
  const sport = GROUP_BY_ID[tab].sport;
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = teams[tab].filter((t) => t.name.toLowerCase().includes(q));
  const popular = q ? [] : matches.filter((t) => t.popular);
  const others = q ? matches : matches.filter((t) => !t.popular).slice(0, PAGE_SIZE);
  const hiddenCount = q ? 0 : matches.filter((t) => !t.popular).length - others.length;
  const popularLabel = tab === "ncaaw" || tab === "ncaav" ? "Top 25" : "Popular";

  const renderRow = (t: Team) => {
    const on = followed.has(teamKey(sport, t.id));
    return (
      <div className="trow" key={t.id}>
        <Link href={`/team/${t.leagueId}/${t.id}`} className="trow-link">
          <Crest team={t} />
          <span className="nm">
            {t.rank !== null && <span className="rank n">{t.rank}</span>}
            {t.name}
          </span>
        </Link>
        <button className="fbtn" aria-pressed={on} onClick={() => toggle(teamKey(sport, t.id))}>
          {on ? "Following" : "Follow team"}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="head">
        <h1 className="cd" style={{ fontSize: "clamp(88px, 17vw, 170px)" }}>
          Your
          <br />
          teams
        </h1>
        <p className="summary">
          Pick the teams you care about. Their games are pinned above everything else on the Today tab.
        </p>
      </div>
      <div className="follow-grid">
        <section>
          <div className="tabs" role="group" aria-label="League">
            {GROUPS.map((g) => {
              const n = teams[g.id].filter((t) => followed.has(teamKey(g.sport, t.id))).length;
              return (
                <button key={g.id} className="tab" aria-pressed={tab === g.id} onClick={() => {
                    setTab(g.id);
                    setQuery("");
                  }}>
                  <span className="dot" style={{ background: g.hue }} />
                  {g.label}
                  {n > 0 && ` ${n}`}
                </button>
              );
            })}
          </div>
          {teams[tab].length > PAGE_SIZE && (
            <input
              className="search"
              type="search"
              aria-label="Search teams"
              placeholder={`Search ${teams[tab].length} teams`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          {teams[tab].length === 0 && <p className="note">Teams for this league didn’t load. Refresh to try again.</p>}
          {popular.length > 0 && <h3 className="tl-group">{popularLabel}</h3>}
          {popular.map(renderRow)}
          {popular.length > 0 && others.length > 0 && <h3 className="tl-group">All teams</h3>}
          {others.map(renderRow)}
          {q && matches.length === 0 && <p className="note">No teams match “{query.trim()}”.</p>}
          {hiddenCount > 0 && (
            <p className="note" style={{ paddingTop: 12 }}>
              {hiddenCount} more teams. Search to find any team.
            </p>
          )}
        </section>
        <section>
          <h2 className="cd label">Following</h2>
          <p className="note" style={{ margin: "8px 0" }}>
            {count === 1 ? "1 team followed" : `${count} teams followed`}. Followed teams stay above everything
            else on the Today tab, even when they play late.
          </p>
          {GROUPS.flatMap((g) =>
            teams[g.id]
              .filter((t) => followed.has(teamKey(g.sport, t.id)))
              .map((t) => (
                <div className="trow" key={`${g.id}:${t.id}`}>
                  <Link href={`/team/${t.leagueId}/${t.id}`} className="trow-link">
                    <Crest team={t} />
                    <span className="nm">{t.name}</span>
                  </Link>
                </div>
              )),
          )}
          {syncAvailable && !user && (
            <p className="note" style={{ paddingTop: 16 }}>
              Your teams are saved on this device only. <Link href="/account">Sign in</Link> to keep them on every device.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
