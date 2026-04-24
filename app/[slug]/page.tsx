import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { MarketingPageTemplate } from "@/components/SeoPageTemplate";
import { getSinglePage, singlePageSlugs } from "@/lib/marketing-content";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
  buildServiceSchema,
  createMetadata,
} from "@/lib/seo";

const SIZE_SCHEMA_MAP: Record<
  string,
  {
    width: string;
    height: string;
    price?: number;
  }
> = {
  "24x36-banner": {
    width: "24 in",
    height: "36 in",
  },
  "36x72-banner": {
    width: "36 in",
    height: "72 in",
    price: 90,
  },
  "48x96-banner": {
    width: "48 in",
    height: "96 in",
    price: 160,
  },
};

export function generateStaticParams() {
  return singlePageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSinglePage(slug);

  if (!page) {
    return {};
  }

  return createMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
  });
}

export default async function SinglePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSinglePage(slug);

  if (!page) {
    notFound();
  }

  const schema =
    page.category === "size"
      ? buildProductSchema({
          name: page.title.replace(" | MakeItBig", ""),
          description: page.description,
          path: page.path,
          ...SIZE_SCHEMA_MAP[page.slug],
        })
      : buildServiceSchema({
          name: page.title.replace(" | MakeItBig", ""),
          description: page.description,
          path: page.path,
          areaServed:
            page.category === "local" ? ["Phoenix", "Arizona"] : "United States",
        });

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: page.h1, path: page.path },
    ]),
    schema,
    ...(page.faqs ? [buildFaqSchema(page.faqs)] : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <MarketingPageTemplate page={page} />
    </>
  );
}
