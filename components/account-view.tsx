"use client";

import Link from "next/link";
import { AccountPanel } from "./account-panel";
import { useFollow } from "./follow";

export function AccountView() {
  const { followed, user, syncAvailable } = useFollow();
  const count = followed.size;
  return (
    <>
      <div className="head">
        <h1 className="cd" style={{ fontSize: "clamp(88px, 17vw, 170px)" }}>
          Account
        </h1>
        <p className="summary">
          {syncAvailable
            ? "Sign in to keep your teams on every device. You don't need an account to use Rally."
            : "You don't need an account to use Rally."}
        </p>
      </div>
      <div className="account-page">
        <AccountPanel showUnavailable />
        <section className="account">
          <h2 className="cd label">Your teams</h2>
          <p className="note">
            {count === 0
              ? "You aren't following any teams yet."
              : `${count} ${count === 1 ? "team" : "teams"} followed${user ? ", synced to your account" : ", saved on this device"}.`}{" "}
            <Link href="/following">{count === 0 ? "Pick teams" : "Change teams"}</Link>
          </p>
        </section>
      </div>
    </>
  );
}
