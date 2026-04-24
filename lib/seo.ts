import type { Metadata } from "next";

export const SITE_NAME = "MakeItBig";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://makeitbig.com";
export const SUPPORT_EMAIL = "hello@makeitbig.com";

export type MetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
};

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function createMetadata({
  title,
  description,
  path,
  type = "website",
}: MetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: SUPPORT_EMAIL,
    logo: absoluteUrl("/mib-logo.svg"),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function buildServiceSchema({
  name,
  description,
  path,
  areaServed,
}: {
  name: string;
  description: string;
  path: string;
  areaServed?: string | string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed,
    url: absoluteUrl(path),
  };
}

export function buildProductSchema({
  name,
  description,
  path,
  price,
  width,
  height,
}: {
  name: string;
  description: string;
  path: string;
  price?: number;
  width?: string;
  height?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    image: absoluteUrl("/hero-bg.png"),
    url: absoluteUrl(path),
    ...(width || height
      ? {
          size: [width, height].filter(Boolean).join(" x "),
        }
      : {}),
    ...(price !== undefined
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price,
            availability: "https://schema.org/InStock",
            url: absoluteUrl(path),
          },
        }
      : {}),
  };
}

export function buildArticleSchema({
  headline,
  description,
  path,
}: {
  headline: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/mib-logo.svg"),
      },
    },
    mainEntityOfPage: absoluteUrl(path),
  };
}
