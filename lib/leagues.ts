export type LeagueId = "wnba" | "nwsl" | "wsl" | "ncaaw";

export type League = {
  id: LeagueId;
  name: string;
  short: string;
  path: string;
  hue: string;
};

export const LEAGUES: League[] = [
  { id: "wnba", name: "WNBA", short: "WNBA", path: "basketball/wnba", hue: "#FF9A2E" },
  { id: "nwsl", name: "National Women's Soccer League", short: "NWSL", path: "soccer/usa.nwsl", hue: "#0EA66B" },
  { id: "wsl", name: "Women's Super League", short: "WSL", path: "soccer/eng.w.1", hue: "#FF5AA5" },
  { id: "ncaaw", name: "NCAA women's basketball", short: "NCAAW", path: "basketball/womens-college-basketball", hue: "#BBA7F0" },
];

export const LEAGUE_BY_ID = Object.fromEntries(LEAGUES.map((l) => [l.id, l])) as Record<LeagueId, League>;
