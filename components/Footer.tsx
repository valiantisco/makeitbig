import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'
import { Shell } from '@/components/Shell'

const FOOTER_LINKS = {
  product: [
    { href: '/vinyl-banners', label: 'Vinyl banners' },
    { href: '/36x72-banner', label: '3 x 6 banners' },
    { href: '/48x96-banner', label: '4 x 8 banners' },
    { href: '/order', label: 'Order' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/file-guidelines', label: 'File guidelines' },
    { href: '/shipping-returns', label: 'Shipping & returns' },
  ],
  resources: [
    { href: '/resources', label: 'Resources' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/business-banners', label: 'Business banners' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: 'mailto:hello@makeitbig.com', label: 'hello@makeitbig.com' },
  ],
  legal: [
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
} as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mib-footer" aria-label="Footer">
      <Shell>
        <div className="mib-footer__grid">
          <div className="mib-footer__brand">
            <BrandLogo className="mib-footer__logo" width={160} height={49} href="/" aria-label="MakeItBig home" inverted />
            <p className="mib-footer__tagline mib-p2">
              The fastest way to turn your file into something impossible to ignore.
            </p>
          </div>

          <div className="mib-footer__col" aria-label="Product links">
            <p className="mib-footer__colTitle mib-p3">Product</p>
            <nav className="mib-footer__links">
              {FOOTER_LINKS.product.map((item) => (
                <Link key={item.href} href={item.href} className="mib-footer__link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mib-footer__col" aria-label="Support links">
            <p className="mib-footer__colTitle mib-p3">Support</p>
            <nav className="mib-footer__links">
              {FOOTER_LINKS.support.map((item) => (
                <Link key={item.href} href={item.href} className="mib-footer__link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mib-footer__col" aria-label="Resource links">
            <p className="mib-footer__colTitle mib-p3">Resources</p>
            <nav className="mib-footer__links">
              {FOOTER_LINKS.resources.map((item) => (
                <Link key={item.href} href={item.href} className="mib-footer__link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mib-footer__col" aria-label="Company links">
            <p className="mib-footer__colTitle mib-p3">Company</p>
            <nav className="mib-footer__links">
              {FOOTER_LINKS.company.map((item) => (
                <Link key={item.href} href={item.href} className="mib-footer__link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mib-footer__col" aria-label="Legal links">
            <p className="mib-footer__colTitle mib-p3">Legal</p>
            <nav className="mib-footer__links">
              {FOOTER_LINKS.legal.map((item) => (
                <Link key={item.href} href={item.href} className="mib-footer__link">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mib-footer__meta">
              <p className="mib-footer__metaItem mib-p3">Printed in the USA</p>
              <p className="mib-footer__metaItem mib-p3">Ships in 3-5 days</p>
            </div>
          </div>
        </div>

        <div className="mib-footer__bottom">
          <p className="mib-footer__copy mib-p3">(c) {year} MakeItBig. All rights reserved.</p>
          <div className="mib-footer__bottomLinks" aria-label="Footer legal shortcuts">
            <Link href="/terms" className="mib-footer__bottomLink">Terms</Link>
            <span className="mib-footer__dot" aria-hidden="true" />
            <Link href="/privacy" className="mib-footer__bottomLink">Privacy</Link>
          </div>
        </div>
      </Shell>
    </footer>
  )
}
