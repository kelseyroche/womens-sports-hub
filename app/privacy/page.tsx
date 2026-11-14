import { ContactLine } from "@/components/contact-line";
import { POLICY_UPDATED } from "@/lib/site";

export const metadata = { title: "Privacy policy · Rally" };

export default function Page() {
  return (
    <article className="prose">
      <h1 className="cd">Privacy policy</h1>
      <p className="note">Last updated {POLICY_UPDATED}</p>

      <p>
        Rally shows scores, schedules and rosters for women’s sports. You can use all of it without an account. This page
        explains what we collect if you choose to sign in, and what stays on your device.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your email address,</strong> only if you sign in. We use it to send you a sign-in link or code.
        </li>
        <li>
          <strong>The teams you follow,</strong> so they appear on your other devices. Without an account, your followed
          teams are saved only on your own device.
        </li>
        <li>
          <strong>Sign-in session information,</strong> so you stay signed in.
        </li>
      </ul>
      <p>
        We don’t collect your name, location, contacts, photos or payment details. We don’t use advertising or tracking
        tools, and we don’t build a profile of you.
      </p>

      <h2>How we use it</h2>
      <p>
        Only to run Rally: signing you in, and keeping your followed teams in sync. We don’t sell your information, and we
        don’t share it for advertising.
      </p>

      <h2>Who handles it for us</h2>
      <ul>
        <li>
          <strong>Supabase</strong> stores accounts and followed teams in a database hosted in the United States.
        </li>
        <li>
          <strong>Vercel</strong> hosts the website and may keep standard server logs, such as visit times and IP
          addresses.
        </li>
        <li>An email delivery service sends your sign-in messages.</li>
        <li>
          <strong>ESPN</strong> is the source of scores, schedules and team information. Your account details are never
          sent to ESPN.
        </li>
      </ul>

      <h2>Keeping and deleting your data</h2>
      <p>
        We keep your account until you delete it. You can delete your account at any time from the Account page on the
        website or in the app. That removes your email address and your followed teams from our database. Teams saved on
        your own device stay there until you clear them.
      </p>

      <h2>Children</h2>
      <p>Rally isn’t directed at children under 13, and we don’t knowingly collect their information.</p>

      <h2>No betting</h2>
      <p>Rally never shows betting odds, links to betting sites, or gambling advertising.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we’ll update the date at the top of this page.</p>

      <h2>Contact</h2>
      <p>
        Questions or requests about your data: <ContactLine />.
      </p>
    </article>
  );
}
