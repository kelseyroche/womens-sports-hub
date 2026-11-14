import { CONTACT_EMAIL } from "@/lib/site";

export function ContactLine() {
  if (!CONTACT_EMAIL) return <span>our contact address, which is being added before launch</span>;
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}
