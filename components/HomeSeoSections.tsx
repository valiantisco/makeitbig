import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { homeSeoLinkGroups } from '@/lib/marketing-content'

const HUB_GROUPS = [
  {
    eyebrow: 'Popular sizes',
    title: 'Find the right fit',
    links: homeSeoLinkGroups.sizes,
  },
  {
    eyebrow: 'File help',
    title: 'Check before you print',
    links: homeSeoLinkGroups.trust,
  },
  {
    eyebrow: 'Use cases',
    title: 'Shop by banner job',
    links: homeSeoLinkGroups.uses,
  },
  {
    eyebrow: 'Resources',
    title: 'Answer the hard questions',
    links: homeSeoLinkGroups.resources,
  },
] as const

export function HomeSeoSections() {
  return (
    <section className="mib-homeSeo">
      <Shell>
        <section className="mib-homeHub">
          <div className="mib-homeHub__head">
            <div>
              <p className="mib-homeSeo__eyebrow">Explore faster</p>
              <h2 className="mib-homeHub__title mib-h2">Jump straight to the banner page that helps you decide.</h2>
            </div>
            <div className="mib-homeHub__actions">
              <Link href="/vinyl-banners" className="mib-btn mib-btn--light">
                <span>See Banner Sizes</span>
              </Link>
              <Link href="/file-guidelines" className="mib-btn mib-btn--accent">
                <span>Check Your File</span>
              </Link>
            </div>
          </div>

          <div className="mib-homeHub__grid">
            {HUB_GROUPS.map((group, index) => {
              const headingId = `home-hub-${index}`

              return (
                <section key={group.title} className="mib-homeHub__card" aria-labelledby={headingId}>
                  <p className="mib-homeHub__eyebrow">{group.eyebrow}</p>
                  <h3 id={headingId} className="mib-h3">
                    {group.title}
                  </h3>
                  <div className="mib-homeHub__links">
                    {group.links.map((link) => (
                      <Link key={link.href} href={link.href} className="mib-homeHub__link">
                        <span className="mib-homeHub__linkLabel">{link.label}</span>
                        <span className="mib-p3">{link.description}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </section>
      </Shell>
    </section>
  )
}
