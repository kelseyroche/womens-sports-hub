import { Suspense } from "react";
import { connection } from "next/server";
import { getGamesForDay, getNextGames } from "@/lib/espn";
import { etDay, longDate } from "@/lib/time";
import { QuietView } from "@/components/quiet-view";
import { TonightView } from "@/components/tonight-view";

async function Tonight() {
  await connection();
  const now = new Date();
  const today = etDay(now);
  const dateLabel = longDate(now);
  const games = await getGamesForDay(today);

  if (games.length === 0) {
    const next = await getNextGames(today, 4);
    return <QuietView dateLabel={dateLabel} next={next} today={today} />;
  }
  return <TonightView games={games} dateLabel={dateLabel} />;
}

export default function Page() {
  return (
    <Suspense fallback={<h1 className="cd" style={{ fontSize: "clamp(88px, 19vw, 200px)" }}>Tonight</h1>}>
      <Tonight />
    </Suspense>
  );
}
