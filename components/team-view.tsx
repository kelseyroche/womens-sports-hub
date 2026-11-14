import Link from "next/link";
import { GROUP_BY_ID, LEAGUE_BY_ID, type LeagueId } from "@/lib/leagues";
import type { RosterPlayer, TeamDetail, TeamGame } from "@/lib/team";
import { clockTime, shortDate } from "@/lib/time";
import { BackLink } from "./back-link";
import { FollowToggle } from "./follow-toggle";

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Guard", "Center"];

function groupRoster(players: RosterPlayer[]) {
  const groups = new Map<string, RosterPlayer[]>();
  for (const p of players) groups.set(p.position, [...(groups.get(p.position) ?? []), p]);
  const rank = (position: string) => {
    const index = POSITION_ORDER.indexOf(position);
    return index === -1 ? POSITION_ORDER.length : index;
  };
  return [...groups.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]))
    .map(([position, list]) => ({
      position,
      players: [...list].sort((a, b) => (Number(a.jersey) || 999) - (Number(b.jersey) || 999)),
    }));
}

function GameRow({ game, league }: { game: TeamGame; league: LeagueId }) {
  const { tm, ap } = clockTime(game.date);
  const upcoming = game.state === "upcoming";
  const content = (
    <>
      <span className="tm-date n">
        {shortDate(game.date)}
        {upcoming && (
          <span className="tm-time">
            {tm} {ap}
          </span>
        )}
      </span>
      <span className="tm-opp">
        {game.opponentLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tm-logo" src={game.opponentLogo} alt="" />
        )}
        {game.isHome ? "vs" : "at"} {game.opponent}
      </span>
      <span className="tm-result n">
        {game.state === "live" && <span className="live-pill">{game.statusText}</span>}
        {game.result && <b className={`tm-wl tm-${game.result}`}>{game.result}</b>}
        {game.score}
      </span>
    </>
  );
  return upcoming ? (
    <div className="tm-row">{content}</div>
  ) : (
    <Link className="tm-row tm-link" href={`/game/${league}/${game.eventId}`}>
      {content}
    </Link>
  );
}

export function TeamView({ team, league }: { team: TeamDetail; league: LeagueId }) {
  const group = GROUP_BY_ID[LEAGUE_BY_ID[league].group];
  const roster = groupRoster(team.roster);
  return (
    <>
      <BackLink />
      <section className="pl-hero" style={{ background: group.hue, borderColor: group.hue }}>
        <span className="crest pl-photo tm-crest">
          {team.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo} alt="" />
          ) : (
            team.name.slice(0, 3).toUpperCase()
          )}
        </span>
        <div className="pl-id">
          <h1 className="cd pl-name">{team.name}</h1>
          <p className="pl-line">{[team.standing, team.record].filter(Boolean).join(" · ")}</p>
        </div>
        <FollowToggle sport={group.sport} teamId={team.id} />
      </section>
      {team.coach && (
        <dl className="pl-facts">
          <div>
            <dt>Head coach</dt>
            <dd>{team.coach}</dd>
          </div>
        </dl>
      )}
      {team.upcoming.length > 0 && (
        <section className="section">
          <h2 className="cd label">Schedule</h2>
          {team.upcoming.map((g) => (
            <GameRow key={g.eventId} game={g} league={league} />
          ))}
        </section>
      )}
      {team.recent.length > 0 && (
        <section className="section">
          <h2 className="cd label">Results</h2>
          {team.recent.map((g) => (
            <GameRow key={g.eventId} game={g} league={league} />
          ))}
        </section>
      )}
      <section className="section">
        <h2 className="cd label">Roster</h2>
        {roster.length === 0 && <p className="note">ESPN doesn’t publish a roster for this team.</p>}
        {roster.map((g) => (
          <div key={g.position}>
            <h3 className="tl-group">{g.position}</h3>
            {g.players.map((p) => (
              <Link key={p.id} className="ro-row" href={`/player/${league}/${p.id}`}>
                <span className="ro-num n">{p.jersey ?? ""}</span>
                <span className="ro-name">
                  {p.name}
                  {p.flag && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="ro-flag" src={p.flag} alt={p.country ?? ""} title={p.country ?? ""} />
                  )}
                </span>
                <span className="ro-meta">{[p.height, p.experience ?? (p.age ? `${p.age}` : null)].filter(Boolean).join(" · ")}</span>
              </Link>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}
