import { Shell } from '@/components/Shell'

export const metadata = {
  title: 'Privacy Policy | MakeItBig',
  description: 'Privacy policy for MakeItBig.',
}

export default function PrivacyPage() {
  return (
    <main className="mib-legal">
      <Shell>
        <header className="mib-legal__head">
          <p className="mib-legal__kicker mib-p3">Legal</p>
          <h1 className="mib-legal__title mib-h1">Privacy Policy</h1>
          <p className="mib-legal__sub mib-p1">
            This policy explains what we collect, why we collect it, and how we handle your files and personal data.
          </p>
          <p className="mib-legal__meta mib-p3">Last updated: April 19, 2026</p>
        </header>

        <section className="mib-legal__section" aria-labelledby="privacy-collect">
          <h2 id="privacy-collect" className="mib-legal__h2 mib-h2">What we collect</h2>
          <p className="mib-legal__p mib-p2">
            We collect information you provide when you contact us or place an order. This can include your name, email,
            shipping address, and order details. We also collect basic usage data to keep the site reliable and secure.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="privacy-files">
          <h2 id="privacy-files" className="mib-legal__h2 mib-h2">Your uploaded files</h2>
          <p className="mib-legal__p mib-p2">
            Your design files are used to generate previews, validate print readiness, and produce your banner. We do not sell
            your files. We keep them only as long as needed to fulfill and support your order.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="privacy-sharing">
          <h2 id="privacy-sharing" className="mib-legal__h2 mib-h2">Sharing</h2>
          <p className="mib-legal__p mib-p2">
            We share data with service providers only when needed to run the business, such as payment processing, hosting,
            analytics, and shipping. These providers are expected to protect your data.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="privacy-cookies">
          <h2 id="privacy-cookies" className="mib-legal__h2 mib-h2">Cookies</h2>
          <p className="mib-legal__p mib-p2">
            We may use cookies to keep the site working and to understand usage patterns. You can control cookies through your
            browser settings.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="privacy-choices">
          <h2 id="privacy-choices" className="mib-legal__h2 mib-h2">Your choices</h2>
          <p className="mib-legal__p mib-p2">
            You can request access, correction, or deletion of your personal information by emailing{' '}
            <a className="mib-legal__link" href="mailto:hello@makeitbig.com">hello@makeitbig.com</a>.
          </p>
        </section>
      </Shell>
    </main>
  )
}

