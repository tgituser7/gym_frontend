function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-800 mb-0.5">{title}</p>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyContent() {
  return (
    <div className="space-y-4">
      <Section title="1. Information We Collect">
        <p>When you register and use Fitark, we collect:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Account details: gym name, email address, phone, and address.</li>
          <li>Member data you enter on behalf of your gym members.</li>
          <li>Usage data such as login timestamps and feature interactions.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use the information collected to:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Provide, maintain, and improve the Fitark platform.</li>
          <li>Send important account and service notifications.</li>
          <li>Respond to support requests.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </Section>

      <Section title="3. Data Storage &amp; Security">
        Your data is stored on secure servers. We implement industry-standard technical and
        organisational measures to protect it against unauthorised access, loss, or disclosure.
        No method of transmission over the internet is 100% secure, and we cannot guarantee
        absolute security.
      </Section>

      <Section title="4. Data Sharing">
        We do not sell or rent your data to third parties. We may share data with trusted service
        providers (e.g. cloud hosting, payment processors) who assist in operating the platform,
        strictly under confidentiality agreements. We may also disclose data when required by law.
      </Section>

      <Section title="5. Member Data Responsibility">
        As a gym operator, you are the data controller for your members' personal information.
        You are responsible for ensuring you have the appropriate consent and legal basis to
        collect and process member data using Fitark.
      </Section>

      <Section title="6. Cookies">
        Fitark uses session cookies to keep you logged in. We do not use third-party advertising
        or tracking cookies.
      </Section>

      <Section title="7. Data Retention">
        We retain your account data for as long as your account is active. Upon account deletion,
        data is removed within 30 days, except where retention is required by law.
      </Section>

      <Section title="8. Your Rights">
        You have the right to access, correct, or delete your personal data. To exercise these
        rights, contact us at <span className="text-orange-500">hello.flexms@gmail.com</span>.
      </Section>

      <Section title="9. Changes to This Policy">
        We may update this Privacy Policy periodically. We will notify registered users of
        material changes via email or an in-app notice.
      </Section>

      <Section title="10. Contact">
        For any privacy-related queries, reach us at{' '}
        <span className="text-orange-500">hello.flexms@gmail.com</span>.
      </Section>
    </div>
  );
}
