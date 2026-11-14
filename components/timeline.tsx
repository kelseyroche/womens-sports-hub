"use client";

import { useState } from "react";
import type { TimelineItem } from "@/lib/game-detail";

const PREVIEW = 5;

function EventMark({ kind }: { kind: TimelineItem["kind"] }) {
  if (kind === "goal" || kind === "score") return <span className="ev-mark ev-goal" aria-hidden="true" />;
  if (kind === "yellow") return <span className="ev-mark ev-card" style={{ background: "#F5E50A" }} aria-hidden="true" />;
  if (kind === "red") return <span className="ev-mark ev-card" style={{ background: "#E0362C" }} aria-hidden="true" />;
  if (kind === "sub") return <span className="ev-mark ev-sub" aria-hidden="true" />;
  return <span className="ev-mark ev-tick" aria-hidden="true" />;
}

type TeamRef = { id: string; name: string };

export function Timeline({ items, title, home, away }: { items: TimelineItem[]; title: string; home: TeamRef; away: TeamRef }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const collapsible = items.length > PREVIEW + 3;
  const shown = collapsible && !expanded ? items.slice(0, PREVIEW) : items;
  const sideOf = (id: string | null) => (id === home.id ? home : id === away.id ? away : null);
  return (
    <section className="section">
      <h2 className="cd label">{title}</h2>
      <ol className="tl" id="timeline-list">
        {shown.map((e) => (
          <li key={e.id} className={`tl-row tl-${e.kind}`}>
            <span className="tl-clock n">{e.clock}</span>
            <EventMark kind={e.kind} />
            <span className="tl-what">
              <span className="tl-title">{e.title}</span>
              {e.detail && <span className="tl-detail">{e.detail}</span>}
              {sideOf(e.teamId) && e.kind !== "score" && <span className="tl-detail">{sideOf(e.teamId)?.name}</span>}
            </span>
            {e.score && <span className="tl-score cd n">{e.score}</span>}
          </li>
        ))}
      </ol>
      {collapsible && (
        <button className="btn ghost tl-toggle" aria-expanded={expanded} aria-controls="timeline-list" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show fewer" : `Show all ${items.length}`}
        </button>
      )}
    </section>
  );
}
