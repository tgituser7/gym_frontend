import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-800 mb-0.5">{title}</p>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}

export default function TermsContent() {
  return (
    <div className="space-y-4">
      <Section title="1. Acceptance of Terms">
        By registering and using Fitark, you agree to be bound by these Terms &amp; Conditions.
        If you do not agree, please do not use the platform.
      </Section>

      <Section title="2. Use of the Platform">
        <p>Fitark is a gym management platform intended for legitimate business use. You agree to:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Provide accurate and up-to-date information during registration.</li>
          <li>Keep your account credentials secure and not share them with unauthorised parties.</li>
          <li>Use the platform only for lawful purposes in compliance with applicable laws.</li>
          <li>Not attempt to reverse-engineer, copy, or exploit any part of the platform.</li>
        </ul>
      </Section>

      <Section title="3. Account Responsibility">
        You are solely responsible for all activity that occurs under your account. Notify us
        immediately at <span className="text-orange-500">hello.flexms@gmail.com</span> if you suspect
        unauthorised access.
      </Section>

      <Section title="4. Data &amp; Privacy">
        Your use of member data collected through Fitark is subject to our{' '}
        <Link href="/privacy" className="text-orange-500 hover:text-orange-600 font-medium underline">
          Privacy Policy
        </Link>
        . You are responsible for obtaining any consents required from your members under applicable
        data protection laws.
      </Section>

      <Section title="5. Payments &amp; Billing">
        Subscription fees are billed as per our standard pricing or as mutually agreed during
        business discussions or meetings. Any custom pricing agreed upon will be documented in
        writing. All fees are non-refundable unless otherwise stated in writing. We reserve the
        right to suspend accounts with overdue payments.
      </Section>

      <Section title="6. Intellectual Property">
        All content, branding, and software within Fitark remain the intellectual property of
        Fitark. You may not reproduce or redistribute them without prior written consent.
      </Section>

      <Section title="7. Limitation of Liability">
        Fitark is provided "as is". To the fullest extent permitted by law, we are not liable for
        any indirect, incidental, or consequential damages arising from your use of the platform.
      </Section>

      <Section title="8. Termination">
        We reserve the right to suspend or terminate accounts that violate these terms, with or
        without notice.
      </Section>

      <Section title="9. Changes to Terms">
        We may update these terms from time to time. Continued use of the platform after changes
        constitutes acceptance of the revised terms.
      </Section>

      <Section title="10. Contact">
        For questions about these terms, contact us at{' '}
        <span className="text-orange-500">hello.flexms@gmail.com</span>.
      </Section>
    </div>
  );
}
