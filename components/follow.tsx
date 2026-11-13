"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "rally-follow";

type FollowContext = {
  ready: boolean;
  followed: ReadonlySet<string>;
  toggle: (key: string) => void;
};

const Ctx = createContext<FollowContext | null>(null);

export const teamKey = (league: string, teamId: string) => `${league}:${teamId}`;

export function FollowProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) setKeys(stored.filter((k): k is string => typeof k === "string"));
    } catch {}
    setReady(true);
  }, []);

  const toggle = useCallback((key: string) => {
    setKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ready, followed: new Set(keys), toggle }), [ready, keys, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFollow() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFollow must be used inside FollowProvider");
  return ctx;
}
