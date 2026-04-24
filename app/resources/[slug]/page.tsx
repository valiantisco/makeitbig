import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ResourceArticleTemplate } from "@/components/SeoPageTemplate";
import { getResourceArticle, resourceArticleSlugs } from "@/lib/marketing-content";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  createMetadata,
} from "@/lib/seo";

export function generateStaticParams() {
  return resourceArticleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getResourceArticle(slug);

  if (!article) {
    return {};
  }

  return createMetadata({
    title: article.title,
    description: article.description,
    path: article.path,
    type: "article",
  });
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getResourceArticle(slug);

  if (!article) {
    notFound();
  }

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Resources", path: "/resources" },
      { name: article.h1, path: article.path },
    ]),
    buildArticleSchema({
      headline: article.h1,
      description: article.description,
      path: article.path,
    }),
    ...(article.faqs ? [buildFaqSchema(article.faqs)] : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ResourceArticleTemplate article={article} />
    </>
  );
}
