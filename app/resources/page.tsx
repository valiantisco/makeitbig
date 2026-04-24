import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SectionArtwork } from "@/components/SectionArtwork";
import { Shell } from "@/components/Shell";
import { VisualCard } from "@/components/VisualCard";
import { resourceArticleSlugs, resourceArticles, resourcesIndex } from "@/lib/marketing-content";
import {
  buildBreadcrumbSchema,
  buildServiceSchema,
  createMetadata,
} from "@/lib/seo";

export const metadata = createMetadata({
  title: resourcesIndex.title,
  description: resourcesIndex.description,
  path: "/resources",
});

export default function ResourcesPage() {
  const articles = resourceArticleSlugs.map((slug) => resourceArticles[slug]);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
          ]),
          buildServiceSchema({
            name: "Banner resources",
            description: resourcesIndex.description,
            path: "/resources",
            areaServed: "United States",
          }),
        ]}
      />

      <MarketingHeader />
      <main className="mib-seoPage mib-seoPage--resourceHub">
        <section className="mib-seoHero mib-seoHero--resource">
          <Shell className="mib-seoHero__shell">
            <div className="mib-seoHero__copy">
              <p className="mib-seoHero__eyebrow">Resources</p>
              <h1 className="mib-h1">{resourcesIndex.h1}</h1>
              <p className="mib-p1">{resourcesIndex.intro}</p>
            </div>
            <div className="mib-seoHero__panel">
              <VisualCard className="mib-seoHero__visualCard">
                <SectionArtwork
                  imageKey="resourcesHero"
                  className="mib-seoHero__artwork"
                  sizes="(min-width: 1280px) 420px, (min-width: 900px) 34vw, 100vw"
                />
              </VisualCard>
              <div className="mib-seoArticleMeta">
                <span>{articles.length} guides</span>
                <span>Sizes, files, and design</span>
                <span>Print-focused references</span>
              </div>
            </div>
          </Shell>
        </section>

        <Shell className="mib-seoContent">
          <section className="mib-seoSection mib-seoSection--cards">
            <div className="mib-seoSection__heading">
              <h2 className="mib-h2">Popular banner resources</h2>
              <p className="mib-p2">
                Start with the guide that matches the decision you need to make right now.
              </p>
            </div>

            <div className="mib-seoLinkGrid">
              {articles.map((article) => (
                <Link key={article.slug} href={article.path} className="mib-seoLinkCard">
                  <span className="mib-seoLinkCard__meta">{article.readTime}</span>
                  <span className="mib-seoLinkCard__label">{article.h1}</span>
                  <span className="mib-p2">{article.description}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mib-seoCta">
            <div className="mib-seoCta__content">
              <p className="mib-seoHero__eyebrow">Next step</p>
              <h2 className="mib-h2">Use the guide, then move into the banner flow</h2>
              <p className="mib-p1">
                The resources help with the decision. The homepage and product pages help you act on it.
              </p>
            </div>
            <div className="mib-seoCta__actions">
              <Link href="/" className="mib-btn mib-btn--accent">
                <span>Upload Your Design</span>
              </Link>
              <Link href="/vinyl-banners" className="mib-btn mib-btn--light">
                <span>View Vinyl Banners</span>
              </Link>
            </div>
          </section>
        </Shell>
      </main>
    </>
  );
}
