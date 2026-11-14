import { cacheLife } from "next/cache";
import { LEAGUE_BY_ID, type LeagueId } from "./leagues";
import type { GameState } from "./espn";

export type RosterPlayer = {
  id: string;
  name: string;
  jersey: string | null;
  position: string;
  height: string | null;
  age: number | null;
  experience: string | null;
  flag: string | null;
  country: string | null;
};

export type TeamGame = {
  eventId: string;
  date: string;
  isHome: boolean;
  opponent: string;
  opponentLogo: string | null;
  state: GameState;
  statusText: string;
  score: string | null;
  result: "W" | "L" | "D" | null;
};

export type TeamDetail = {
  id: string;
  name: string;
  logo: string | null;
  record: string | null;
  standing: string | null;
  coach: string | null;
  roster: RosterPlayer[];
  recent: TeamGame[];
  upcoming: TeamGame[];
};

type InfoBody = {
  team?: {
    id: string;
    displayName: string;
    logos?: { href: string }[];
    standingSummary?: string;
    record?: { items?: { summary?: string }[] };
  };
};

type RawAthlete = {
  id: string;
  displayName: string;
  jersey?: string;
  height?: number;
  displayHeight?: string;
  age?: number;
  experience?: { displayValue?: string; years?: number };
  position?: { displayName?: string; abbreviation?: string };
  flag?: { alt?: string; href?: string };
  citizenship?: string;
};

type RosterBody = {
  athletes?: (RawAthlete | { position?: string; items?: RawAthlete[] })[];
  coach?: { firstName?: string; lastName?: string }[];
};

type RawCompetitor = {
  homeAway: "home" | "away";
  score?: string | { displayValue?: string };
  winner?: boolean;
  team: { id: string; displayName: string; logos?: { href: string }[]; logo?: string };
};

type ScheduleBody = {
  events?: {
    id: string;
    date: string;
    competitions: {
      status: { type: { state: "pre" | "in" | "post"; shortDetail: string } };
      competitors: RawCompetitor[];
    }[];
  }[];
};

const BASE = "https://site.api.espn.com/apis/site/v2/sports";
const STATE_MAP = { pre: "upcoming", in: "live", post: "final" } as const;

const scoreOf = (c: RawCompetitor) => (typeof c.score === "string" ? c.score : c.score?.displayValue);

function toGames(body: ScheduleBody, teamId: string): TeamGame[] {
  return (body.events ?? []).flatMap((e) => {
    const comp = e.competitions[0];
    const own = comp?.competitors.find((c) => c.team.id === teamId);
    const other = comp?.competitors.find((c) => c.team.id !== teamId);
    if (!comp || !own || !other) return [];
    const state = STATE_MAP[comp.status.type.state];
    const ownScore = scoreOf(own);
    const otherScore = scoreOf(other);
    const played = state !== "upcoming" && ownScore !== undefined && otherScore !== undefined;
    let result: TeamGame["result"] = null;
    if (state === "final" && played) {
      result = own.winner ? "W" : other.winner ? "L" : Number(ownScore) === Number(otherScore) ? "D" : null;
    }
    return [
      {
        eventId: e.id,
        date: e.date,
        isHome: own.homeAway === "home",
        opponent: other.team.displayName,
        opponentLogo: other.team.logos?.[0]?.href ?? other.team.logo ?? null,
        state,
        statusText: comp.status.type.shortDetail,
        score: played ? `${ownScore}–${otherScore}` : null,
        result,
      },
    ];
  });
}

function toRoster(body: RosterBody): RosterPlayer[] {
  const flat = (body.athletes ?? []).flatMap((a) => ("items" in a && a.items ? a.items : [a as RawAthlete]));
  return flat.map((a) => ({
    id: a.id,
    name: a.displayName,
    jersey: a.jersey ?? null,
    position: a.position?.displayName ?? a.position?.abbreviation ?? "Other",
    height: a.displayHeight ?? null,
    age: a.age ?? null,
    experience: a.experience?.displayValue ?? null,
    flag: a.flag?.href ?? null,
    country: a.citizenship ?? a.flag?.alt ?? null,
  }));
}

async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url);
  return res.ok ? ((await res.json()) as T) : null;
}

export async function getTeam(leagueId: LeagueId, teamId: string): Promise<TeamDetail | null> {
  "use cache";
  cacheLife("minutes");
  const path = LEAGUE_BY_ID[leagueId].path;
  const [info, roster, schedule] = await Promise.all([
    getJson<InfoBody>(`${BASE}/${path}/teams/${teamId}`),
    getJson<RosterBody>(`${BASE}/${path}/teams/${teamId}/roster`),
    getJson<ScheduleBody>(`${BASE}/${path}/teams/${teamId}/schedule`),
  ]);
  const team = info?.team;
  if (!team) return null;

  const games = schedule ? toGames(schedule, teamId).sort((a, b) => a.date.localeCompare(b.date)) : [];
  const coachEntry = roster?.coach?.[0];
  return {
    id: team.id,
    name: team.displayName,
    logo: team.logos?.[0]?.href ?? null,
    record: team.record?.items?.[0]?.summary ?? null,
    standing: team.standingSummary ?? null,
    coach: coachEntry ? [coachEntry.firstName, coachEntry.lastName].filter(Boolean).join(" ") || null : null,
    roster: roster ? toRoster(roster) : [],
    recent: games.filter((g) => g.state === "final").slice(-5).reverse(),
    upcoming: games.filter((g) => g.state !== "final").slice(0, 5),
  };
}
