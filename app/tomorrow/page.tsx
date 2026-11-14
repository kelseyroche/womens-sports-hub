import { Suspense } from "react";
import { DayPage } from "@/components/day-page";

export const metadata = { title: "Tomorrow · Rally" };

export default function Page() {
  return (
    <Suspense fallback={<h1 className="cd" style={{ fontSize: "clamp(88px, 19vw, 200px)" }}>Tomorrow</h1>}>
      <DayPage offset={1} />
    </Suspense>
  );
}
