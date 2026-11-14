import Link from "next/link";
import { GROUP_BY_ID, LEAGUE_BY_ID, type LeagueId } from "@/lib/leagues";
import type { PlayerDetail } from "@/lib/player";
import { shortDate } from "@/lib/time";
import { BackLink } from "./back-link";

function Facts({ player }: { player: PlayerDetail }) {
  const facts = [
    ["Height", player.height],
    ["Weight", player.weight],
    ["Age", player.age ? String(player.age) : null],
    ["From", player.birthplace],
    ["Nationality", player.citizenship],
    ["Class", player.experience],
  ].filter((f): f is [string, string] => !!f[1]);
  if (facts.length === 0) return null;
  return (
    <dl className="pl-facts">
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd className="pl-fact-value">
            {k === "Nationality" && player.flag && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="pl-flag" src={player.flag} alt="" />
            )}
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function StatTable({ labels, rows, first }: { labels: string[]; rows: { key: string; head: React.ReactNode; stats: string[] }[]; first: string }) {
  return (
    <div className="bx-scroll">
      <table className="bx-table">
        <thead>
          <tr>
            <th scope="col">{first}</th>
            {labels.map((l) => (
              <th scope="col" key={l}>
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row">{r.head}</th>
              {r.stats.map((v, i) => (
                <td className="n" key={i}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlayerView({ player, league }: { player: PlayerDetail; league: LeagueId }) {
  const group = GROUP_BY_ID[LEAGUE_BY_ID[league].group];
  return (
    <>
      <BackLink />
      <section className="pl-hero" style={{ background: group.hue, borderColor: group.hue }}>
        <span className="crest pl-photo">
          {player.headshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.headshot} alt="" />
          ) : (
            player.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
          )}
        </span>
        <div className="pl-id">
          <h1 className="cd pl-name">{player.name}</h1>
          <p className="pl-line">
            {player.position}
            {player.position && player.team && " · "}
            {player.team && (
              <Link className="team-link" href={`/team/${league}/${player.team.id}`} style={{ textDecoration: "underline" }}>
                {player.team.name}
              </Link>
            )}
          </p>
        </div>
        {player.jersey && <span className="cd n pl-jersey">{player.jersey}</span>}
      </section>
      <Facts player={player} />
      {player.seasons.length > 0 && (
        <section className="section">
          <h2 className="cd label">Season stats</h2>
          <StatTable
            first="Season"
            labels={player.statLabels}
            rows={player.seasons.map((s, i) => ({ key: `${s.label}-${i}`, head: s.label, stats: s.stats }))}
          />
        </section>
      )}
      {player.recentGames.length > 0 && (
        <section className="section">
          <h2 className="cd label">Recent games</h2>
          <StatTable
            first="Game"
            labels={player.gameLabels}
            rows={player.recentGames.map((g) => ({
              key: g.eventId,
              head: (
                <Link href={`/game/${league}/${g.eventId}`}>
                  {shortDate(g.date)} {g.atVs} {g.opponent} · {g.result} {g.score}
                </Link>
              ),
              stats: g.stats,
            }))}
          />
        </section>
      )}
      {player.seasons.length === 0 && player.recentGames.length === 0 && (
        <p className="note">ESPN has no stats for this player yet.</p>
      )}
    </>
  );
}
