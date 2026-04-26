import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Terms of Service — Life Sentinel",
  description: "Terms and conditions for using Life Sentinel.",
};

const EFFECTIVE_DATE = "April 26, 2026";
const CONTACT_EMAIL = "support@lifesentinelfamily.com";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-stone-500 hover:text-amber-700 transition"
          >
            Privacy Policy →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:px-8">
        <div className="mb-10">
          <p className="text-xs text-stone-400 mb-2">Effective {EFFECTIVE_DATE}</p>
          <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            These Terms of Service govern your use of Life Sentinel. By creating an account or using the service, you agree to these terms. Please read them carefully.
          </p>
        </div>

        <div className="space-y-10">

          <Section title="1. About Life Sentinel">
            <p>Life Sentinel is a readiness and legacy planning platform designed to help veterans, active duty service members, and first responders organize important documents and information for their families. Life Sentinel is provided as a software service. For questions, contact <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a>.</p>
          </Section>

          <Section title="2. Eligibility">
            <Item>You must be at least 18 years old to use Life Sentinel</Item>
            <Item>You must provide accurate information during registration</Item>
            <Item>Accounts are approved manually — access is not automatic upon registration</Item>
            <Item>You may not create an account on behalf of another person without their authorization</Item>
          </Section>

          <Section title="3. Your Account">
            <Item>You are responsible for maintaining the security of your account credentials</Item>
            <Item>You are responsible for all activity that occurs under your account</Item>
            <Item>Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a> if you suspect unauthorized access</Item>
            <Item>We reserve the right to suspend or terminate accounts that violate these terms</Item>
          </Section>

          <Section title="4. Acceptable Use">
            <p className="mb-3">You agree not to use Life Sentinel to:</p>
            <Item>Upload or store illegal content of any kind</Item>
            <Item>Impersonate another person or entity</Item>
            <Item>Attempt to gain unauthorized access to other users' data</Item>
            <Item>Reverse-engineer, scrape, or otherwise extract data from the platform</Item>
            <Item>Use the service for commercial purposes without written authorization</Item>
            <Item>Interfere with or disrupt the security or integrity of the platform</Item>
          </Section>

          <Section title="5. Guardian Access">
            <p>When you create a guardian link and share it with another person, you are granting that person read-only access to the information categories you select. You are responsible for ensuring that you only share guardian links with individuals you trust. You can revoke guardian access at any time. Life Sentinel is not responsible for information accessed by guardians you have authorized.</p>
          </Section>

          <Section title="6. Not Legal or Financial Advice">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-3">
              <p className="text-sm font-semibold text-amber-900 mb-1">Important disclaimer</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                The Family Benefits Guide, readiness checklists, and all other content provided by Life Sentinel — including AI-generated analyses — are for informational purposes only. They do not constitute legal, financial, medical, or benefits advice. Benefit amounts, eligibility rules, and programs change over time and vary by individual circumstance.
              </p>
            </div>
            <p>Always verify benefit eligibility and application requirements with the VA (1-800-827-1000), SSA (1-800-772-1213), your state veterans affairs office, or a VA-accredited attorney or VSO before making decisions. Life Sentinel makes no guarantees about the accuracy, completeness, or timeliness of benefits information.</p>
          </Section>

          <Section title="7. Uploaded Content">
            <Item>You retain full ownership of all documents and files you upload to Life Sentinel</Item>
            <Item>By uploading content, you grant Life Sentinel a limited license to store and display it to you and your designated guardians</Item>
            <Item>You are responsible for ensuring you have the right to upload any content you store on the platform</Item>
            <Item>Do not upload content that is unlawful, threatening, or violates the privacy of others</Item>
          </Section>

          <Section title="8. Service Availability">
            <Item>Life Sentinel is provided on an "as is" and "as available" basis</Item>
            <Item>We do not guarantee uninterrupted or error-free service</Item>
            <Item>We may perform maintenance, updates, or modifications that temporarily affect availability</Item>
            <Item>We will make reasonable efforts to notify users of planned downtime</Item>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>To the fullest extent permitted by law, Life Sentinel shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service — including but not limited to loss of data, missed benefit claims, or reliance on AI-generated content. Our total liability for any claim shall not exceed the amount you paid for the service in the 12 months preceding the claim.</p>
          </Section>

          <Section title="10. Termination">
            <Item>You may delete your account at any time by contacting <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a></Item>
            <Item>We may suspend or terminate your account if you violate these terms</Item>
            <Item>Upon termination, your data will be deleted in accordance with our Privacy Policy</Item>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>We may update these Terms of Service from time to time. We will notify you of material changes via email. Continued use of Life Sentinel after changes take effect constitutes your acceptance of the updated terms.</p>
          </Section>

          <Section title="12. Governing Law">
            <p>These terms are governed by the laws of the Commonwealth of Virginia, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Virginia.</p>
          </Section>

          <Section title="13. Contact">
            <p>For questions about these terms, contact us at:<br />
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 underline hover:text-amber-700">{CONTACT_EMAIL}</a>
            </p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <span>© {new Date().getFullYear()} Life Sentinel. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-amber-700 transition">Privacy Policy</Link>
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

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
      <span>{children}</span>
    </li>
  );
}
