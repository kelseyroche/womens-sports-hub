import { Suspense } from "react";
import { DayPage } from "@/components/day-page";

export default function Page() {
  return (
    <Suspense fallback={<h1 className="cd" style={{ fontSize: "clamp(88px, 19vw, 200px)" }}>Tonight</h1>}>
      <DayPage offset={0} />
    </Suspense>
  );
}
