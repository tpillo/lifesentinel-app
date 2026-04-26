import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Privacy Policy — Life Sentinel",
  description: "How Life Sentinel collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "April 26, 2026";
const CONTACT_EMAIL = "support@lifesentinelfamily.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <Link
            href="/terms"
            className="text-sm text-stone-500 hover:text-amber-700 transition"
          >
            Terms of Service →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:px-8">
        <div className="mb-10">
          <p className="text-xs text-stone-400 mb-2">Effective {EFFECTIVE_DATE}</p>
          <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Life Sentinel is built for veterans, active duty service members, and first responders who need a trustworthy place to organize sensitive information for their families. We take that trust seriously. This policy explains exactly what we collect, how we use it, and what rights you have over your data.
          </p>
        </div>

        <div className="space-y-10">

          <Section title="1. Who We Are">
            <p>Life Sentinel is operated as a private software service. For privacy matters, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a>.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="mb-3">We collect only what is necessary to provide the service:</p>
            <SubSection title="Account Information">
              <Item>Email address and encrypted password (used for authentication)</Item>
              <Item>Name, date of birth, and marital status (entered during profile setup)</Item>
              <Item>State of residence</Item>
            </SubSection>
            <SubSection title="Military & Service Information">
              <Item>Branch of service, service status, and years of service</Item>
              <Item>VA disability rating and P&amp;T designation</Item>
              <Item>Retirement type and SBP/RCSBP election status</Item>
              <Item>Cause of death (service-connected status) — only if entered by you</Item>
            </SubSection>
            <SubSection title="Documents & Vault Files">
              <Item>Files you upload to the secure document vault (stored encrypted at rest)</Item>
              <Item>Readiness checklist completion status and notes you add to items</Item>
            </SubSection>
            <SubSection title="Guardian Access">
              <Item>Tokens you generate for designated guardians — these are time-limited and revocable</Item>
              <Item>No guardian account is required; access is token-based only</Item>
            </SubSection>
            <SubSection title="Usage Data">
              <Item>Anonymous analytics via Google Analytics (page views, feature usage — no personal identifiers)</Item>
              <Item>Server logs retained for up to 30 days for security and debugging</Item>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <Item>To provide the readiness checklist, document vault, benefits guide, and guardian sharing features</Item>
            <Item>To personalize your Family Benefits Guide based on your service history and profile</Item>
            <Item>To send account-related emails (registration confirmation, approval notifications) via Resend</Item>
            <Item>To improve the service through aggregated, anonymized usage patterns</Item>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed font-medium">We do not sell your data. We do not share your personal information with third parties for marketing purposes.</p>
          </Section>

          <Section title="4. How We Store and Protect Your Data">
            <Item>All data is stored in a secured PostgreSQL database hosted by Supabase, with row-level security enforced — meaning each user can only access their own records</Item>
            <Item>Uploaded documents are stored in encrypted object storage</Item>
            <Item>All data is transmitted over HTTPS/TLS</Item>
            <Item>Authentication is managed by Supabase Auth with industry-standard password hashing</Item>
            <Item>Guardian tokens are cryptographically generated and expire automatically</Item>
            <Item>We do not store payment information — no payment processing occurs on this platform at this time</Item>
          </Section>

          <Section title="5. Third-Party Services">
            <p className="mb-3">We use the following third-party services to operate Life Sentinel:</p>
            <Item><strong>Supabase</strong> — database, authentication, and file storage (supabase.com/privacy)</Item>
            <Item><strong>Anthropic Claude API</strong> — powers the AI-generated benefits analysis; your profile data is sent to generate the report and is not retained by Anthropic for training</Item>
            <Item><strong>Resend</strong> — transactional email delivery (resend.com/legal/privacy-policy)</Item>
            <Item><strong>Google Analytics</strong> — anonymized usage analytics; no personal data is transmitted (policies.google.com/privacy)</Item>
            <Item><strong>Vercel / Netlify</strong> — application hosting; server-side request logs may be retained per their policies</Item>
          </Section>

          <Section title="6. Guardian Access">
            <p>When you create a guardian link, you choose who receives it, what categories they can view, and how long it remains active. Guardians can view your readiness status, documents, and benefits information — but cannot modify or delete anything. You can revoke access at any time from your Guardian dashboard. Guardian tokens expire automatically and are single-use per session.</p>
          </Section>

          <Section title="7. Data Retention">
            <Item>Your account data is retained for as long as your account is active</Item>
            <Item>If you delete your account, your profile, readiness data, and uploaded files are permanently deleted within 30 days</Item>
            <Item>Anonymous analytics data may be retained longer in aggregated form</Item>
            <Item>Server logs are purged within 30 days</Item>
          </Section>

          <Section title="8. Your Rights">
            <p className="mb-3">You have the right to:</p>
            <Item><strong>Access</strong> — request a copy of all personal data we hold about you</Item>
            <Item><strong>Correction</strong> — update your profile information at any time via Profile Setup</Item>
            <Item><strong>Deletion</strong> — request full deletion of your account and all associated data</Item>
            <Item><strong>Portability</strong> — request an export of your data in a machine-readable format</Item>
            <p className="mt-3">To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Life Sentinel is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a> and we will delete it promptly.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top of this page. For material changes, we will notify you by email. Continued use of Life Sentinel after a policy change constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="11. Contact">
            <p>For privacy questions, data requests, or concerns, contact us at:<br />
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a>
            </p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <span>© {new Date().getFullYear()} Life Sentinel. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-amber-700 transition">Terms of Service</Link>
            <Link href="/" className="hover:text-amber-700 transition">Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg font-semibold text-stone-900 mb-3 pb-2 border-b border-stone-100">{title}</h2>
      <div className="text-sm text-stone-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="font-semibold text-stone-700 mb-1.5">{title}</p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
      <span>{children}</span>
    </li>
  );
}
