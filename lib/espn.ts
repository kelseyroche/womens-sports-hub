import { cacheLife } from "next/cache";
import { LEAGUES, LEAGUE_BY_ID, type League, type LeagueId } from "./leagues";
import { addDays } from "./time";

export type GameState = "upcoming" | "live" | "final";

export type Side = {
  id: string;
  name: string;
  abbreviation: string;
  logo: string | null;
  score: number | null;
};

export type Game = {
  id: string;
  league: LeagueId;
  startsAt: string;
  state: GameState;
  statusText: string;
  home: Side;
  away: Side;
  venue: string | null;
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  score?: string;
  team: { id: string; displayName: string; abbreviation?: string; logo?: string };
};

type EspnEvent = {
  id: string;
  date: string;
  status: { type: { state: "pre" | "in" | "post"; shortDetail: string } };
  competitions: { venue?: { fullName?: string }; competitors: EspnCompetitor[] }[];
};

const STATE_MAP = { pre: "upcoming", in: "live", post: "final" } as const;

function toSide(c: EspnCompetitor, state: GameState): Side {
  const score = c.score === undefined || state === "upcoming" ? null : Number(c.score);
  return {
    id: c.team.id,
    name: c.team.displayName,
    abbreviation: c.team.abbreviation ?? c.team.displayName.slice(0, 3).toUpperCase(),
    logo: c.team.logo ?? null,
    score: Number.isNaN(score) ? null : score,
  };
}

function toGame(league: League, event: EspnEvent): Game | null {
  const competition = event.competitions[0];
  const home = competition?.competitors.find((c) => c.homeAway === "home");
  const away = competition?.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;
  const state = STATE_MAP[event.status.type.state];
  return {
    id: `${league.id}-${event.id}`,
    league: league.id,
    startsAt: event.date,
    state,
    statusText: event.status.type.shortDetail,
    home: toSide(home, state),
    away: toSide(away, state),
    venue: competition.venue?.fullName ?? null,
  };
}

async function fetchLeagueDay(league: League, day: string): Promise<Game[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${league.path}/scoreboard?dates=${day}&limit=100`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const body = (await res.json()) as { events?: EspnEvent[] };
  return (body.events ?? []).flatMap((e) => toGame(league, e) ?? []);
}

export async function getGamesForDay(day: string): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");
  const perLeague = await Promise.allSettled(LEAGUES.map((l) => fetchLeagueDay(l, day)));
  return perLeague
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getNextGames(fromDay: string, limit: number): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");
  const found: Game[] = [];
  for (let i = 1; i <= 14 && found.length < limit; i++) {
    const games = await getGamesForDay(addDays(fromDay, i));
    found.push(...games.filter((g) => g.state === "upcoming"));
  }
  return found.slice(0, limit);
}

export type Team = { id: string; name: string; abbreviation: string; logo: string | null };

export async function getTeams(leagueId: LeagueId): Promise<Team[]> {
  "use cache";
  cacheLife("days");
  const league = LEAGUE_BY_ID[leagueId];
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${league.path}/teams?limit=100`);
  if (!res.ok) return [];
  const body = (await res.json()) as {
    sports?: { leagues?: { teams?: { team: { id: string; displayName: string; abbreviation?: string; logos?: { href: string }[] } }[] }[] }[];
  };
  const teams = body.sports?.[0]?.leagues?.[0]?.teams ?? [];
  return teams
    .map(({ team }) => ({
      id: team.id,
      name: team.displayName,
      abbreviation: team.abbreviation ?? team.displayName.slice(0, 3).toUpperCase(),
      logo: team.logos?.[0]?.href ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
