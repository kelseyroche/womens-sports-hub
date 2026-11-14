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

export type Team = {
  id: string;
  name: string;
  abbreviation: string;
  logo: string | null;
  rank: number | null;
  popular: boolean;
  leagueId: LeagueId;
};

type EspnTeamsBody = {
  sports?: {
    leagues?: {
      teams?: { team: { id: string; displayName: string; abbreviation?: string; logos?: { href: string }[] } }[];
    }[];
  }[];
};

const POPULAR_NATIONAL = [
  "United States", "England", "Spain", "Germany", "France", "Brazil", "Canada", "Japan", "Australia", "Sweden",
  "Netherlands", "Italy", "Norway", "Mexico", "Denmark", "Colombia", "Scotland", "Wales", "South Korea", "Nigeria",
];

const RANKING_PATHS: Partial<Record<GroupId, string>> = {
  ncaaw: "basketball/womens-college-basketball",
  ncaav: "volleyball/womens-college-volleyball",
};

async function fetchRanks(groupId: GroupId): Promise<Map<string, number>> {
  const path = RANKING_PATHS[groupId];
  const ranks = new Map<string, number>();
  if (!path) return ranks;
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${path}/rankings`);
  if (!res.ok) return ranks;
  const body = (await res.json()) as { rankings?: { ranks?: { current: number; team: { id: string } }[] }[] };
  for (const r of body.rankings?.[0]?.ranks ?? []) ranks.set(r.team.id, r.current);
  return ranks;
}

async function fetchTeams(leagueId: LeagueId): Promise<Omit<Team, "rank" | "popular">[]> {
  const league = LEAGUE_BY_ID[leagueId];
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${league.path}/teams?limit=500`);
  if (!res.ok) return [];
  const body = (await res.json()) as EspnTeamsBody;
  return (body.sports?.[0]?.leagues?.[0]?.teams ?? []).map(({ team }) => ({
    id: team.id,
    name: team.displayName,
    abbreviation: team.abbreviation ?? team.displayName.slice(0, 3).toUpperCase(),
    logo: team.logos?.[0]?.href ?? null,
    leagueId,
  }));
}

export async function getGroupTeams(groupId: GroupId): Promise<Team[]> {
  "use cache";
  cacheLife("hours");
  const sources = GROUP_BY_ID[groupId].teamSources;
  const [lists, ranks] = await Promise.all([Promise.allSettled(sources.map(fetchTeams)), fetchRanks(groupId)]);
  const firstSourceIds = new Set<string>();
  const byId = new Map<string, Team>();
  lists.forEach((r, index) => {
    if (r.status !== "fulfilled") return;
    for (const t of r.value) {
      if (index === 0 && sources.length > 1 && groupId === "europe") firstSourceIds.add(t.id);
      if (!byId.has(t.id)) byId.set(t.id, { ...t, rank: ranks.get(t.id) ?? null, popular: false });
    }
  });
  const popularIndex = (t: Team) => (groupId === "national" ? POPULAR_NATIONAL.indexOf(t.name) : -1);
  const teams = [...byId.values()].map((t) => ({
    ...t,
    popular: t.rank !== null || firstSourceIds.has(t.id) || popularIndex(t) >= 0,
  }));
  return teams.sort((a, b) => {
    if (a.rank !== null || b.rank !== null) {
      if (a.rank === null) return 1;
      if (b.rank === null) return -1;
      return a.rank - b.rank;
    }
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    if (groupId === "national" && a.popular && b.popular) return popularIndex(a) - popularIndex(b);
    return a.name.localeCompare(b.name);
  });
}
