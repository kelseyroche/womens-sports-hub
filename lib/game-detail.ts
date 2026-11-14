import { cacheLife } from "next/cache";
import { GROUP_BY_ID, LEAGUE_BY_ID, type LeagueId, type Sport } from "./leagues";
import type { GameState } from "./espn";

export type DetailSide = {
  id: string;
  name: string;
  abbreviation: string;
  logo: string | null;
  score: number | null;
  record: string | null;
  periods: string[];
};

export type TimelineKind = "goal" | "yellow" | "red" | "sub" | "period" | "score";

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  clock: string;
  title: string;
  detail: string | null;
  teamId: string | null;
  score: string | null;
};

export type StatRow = { label: string; home: string; away: string };

export type LineupPlayer = {
  id: string | null;
  name: string;
  jersey: string;
  position: string;
  starter: boolean;
  cameOn: boolean;
  wentOff: boolean;
};

export type Lineup = { teamId: string; teamName: string; formation: string | null; players: LineupPlayer[] };

export type BoxScore = { teamId: string; teamName: string; labels: string[]; rows: { id: string | null; name: string; stats: string[] }[] };

export type GameDetail = {
  league: LeagueId;
  sport: Sport;
  state: GameState;
  statusText: string;
  startsAt: string;
  venue: string | null;
  attendance: number | null;
  home: DetailSide;
  away: DetailSide;
  periodLabel: string | null;
  timeline: TimelineItem[];
  stats: StatRow[];
  lineups: Lineup[];
  boxScores: BoxScore[];
};

type Team = { id: string; displayName: string; abbreviation?: string; logo?: string; logos?: { href: string }[] };
type Competitor = {
  homeAway: "home" | "away";
  score?: string;
  team: Team;
  record?: { displayValue?: string }[];
  linescores?: { displayValue?: string }[];
};
type KeyEvent = {
  id: string;
  type: { text: string; type: string };
  clock?: { displayValue?: string };
  scoringPlay?: boolean;
  team?: { id: string };
  participants?: { athlete?: { displayName?: string } }[];
  shootout?: boolean;
};
type Play = {
  id: string;
  text: string;
  scoringPlay?: boolean;
  homeScore?: number;
  awayScore?: number;
  period?: { number: number };
  clock?: { displayValue?: string };
  team?: { id: string };
};
type RosterEntry = {
  starter?: boolean;
  jersey?: string;
  athlete?: { id?: string; displayName?: string };
  position?: { abbreviation?: string };
  subbedIn?: boolean;
  subbedOut?: boolean;
};
type Summary = {
  header: {
    competitions: {
      date: string;
      status: { type: { state: "pre" | "in" | "post"; shortDetail: string } };
      competitors: Competitor[];
    }[];
  };
  gameInfo?: { venue?: { fullName?: string }; attendance?: number };
  keyEvents?: KeyEvent[];
  plays?: Play[];
  boxscore?: {
    teams?: { team: { id: string }; statistics?: { label?: string; displayValue?: string }[] }[];
    players?: {
      team: { id: string; displayName: string };
      statistics?: { labels?: string[]; athletes?: { athlete?: { id?: string; displayName?: string }; stats?: string[] }[] }[];
    }[];
  };
  rosters?: { team: { id: string; displayName: string }; formation?: string; roster?: RosterEntry[] }[];
};

const STATE_MAP = { pre: "upcoming", in: "live", post: "final" } as const;

function toSide(c: Competitor, state: GameState): DetailSide {
  const score = c.score === undefined || state === "upcoming" ? null : Number(c.score);
  return {
    id: c.team.id,
    name: c.team.displayName,
    abbreviation: c.team.abbreviation ?? c.team.displayName.slice(0, 3).toUpperCase(),
    logo: c.team.logo ?? c.team.logos?.[0]?.href ?? null,
    score: score === null || Number.isNaN(score) ? null : score,
    record: c.record?.[0]?.displayValue ?? null,
    periods: (c.linescores ?? []).map((l) => l.displayValue ?? "–"),
  };
}

function soccerTimeline(events: KeyEvent[], homeId: string): TimelineItem[] {
  let homeGoals = 0;
  let awayGoals = 0;
  const items: TimelineItem[] = [];
  for (const e of events) {
    if (e.shootout) continue;
    const type = e.type.type;
    const names = (e.participants ?? []).map((p) => p.athlete?.displayName).filter((n): n is string => !!n);
    const clock = e.clock?.displayValue ?? "";
    const base = { id: e.id, clock, teamId: e.team?.id ?? null, score: null as string | null };
    if (type.includes("goal") || type.includes("penalty---scored")) {
      if (e.team?.id === homeId) homeGoals += 1;
      else awayGoals += 1;
      const ownGoal = type.includes("own");
      items.push({
        ...base,
        kind: "goal",
        title: names[0] ?? e.type.text,
        detail: ownGoal ? "Own goal" : names[1] ? `Assist ${names[1]}` : e.type.text.replace(/^Goal ?-? ?/, "") || null,
        score: `${awayGoals}–${homeGoals}`,
      });
    } else if (type.includes("yellow-card") || type.includes("red-card")) {
      items.push({
        ...base,
        kind: type.includes("red") ? "red" : "yellow",
        title: names[0] ?? e.type.text,
        detail: e.type.text,
      });
    } else if (type === "substitution") {
      items.push({ ...base, kind: "sub", title: `${names[0] ?? "Player"} on`, detail: names[1] ? `${names[1]} off` : null });
    } else if (["halftime", "end-regular-time", "start-2nd-half", "kickoff"].includes(type)) {
      items.push({ ...base, kind: "period", title: e.type.text, detail: null });
    }
  }
  return items.reverse();
}

