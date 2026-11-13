import Link from "next/link";
import type { Game } from "@/lib/espn";
import { clockTime, dayLabel } from "@/lib/time";
import { GameTile } from "./game-tile";

export function QuietView({ dateLabel, next, today }: { dateLabel: string; next: Game[]; today: string }) {
  const first = next[0];
  const firstTime = first ? clockTime(first.startsAt) : null;
  return (
    <>
      <div className="quiet">
        <div>
          <div className="cd date">{dateLabel}</div>
          <h1 className="cd">
            Nothing
            <br />
            on tonight.
          </h1>
          <p className="lede">
            {first && firstTime
              ? `None of your leagues plays tonight. The next game is ${dayLabel(first.startsAt, today).toLowerCase()} at ${firstTime.tm} ${firstTime.ap} Eastern.`
              : "None of your leagues plays tonight, and nothing is scheduled in the next two weeks."}
          </p>
          <div className="btnrow">
            <Link className="btn" href="/following">
              Follow teams
            </Link>
          </div>
        </div>
      </div>
      {next.length > 0 && (
        <section className="section">
          <h2 className="cd label">Next up</h2>
          <div className="mosaic">
            {next.map((g) => (
              <GameTile key={g.id} game={g} size="small" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
