"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "rally-follow";

type FollowContext = {
  ready: boolean;
  followed: ReadonlySet<string>;
  toggle: (key: string) => void;
  syncAvailable: boolean;
  user: User | null;
  syncError: string | null;
  signInWithEmail: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
};

const Ctx = createContext<FollowContext | null>(null);

export const teamKey = (sport: string, teamId: string) => `${sport}:${teamId}`;

function readLocal(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(keys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {}
}

export function FollowProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const keysRef = useRef<string[]>([]);

  const commit = useCallback((next: string[]) => {
    keysRef.current = next;
    setKeys(next);
    writeLocal(next);
  }, []);

  useEffect(() => {
    commit(readLocal());
    setReady(true);
  }, [commit]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!supabase || !userId || !ready) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("follows").select("team_key");
      if (cancelled) return;
      if (error) {
        setSyncError("Couldn't sync your teams. They're saved on this device.");
        return;
      }
      const remote = (data ?? []).map((r) => r.team_key as string);
      const merged = Array.from(new Set([...keysRef.current, ...remote]));
      const missing = merged.filter((k) => !remote.includes(k));
      if (missing.length > 0) {
        const { error: upsertError } = await supabase
          .from("follows")
          .upsert(missing.map((team_key) => ({ team_key })), { onConflict: "user_id,team_key", ignoreDuplicates: true });
        if (upsertError) setSyncError("Couldn't sync your teams. They're saved on this device.");
        else setSyncError(null);
      } else {
        setSyncError(null);
      }
      commit(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, ready, commit]);

  const toggle = useCallback(
    (key: string) => {
      const adding = !keysRef.current.includes(key);
      commit(adding ? [...keysRef.current, key] : keysRef.current.filter((k) => k !== key));
      if (!supabase || !userId) return;
      const request = adding
        ? supabase.from("follows").upsert({ team_key: key }, { onConflict: "user_id,team_key", ignoreDuplicates: true })
        : supabase.from("follows").delete().eq("team_key", key);
      request.then(({ error }) =>
        setSyncError(error ? "Couldn't sync that change. It's saved on this device." : null),
      );
    },
    [commit, userId],
  );

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return "Sign-in isn't set up yet.";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/following` },
    });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!supabase) return "Sign-in isn't set up yet.";
    const { error } = await supabase.rpc("delete_my_account");
    if (error) return error.message;
    await supabase.auth.signOut();
    return null;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      followed: new Set(keys),
      toggle,
      syncAvailable: supabase !== null,
      user,
      syncError,
      signInWithEmail,
      signOut,
      deleteAccount,
    }),
    [ready, keys, toggle, user, syncError, signInWithEmail, signOut, deleteAccount],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFollow() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFollow must be used inside FollowProvider");
  return ctx;
}
