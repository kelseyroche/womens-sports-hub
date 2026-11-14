import { cacheLife } from "next/cache";
import { GROUP_BY_ID, LEAGUES, LEAGUE_BY_ID, type GroupId, type League, type LeagueId } from "./leagues";
import { addDays } from "./time";

export type GameState = "upcoming" | "live" | "final";

export type Side = {
  id: string;
  name: string;
  abbreviation: string;
  logo: string | null;
  score: number | null;
  rank: number | null;
};

export type Game = {
  id: string;
  eventId: string;
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
  curatedRank?: { current: number };
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
    rank: c.curatedRank && c.curatedRank.current >= 1 && c.curatedRank.current <= 25 ? c.curatedRank.current : null,
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
    eventId: event.id,
    league: league.id,
    startsAt: event.date,
    state,
    statusText: event.status.type.shortDetail,
    home: toSide(home, state),
    away: toSide(away, state),
    venue: competition.venue?.fullName ?? null,
  };
}

async function fetchLeagueDates(league: League, dates: string): Promise<Game[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${league.path}/scoreboard?dates=${dates}&limit=200`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const body = (await res.json()) as { events?: EspnEvent[] };
  return (body.events ?? []).flatMap((e) => toGame(league, e) ?? []);
}

export async function getGamesForDay(day: string): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");
  const perLeague = await Promise.allSettled(LEAGUES.map((l) => fetchLeagueDates(l, day)));
  return perLeague
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getNextGames(fromDay: string, limit: number): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");
  const chunks = [[1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14]];
  const found: Game[] = [];
  for (const chunk of chunks) {
    const days = await Promise.all(chunk.map((n) => getGamesForDay(addDays(fromDay, n))));
    found.push(...days.flat().filter((g) => g.state === "upcoming"));
    if (found.length >= limit) break;
  }
  return found.sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, limit);
}

export type Team = { id: string; name: string; abbreviation: string; logo: string | null };

type EspnTeamsBody = {
  sports?: {
    leagues?: {
      teams?: { team: { id: string; displayName: string; abbreviation?: string; logos?: { href: string }[] } }[];
    }[];
  }[];
};

async function fetchTeams(leagueId: LeagueId): Promise<Team[]> {
  const league = LEAGUE_BY_ID[leagueId];
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${league.path}/teams?limit=500`);
  if (!res.ok) return [];
  const body = (await res.json()) as EspnTeamsBody;
  return (body.sports?.[0]?.leagues?.[0]?.teams ?? []).map(({ team }) => ({
    id: team.id,
    name: team.displayName,
    abbreviation: team.abbreviation ?? team.displayName.slice(0, 3).toUpperCase(),
    logo: team.logos?.[0]?.href ?? null,
  }));
}

export async function getGroupTeams(groupId: GroupId): Promise<Team[]> {
  "use cache";
  cacheLife("days");
  const lists = await Promise.allSettled(GROUP_BY_ID[groupId].teamSources.map(fetchTeams));
  const byId = new Map<string, Team>();
  for (const r of lists) {
    if (r.status !== "fulfilled") continue;
    for (const t of r.value) if (!byId.has(t.id)) byId.set(t.id, t);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
