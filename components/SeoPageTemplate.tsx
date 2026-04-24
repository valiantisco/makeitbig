import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SectionArtwork } from "@/components/SectionArtwork";
import { Shell } from "@/components/Shell";
import { VisualCard } from "@/components/VisualCard";
import type {
  ContentSection,
  LinkCard,
  MarketingPageData,
  ResourceArticleData,
} from "@/lib/marketing-content";
import {
  getMarketingPageImageSlots,
  getResourcePageImageSlots,
} from "@/src/content/siteImages";

const GLOBAL_RELATED_LINKS: LinkCard[] = [
  {
    href: "/vinyl-banners",
    label: "Custom vinyl banners",
    description: "Return to the main product page for banner printing online.",
  },
  {
    href: "/file-guidelines",
    label: "File guidelines",
    description: "Use export, crop, and resolution guidance before you order.",
  },
  {
    href: "/resources",
    label: "Banner resources",
    description: "See banner guides for sizing, design, and image quality decisions.",
  },
  {
    href: "/faq",
    label: "Banner printing FAQ",
    description: "Quick answers on file setup, sizing, and ordering.",
  },
];

function dedupeLinks(links: LinkCard[], currentPath: string) {
  const seen = new Set<string>();

  return links.filter((link) => {
    if (link.href === currentPath) return false;
    const key = `${link.href}::${link.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getExpandedLinks(page: Pick<MarketingPageData | ResourceArticleData, "path" | "relatedLinks">) {
  return dedupeLinks([...page.relatedLinks, ...GLOBAL_RELATED_LINKS], page.path);
}

function getFitSection(page: MarketingPageData) {
  if (page.fitSection) return page.fitSection;

  return {
    title: "Is this right for you?",
    intro: "Use this page when you want banner guidance tied to the actual buying decision, not just a generic product overview.",
    cards: page.heroCards,
  };
}

function getQualitySection(page: MarketingPageData) {
  if (page.qualitySection) return page.qualitySection;
  if (page.category !== "size" && page.slug !== "vinyl-banners") return null;

  return {
    title: "Print quality for this size",
    intro: "The final result depends on the source file, the amount of detail in the artwork, and how close people will stand to the banner.",
    cards: [
      {
        title: "Sharp source files matter first",
        body: "Original exports and vector artwork give you more room to print large cleanly.",
      },
      {
        title: "Small text shows weakness early",
        body: "If the design relies on tiny details, use a stronger file or simplify the layout before printing.",
      },
      {
        title: "Preview before ordering",
        body: "Checking crop and orientation early is the fastest way to avoid a banner that feels soft or cramped.",
      },
    ],
  };
}

function SectionRenderer({ section }: { section: ContentSection }) {
  if (section.kind === "cards") {
    return (
      <section className="mib-seoSection mib-seoSection--cards">
        <div className="mib-seoSection__heading">
          <h2 className="mib-h2">{section.title}</h2>
          {section.intro && <p className="mib-p2">{section.intro}</p>}
        </div>
        <div className="mib-seoCardGrid">
          {section.cards.map((card) => (
            <article key={card.title} className="mib-seoCard">
              <h3 className="mib-h3">{card.title}</h3>
              <p className="mib-p2">{card.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.kind === "body") {
    return (
      <section className="mib-seoSection mib-seoSection--body">
        <div className="mib-seoSection__heading">
          <h2 className="mib-h2">{section.title}</h2>
        </div>
        <div className="mib-seoCopy">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mib-p2">
              {paragraph}
            </p>
          ))}
          {section.callout && <p className="mib-seoCallout mib-p2">{section.callout}</p>}
        </div>
        {section.links && <LinkGrid title="Related banner resources" links={section.links} />}
      </section>
    );
  }

  if (section.kind === "checklist") {
    return (
      <section className="mib-seoSection mib-seoSection--checklist">
        <div className="mib-seoChecklist">
          <div className="mib-seoSection__heading">
            <h2 className="mib-h2">{section.title}</h2>
            {section.intro && <p className="mib-p2">{section.intro}</p>}
          </div>
          <ul className="mib-seoChecklist__list">
            {section.items.map((item) => (
              <li key={item} className="mib-seoChecklist__item">
                <span className="mib-seoChecklist__dot" aria-hidden="true" />
                <span className="mib-p2">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {(section.asideTitle || section.asideBody) && (
          <aside className="mib-seoAside">
            {section.asideTitle && <p className="mib-seoAside__eyebrow">{section.asideTitle}</p>}
            {section.asideBody && <p className="mib-p2">{section.asideBody}</p>}
          </aside>
        )}
      </section>
    );
  }

  if (section.kind === "steps") {
    return (
      <section className="mib-seoSection mib-seoSection--steps">
        <div className="mib-seoSection__heading">
          <h2 className="mib-h2">{section.title}</h2>
          {section.intro && <p className="mib-p2">{section.intro}</p>}
        </div>
        <div className="mib-seoStepGrid">
          {section.steps.map((step, index) => (
            <article key={step.title} className="mib-seoStep">
              <span className="mib-seoStep__number">{`0${index + 1}`}</span>
              <h3 className="mib-h3">{step.title}</h3>
              <p className="mib-p2">{step.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mib-seoSection mib-seoSection--compare">
      <div className="mib-seoSection__heading">
        <h2 className="mib-h2">{section.title}</h2>
        {section.intro && <p className="mib-p2">{section.intro}</p>}
      </div>
      <div className="mib-seoCompareGrid">
        <article className="mib-seoCompareCard">
          <h3 className="mib-h3">{section.leftTitle}</h3>
          <ul className="mib-seoCompareCard__list">
            {section.leftItems.map((item) => (
              <li key={item} className="mib-p2">
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className="mib-seoCompareCard">
          <h3 className="mib-h3">{section.rightTitle}</h3>
          <ul className="mib-seoCompareCard__list">
            {section.rightItems.map((item) => (
              <li key={item} className="mib-p2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function LinkGrid({ title, links }: { title: string; links: LinkCard[] }) {
  return (
    <section className="mib-seoLinks">
      <div className="mib-seoSection__heading">
        <h2 className="mib-h2">{title}</h2>
      </div>
      <div className="mib-seoLinkGrid">
        {links.map((link) => (
          <Link key={`${link.href}-${link.label}`} href={link.href} className="mib-seoLinkCard">
            <span className="mib-seoLinkCard__label">{link.label}</span>
            <span className="mib-p2">{link.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FaqGrid({
  title,
  items,
}: {
  title: string;
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <section className="mib-seoSection mib-seoSection--faq">
      <div className="mib-seoSection__heading">
        <h2 className="mib-h2">{title}</h2>
      </div>
      <div className="mib-seoFaqGrid">
        {items.map((item) => (
          <article key={item.question} className="mib-seoFaqCard">
            <h3 className="mib-h3">{item.question}</h3>
            <p className="mib-p2">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PageCta({
  title,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: MarketingPageData["cta"]) {
  return (
    <section className="mib-seoCta">
      <div className="mib-seoCta__content">
        <p className="mib-seoHero__eyebrow">Ready to print</p>
        <h2 className="mib-h2">{title}</h2>
        <p className="mib-p1">{body}</p>
      </div>
      <div className="mib-seoCta__actions">
        <Link href={primaryHref} className="mib-btn mib-btn--accent">
          <span>{primaryLabel}</span>
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref} className="mib-btn mib-btn--light">
            <span>{secondaryLabel}</span>
          </Link>
        )}
      </div>
    </section>
  );
}

export function MarketingPageTemplate({ page }: { page: MarketingPageData }) {
  const fitSection = getFitSection(page);
  const qualitySection = getQualitySection(page);
  const expandedLinks = getExpandedLinks(page);
  const imageSlots = getMarketingPageImageSlots(page.slug);

  return (
    <>
      <MarketingHeader />
      <main className="mib-seoPage">
        <section className="mib-seoHero">
          <Shell className="mib-seoHero__shell">
            <div className="mib-seoHero__copy">
              <p className="mib-seoHero__eyebrow">{page.eyebrow}</p>
              <h1 className="mib-h1">{page.h1}</h1>
              <p className="mib-p1">{page.intro}</p>
              {page.supportingIntro && <p className="mib-p2">{page.supportingIntro}</p>}
              <div className="mib-seoHero__actions">
                <Link href={page.cta.primaryHref} className="mib-btn mib-btn--accent">
                  <span>{page.cta.primaryLabel}</span>
                </Link>
                {page.cta.secondaryLabel && page.cta.secondaryHref && (
                  <Link href={page.cta.secondaryHref} className="mib-btn mib-btn--light">
                    <span>{page.cta.secondaryLabel}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="mib-seoHero__panel">
              {imageSlots?.hero && (
                <VisualCard className="mib-seoHero__visualCard">
                  <SectionArtwork
                    imageKey={imageSlots.hero}
                    className="mib-seoHero__artwork"
                    sizes="(min-width: 1280px) 420px, (min-width: 900px) 34vw, 100vw"
                  />
                </VisualCard>
              )}

              <div className="mib-seoFactGrid">
                {page.heroFacts.map((fact) => (
                  <article key={fact.title} className="mib-seoFactCard">
                    <p className="mib-seoFactCard__label">{fact.title}</p>
                    <p className="mib-h3">{fact.body}</p>
                  </article>
                ))}
              </div>
              <div className="mib-seoHeroCards">
                {page.heroCards.map((card) => (
                  <article key={card.title} className="mib-seoHeroCard">
                    <h3 className="mib-h3">{card.title}</h3>
                    <p className="mib-p2">{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </Shell>
        </section>

        <Shell className="mib-seoContent">
          <section className="mib-seoSection mib-seoSection--cards">
            <div className="mib-seoSection__heading">
              <h2 className="mib-h2">{fitSection.title}</h2>
              {fitSection.intro && <p className="mib-p2">{fitSection.intro}</p>}
            </div>
            <div className="mib-seoCardGrid">
              {fitSection.cards.map((card) => (
                <article key={`${page.slug}-fit-${card.title}`} className="mib-seoCard">
                  <h3 className="mib-h3">{card.title}</h3>
                  <p className="mib-p2">{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          {qualitySection && (
            <section className="mib-seoSection mib-seoSection--cards">
              <div className="mib-seoSection__heading">
                <h2 className="mib-h2">{qualitySection.title}</h2>
                {qualitySection.intro && <p className="mib-p2">{qualitySection.intro}</p>}
              </div>
              <div className="mib-seoCardGrid">
                {qualitySection.cards.map((card) => (
                  <article key={`${page.slug}-quality-${card.title}`} className="mib-seoCard">
                    <h3 className="mib-h3">{card.title}</h3>
                    <p className="mib-p2">{card.body}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {imageSlots?.section && (
            <VisualCard className="mib-seoSectionVisual">
              <SectionArtwork
                imageKey={imageSlots.section}
                className="mib-seoSectionVisual__artwork"
                sizes="(min-width: 1280px) 960px, 100vw"
              />
            </VisualCard>
          )}

          {page.sections.map((section) => (
            <SectionRenderer key={`${page.slug}-${section.title}`} section={section} />
          ))}

          {page.faqs && <FaqGrid title="Frequently asked questions" items={page.faqs} />}

          <LinkGrid title="Related pages and resources" links={expandedLinks} />
          <PageCta {...page.cta} />
        </Shell>
      </main>
    </>
  );
}

export function ResourceArticleTemplate({ article }: { article: ResourceArticleData }) {
  const expandedLinks = getExpandedLinks(article);
  const imageSlots = getResourcePageImageSlots(article.slug);

  return (
    <>
      <MarketingHeader />
      <main className="mib-seoPage mib-seoPage--resource">
        <section className="mib-seoHero mib-seoHero--resource">
          <Shell className="mib-seoHero__shell">
            <div className="mib-seoHero__copy">
              <p className="mib-seoHero__eyebrow">{article.eyebrow}</p>
              <h1 className="mib-h1">{article.h1}</h1>
              <p className="mib-p1">{article.intro}</p>
            </div>
            <div className="mib-seoHero__panel">
              {imageSlots?.hero && (
                <VisualCard className="mib-seoHero__visualCard">
                  <SectionArtwork
                    imageKey={imageSlots.hero}
                    className="mib-seoHero__artwork"
                    sizes="(min-width: 1280px) 420px, (min-width: 900px) 34vw, 100vw"
                  />
                </VisualCard>
              )}
              <div className="mib-seoArticleMeta">
                <span>{article.readTime}</span>
                <span>Helpful before ordering</span>
                <span>Built around banner decisions</span>
              </div>
            </div>
          </Shell>
        </section>

        <Shell className="mib-seoContent">
          <section className="mib-seoSection mib-seoSection--cards">
            <div className="mib-seoSection__heading">
              <h2 className="mib-h2">Key takeaways</h2>
            </div>
            <div className="mib-seoCardGrid">
              {article.takeaways.map((takeaway) => (
                <article key={takeaway.title} className="mib-seoCard">
                  <h3 className="mib-h3">{takeaway.title}</h3>
                  <p className="mib-p2">{takeaway.body}</p>
                </article>
              ))}
            </div>
          </section>

          {article.sections.map((section) => (
            <SectionRenderer key={`${article.slug}-${section.title}`} section={section} />
          ))}

          {article.faqs && <FaqGrid title="Related questions" items={article.faqs} />}

          <LinkGrid title="Related pages and resources" links={expandedLinks} />
          <PageCta {...article.cta} />
        </Shell>
      </main>
    </>
  );
}
