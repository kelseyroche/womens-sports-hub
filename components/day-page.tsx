import { connection } from "next/server";
import { getGamesForDay, getNextGames } from "@/lib/espn";
import { addDays, dayToDate, etDay, longDate } from "@/lib/time";
import { QuietView } from "./quiet-view";
import { TonightView } from "./tonight-view";

export async function DayPage({ offset }: { offset: 0 | 1 }) {
  await connection();
  const today = etDay(new Date());
  const day = addDays(today, offset);
  const dateLabel = longDate(dayToDate(day));
  const games = await getGamesForDay(day);

  if (games.length === 0) {
    const next = await getNextGames(day, 4);
    return <QuietView dateLabel={dateLabel} next={next} today={today} when={offset === 0 ? "today" : "tomorrow"} />;
  }
  return <TonightView games={games} dateLabel={dateLabel} title={offset === 0 ? "Today" : "Tomorrow"} />;
}
