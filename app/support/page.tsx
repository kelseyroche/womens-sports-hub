import { ContactLine } from "@/components/contact-line";

export const metadata = { title: "Support · Rally" };

export default function Page() {
  return (
    <article className="prose">
      <h1 className="cd">Support</h1>
      <p>Something not working, or have a suggestion? Email <ContactLine />.</p>

      <h2>Common questions</h2>

      <h3>Do I need an account?</h3>
      <p>
        No. Scores, schedules, teams and players all work without one. An account only keeps the teams you follow in sync
        across your devices.
      </p>

      <h3>I didn’t get my sign-in email.</h3>
      <p>
        Check your spam folder, and make sure you typed the address correctly. Links and codes expire after a short time,
        so request a new one if it’s been a while.
      </p>

      <h3>How do I delete my account?</h3>
      <p>
        Open the Account page (on the website or in the app) while signed in, and choose Delete account. This removes your
        email address and followed teams from our database.
      </p>

      <h3>A score looks wrong or late.</h3>
      <p>
        Scores come from a third-party source and can lag the real game by a few minutes. Pull down to refresh in the
        app, or reload the page.
      </p>

      <h3>Why can’t I see a roster for a national team?</h3>
      <p>Our data source doesn’t publish rosters for national teams.</p>

      <p>
        <a href="/privacy">Privacy policy</a> · <a href="/terms">Terms of use</a>
      </p>
    </article>
  );
}
