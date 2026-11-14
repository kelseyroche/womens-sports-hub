"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
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

const listeners = new Set<() => void>();
let snapshot: string | null = null;

function readSnapshot(): string {
  if (snapshot === null) {
    try {
      snapshot = localStorage.getItem(STORAGE_KEY) ?? "[]";
    } catch {
      snapshot = "[]";
    }
  }
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function parseKeys(raw: string): string[] {
  try {
    const stored = JSON.parse(raw);
    return Array.isArray(stored) ? stored.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function writeKeys(keys: string[]) {
  snapshot = JSON.stringify(keys);
  try {
    localStorage.setItem(STORAGE_KEY, snapshot);
  } catch {}
  listeners.forEach((l) => l());
}

const subscribeNever = () => () => {};

export function FollowProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readSnapshot, () => "[]");
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  const keys = useMemo(() => parseKeys(raw), [raw]);
  const [user, setUser] = useState<User | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

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
        setSyncError("Couldn’t sync your teams. They’re saved on this device.");
        return;
      }
      const remote = (data ?? []).map((r) => r.team_key as string);
      const merged = Array.from(new Set([...parseKeys(readSnapshot()), ...remote]));
      const missing = merged.filter((k) => !remote.includes(k));
      if (missing.length > 0) {
        const { error: upsertError } = await supabase
          .from("follows")
          .upsert(missing.map((team_key) => ({ team_key })), { onConflict: "user_id,team_key", ignoreDuplicates: true });
        setSyncError(upsertError ? "Couldn’t sync your teams. They’re saved on this device." : null);
      } else {
        setSyncError(null);
      }
      writeKeys(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, ready]);

  const toggle = useCallback(
    (key: string) => {
      const current = parseKeys(readSnapshot());
      const adding = !current.includes(key);
      writeKeys(adding ? [...current, key] : current.filter((k) => k !== key));
      if (!supabase || !userId) return;
      const request = adding
        ? supabase.from("follows").upsert({ team_key: key }, { onConflict: "user_id,team_key", ignoreDuplicates: true })
        : supabase.from("follows").delete().eq("team_key", key);
      request.then(({ error }) =>
        setSyncError(error ? "Couldn’t sync that change. It’s saved on this device." : null),
      );
    },
    [userId],
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
