const ZONE = "America/New_York";

function parts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: ZONE, ...options }).formatToParts(date);
}

export function etDay(date: Date): string {
  const p = parts(date, { year: "numeric", month: "2-digit", day: "2-digit" });
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("year")}${get("month")}${get("day")}`;
}

export function addDays(day: string, n: number): string {
  const d = new Date(Date.UTC(+day.slice(0, 4), +day.slice(4, 6) - 1, +day.slice(6, 8) + n));
  return d.toISOString().slice(0, 10).replaceAll("-", "");
}

export function clockTime(iso: string): { tm: string; ap: string } {
  const p = parts(new Date(iso), { hour: "numeric", minute: "2-digit", hour12: true });
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { tm: `${get("hour")}:${get("minute")}`, ap: get("dayPeriod") };
}

export function longDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "long", month: "long", day: "numeric" }).format(date);
}

export function dayLabel(iso: string, today: string): string {
  const day = etDay(new Date(iso));
  if (day === today) return "Today";
  if (day === addDays(today, 1)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "long" }).format(new Date(iso));
}

export function dayToDate(day: string): Date {
  return new Date(Date.UTC(+day.slice(0, 4), +day.slice(4, 6) - 1, +day.slice(6, 8), 12));
}

export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: ZONE, month: "short", day: "numeric" }).format(new Date(iso));
}
