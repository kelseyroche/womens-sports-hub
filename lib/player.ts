import { cacheLife } from "next/cache";
import { LEAGUE_BY_ID, type LeagueId } from "./leagues";

export type PlayerGame = {
  eventId: string;
  date: string;
  opponent: string;
  atVs: string;
  result: string;
  score: string;
  stats: string[];
};

export type PlayerSeason = { label: string; stats: string[] };

export type PlayerDetail = {
  id: string;
  name: string;
  jersey: string | null;
  position: string | null;
  height: string | null;
  weight: string | null;
  age: number | null;
  birthplace: string | null;
  citizenship: string | null;
  flag: string | null;
  experience: string | null;
  headshot: string | null;
  team: { id: string; name: string; logo: string | null } | null;
  statLabels: string[];
  seasons: PlayerSeason[];
  gameLabels: string[];
  recentGames: PlayerGame[];
};

type AthleteBody = {
  athlete?: {
    id: string;
    displayName: string;
    jersey?: string;
    position?: { displayName?: string };
    displayHeight?: string;
    displayWeight?: string;
    age?: number;
    displayBirthPlace?: string;
    citizenship?: string;
    flag?: { href?: string; alt?: string };
    displayExperience?: string;
    headshot?: { href?: string };
    team?: { id: string; displayName: string; logos?: { href: string }[] };
  };
};

type OverviewBody = {
  statistics?: { labels?: string[]; splits?: { displayName: string; stats: string[] }[] };
  gameLog?: {
    statistics?: { labels?: string[]; events?: { eventId: string; stats: string[] }[] }[];
    events?: Record<
      string,
      {
        gameDate: string;
        atVs: string;
        gameResult: string;
        homeTeamId: string;
        homeTeamScore: string;
        awayTeamScore: string;
        opponent?: { displayName?: string };
      }
    >;
  };
};

const BASE = "https://site.web.api.espn.com/apis/common/v3/sports";

export async function getPlayer(leagueId: LeagueId, athleteId: string): Promise<PlayerDetail | null> {
  "use cache";
  cacheLife("minutes");
  const path = LEAGUE_BY_ID[leagueId].path;
  const [bioRes, overviewRes] = await Promise.all([
    fetch(`${BASE}/${path}/athletes/${athleteId}`),
    fetch(`${BASE}/${path}/athletes/${athleteId}/overview`),
  ]);
  if (!bioRes.ok) return null;
  const athlete = ((await bioRes.json()) as AthleteBody).athlete;
  if (!athlete) return null;
  const overview = overviewRes.ok ? ((await overviewRes.json()) as OverviewBody) : {};

  const teamId = athlete.team?.id ?? null;
  const log = overview.gameLog;
  const logGroup = log?.statistics?.[0];
  const recentGames = (logGroup?.events ?? []).flatMap((e) => {
    const meta = log?.events?.[e.eventId];
    if (!meta) return [];
    const isHome = meta.homeTeamId === teamId;
    const own = isHome ? meta.homeTeamScore : meta.awayTeamScore;
    const other = isHome ? meta.awayTeamScore : meta.homeTeamScore;
    return [
      {
        eventId: e.eventId,
        date: meta.gameDate,
        opponent: meta.opponent?.displayName ?? "Opponent",
        atVs: meta.atVs,
        result: meta.gameResult,
        score: `${own}–${other}`,
        stats: e.stats,
      },
    ];
  });

  return {
    id: athlete.id,
    name: athlete.displayName,
    jersey: athlete.jersey ?? null,
    position: athlete.position?.displayName ?? null,
    height: athlete.displayHeight ?? null,
    weight: athlete.displayWeight ?? null,
    age: athlete.age ?? null,
    birthplace: athlete.displayBirthPlace ?? null,
    citizenship: athlete.citizenship ?? athlete.flag?.alt ?? null,
    flag: athlete.flag?.href ?? null,
    experience: athlete.displayExperience ?? null,
    headshot: athlete.headshot?.href ?? null,
    team: athlete.team
      ? { id: athlete.team.id, name: athlete.team.displayName, logo: athlete.team.logos?.[0]?.href ?? null }
      : null,
    statLabels: overview.statistics?.labels ?? [],
    seasons: (overview.statistics?.splits ?? []).map((s) => ({ label: s.displayName, stats: s.stats })),
    gameLabels: logGroup?.labels ?? [],
    recentGames,
  };
}
