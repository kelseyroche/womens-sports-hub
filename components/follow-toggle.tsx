"use client";

import { teamKey, useFollow } from "./follow";

export function FollowToggle({ sport, teamId }: { sport: string; teamId: string }) {
  const { followed, toggle, ready } = useFollow();
  if (!ready) return null;
  const on = followed.has(teamKey(sport, teamId));
  return (
    <button className="fbtn team-follow" aria-pressed={on} onClick={() => toggle(teamKey(sport, teamId))}>
      {on ? "Following" : "Follow team"}
    </button>
  );
}
