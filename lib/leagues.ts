export type Sport = "basketball" | "soccer" | "volleyball";

export type GroupId = "wnba" | "ncaaw" | "ncaav" | "nwsl" | "england" | "europe" | "national";

export type Group = {
  id: GroupId;
  label: string;
  sport: Sport;
  hue: string;
  crowded?: boolean;
  teamSources: LeagueId[];
};

export const GROUPS: Group[] = [
  { id: "wnba", label: "WNBA", sport: "basketball", hue: "#FF9A2E", teamSources: ["wnba"] },
  { id: "ncaaw", label: "NCAA women's basketball", sport: "basketball", hue: "#BBA7F0", crowded: true, teamSources: ["ncaaw"] },
  { id: "ncaav", label: "NCAA volleyball", sport: "volleyball", hue: "#F2545B", crowded: true, teamSources: ["ncaav"] },
  { id: "nwsl", label: "NWSL", sport: "soccer", hue: "#0EA66B", teamSources: ["nwsl"] },
  { id: "england", label: "England", sport: "soccer", hue: "#FF5AA5", teamSources: ["wsl"] },
  { id: "europe", label: "Europe", sport: "soccer", hue: "#4DB5FF", teamSources: ["uwcl", "liga-f", "premiere-ligue"] },
  { id: "national", label: "National teams", sport: "soccer", hue: "#3D5AFE", teamSources: ["friendlies"] },
];

export const GROUP_BY_ID = Object.fromEntries(GROUPS.map((g) => [g.id, g])) as Record<GroupId, Group>;

export type LeagueId =
  | "wnba"
  | "ncaaw"
  | "ncaav"
  | "nwsl"
  | "nwsl-cup"
  | "wsl"
  | "fa-cup"
  | "league-cup"
  | "uwcl"
  | "liga-f"
  | "premiere-ligue"
  | "friendlies"
  | "world-cup"
  | "euro"
  | "nations-league"
  | "gold-cup"
  | "w-championship"
  | "asian-cup"
  | "africa-cup"
  | "olympics";

export type League = {
  id: LeagueId;
  name: string;
  path: string;
  group: GroupId;
};

export const LEAGUES: League[] = [
  { id: "wnba", name: "WNBA", path: "basketball/wnba", group: "wnba" },
  { id: "ncaaw", name: "NCAA women's basketball", path: "basketball/womens-college-basketball", group: "ncaaw" },
  { id: "ncaav", name: "NCAA women's volleyball", path: "volleyball/womens-college-volleyball", group: "ncaav" },
  { id: "nwsl", name: "NWSL", path: "soccer/usa.nwsl", group: "nwsl" },
  { id: "nwsl-cup", name: "NWSL Challenge Cup", path: "soccer/usa.nwsl.cup", group: "nwsl" },
  { id: "wsl", name: "Women's Super League", path: "soccer/eng.w.1", group: "england" },
  { id: "fa-cup", name: "Women's FA Cup", path: "soccer/eng.w.fa", group: "england" },
  { id: "league-cup", name: "Women's League Cup", path: "soccer/eng.w.league_cup", group: "england" },
  { id: "uwcl", name: "UEFA Women's Champions League", path: "soccer/uefa.wchampions", group: "europe" },
  { id: "liga-f", name: "Liga F", path: "soccer/esp.w.1", group: "europe" },
  { id: "premiere-ligue", name: "Première Ligue", path: "soccer/fra.w.1", group: "europe" },
  { id: "friendlies", name: "International friendlies", path: "soccer/fifa.friendly.w", group: "national" },
  { id: "world-cup", name: "Women's World Cup", path: "soccer/fifa.wwc", group: "national" },
  { id: "euro", name: "Women's Euro", path: "soccer/uefa.weuro", group: "national" },
  { id: "nations-league", name: "Women's Nations League", path: "soccer/uefa.w.nations", group: "national" },
  { id: "gold-cup", name: "Concacaf W Gold Cup", path: "soccer/concacaf.w.gold", group: "national" },
  { id: "w-championship", name: "Concacaf W Championship", path: "soccer/concacaf.womens.championship", group: "national" },
  { id: "asian-cup", name: "AFC Women's Asian Cup", path: "soccer/afc.w.asian.cup", group: "national" },
  { id: "africa-cup", name: "Women's Africa Cup of Nations", path: "soccer/caf.w.nations", group: "national" },
  { id: "olympics", name: "Olympic women's soccer", path: "soccer/fifa.w.olympics", group: "national" },
];

export const LEAGUE_BY_ID = Object.fromEntries(LEAGUES.map((l) => [l.id, l])) as Record<LeagueId, League>;
