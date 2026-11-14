"use client";

import { useState } from "react";
import { useFollow } from "./follow";

export function AccountPanel({ showUnavailable = false }: { showUnavailable?: boolean }) {
  const { syncAvailable, user, syncError, signInWithEmail, signOut, deleteAccount } = useFollow();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!syncAvailable) {
    return showUnavailable ? (
      <p className="note">Accounts aren’t turned on for this site yet. Your teams are saved on this device.</p>
    ) : null;
  }

  if (user) {
    return (
      <section className="account">
        <h2 className="cd label">Account</h2>
        <p className="note">
          Signed in as {user.email}. Your teams sync across your devices.
        </p>
        {syncError && <p className="account-error">{syncError}</p>}
        <div className="btnrow">
          <button className="btn ghost" onClick={() => signOut()}>
            Sign out
          </button>
          {confirmingDelete ? (
            <button
              className="btn"
              onClick={async () => {
                const message = await deleteAccount();
                if (message) setError(message);
                setConfirmingDelete(false);
              }}
            >
              Delete account and followed teams
            </button>
          ) : (
            <button className="btn ghost" onClick={() => setConfirmingDelete(true)}>
              Delete account
            </button>
          )}
        </div>
        {error && <p className="account-error">{error}</p>}
      </section>
    );
  }

  return (
    <section className="account">
      <h2 className="cd label">Sync your teams</h2>
      <p className="note">Sign in with your email to keep your teams on every device. No password.</p>
      {status === "sent" ? (
        <p className="account-sent">Check {email} for your sign-in link.</p>
      ) : (
        <form
          className="account-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus("sending");
            setError(null);
            const message = await signInWithEmail(email.trim());
            if (message) {
              setError(message);
              setStatus("idle");
            } else {
              setStatus("sent");
            }
          }}
        >
          <input
            className="search"
            type="email"
            required
            aria-label="Email address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending" : "Email me a sign-in link"}
          </button>
        </form>
      )}
      {error && <p className="account-error">{error}</p>}
    </section>
  );
}
