import Link from "next/link";
import type { GameDetail, DetailSide, StatRow, TimelineItem } from "@/lib/game-detail";
import { GROUP_BY_ID, LEAGUE_BY_ID } from "@/lib/leagues";
import { clockTime, longDate } from "@/lib/time";
import { LiveRefresh } from "./live-refresh";

function Crest({ side }: { side: DetailSide }) {
  return (
    <span className="crest gd-crest">
      {side.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={side.logo} alt="" />
      ) : (
        side.abbreviation
      )}
    </span>
  );
}

function Linescore({ detail }: { detail: GameDetail }) {
  const count = Math.max(detail.home.periods.length, detail.away.periods.length);
  if (!detail.periodLabel || count === 0) return null;
  const head = Array.from({ length: count }, (_, i) => i + 1);
  return (
    <div className="gd-lines" role="table" aria-label={`${detail.periodLabel} scores`}>
      <div className="gd-lines-row" role="row">
        <span role="columnheader" className="gd-lines-name" />
        {head.map((n) => (
          <span key={n} role="columnheader" className="n">
            {detail.periodLabel === "Set" ? `Set ${n}` : `Q${n}`}
          </span>
        ))}
      </div>
      {[detail.away, detail.home].map((side) => (
        <div className="gd-lines-row" role="row" key={side.id}>
          <span role="rowheader" className="gd-lines-name">
            {side.abbreviation}
          </span>
          {head.map((n) => (
            <span key={n} role="cell" className="n">
              {side.periods[n - 1] ?? "–"}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Scoreboard({ detail }: { detail: GameDetail }) {
  const league = LEAGUE_BY_ID[detail.league];
  const group = GROUP_BY_ID[league.group];
  const live = detail.state === "live";
  const background = live ? "#0C3B2E" : group.hue;
  const color = live ? "#F8F3E9" : "#0C3B2E";
  const { tm, ap } = clockTime(detail.startsAt);
  const scores = [detail.away.score ?? 0, detail.home.score ?? 0];
  return (
    <section className="gd-board" style={{ background, color, borderColor: live ? "#0C3B2E" : group.hue }}>
      <div className="t-top">
        <span>{league.name}</span>
        {live ? (
          <span className="status live n">
            <i />
            {detail.statusText}
          </span>
        ) : (
          <span className="status n" style={{ borderColor: color }}>
            {detail.state === "final" ? detail.statusText : "Upcoming"}
          </span>
        )}
      </div>
      <div className="gd-teams">
        {[detail.away, detail.home].map((side, i) => (
          <div className="gd-team" key={side.id}>
            <Crest side={side} />
            <div className="gd-name">
              <b>{side.name}</b>
              {side.record && <span className="gd-rec n">{side.record}</span>}
            </div>
            <div
              className="gd-score cd n"
              style={{ opacity: detail.state === "upcoming" || scores[i] >= Math.max(...scores) ? 1 : 0.55 }}
            >
              {detail.state === "upcoming" ? `${tm}` : (side.score ?? "–")}
              {detail.state === "upcoming" && i === 0 && <small>{ap}</small>}
            </div>
          </div>
        ))}
      </div>
      <Linescore detail={detail} />
      <p className="gd-meta">
        {longDate(new Date(detail.startsAt))}, {tm} {ap} Eastern
        {detail.venue ? ` · ${detail.venue}` : ""}
        {detail.attendance ? ` · ${detail.attendance.toLocaleString("en-US")} attended` : ""}
      </p>
    </section>
  );
}

function EventMark({ kind }: { kind: TimelineItem["kind"] }) {
  if (kind === "goal" || kind === "score") return <span className="ev-mark ev-goal" aria-hidden="true" />;
  if (kind === "yellow") return <span className="ev-mark ev-card" style={{ background: "#F5E50A" }} aria-hidden="true" />;
  if (kind === "red") return <span className="ev-mark ev-card" style={{ background: "#E0362C" }} aria-hidden="true" />;
  if (kind === "sub") return <span className="ev-mark ev-sub" aria-hidden="true" />;
  return <span className="ev-mark ev-tick" aria-hidden="true" />;
}

function Timeline({ detail }: { detail: GameDetail }) {
  if (detail.timeline.length === 0) return null;
  const title = detail.sport === "basketball" ? "Scoring plays" : "Match events";
  const sideOf = (id: string | null) => (id === detail.home.id ? detail.home : id === detail.away.id ? detail.away : null);
  return (
    <section className="section">
      <h2 className="cd label">{title}</h2>
      <ol className="tl">
        {detail.timeline.map((e) => (
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
    </section>
  );
}

function numeric(v: string): number | null {
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

function Stats({ rows, detail }: { rows: StatRow[]; detail: GameDetail }) {
  if (rows.length === 0) return null;
  return (
    <section className="section">
      <h2 className="cd label">Team stats</h2>
      <div className="st-head">
        <span>{detail.away.name}</span>
        <span>{detail.home.name}</span>
      </div>
      {rows.map((r) => {
        const a = numeric(r.away);
        const h = numeric(r.home);
        const total = a !== null && h !== null ? a + h : 0;
        const awayShare = total > 0 ? ((a ?? 0) / total) * 100 : 50;
        return (
          <div className="st-row" key={r.label}>
            <span className="st-val n">{r.away}</span>
            <span className="st-mid">
              <span className="st-label">{r.label}</span>
              <span className="st-bar" aria-hidden="true">
                <i style={{ width: `${awayShare}%` }} />
              </span>
            </span>
            <span className="st-val n">{r.home}</span>
          </div>
        );
      })}
    </section>
  );
}

function Lineups({ detail }: { detail: GameDetail }) {
  if (detail.lineups.length === 0) return null;
  const ordered = [...detail.lineups].sort((a) => (a.teamId === detail.away.id ? -1 : 1));
  return (
    <section className="section">
      <h2 className="cd label">Lineups</h2>
      <div className="lu-grid">
        {ordered.map((l) => (
          <div key={l.teamId}>
            <h3 className="lu-team">
              {l.teamName}
              {l.formation && <span className="gd-rec n"> {l.formation}</span>}
            </h3>
            {[true, false].map((starter) => {
              const group = l.players.filter((p) => p.starter === starter);
              if (group.length === 0) return null;
              return (
                <div key={String(starter)}>
                  <p className="note lu-sub">{starter ? "Starting" : "Bench"}</p>
                  {group.map((p, i) => (
                    <div className="lu-row" key={`${p.name}-${i}`}>
                      <span className="lu-num n">{p.jersey}</span>
                      <span className="lu-name">{p.name}</span>
                      <span className="lu-pos">{p.position}</span>
                      <span className="lu-flag">{p.wentOff ? "Off" : p.cameOn ? "On" : ""}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function BoxScores({ detail }: { detail: GameDetail }) {
  if (detail.boxScores.length === 0) return null;
  return (
    <section className="section">
      <h2 className="cd label">Box score</h2>
      {detail.boxScores.map((b) => (
        <div key={b.teamId} className="bx">
          <h3 className="lu-team">{b.teamName}</h3>
          <div className="bx-scroll">
            <table className="bx-table">
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  {b.labels.map((l) => (
                    <th scope="col" key={l}>
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={`${r.name}-${i}`}>
                    <th scope="row">{r.name}</th>
                    {r.stats.map((v, j) => (
                      <td className="n" key={j}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

export function GameDetailView({ detail }: { detail: GameDetail }) {
  return (
    <>
      {detail.state === "live" && <LiveRefresh />}
      <Link className="gd-back" href="/">
        Back to Tonight
      </Link>
      <Scoreboard detail={detail} />
      {detail.state === "upcoming" && (
        <p className="note">This game hasn’t started. Scores, events and stats appear here once it does.</p>
      )}
      <Timeline detail={detail} />
      <Stats rows={detail.stats} detail={detail} />
      <Lineups detail={detail} />
      <BoxScores detail={detail} />
      {detail.sport === "volleyball" && detail.stats.length === 0 && (
        <p className="note">ESPN only publishes set scores for college volleyball.</p>
      )}
    </>
  );
}
