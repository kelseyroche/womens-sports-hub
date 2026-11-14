"use client";

import type { Game } from "@/lib/espn";
import { useFollow } from "./follow";
import { CompactRow, usePartition } from "./game-list";

export type UpcomingDay = { day: string; label: string; dateLabel: string; games: Game[] };

function DaySection({ day }: { day: UpcomingDay }) {
  const { pinned, featured, more } = usePartition(day.games);
  const pinnedIds = new Set(pinned.map((g) => g.id));
  const lead = [...pinned, ...featured];
  return (
    <section className="section">
      <h2 className="cd label">
        {day.label === "Tomorrow" ? `Tomorrow, ${day.dateLabel.split(", ")[1]}` : day.dateLabel}
      </h2>
      {day.games.length === 0 && <p className="note">No games scheduled.</p>}
      {lead.map((g) => (
        <CompactRow key={g.id} game={g} pinned={pinnedIds.has(g.id)} />
      ))}
      {more.length > 0 && (
        <details className="more">
          <summary>All other college games ({more.length})</summary>
          {more.map((g) => (
            <CompactRow key={g.id} game={g} />
          ))}
        </details>
      )}
    </section>
  );
}

export function UpcomingView({ days }: { days: UpcomingDay[] }) {
  const { ready } = useFollow();
  const total = days.reduce((n, d) => n + d.games.length, 0);
  return (
    <>
      <div className="head">
        <h1 className="cd" style={{ fontSize: "clamp(88px, 17vw, 170px)" }}>
          Upcoming
        </h1>
        <p className="summary">
          {total} games over the next 7 days. {ready ? "Games with your teams come first each day." : ""} All times
          Eastern.
        </p>
      </div>
      {days.map((d) => (
        <DaySection key={d.day} day={d} />
      ))}
    </>
  );
}
