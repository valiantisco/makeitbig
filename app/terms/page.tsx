import { Shell } from '@/components/Shell'

export const metadata = {
  title: 'Terms & Conditions | MakeItBig',
  description: 'Terms and conditions for MakeItBig.',
}

export default function TermsPage() {
  return (
    <main className="mib-legal">
      <Shell>
        <header className="mib-legal__head">
          <p className="mib-legal__kicker mib-p3">Legal</p>
          <h1 className="mib-legal__title mib-h1">Terms & Conditions</h1>
          <p className="mib-legal__sub mib-p1">
            These terms explain how orders, files, and fulfillment work when you use MakeItBig.
          </p>
          <p className="mib-legal__meta mib-p3">Last updated: April 19, 2026</p>
        </header>

        <section className="mib-legal__section" aria-labelledby="terms-orders">
          <h2 id="terms-orders" className="mib-legal__h2 mib-h2">Orders and production</h2>
          <p className="mib-legal__p mib-p2">
            By placing an order, you confirm you have the right to print the content you upload. We may contact you if a file
            needs adjustments for print quality or if something looks incorrect.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="terms-files">
          <h2 id="terms-files" className="mib-legal__h2 mib-h2">Files and print quality</h2>
          <p className="mib-legal__p mib-p2">
            Our on-site checks are guidance, not a guarantee. Final print results depend on source resolution, crop fit, color
            profiles, and viewing distance. If you are unsure, export a higher-resolution PNG/JPG or use a vector PDF.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="terms-shipping">
          <h2 id="terms-shipping" className="mib-legal__h2 mib-h2">Shipping timelines</h2>
          <p className="mib-legal__p mib-p2">
            Shipping and production timelines are estimates. Delays can happen due to carrier issues, holidays, or file
            approval needs.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="terms-returns">
          <h2 id="terms-returns" className="mib-legal__h2 mib-h2">Returns and reprints</h2>
          <p className="mib-legal__p mib-p2">
            Custom printed items are generally not returnable. If your banner arrives damaged or has a production defect,
            contact us and we will make it right.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="terms-liability">
          <h2 id="terms-liability" className="mib-legal__h2 mib-h2">Limitation of liability</h2>
          <p className="mib-legal__p mib-p2">
            To the maximum extent permitted by law, MakeItBig is not liable for indirect, incidental, or consequential damages.
            Our total liability for any claim is limited to the amount paid for the order at issue.
          </p>
        </section>

        <section className="mib-legal__section" aria-labelledby="terms-contact">
          <h2 id="terms-contact" className="mib-legal__h2 mib-h2">Contact</h2>
          <p className="mib-legal__p mib-p2">
            Questions? Email <a className="mib-legal__link" href="mailto:hello@makeitbig.com">hello@makeitbig.com</a>.
          </p>
        </section>
      </Shell>
    </main>
  )
}

