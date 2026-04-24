import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Shell } from "@/components/Shell";

const NAV_LINKS = [
  { href: "/vinyl-banners", label: "Vinyl banners" },
  { href: "/file-guidelines", label: "File help" },
  { href: "/resources", label: "Resources" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingHeader() {
  return (
    <header className="mib-marketingNav">
      <Shell className="mib-marketingNav__inner">
        <BrandLogo width={152} height={47} className="mib-marketingNav__logo" />

        <nav className="mib-marketingNav__links" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="mib-marketingNav__link">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="mib-marketingNav__cta">
          Start Your Banner
        </Link>
      </Shell>
    </header>
  );
}
