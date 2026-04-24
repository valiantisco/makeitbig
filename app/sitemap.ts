import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/marketing-content";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/vinyl-banners" ? 0.9 : 0.8,
  }));
}
