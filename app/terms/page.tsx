import { ContactLine } from "@/components/contact-line";
import { POLICY_UPDATED } from "@/lib/site";

export const metadata = { title: "Terms of use · Rally" };

export default function Page() {
  return (
    <article className="prose">
      <h1 className="cd">Terms of use</h1>
      <p className="note">Last updated {POLICY_UPDATED}</p>

      <p>By using Rally, you agree to these terms. If you don’t agree, please don’t use it.</p>

      <h2>What Rally is</h2>
      <p>
        Rally is an independent project that shows scores, schedules, standings and rosters for women’s sports. It’s free
        to use, and an account is optional.
      </p>

      <h2>Scores and data</h2>
      <p>
        Information comes from third-party sources and may be delayed, incomplete or wrong. Don’t rely on Rally for
        anything important. Rally isn’t affiliated with, endorsed by or sponsored by ESPN or any league, team, school or
        player shown in it.
      </p>

      <h2>Trademarks</h2>
      <p>
        Team names, logos and league names belong to their owners. They appear in Rally only to identify the teams and
        competitions being reported on.
      </p>

      <h2>Your account</h2>
      <p>
        You’re responsible for the email address you sign in with. You can delete your account at any time from the
        Account page. Please don’t try to break, overload or misuse Rally or its sign-in system.
      </p>

      <h2>No betting</h2>
      <p>Rally doesn’t offer or promote gambling of any kind.</p>

      <h2>No guarantees</h2>
      <p>
        Rally is provided as is, without promises that it will always be available or error-free. To the fullest extent
        the law allows, we aren’t liable for losses that come from using it.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. If we do, we’ll change the date at the top. Continuing to use Rally means you accept the update.</p>

      <h2>Contact</h2>
      <p>
        Questions: <ContactLine />.
      </p>
    </article>
  );
}
