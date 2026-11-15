"use client";

import Link from "next/link";
import type { Team } from "@/lib/espn";
import { GROUPS, type GroupId } from "@/lib/leagues";
import { AccountPanel } from "./account-panel";
import { teamKey, useFollow } from "./follow";

export function AccountView({ teams }: { teams: Record<GroupId, Team[]> }) {
  const { followed, user, syncAvailable } = useFollow();
  const count = followed.size;
  const followedTeams = GROUPS.flatMap((g) =>
    teams[g.id].filter((t) => followed.has(teamKey(g.sport, t.id))).map((t) => ({ group: g.id, team: t })),
  );
  return (
    <>
      <div className="head">
        <h1 className="cd" style={{ fontSize: "clamp(88px, 17vw, 170px)" }}>
          Account
        </h1>
        <p className="summary">
          {syncAvailable
            ? "Sign in to keep your teams on every device. You don't need an account to use Rally."
            : "You don't need an account to use Rally."}
        </p>
      </div>
      <div className="account-page">
        <AccountPanel showUnavailable />
        <section className="account">
          <h2 className="cd label">Your teams</h2>
          <p className="note">
            {count === 0
              ? "You aren't following any teams yet."
              : `${count} ${count === 1 ? "team" : "teams"} followed${user ? ", synced to your account" : ", saved on this device"}.`}{" "}
            <Link href="/following">{count === 0 ? "Pick teams" : "Change teams"}</Link>
          </p>
          {followedTeams.map(({ group, team }) => (
            <Link key={`${group}:${team.id}`} href={`/team/${team.leagueId}/${team.id}`} className="trow trow-link account-team">
              <span className="crest">
                {team.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.logo} alt="" />
                ) : (
                  team.abbreviation
                )}
              </span>
              <span className="nm">{team.name}</span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
