import { Suspense } from "react";
import { connection } from "next/server";
import { UpcomingView, type UpcomingDay } from "@/components/upcoming-view";
import { getGamesForDay } from "@/lib/espn";
import { addDays, dayLabel, dayToDate, etDay, longDate } from "@/lib/time";

export const metadata = { title: "Upcoming · Rally" };

async function Week() {
  await connection();
  const today = etDay(new Date());
  const days: UpcomingDay[] = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const day = addDays(today, i + 1);
      const date = dayToDate(day);
      return {
        day,
        label: dayLabel(date.toISOString(), today),
        dateLabel: longDate(date),
        games: await getGamesForDay(day),
      };
    }),
  );
  return <UpcomingView days={days} />;
}

export default function Page() {
  return (
    <Suspense fallback={<h1 className="cd" style={{ fontSize: "clamp(88px, 17vw, 170px)" }}>Upcoming</h1>}>
      <Week />
    </Suspense>
  );
}
