import { JsonLd } from "@/components/JsonLd";
import HomePageClient from "@/components/HomePageClient";
import { homeFaqs } from "@/lib/marketing-content";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildServiceSchema,
  buildWebSiteSchema,
  createMetadata,
} from "@/lib/seo";

export const metadata = createMetadata({
  title: "Custom Vinyl Banners Online | MakeItBig",
  description:
    "Upload your design, preview it big, and order custom vinyl banners online with simple sizing, file guidance, and fast printing.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          buildOrganizationSchema(),
          buildWebSiteSchema(),
          buildServiceSchema({
            name: "Custom vinyl banners online",
            description:
              "Upload your design, preview it big, and order custom vinyl banners online with simple sizing, file guidance, and fast printing.",
            path: "/",
            areaServed: "United States",
          }),
          buildFaqSchema(homeFaqs),
        ]}
      />
      <HomePageClient />
    </>
  );
}