function scoringPlays(plays: Play[]): TimelineItem[] {
  return plays
    .filter((p) => p.scoringPlay)
    .map((p) => ({
      id: p.id,
      kind: "score" as const,
      clock: `Q${p.period?.number ?? ""} ${p.clock?.displayValue ?? ""}`.trim(),
      title: p.text,
      detail: null,
      teamId: p.team?.id ?? null,
      score: `${p.awayScore ?? 0}–${p.homeScore ?? 0}`,
    }))
    .reverse()
    .slice(0, 80);
}

const SOCCER_STATS = ["Possession", "SHOTS", "ON GOAL", "Corner Kicks", "Saves", "Fouls", "Offsides", "Yellow Cards", "Red Cards", "Passes", "Tackles"];

function toStats(summary: Summary, homeId: string, sport: Sport): StatRow[] {
  const teams = summary.boxscore?.teams ?? [];
  const home = teams.find((t) => t.team.id === homeId);
  const away = teams.find((t) => t.team.id !== homeId);
  if (!home || !away) return [];
  const rows = (home.statistics ?? []).flatMap((s) => {
    const other = (away.statistics ?? []).find((o) => o.label === s.label);
    if (!s.label || !s.displayValue || !other?.displayValue) return [];
    return [{ label: s.label, home: s.displayValue, away: other.displayValue }];
  });
  if (sport !== "soccer") return rows;
  return SOCCER_STATS.flatMap((label) => rows.filter((r) => r.label === label));
}

function toLineups(summary: Summary): Lineup[] {
  return (summary.rosters ?? []).map((r) => ({
    teamId: r.team.id,
    teamName: r.team.displayName,
    formation: r.formation ?? null,
    players: (r.roster ?? []).map((p) => ({
      id: p.athlete?.id ?? null,
      name: p.athlete?.displayName ?? "Unknown",
      jersey: p.jersey ?? "",
      position: p.position?.abbreviation ?? "",
      starter: !!p.starter,
      cameOn: !!p.subbedIn,
      wentOff: !!p.subbedOut,
    })),
  }));
}

function toBoxScores(summary: Summary): BoxScore[] {
  return (summary.boxscore?.players ?? []).flatMap((t) => {
    const group = t.statistics?.[0];
    if (!group?.labels) return [];
    const rows = (group.athletes ?? [])
      .filter((a) => a.stats && a.stats.length > 0)
      .map((a) => ({ id: a.athlete?.id ?? null, name: a.athlete?.displayName ?? "Unknown", stats: a.stats ?? [] }));
    return rows.length > 0 ? [{ teamId: t.team.id, teamName: t.team.displayName, labels: group.labels, rows }] : [];
  });
}

export async function getGameDetail(leagueId: LeagueId, eventId: string): Promise<GameDetail | null> {
  "use cache";
  cacheLife("seconds");
  const league = LEAGUE_BY_ID[leagueId];
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${league.path}/summary?event=${eventId}`);
  if (!res.ok) return null;
  const summary = (await res.json()) as Summary;
  const competition = summary.header?.competitions?.[0];
  const homeC = competition?.competitors.find((c) => c.homeAway === "home");
  const awayC = competition?.competitors.find((c) => c.homeAway === "away");
  if (!competition || !homeC || !awayC) return null;

  const sport = GROUP_BY_ID[league.group].sport;
  const state = STATE_MAP[competition.status.type.state];
  const timeline =
    sport === "soccer" ? soccerTimeline(summary.keyEvents ?? [], homeC.team.id) : sport === "basketball" ? scoringPlays(summary.plays ?? []) : [];

  return {
    league: leagueId,
    sport,
    state,
    statusText: competition.status.type.shortDetail,
    startsAt: competition.date,
    venue: summary.gameInfo?.venue?.fullName ?? null,
    attendance: summary.gameInfo?.attendance && summary.gameInfo.attendance > 0 ? summary.gameInfo.attendance : null,
    home: toSide(homeC, state),
    away: toSide(awayC, state),
    periodLabel: sport === "volleyball" ? "Set" : sport === "basketball" ? "Q" : null,
    timeline,
    stats: toStats(summary, homeC.team.id, sport),
    lineups: sport === "soccer" ? toLineups(summary) : [],
    boxScores: sport === "soccer" ? [] : toBoxScores(summary),
  };
}
