"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GROUPS } from "@/lib/leagues";

const STRIPES = ["#FF9A2E", "#0EA66B", "#FF5AA5", "#BBA7F0", "#F5E50A"];
const FOOT_STRIPES = ["#FF9A2E", "#0EA66B", "#FF5AA5", "#BBA7F0", "#F8F3E9"];

function Wordmark() {
  return (
    <div className="mark">
      <div className="mark-row">
        <span className="wordmark">Rally</span>
        <svg className="star" aria-hidden="true" viewBox="0 0 20 20">
          <path d="M10 0C11 6 14 9 20 10C14 11 11 14 10 20C9 14 6 11 0 10C6 9 9 6 10 0Z" fill="#FF5AA5" />
        </svg>
      </div>
      <svg className="swoosh" aria-hidden="true" viewBox="0 0 320 40">
        <path d="M2 36C80 8 200 0 318 10C200 10 90 20 2 36Z" fill="#FF5AA5" />
      </svg>
    </div>
  );
}

export function Band() {
  return (
    <div className="band">
      <div className="wrap">
        <div className="brandrow">
          <Wordmark />
          <span className="tagline">Women’s sports, all in one place.</span>
        </div>
        <div className="stripes" aria-hidden="true">
          {STRIPES.map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Tonight" },
    { href: "/tomorrow", label: "Tomorrow" },
    { href: "/upcoming", label: "Upcoming" },
    { href: "/following", label: "Following" },
  ];
  return (
    <nav className="nav" aria-label="Main">
      <div className="wrap">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="site">
      <div className="wrap foot-top">
        <Wordmark />
        <div className="fcols">
          <div className="fcol">
            <h3>Leagues</h3>
            {GROUPS.map((g) => (
              <span key={g.id}>{g.label}</span>
            ))}
          </div>
          <div className="fcol">
            <h3>Coming later</h3>
            <span>PWHL</span>
          </div>
        </div>
      </div>
      <div className="wrap fine">
        Scores and schedules come from ESPN. Times are Eastern. No betting, ever.
      </div>
      <div className="foot-stripes" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <span key={i} style={{ background: FOOT_STRIPES[i % 5] }} />
        ))}
      </div>
    </footer>
  );
}
