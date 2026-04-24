import { BANNER_SIZES, getCustomOrderHref, getOrderHref } from "@/lib/banner-config";
import type { FaqItem } from "@/lib/seo";

export type LinkCard = {
  href: string;
  label: string;
  description: string;
};

export type FeatureCard = {
  title: string;
  body: string;
};

export type ContentSection =
  | {
      kind: "cards";
      title: string;
      intro?: string;
      cards: FeatureCard[];
    }
  | {
      kind: "body";
      title: string;
      paragraphs: string[];
      links?: LinkCard[];
      callout?: string;
    }
  | {
      kind: "checklist";
      title: string;
      intro?: string;
      items: string[];
      asideTitle?: string;
      asideBody?: string;
    }
  | {
      kind: "steps";
      title: string;
      intro?: string;
      steps: FeatureCard[];
    }
  | {
      kind: "compare";
      title: string;
      intro?: string;
      leftTitle: string;
      leftItems: string[];
      rightTitle: string;
      rightItems: string[];
    };

export type MarketingPageData = {
  slug: string;
  path: string;
  category: "core" | "size" | "use-case" | "company" | "local";
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  supportingIntro?: string;
  heroCards: FeatureCard[];
  heroFacts: FeatureCard[];
  fitSection?: {
    title?: string;
    intro?: string;
    cards: FeatureCard[];
  };
  qualitySection?: {
    title?: string;
    intro?: string;
    cards: FeatureCard[];
  };
  sections: ContentSection[];
  faqs?: FaqItem[];
  relatedLinks: LinkCard[];
  cta: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
};

export type ResourceArticleData = {
  slug: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  readTime: string;
  takeaways: FeatureCard[];
  sections: ContentSection[];
  faqs?: FaqItem[];
  relatedLinks: LinkCard[];
  cta: MarketingPageData["cta"];
};

export const homeFaqs: FaqItem[] = [
  {
    question: "Can I check if my image is sharp enough before I order?",
    answer:
      "Yes. Upload your design and MakeItBig checks effective print quality, crop fit, and the banner size that makes the most sense before you continue to checkout.",
  },
  {
    question: "What banner sizes can I order online?",
    answer:
      "The main presets are 2 x 4 foot, 3 x 6 foot, and 4 x 8 foot vinyl banners, plus custom sizing priced by square foot.",
  },
  {
    question: "What file types work best for banner printing?",
    answer:
      "PNG, JPG, and PDF files work well. High-resolution exports and vector PDFs usually give the best result for large-format printing.",
  },
  {
    question: "How fast is banner ordering?",
    answer:
      "The site is built for a fast online workflow: upload your file, preview the size, and move into ordering without a long quote process.",
  },
];

const popularSizeLinks: LinkCard[] = [
  {
    href: "/24x36-banner",
    label: "24 x 36 banner printing",
    description: "Best for compact signage, pop-ups, and smaller wall space.",
  },
  {
    href: "/36x72-banner",
    label: "36 x 72 banner printing",
    description: "The strong default for events, storefronts, and booths.",
  },
  {
    href: "/48x96-banner",
    label: "48 x 96 banner printing",
    description: "Made for backdrops, fences, and bigger viewing distance.",
  },
];

const resourceLinks: LinkCard[] = [
  {
    href: "/resources/what-size-banner-do-i-need",
    label: "What size banner do I need?",
    description: "Match banner dimensions to viewing distance, wall space, and message size.",
  },
  {
    href: "/resources/best-resolution-for-large-print",
    label: "Best resolution for large print",
    description: "Use effective PPI and file setup guidelines that actually matter for banners.",
  },
  {
    href: "/resources/can-i-print-this-image-large",
    label: "Can I print this image large?",
    description: "Learn how to judge a file before it turns soft on a big banner.",
  },
];

const trustLinks: LinkCard[] = [
  {
    href: "/file-guidelines",
    label: "File guidelines",
    description: "See how to export artwork that stays clear at banner scale.",
  },
  {
    href: "/faq",
    label: "Banner printing FAQ",
    description: "Quick answers on sizing, file prep, ordering, and turnaround questions.",
  },
  {
    href: "/gallery",
    label: "Banner gallery",
    description: "See how different banner sizes and use cases come together.",
  },
];

function mergeLinks(...groups: LinkCard[][]) {
  const seen = new Set<string>();
  const merged: LinkCard[] = [];

  for (const group of groups) {
    for (const link of group) {
      const key = `${link.href}::${link.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(link);
    }
  }

  return merged;
}

function createSizePage({
  slug,
  title,
  description,
  h1,
  eyebrow,
  intro,
  sizeLabel,
  inches,
  orderHref,
  price,
  bestFor,
  qualityCards,
  designNotes,
  relatedLinks,
}: {
  slug: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  sizeLabel: string;
  inches: string;
  orderHref: string;
  price: string;
  bestFor: FeatureCard[];
  qualityCards: FeatureCard[];
  designNotes: string[];
  relatedLinks: LinkCard[];
}) {
  return {
    slug,
    path: `/${slug}`,
    category: "size" as const,
    title,
    description,
    h1,
    eyebrow,
    intro,
    supportingIntro:
      "These pages focus on real banner-printing questions: how large the file can go, where the size works best, and how to order without guessing.",
    heroCards: bestFor,
    heroFacts: [
      { title: "Banner size", body: sizeLabel },
      { title: "Inches", body: inches },
      { title: "Starting price", body: price },
    ],
    fitSection: {
      title: "Is this right for you?",
      intro: `Use ${sizeLabel} when the banner needs to fit the space cleanly and still read from the distance people will actually stand.`,
      cards: bestFor,
    },
    qualitySection: {
      title: "Print quality for this size",
      intro: `Banner quality at ${sizeLabel} depends on source file strength, viewing distance, and how much detail the design is trying to hold.`,
      cards: qualityCards,
    },
    sections: [
      {
        kind: "body",
        title: `When ${sizeLabel} is the right banner size`,
        paragraphs: [
          `${sizeLabel} works when you need something clear, fast, and easy to place. It is large enough to carry a logo, headline, and call to action without demanding the wall space of a full backdrop.`,
          `For most customers, the real question is not just dimensions. It is whether the file will still look sharp once the design is scaled to ${inches}. That is where previewing the crop and checking resolution before checkout matters.`,
        ],
        links: [...resourceLinks],
      },
      {
        kind: "checklist",
        title: "Before you print this size",
        intro: "A few simple checks prevent most banner problems.",
        items: designNotes,
        asideTitle: "Fastest path",
        asideBody:
          "Upload your design, preview the crop, and keep the banner message short enough to read from the distance people will actually stand.",
      },
      {
        kind: "cards",
        title: `Best fits for ${sizeLabel}`,
        intro: "Use the size where it solves a real placement problem, not just where it sounds standard.",
        cards: bestFor,
      },
      {
        kind: "steps",
        title: "How to order with more confidence",
        intro: "The flow is intentionally short so you can verify the file before you commit.",
        steps: [
          { title: "Upload the file", body: "Start with PNG, JPG, or PDF artwork from your design tool." },
          { title: "Preview the format", body: "See how the size and orientation affect the crop." },
          { title: "Print it big", body: "Move into the order flow once the file looks right for the selected size." },
        ],
      },
    ],
    faqs: [
      {
        question: `Is ${sizeLabel} big enough for outdoor banner printing?`,
        answer:
          "It depends on viewing distance. This size works well when people are fairly close. If the banner needs to read across a parking lot or a wide room, step up to a larger size.",
      },
      {
        question: `What resolution do I need for a ${sizeLabel} banner?`,
        answer:
          "You do not need photo-print resolution at full size, but you do need enough effective PPI for the distance the banner will be viewed from. Small text and detailed artwork need more pixels than simple graphics.",
      },
      {
        question: `Can I order this banner size online without talking to sales?`,
        answer:
          "Yes. The point of MakeItBig is to let you upload, preview, and order online without slowing the process down.",
      },
    ],
    relatedLinks: mergeLinks(relatedLinks, popularSizeLinks, trustLinks, resourceLinks),
    cta: {
      title: `Start your ${sizeLabel} banner`,
      body: "Upload the design, check the crop, and move into the order flow with the size already selected.",
      primaryLabel: "Start Your Banner",
      primaryHref: orderHref,
      secondaryLabel: "Check Your File",
      secondaryHref: "/file-guidelines",
    },
  } satisfies MarketingPageData;
}

function createUseCasePage({
  slug,
  title,
  description,
  h1,
  intro,
  useCards,
  checklist,
  comparisonTitle,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  relatedLinks,
}: {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  useCards: FeatureCard[];
  checklist: string[];
  comparisonTitle: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  relatedLinks: LinkCard[];
}) {
  return {
    slug,
    path: `/${slug}`,
    category: "use-case" as const,
    title,
    description,
    h1,
    eyebrow: "Use cases",
    intro,
    supportingIntro:
      "These pages speak to the job the banner needs to do first, then connect that job to sizing, file prep, and an easy online order.",
    heroCards: useCards,
    heroFacts: [
      { title: "Best first size", body: "3 x 6 ft" },
      { title: "Ideal workflow", body: "Upload, preview, order" },
      { title: "Helpful next step", body: "Check file quality" },
    ],
    fitSection: {
      title: "Is this right for you?",
      intro: "This banner path works best when the use case matters more than starting from a product spec.",
      cards: useCards,
    },
    sections: [
      {
        kind: "cards",
        title: "What matters for this banner type",
        intro: "The design choices change depending on who needs to read the banner and how quickly they need to understand it.",
        cards: useCards,
      },
      {
        kind: "checklist",
        title: "Design checklist before you print",
        intro: "Keep the design focused enough to work at actual viewing distance.",
        items: checklist,
        asideTitle: "Simple rule",
        asideBody:
          "If the banner has to work in two seconds, reduce the message, increase the contrast, and make the call to action obvious.",
      },
      {
        kind: "compare",
        title: comparisonTitle,
        intro: "Different banner jobs call for different design priorities.",
        leftTitle,
        leftItems,
        rightTitle,
        rightItems,
      },
      {
        kind: "body",
        title: "From idea to printed banner",
        paragraphs: [
          "The fastest route is still the safest one when the site tells you whether the file is ready. That is why MakeItBig is built around confidence before printing, not around forcing a long quote process.",
          "Choose a likely size, upload the art, preview the crop, and only move into ordering once the banner feels right for the job it needs to do.",
        ],
        links: [...popularSizeLinks, ...trustLinks.slice(0, 2)],
      },
    ],
    relatedLinks: mergeLinks(relatedLinks, popularSizeLinks, trustLinks, resourceLinks),
    cta: {
      title: "Upload your design and print it big",
      body: "Start with the banner you already have in mind, then let the preview and size guidance do the heavy lifting.",
      primaryLabel: "Upload Your Design",
      primaryHref: "/",
      secondaryLabel: "See Banner Sizes",
      secondaryHref: "/vinyl-banners",
    },
  } satisfies MarketingPageData;
}

function createLocalPage({
  slug,
  title,
  description,
  h1,
  intro,
  localCards,
  checklist,
}: {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  localCards: FeatureCard[];
  checklist: string[];
}) {
  return {
    slug,
    path: `/${slug}`,
    category: "local" as const,
    title,
    description,
    h1,
    eyebrow: "Arizona service area",
    intro,
    supportingIntro:
      "These local pages are written for search intent around online banner printing in Phoenix and Arizona without pretending there is a walk-in storefront where none has been confirmed.",
    heroCards: localCards,
    heroFacts: [
      { title: "Ordering style", body: "Online" },
      { title: "Best for", body: "Fast banner decisions" },
      { title: "Focus", body: "Preview before print" },
    ],
    fitSection: {
      title: "Is this right for you?",
      intro: "These local pages are meant for buyers who want Arizona-relevant banner help without losing the speed of an online order.",
      cards: localCards,
    },
    sections: [
      {
        kind: "cards",
        title: "Why people search local for banner printing",
        intro: "Most buyers are not looking for keyword noise. They are trying to solve a practical event or business problem quickly.",
        cards: localCards,
      },
      {
        kind: "checklist",
        title: "What to verify before ordering in Arizona",
        intro: "The basics stay the same whether the banner is for Phoenix, Tucson, Mesa, or a statewide event.",
        items: checklist,
        asideTitle: "Important note",
        asideBody:
          "This site is positioned as an online ordering experience. It does not claim a public retail address on these pages.",
      },
      {
        kind: "body",
        title: "Local intent, online workflow",
        paragraphs: [
          "People often search for banner printing near them because they want speed and certainty. MakeItBig answers that with online previewing, file checks, and a quick order path instead of making you wait for manual back-and-forth.",
          "If you are ordering for a storefront opening, school event, conference, fundraiser, or real-estate install in Arizona, the useful questions are the same: what size to pick, whether the art will scale, and how fast you can move once the file looks right.",
        ],
        links: [...popularSizeLinks, ...resourceLinks],
      },
    ],
    faqs: [
      {
        question: "Do these local pages mean there is a Phoenix storefront?",
        answer:
          "No. These pages are for people in Phoenix and Arizona looking for online custom banner printing. They do not claim a walk-in retail location.",
      },
      {
        question: "Can I still upload and order online from Arizona?",
        answer:
          "Yes. The site is built for online ordering, with banner sizing, file checks, and a direct path into the order flow.",
      },
    ],
    relatedLinks: mergeLinks([
      { href: "/vinyl-banners", label: "Custom vinyl banners", description: "Main product page for online banner printing." },
      { href: "/file-guidelines", label: "File guidelines", description: "Check resolution, export, and crop advice before ordering." },
      { href: "/resources", label: "Banner resources", description: "Helpful buying guides for large-format printing decisions." },
    ], popularSizeLinks, trustLinks),
    cta: {
      title: "Start your Arizona banner order online",
      body: "Upload the design, preview the banner size, and move forward once the file looks right.",
      primaryLabel: "Print It Big",
      primaryHref: "/",
      secondaryLabel: "See Banner Sizes",
      secondaryHref: "/vinyl-banners",
    },
  } satisfies MarketingPageData;
}

export const singlePages: Record<string, MarketingPageData> = {
  "vinyl-banners": {
    slug: "vinyl-banners",
    path: "/vinyl-banners",
    category: "core",
    title: "Custom Vinyl Banners Online | Banner Printing | MakeItBig",
    description:
      "Order custom vinyl banners online with fast size selection, file guidance, and a preview-first workflow built for confident banner printing.",
    h1: "Custom vinyl banners online with a faster way to check the file first",
    eyebrow: "Main product",
    intro:
      "MakeItBig is built for people who want custom vinyl banners online without guessing what size to order or whether the file will hold up when printed large.",
    supportingIntro:
      "Upload your design. See it big in seconds. Then move into ordering once the size, crop, and print quality make sense.",
    heroCards: [
      {
        title: "Preview before you commit",
        body: "See the banner format and upload your design before you get deep into checkout.",
      },
      {
        title: "Pick a size that fits the job",
        body: "Use standard sizes like 2 x 4, 3 x 6, and 4 x 8 or move into a custom size when the space demands it.",
      },
      {
        title: "Reduce print risk",
        body: "Use the file check to catch soft artwork, awkward crops, and sizing mistakes before the banner goes to print.",
      },
    ],
    heroFacts: [
      { title: "Top seller", body: "3 x 6 ft" },
      { title: "File types", body: "PNG, JPG, PDF" },
      { title: "Ordering path", body: "Upload, preview, order" },
    ],
    sections: [
      {
        kind: "cards",
        title: "Why people buy custom vinyl banners",
        intro: "The banner usually needs to solve one clear problem: get seen, get understood, and hold up visually once it is printed large.",
        cards: [
          {
            title: "Storefront promotions",
            body: "Temporary offers, launches, and sidewalk messaging that need to read fast.",
          },
          {
            title: "Events and trade shows",
            body: "Backdrops and directional banners that need clean hierarchy at a glance.",
          },
          {
            title: "School, church, and community use",
            body: "Programs, fundraisers, and celebrations where size and clarity matter more than flashy copy.",
          },
        ],
      },
      {
        kind: "steps",
        title: "How MakeItBig keeps banner ordering simple",
        intro: "Banner printing should feel straightforward, not like a maze of product pages.",
        steps: [
          { title: "Choose a likely size", body: "Start with the banner dimension that matches your space and message length." },
          { title: "Upload the design", body: "Use your current art file and see how it behaves at print scale." },
          { title: "Move into the order flow", body: "Keep going once the preview and file guidance give you enough confidence." },
        ],
      },
      {
        kind: "body",
        title: "Banner printing that answers the real pre-purchase questions",
        paragraphs: [
          "Most people do not start with price. They start with doubt. Will the file look blurry? Is the banner too small for the wall? Can this artwork actually print at 4 x 8 feet without falling apart?",
          "That is why the site is organized around confidence before printing. Instead of hiding the important information, the pages connect sizing, file prep, and real-world use cases to the order flow.",
        ],
        links: [...popularSizeLinks, ...resourceLinks],
      },
      {
        kind: "compare",
        title: "What a strong banner page should help you decide",
        intro: "Helpful content reduces wasted clicks and bad orders.",
        leftTitle: "Helpful banner buying signals",
        leftItems: [
          "What size works for the wall, booth, or fence",
          "Whether the file has enough detail for large print",
          "How quickly you can move from upload to order",
        ],
        rightTitle: "What people do not need",
        rightItems: [
          "Stuffed keywords with no sizing guidance",
          "Long copy that never leads back to ordering",
          "Generic claims that ignore file quality",
        ],
      },
    ],
    faqs: homeFaqs,
    relatedLinks: [
      ...popularSizeLinks,
      {
        href: "/business-banners",
        label: "Business banners",
        description: "For storefront promotions, pop-ups, and branded installs.",
      },
      {
        href: "/resources",
        label: "Banner resources",
        description: "See the buying guides that help customers choose size and file setup.",
      },
    ],
    cta: {
      title: "Start your custom vinyl banner",
      body: "Upload your design, preview the format, and move into ordering once it looks right.",
      primaryLabel: "Upload Your Design",
      primaryHref: "/",
      secondaryLabel: "See Banner Sizes",
      secondaryHref: "/vinyl-banners",
    },
  },
  "24x36-banner": createSizePage({
    slug: "24x36-banner",
    title: "24 x 36 Banner Printing | 2 x 3 Vinyl Banner | MakeItBig",
    description:
      "Order 24 x 36 banner printing online. Learn when a 2 x 3 vinyl banner works, how sharp your file needs to be, and how to preview before ordering.",
    h1: "24 x 36 banner printing for compact signs that still need to read clearly",
    eyebrow: "Size page",
    intro:
      "A 24 x 36 banner is the right move when you need something more polished than a poster but smaller than a booth backdrop.",
    sizeLabel: "2 x 3 ft",
    inches: "24 x 36 in",
    orderHref: getCustomOrderHref("horizontal", 2, 3),
    price: "Custom priced by area",
    bestFor: [
      { title: "Entry signs", body: "A clear welcome or instruction sign near a doorway or check-in table." },
      { title: "Table displays", body: "Compact banners that support a product demo or community booth." },
      { title: "Wall notices", body: "Short messages in tight indoor spaces where a 3 x 6 banner would be too wide." },
    ],
    qualityCards: [
      { title: "Closer viewing needs a cleaner file", body: "Smaller banners are often read nearby, so soft edges and weak text show up faster." },
      { title: "Simple layouts print safest", body: "Bold headlines, logos, and uncomplicated graphics usually hold up best at this size." },
      { title: "Web images are the biggest risk", body: "A screenshot or compressed social asset can look acceptable on screen but weak at 24 x 36 inches." },
    ],
    designNotes: [
      "Keep the headline short so it can read from a few feet away.",
      "Avoid tiny sponsor logos unless the audience will stand close.",
      "Export at full size or larger if the design includes fine detail.",
      "Leave enough margin so critical text does not get trimmed near the edge.",
    ],
    relatedLinks: [
      { href: "/36x72-banner", label: "36 x 72 banner", description: "Move up when the message needs more distance." },
      { href: "/file-guidelines", label: "File guidelines", description: "See how to prep art for smaller large-format banners." },
      { href: "/business-banners", label: "Business banners", description: "Examples of compact promotional banner use cases." },
    ],
  }),
  "36x72-banner": createSizePage({
    slug: "36x72-banner",
    title: "36 x 72 Banner Printing | 3 x 6 Vinyl Banner | MakeItBig",
    description:
      "Order 36 x 72 banner printing online. See why the 3 x 6 vinyl banner is the most flexible size for events, storefronts, and branded displays.",
    h1: "36 x 72 banner printing for the banner size most people should start with",
    eyebrow: "Size page",
    intro:
      "The 3 x 6 vinyl banner is the easy default because it is large enough to get noticed without becoming hard to place.",
    sizeLabel: "3 x 6 ft",
    inches: "36 x 72 in",
    orderHref: getOrderHref("3x6", "horizontal"),
    price: "$90",
    bestFor: [
      { title: "Storefront promotions", body: "Big enough for a bold offer, hours, or launch message." },
      { title: "Trade-show walls", body: "A practical footprint for logos, product names, and short supporting copy." },
      { title: "Community events", body: "Works well for sponsor recognition, directional messaging, and branded photo moments." },
    ],
    qualityCards: [
      { title: "A strong middle ground", body: "This size gives you room without demanding the same file strength as a full 4 x 8 backdrop." },
      { title: "Text still needs attention", body: "Small phone numbers, prices, or sponsor details can soften first if the export is weak." },
      { title: "Orientation changes the crop", body: "A file can look clean in horizontal format and feel cramped once switched to vertical, so preview both if needed." },
    ],
    designNotes: [
      "Use one dominant message and one supporting line, not a crowded paragraph block.",
      "Large logos and bold type usually hold up best at this size.",
      "A sharper file matters if the banner includes smaller contact details or pricing text.",
      "Choose horizontal or vertical orientation based on the natural crop of the artwork.",
    ],
    relatedLinks: [
      { href: "/48x96-banner", label: "48 x 96 banner", description: "Go larger for backdrops and long-distance visibility." },
      { href: "/resources/what-size-banner-do-i-need", label: "Banner size guide", description: "See how 3 x 6 compares to other common banner sizes." },
      { href: "/business-banners", label: "Business banners", description: "See why this size is a favorite for promotional use." },
    ],
  }),
  "48x96-banner": createSizePage({
    slug: "48x96-banner",
    title: "48 x 96 Banner Printing | 4 x 8 Vinyl Banner | MakeItBig",
    description:
      "Order 48 x 96 banner printing online. See when a 4 x 8 vinyl banner makes sense, how to design for distance, and how to avoid a soft print.",
    h1: "48 x 96 banner printing for bigger spaces, bigger messages, and fewer close-up mistakes",
    eyebrow: "Size page",
    intro:
      "A 4 x 8 vinyl banner is for moments when the banner has to carry the room, not just fill a gap on the wall.",
    sizeLabel: "4 x 8 ft",
    inches: "48 x 96 in",
    orderHref: getOrderHref("4x8", "horizontal"),
    price: "$160",
    bestFor: [
      { title: "Photo backdrops", body: "Large enough for brand presence behind guests, speakers, or booths." },
      { title: "Fence and exterior installs", body: "A stronger choice when people need to read the message from farther away." },
      { title: "Stage and room graphics", body: "Useful when a 3 x 6 banner would disappear in the space." },
    ],
    qualityCards: [
      { title: "Distance helps, detail still matters", body: "Big banners are often viewed from farther away, but faces, thin lines, and dense artwork still need a stronger source file." },
      { title: "Wide crops need extra care", body: "At 4 x 8, background photos and edge-to-edge artwork can lose important content if the aspect ratio is off." },
      { title: "Best for bold hierarchy", body: "Large headlines, fewer elements, and clean contrast make the most of the extra size and reduce print risk." },
    ],
    designNotes: [
      "Keep your type bigger than you think you need if the banner will be read from a distance.",
      "Use higher-resolution art for dense graphics, photography, or sponsor-heavy layouts.",
      "A wide background image should be checked carefully for crop and softness.",
      "Do not rely on thin lines or small QR codes unless the audience will stand close.",
    ],
    relatedLinks: [
      { href: "/36x72-banner", label: "36 x 72 banner", description: "Compare the most flexible banner size to a full 4 x 8." },
      { href: "/resources/best-resolution-for-large-print", label: "Large print resolution guide", description: "How to think about quality at larger banner sizes." },
      { href: "/gallery", label: "Banner gallery", description: "See examples of larger banner layouts and use cases." },
    ],
  }),
  "file-guidelines": {
    slug: "file-guidelines",
    path: "/file-guidelines",
    category: "core",
    title: "Banner File Guidelines | Large Print Setup Help | MakeItBig",
    description:
      "Learn the banner file guidelines that matter most for large-format printing, including resolution, export settings, crop safety, and artwork prep.",
    h1: "Banner file guidelines that help your design print large without surprises",
    eyebrow: "Preflight",
    intro:
      "Good banner printing starts before checkout. The right export settings, smart crop margins, and realistic expectations about viewing distance prevent most bad prints.",
    heroCards: [
      { title: "Use the cleanest source file you have", body: "High-res images and vector PDFs give you more room to scale." },
      { title: "Design for distance", body: "Banner graphics are judged from a few feet away or across the room, not at nose distance." },
      { title: "Protect the edges", body: "Keep critical type and faces away from the trim line." },
    ],
    heroFacts: [
      { title: "Preferred types", body: "PNG, JPG, PDF" },
      { title: "Most common issue", body: "Small text" },
      { title: "Best safety habit", body: "Preview crop first" },
    ],
    sections: [
      {
        kind: "checklist",
        title: "Export checklist",
        intro: "This is the shortest route to a safer file.",
        items: [
          "Start from the original design file, not a screenshot or social post export.",
          "Use PNG or JPG for raster artwork and PDF for vector layouts when possible.",
          "Keep text and logos away from the outer edge so trim does not feel tight.",
          "Flatten only when you are sure the file is final and fonts are handled correctly.",
          "If the design includes tiny details, export larger rather than hoping the print will rescue it.",
        ],
        asideTitle: "Most common mistake",
        asideBody:
          "Customers often reuse a small web graphic for a banner. It may look fine on screen but turn soft once stretched to several feet wide.",
      },
      {
        kind: "body",
        title: "How banner resolution really works",
        paragraphs: [
          "Large-format printing is not judged by the same rules as a photo book or brochure. What matters is the effective detail at the final print size and how far away someone will stand when reading it.",
          "That said, detail-heavy artwork, fine lines, and smaller text need more pixel room than a simple logo with one headline. If the design feels busy, be stricter with your file quality.",
        ],
        links: [
          { href: "/resources/best-resolution-for-large-print", label: "Resolution guide", description: "A deeper explanation of large-format file quality." },
          { href: "/resources/can-i-print-this-image-large", label: "Can I print this image large?", description: "Learn how to judge a specific file before ordering." },
        ],
      },
      {
        kind: "steps",
        title: "Best process before you order",
        steps: [
          { title: "Choose the likely size", body: "Start with 2 x 4, 3 x 6, 4 x 8, or a custom dimension." },
          { title: "Upload the artwork", body: "Use the file you intend to print, not a draft export." },
          { title: "Review the preview", body: "Watch for tight crops, blurry detail, or too much copy." },
        ],
      },
    ],
    faqs: [
      {
        question: "Can I upload a PDF for banner printing?",
        answer:
          "Yes. PDF files are often a strong option, especially when the design includes vector text and shapes that need to scale cleanly.",
      },
      {
        question: "What if I only have a JPG?",
        answer:
          "A JPG can work well if it is exported large enough from the original design source. The risk goes up when it is a compressed or low-resolution image pulled from the web.",
      },
      {
        question: "How much margin should I leave near the edge?",
        answer:
          "A practical rule is to keep important text, logos, and faces comfortably inside the trim area so the layout still looks intentional if the crop lands a little tighter than expected.",
      },
    ],
    relatedLinks: [...popularSizeLinks, ...resourceLinks],
    cta: {
      title: "Check your file before it becomes a problem",
      body: "Upload the art, preview the crop, and use the size flow to avoid banner mistakes while the fix is still easy.",
      primaryLabel: "Check Your File",
      primaryHref: "/#file-confidence",
      secondaryLabel: "Upload Your Design",
      secondaryHref: "/",
    },
  },
  faq: {
    slug: "faq",
    path: "/faq",
    category: "core",
    title: "Banner Printing FAQ | Sizes, Files, and Ordering | MakeItBig",
    description:
      "Get answers to common banner printing questions about sizes, file setup, resolution, ordering, and what to check before printing.",
    h1: "Banner printing FAQ for the questions people ask before they upload and order",
    eyebrow: "Support",
    intro:
      "This FAQ is built for real pre-purchase friction points: file quality, banner size, ordering speed, and whether your design can actually print large.",
    heroCards: [
      { title: "Size questions", body: "Which preset works and when a custom size is worth it." },
      { title: "File questions", body: "What to upload, what resolution matters, and what usually causes trouble." },
      { title: "Order questions", body: "How the preview-first flow works before checkout." },
    ],
    heroFacts: [
      { title: "Top concern", body: "Will it print sharp?" },
      { title: "Best first step", body: "Upload the file" },
      { title: "Helpful pages", body: "Sizes and resources" },
    ],
    sections: [
      {
        kind: "steps",
        title: "How to use this FAQ",
        intro: "If you are ordering soon, these are the fastest routes to clarity.",
        steps: [
          { title: "Unsure on size", body: "Start with the size guides and compare 2 x 4, 3 x 6, and 4 x 8." },
          { title: "Unsure on quality", body: "Use the file guidelines and resolution resources to judge the artwork." },
          { title: "Ready to move", body: "Upload the design and head into the order flow once the preview looks right." },
        ],
      },
      {
        kind: "cards",
        title: "Most common banner-printing questions",
        cards: homeFaqs.map((item) => ({ title: item.question, body: item.answer })),
      },
      {
        kind: "body",
        title: "Where to go next",
        paragraphs: [
          "The FAQ is only useful if it helps you move. If you still need help choosing a size, use the size pages. If the concern is file quality, go to the resource guides or the file-check section on the homepage.",
        ],
        links: [...popularSizeLinks, ...resourceLinks, ...trustLinks],
      },
    ],
    faqs: [
      ...homeFaqs,
      {
        question: "Can I order a custom banner size?",
        answer:
          "Yes. MakeItBig supports custom banner sizes priced by square foot when one of the standard presets does not fit your wall or install.",
      },
      {
        question: "What if I am between two banner sizes?",
        answer:
          "Choose based on viewing distance and space. If people need to read it farther away, go larger. If the wall is tight or the message is short, the smaller size may look cleaner.",
      },
    ],
    relatedLinks: [
      ...popularSizeLinks,
      { href: "/resources", label: "Resources", description: "Longer guides for common print questions." },
      { href: "/contact", label: "Contact", description: "Use this when you need real business details that are not published yet." },
    ],
    cta: {
      title: "Start with your current design",
      body: "Upload your file and let the size and preview flow answer the practical questions while you order.",
      primaryLabel: "Upload Your Design",
      primaryHref: "/",
      secondaryLabel: "See Banner Sizes",
      secondaryHref: "/vinyl-banners",
    },
  },
  gallery: {
    slug: "gallery",
    path: "/gallery",
    category: "company",
    title: "Banner Gallery | Vinyl Banner Ideas and Layouts | MakeItBig",
    description:
      "Explore vinyl banner ideas by size and use case, from business banners to event backdrops, with quick links back to ordering and file setup help.",
    h1: "Banner gallery ideas that help you picture the size before you print",
    eyebrow: "Visual inspiration",
    intro:
      "This gallery is not about filler mockups. It is here to help you imagine how different banner sizes and use cases behave in real buying situations.",
    heroCards: [
      { title: "Compact signs", body: "Smaller banner moments where clarity beats decoration." },
      { title: "Mid-size promotional banners", body: "The workhorse range for most storefront and event needs." },
      { title: "Large backdrops", body: "Wide graphics designed to read across a room or frame a space." },
    ],
    heroFacts: [
      { title: "Best starting size", body: "3 x 6 ft" },
      { title: "Most visual risk", body: "Crowded layouts" },
      { title: "Fastest next step", body: "Preview your file" },
    ],
    sections: [
      {
        kind: "cards",
        title: "Popular banner directions",
        intro: "Use the gallery as a way to think through intent, not just style.",
        cards: [
          { title: "Storefront sale banners", body: "Short messages, bold prices, high contrast, and fast roadside readability." },
          { title: "Trade-show identity", body: "Logo-led layouts with one supporting message and a calmer visual rhythm." },
          { title: "Celebration banners", body: "Photo-forward designs where crop safety and image quality matter more." },
          { title: "Directional event graphics", body: "Large arrows, sparse copy, and clean spacing that works under pressure." },
        ],
      },
      {
        kind: "compare",
        title: "What makes a banner feel professional",
        leftTitle: "Stronger layouts",
        leftItems: [
          "One dominant headline",
          "Enough contrast to read fast",
          "Logo and support details placed with breathing room",
        ],
        rightTitle: "Common weak layouts",
        rightItems: [
          "Too much copy fighting for attention",
          "Photos cropped too tight to the trim",
          "Contact details sized smaller than the viewing distance allows",
        ],
      },
      {
        kind: "body",
        title: "Use the gallery to choose your next step",
        paragraphs: [
          "If the layout you have in mind looks like a compact sign, start with smaller sizes. If it feels like a wall graphic or event backdrop, compare 3 x 6 and 4 x 8 first.",
          "From there, the best move is not more browsing. It is uploading your actual file and checking whether the crop and detail still work at size.",
        ],
        links: [
          { href: "/business-banners", label: "Business banners", description: "A stronger use-case page for commercial layouts." },
          { href: "/event-banners", label: "Event banners", description: "A better fit for directional and sponsor-focused banner ideas." },
          { href: "/resources/how-to-make-a-banner-look-professional", label: "Professional banner guide", description: "See the design moves that actually improve banner quality." },
        ],
      },
    ],
    relatedLinks: [...popularSizeLinks, ...trustLinks],
    cta: {
      title: "Turn the idea into a real banner",
      body: "Upload your design, preview it at size, and move into ordering once the layout feels right.",
      primaryLabel: "Start Your Banner",
      primaryHref: "/",
      secondaryLabel: "Check Your File",
      secondaryHref: "/file-guidelines",
    },
  },
  about: {
    slug: "about",
    path: "/about",
    category: "company",
    title: "About MakeItBig | Online Banner Printing Built for Confidence",
    description:
      "Learn how MakeItBig approaches online banner printing with a preview-first experience focused on file confidence, simple sizing, and fast ordering.",
    h1: "MakeItBig was built for the moment people ask if this file will still look good printed large",
    eyebrow: "About",
    intro:
      "MakeItBig is not trying to be every print product for every situation. It is focused on a simple promise for banner printing: upload your design, see it big in seconds, and order with more confidence.",
    heroCards: [
      { title: "Confidence before printing", body: "The experience is organized around pre-purchase questions, not around hiding them." },
      { title: "Simple sizing", body: "Choose from proven banner sizes or go custom when the space calls for it." },
      { title: "Direct order flow", body: "Move from upload to preview to ordering without a bloated quote process." },
    ],
    heroFacts: [
      { title: "Primary product", body: "Vinyl banners" },
      { title: "Core promise", body: "See it big in seconds" },
      { title: "Main concern solved", body: "Will my file hold up?" },
    ],
    sections: [
      {
        kind: "body",
        title: "Why this site exists",
        paragraphs: [
          "Banner printing often breaks trust in small ways. The page says one thing, the file behaves another way, and the customer is left wondering whether the print will show up soft, cramped, or disappointing.",
          "MakeItBig focuses on narrowing that gap. The site is meant to make size choice easier, surface file concerns earlier, and keep the order flow moving once the banner looks right.",
        ],
      },
      {
        kind: "cards",
        title: "What the product is trying to do well",
        cards: [
          { title: "Reduce hesitation", body: "Use page structure and tools that answer the banner questions people actually have." },
          { title: "Preserve momentum", body: "Keep the ordering experience fast once the customer feels good about the file." },
          { title: "Stay focused", body: "Build around banners rather than diluting the experience across every possible print item." },
        ],
      },
      {
        kind: "body",
        title: "What still needs real business detail",
        paragraphs: [
          "Some information should stay grounded in actual operations, not in marketing copy. If exact turnaround times, support channels, or business location details need to be published, they should come from the real business setup.",
        ],
        links: [
          { href: "/contact", label: "Contact", description: "The place for real support details and direct business contact." },
          { href: "/shipping-returns", label: "Shipping and returns", description: "What is stated today, and what may need formal policy detail." },
        ],
      },
    ],
    relatedLinks: [...trustLinks, ...popularSizeLinks],
    cta: {
      title: "See how your file looks at banner scale",
      body: "Upload the design and use the preview-first workflow that the site is built around.",
      primaryLabel: "Upload Your Design",
      primaryHref: "/",
      secondaryLabel: "View Vinyl Banners",
      secondaryHref: "/vinyl-banners",
    },
  },
  contact: {
    slug: "contact",
    path: "/contact",
    category: "company",
    title: "Contact MakeItBig | Banner Printing Help and Support",
    description:
      "Contact MakeItBig for banner printing help, file questions, and support. See what details are available now and what real business info may still need confirmation.",
    h1: "Contact MakeItBig when you need a real answer that the site does not already cover",
    eyebrow: "Support",
    intro:
      "Most banner questions should be answered by the sizing pages, file guidance, and FAQ. This page is for the remaining questions that need a direct human answer or confirmed business detail.",
    heroCards: [
      { title: "File-specific questions", body: "Use this when your design has a special requirement or edge case." },
      { title: "Order and policy questions", body: "Ask when you need confirmation beyond the current published guidance." },
      { title: "Business detail requests", body: "Use this page for phone, address, or operations questions that still need formal confirmation." },
    ],
    heroFacts: [
      { title: "Published email", body: "hello@makeitbig.com" },
      { title: "Best self-serve pages", body: "FAQ and file guidelines" },
      { title: "Fastest action", body: "Upload and preview first" },
    ],
    sections: [
      {
        kind: "cards",
        title: "Start with self-serve if one of these solves it",
        cards: [
          { title: "Need the right banner size", body: "Go to the size pages or the resource guide on choosing banner dimensions." },
          { title: "Need file prep help", body: "Use the file guidelines and large-print resolution guides first." },
          { title: "Need basic ordering info", body: "The FAQ covers the most common pre-purchase questions." },
        ],
      },
      {
        kind: "body",
        title: "Current contact path",
        paragraphs: [
          "The only clearly published support contact currently on the site is hello@makeitbig.com. If phone support, a mailing address, or additional channels are part of the real business, they should be added here once confirmed.",
          "That matters for trust. Contact information should be accurate, current, and matched to the actual business workflow.",
        ],
      },
      {
        kind: "checklist",
        title: "When to reach out directly",
        items: [
          "You have an unusual file format or export situation.",
          "You need to confirm a shipping, returns, or turnaround edge case.",
          "You need business details that are not published elsewhere on the site.",
        ],
        asideTitle: "Support email",
        asideBody: "hello@makeitbig.com",
      },
    ],
    relatedLinks: [...trustLinks, ...resourceLinks],
    cta: {
      title: "Try the preview-first flow first",
      body: "Many banner questions become easier once you see the file at size and in the order flow.",
      primaryLabel: "Start Your Banner",
      primaryHref: "/",
      secondaryLabel: "Check Your File",
      secondaryHref: "/file-guidelines",
    },
  },
  "shipping-returns": {
    slug: "shipping-returns",
    path: "/shipping-returns",
    category: "company",
    title: "Shipping and Returns | MakeItBig Banner Policies",
    description:
      "Review current shipping and returns guidance for MakeItBig banner orders, with notes on what policy details still need confirmed business information.",
    h1: "Shipping and returns guidance for custom banner orders",
    eyebrow: "Policy",
    intro:
      "Custom printing works best when policies are clear before checkout. This page keeps the current guidance simple and avoids inventing terms that need real business confirmation.",
    heroCards: [
      { title: "Custom work needs review", body: "Banner orders often depend on file approval and production readiness." },
      { title: "Carrier timelines vary", body: "Shipping windows can shift because of production timing, holidays, or carrier delays." },
      { title: "Defect issues should be handled directly", body: "Production problems and damage need a clear path to support." },
    ],
    heroFacts: [
      { title: "Current site language", body: "Ships in 3-5 days" },
      { title: "Needs confirmation", body: "Exact turnaround policy" },
      { title: "Custom items", body: "Not typically returnable" },
    ],
    sections: [
      {
        kind: "body",
        title: "What is safe to say today",
        paragraphs: [
          "The existing site language points to banners shipping in 3-5 days and notes that a reprint may be available if something is not right. That is useful directional guidance, but formal policies should still match actual operations.",
          "Custom printed items are usually treated differently from stock products because they are made to order. That means returns, cancellations, and reprints should be explained with precision once the final policy is confirmed.",
        ],
      },
      {
        kind: "checklist",
        title: "Business details this page still needs",
        items: [
          "Exact production turnaround definitions",
          "Carrier methods and whether expedited shipping exists",
          "Return window language for damaged or defective products",
          "Whether customers must report issues within a specific time",
        ],
        asideTitle: "Why it matters",
        asideBody:
          "Policy pages are trust pages. They should use confirmed business information, not generic print-shop assumptions.",
      },
      {
        kind: "body",
        title: "What customers should do now",
        paragraphs: [
          "If your order has a timing-sensitive deadline or you need confirmation on damage, reprint eligibility, or delivery expectations, use the contact page so the answer is tied to real operations instead of guesswork.",
        ],
        links: [
          { href: "/contact", label: "Contact support", description: "Use the current published contact path." },
          { href: "/terms", label: "Terms and conditions", description: "Review the legal baseline for orders and print quality." },
        ],
      },
    ],
    relatedLinks: [...trustLinks, { href: "/contact", label: "Contact", description: "Confirm policy details that need real business info." }],
    cta: {
      title: "Check the file now and keep the order moving",
      body: "The fastest way to reduce fulfillment friction is still to start with the correct file and size.",
      primaryLabel: "Upload Your Design",
      primaryHref: "/",
      secondaryLabel: "File Guidelines",
      secondaryHref: "/file-guidelines",
    },
  },
  "business-banners": createUseCasePage({
    slug: "business-banners",
    title: "Business Banners | Custom Vinyl Banner Printing | MakeItBig",
    description:
      "Print business banners online for storefronts, promotions, trade shows, and branded events with banner sizes and file guidance that keep the design clear.",
    h1: "Business banners that look sharp, read fast, and help customers know what to do next",
    intro:
      "Business banners work best when they simplify the message instead of trying to say everything at once. The right size, cleaner hierarchy, and a file that holds up at print scale matter more than flashy filler.",
    useCards: [
      { title: "Storefront promos", body: "Promote sales, openings, and seasonal pushes with one clear offer." },
      { title: "Trade-show presence", body: "Use the banner to anchor the booth, not overwhelm it." },
      { title: "Service messaging", body: "Explain what you do, who it is for, and how to contact you." },
    ],
    checklist: [
      "Lead with the offer or service, not the backstory.",
      "Make the phone number or URL large enough to be worth including.",
      "Use brand colors with enough contrast to read outdoors or under event lighting.",
      "If the logo is detailed, export from the original source file.",
    ],
    comparisonTitle: "Two common business banner jobs",
    leftTitle: "Promotional banners",
    leftItems: ["Short headline", "Bold pricing or event date", "High urgency and contrast"],
    rightTitle: "Branding banners",
    rightItems: ["Larger logo treatment", "Cleaner spacing", "Less copy and more visual presence"],
    relatedLinks: [...popularSizeLinks, ...trustLinks],
  }),
  "birthday-banners": createUseCasePage({
    slug: "birthday-banners",
    title: "Birthday Banners | Custom Birthday Banner Printing | MakeItBig",
    description:
      "Create custom birthday banners online with photo-friendly sizing, file guidance, and banner layouts that still look good when printed large.",
    h1: "Birthday banners that keep the photo sharp and the message easy to read",
    intro:
      "Birthday banners usually fail in one of two ways: the photo turns soft or the layout gets crowded with too many decorations. A cleaner file and the right size fix most of it.",
    useCards: [
      { title: "Photo birthday banners", body: "Use a sharper source image and keep the crop gentle around faces." },
      { title: "Milestone celebrations", body: "Make the age and name the dominant read from across the room." },
      { title: "Indoor party backdrops", body: "Choose a size that frames the table or photo area without swallowing the space." },
    ],
    checklist: [
      "Use the highest-resolution photo you have, especially for close-up faces.",
      "Keep names and dates large enough to read in party photos.",
      "Do not place text too close to the banner edge.",
      "If multiple photos are included, simplify the design before scaling it larger.",
    ],
    comparisonTitle: "What changes by birthday banner style",
    leftTitle: "Photo-led banner",
    leftItems: ["Sharper image matters most", "Less copy", "Crop safety around faces"],
    rightTitle: "Graphic-led banner",
    rightItems: ["Large number or name", "Simpler artwork", "More freedom in file resolution"],
    relatedLinks: [...popularSizeLinks, ...resourceLinks],
  }),
  "graduation-banners": createUseCasePage({
    slug: "graduation-banners",
    title: "Graduation Banners | Custom Graduation Banner Printing | MakeItBig",
    description:
      "Order graduation banners online with helpful size guidance for party backdrops, school colors, photos, and names that need to stay readable.",
    h1: "Graduation banners built for names, photos, and school pride that still print clean",
    intro:
      "Graduation banners often combine photos, names, school colors, and dates. That can work well, but only if the layout gives the important details enough room.",
    useCards: [
      { title: "Party backdrop banners", body: "Great for dessert tables, entrances, and photo walls." },
      { title: "Yard and porch celebrations", body: "Use bolder type and simpler layouts when the banner will be viewed from farther away." },
      { title: "School recognition graphics", body: "Highlight the graduate first, then add supporting details." },
    ],
    checklist: [
      "Prioritize the graduate's name before secondary copy.",
      "Check that school logos and crests stay readable at the chosen size.",
      "Use enough contrast when school colors are dark or similar in value.",
      "Choose a banner size that fits the space for photos as well as the message.",
    ],
    comparisonTitle: "Graduation banner priorities by placement",
    leftTitle: "Photo area banners",
    leftItems: ["Larger image zone", "Balanced crop", "Readable from a few feet away"],
    rightTitle: "Outdoor recognition banners",
    rightItems: ["Bolder headline", "Less detail", "Stronger distance readability"],
    relatedLinks: [...popularSizeLinks, ...trustLinks],
  }),
  "real-estate-banners": createUseCasePage({
    slug: "real-estate-banners",
    title: "Real Estate Banners | Realtor Banner Printing | MakeItBig",
    description:
      "Print real estate banners online for listings, open houses, leasing, and development sites with banner sizes and layouts that stay readable fast.",
    h1: "Real estate banners for listings, leasing, and open-house traffic that need to read immediately",
    intro:
      "Real estate banners live or die on quick readability. If the audience is driving by or making a fast decision on site, the design has to be direct.",
    useCards: [
      { title: "Open house banners", body: "Clear date or directional messaging with strong contrast." },
      { title: "For lease or for sale banners", body: "The agent name is secondary to the property status and contact path." },
      { title: "Development signage", body: "Choose larger formats when the install needs to read from the street." },
    ],
    checklist: [
      "Keep phone numbers big enough to justify printing them.",
      "Avoid overly detailed property photography unless the banner is close-viewed.",
      "Use one primary status line such as For Sale, Open House, or Leasing.",
      "Choose a wider banner if the sign will be mounted along fencing or long walls.",
    ],
    comparisonTitle: "Real estate banner priorities",
    leftTitle: "Traffic-facing installs",
    leftItems: ["Short message", "Large contact info", "Higher contrast colors"],
    rightTitle: "On-site walkthrough installs",
    rightItems: ["More room for branding", "Can support a bit more detail", "Closer viewing distance"],
    relatedLinks: [...popularSizeLinks, ...resourceLinks],
  }),
  "event-banners": createUseCasePage({
    slug: "event-banners",
    title: "Event Banners | Custom Event Banner Printing | MakeItBig",
    description:
      "Order custom event banners online for sponsor walls, check-in areas, announcements, and directional signage with premium layouts and fast sizing guidance.",
    h1: "Event banners that guide people fast and still look polished in the room",
    intro:
      "Event banners need to balance speed and appearance. They should help people know where to go, what is happening, or who is behind the event without feeling cluttered.",
    useCards: [
      { title: "Check-in banners", body: "Use large headers and uncomplicated directional cues." },
      { title: "Sponsor walls", body: "Give logos enough room or reduce the sponsor count." },
      { title: "Stage and room graphics", body: "Choose scale based on how much of the room the banner needs to carry." },
    ],
    checklist: [
      "Decide whether the banner is directional, promotional, or decorative first.",
      "Do not cram sponsor logos into a banner size that cannot support them.",
      "Use strong contrast if the room lighting may be uneven.",
      "Keep dates, times, and room names on one clean line if possible.",
    ],
    comparisonTitle: "Different event banner jobs",
    leftTitle: "Directional banners",
    leftItems: ["Arrow or destination first", "Minimal copy", "Quick readability"],
    rightTitle: "Backdrop banners",
    rightItems: ["More visual presence", "Cleaner spacing", "Logo hierarchy matters more"],
    relatedLinks: [...popularSizeLinks, ...trustLinks],
  }),
  "church-banners": createUseCasePage({
    slug: "church-banners",
    title: "Church Banners | Custom Church Banner Printing | MakeItBig",
    description:
      "Print church banners online for sermons, welcome messages, ministry events, and seasonal services with banner sizes and file guidance that stay clear.",
    h1: "Church banners for welcome moments, seasonal services, and ministry events that need warmth and clarity",
    intro:
      "Church banners often carry a softer tone, but they still need strong hierarchy. A warm design is only useful if people can read it quickly and the file holds up once printed large.",
    useCards: [
      { title: "Welcome banners", body: "Clear, inviting messaging placed where visitors first arrive." },
      { title: "Seasonal service banners", body: "Use bold event titles and dates that read across the lobby or room." },
      { title: "Ministry event banners", body: "Keep the name of the program larger than supporting details." },
    ],
    checklist: [
      "Use strong contrast even if the color palette is soft.",
      "Prioritize the event or welcome message before scripture or supporting copy.",
      "If using photography, export from the original high-resolution file.",
      "Choose the size based on entrance width and likely viewing distance.",
    ],
    comparisonTitle: "Two church banner approaches",
    leftTitle: "Welcome and wayfinding",
    leftItems: ["Short message", "Calm design", "Fast readability"],
    rightTitle: "Event promotion",
    rightItems: ["Bigger title", "Date and call to action", "Slightly more design energy"],
    relatedLinks: [...popularSizeLinks, ...resourceLinks],
  }),
  "school-banners": createUseCasePage({
    slug: "school-banners",
    title: "School Banners | Custom School Banner Printing | MakeItBig",
    description:
      "Print school banners online for admissions, athletics, graduations, and fundraisers with banner sizes and layouts that stay readable in busy spaces.",
    h1: "School banners for hallways, events, and campus messaging that need to stay readable in busy environments",
    intro:
      "Schools need banners for very different reasons, from admissions and athletics to graduations and fundraisers. The common need is clarity in spaces where people are already overloaded with information.",
    useCards: [
      { title: "Admissions and welcome", body: "Lead with the school name or event, then the action you want families to take." },
      { title: "Athletics and spirit banners", body: "Use scale and contrast so the banner still works in a loud visual environment." },
      { title: "Fundraiser and event banners", body: "Keep sponsors and supporting details from overpowering the main message." },
    ],
    checklist: [
      "Choose larger text than you would for a flyer or hallway sign.",
      "If including mascots or crests, use clean source art.",
      "Make the event name, date, and location easy to scan.",
      "Use one primary action line instead of multiple competing asks.",
    ],
    comparisonTitle: "School banner goals",
    leftTitle: "Spirit and recognition banners",
    leftItems: ["Big visual energy", "Bold names or titles", "Room-scale readability"],
    rightTitle: "Information banners",
    rightItems: ["Dates and logistics matter", "Cleaner spacing", "Directional clarity matters more"],
    relatedLinks: [...popularSizeLinks, ...trustLinks],
  }),
  "restaurant-banners": createUseCasePage({
    slug: "restaurant-banners",
    title: "Restaurant Banners | Custom Restaurant Banner Printing | MakeItBig",
    description:
      "Create restaurant banners online for grand openings, patio promotions, specials, and events with sizes and file guidance made for fast readability.",
    h1: "Restaurant banners for openings, specials, and sidewalk traffic that have to read in seconds",
    intro:
      "Restaurant banners are usually seen on the move. That means the offer, event, or occasion has to read instantly and the layout cannot depend on delicate detail.",
    useCards: [
      { title: "Grand opening banners", body: "Lead with the moment and let the brand support it." },
      { title: "Seasonal promo banners", body: "Keep the special or offer clear enough for passing traffic." },
      { title: "Event and patio banners", body: "Use larger sizes when the banner sits farther from the sidewalk or parking area." },
    ],
    checklist: [
      "Use one main offer or announcement, not a full menu of details.",
      "Make sure the price or date is readable at passing speed.",
      "Use bold color contrast if the install competes with storefront clutter.",
      "Avoid food photos that are too low-res to survive large-format printing.",
    ],
    comparisonTitle: "Restaurant banner priorities",
    leftTitle: "Traffic-facing promos",
    leftItems: ["Short offer", "Big type", "Simple CTA or date"],
    rightTitle: "In-space event graphics",
    rightItems: ["Can support more atmosphere", "More visual room", "Still needs clear hierarchy"],
    relatedLinks: [...popularSizeLinks, ...resourceLinks],
  }),
  "phoenix-banner-printing": createLocalPage({
    slug: "phoenix-banner-printing",
    title: "Phoenix Banner Printing | Custom Banners Online | MakeItBig",
    description:
      "Looking for Phoenix banner printing? Order custom banners online with size guidance, file checks, and a preview-first workflow designed for faster decisions.",
    h1: "Phoenix banner printing for people who want to order online and feel confident before it prints",
    intro:
      "If you are searching for Phoenix banner printing, you are probably trying to solve something practical fast: an event, a storefront push, a school function, a real-estate install, or a branded setup that cannot miss.",
    localCards: [
      { title: "Fast local intent", body: "People searching in Phoenix usually care about speed, clarity, and whether the file is actually ready." },
      { title: "Hot-weather placements", body: "Exterior banners need strong readability because sunlight and distance flatten weak layouts quickly." },
      { title: "Event-heavy demand", body: "Phoenix-area events, pop-ups, schools, and businesses often need banner decisions without extra friction." },
    ],
    checklist: [
      "Choose the banner size based on where it will sit in the real space.",
      "Check whether your file is strong enough for outdoor readability.",
      "Reduce clutter if the banner will compete with sunlight, traffic, or visual noise.",
      "Use the online preview flow before assuming the file is ready.",
    ],
  }),
  "custom-banners-arizona": createLocalPage({
    slug: "custom-banners-arizona",
    title: "Custom Banners Arizona | Vinyl Banner Printing Online | MakeItBig",
    description:
      "Order custom banners in Arizona online with simple size selection, file guidance, and a preview-first banner printing workflow.",
    h1: "Custom banners in Arizona with a simpler path from file upload to print-ready order",
    intro:
      "Arizona buyers search for custom banners in every kind of situation: small business promotions, statewide events, school installs, church gatherings, real-estate signage, and local celebrations. The useful part is not the keyword. It is making the file and size decisions easier.",
    localCards: [
      { title: "Statewide use cases", body: "Banners in Arizona need to work for city storefronts, schools, events, and outdoor visibility." },
      { title: "Online convenience", body: "A strong online flow matters when customers are spread across the state." },
      { title: "Confidence matters more than hype", body: "The real value is knowing whether the design can print large before spending money." },
    ],
    checklist: [
      "Match the banner size to the install distance, not just the budget line item.",
      "Use stronger contrast for outdoor and roadside conditions.",
      "Do not trust a small web export to scale into a large banner without checking it.",
      "Let the preview and file guidance do the decision work early.",
    ],
  }),
};

export const resourceArticles: Record<string, ResourceArticleData> = {
  "what-size-banner-do-i-need": {
    slug: "what-size-banner-do-i-need",
    path: "/resources/what-size-banner-do-i-need",
    title: "What Size Banner Do I Need? | Banner Size Guide | MakeItBig",
    description:
      "Use this banner size guide to choose the right dimensions for walls, booths, storefronts, and events without guessing.",
    h1: "What size banner do I need for the space, the message, and the viewing distance?",
    eyebrow: "Banner size guide",
    intro:
      "Banner size is really a placement decision. The right answer depends on where the banner goes, how far away people stand, and how much the design is trying to say.",
    readTime: "5 min read",
    takeaways: [
      { title: "Start with distance", body: "If people are far away, go larger before you add more copy." },
      { title: "Match the wall", body: "A banner should feel intentional in the space, not barely squeezed in." },
      { title: "Let the message stay short", body: "Long copy often signals the banner is trying to do too much." },
    ],
    sections: [
      {
        kind: "cards",
        title: "Quick size rules",
        cards: [
          { title: "2 x 4 ft", body: "Best when the audience is close and the message is short." },
          { title: "3 x 6 ft", body: "The best starting size for most promotional, event, and storefront needs." },
          { title: "4 x 8 ft", body: "A better choice when the banner needs to carry more space or more distance." },
        ],
      },
      {
        kind: "body",
        title: "Choose size by where the banner lives",
        paragraphs: [
          "A banner behind a check-in table is a different job than a banner stretched across a fence. Indoor backdrops can support more detail because people stand closer. Road-facing or parking-lot-facing banners need fewer words and more scale.",
          "When in doubt, sketch the install area and decide whether the banner is meant to be read up close, across a room, or from passing traffic. That gives you a better answer than keyword-based guessing.",
        ],
      },
      {
        kind: "compare",
        title: "A simple way to compare sizes",
        leftTitle: "Choose smaller when",
        leftItems: [
          "The install area is tight",
          "People will stand nearby",
          "The layout is simple and focused",
        ],
        rightTitle: "Choose larger when",
        rightItems: [
          "The banner needs to anchor a wider wall or room",
          "The audience will view it from farther away",
          "The banner needs stronger visual presence",
        ],
      },
    ],
    faqs: [
      {
        question: "Is 3 x 6 the best general banner size?",
        answer:
          "For many buyers, yes. It is large enough to feel substantial and flexible enough to fit storefronts, booths, events, and interior walls.",
      },
      {
        question: "When should I choose a custom size?",
        answer:
          "Choose a custom size when the install area has a specific dimension or when the standard presets leave too much dead space or feel cramped.",
      },
    ],
    relatedLinks: [...popularSizeLinks, { href: "/vinyl-banners", label: "Vinyl banners", description: "Return to the main product page." }],
    cta: {
      title: "Pick a likely size and see it big",
      body: "The fastest way to validate the choice is to upload the file and view the banner in the order flow.",
      primaryLabel: "See Banner Sizes",
      primaryHref: "/vinyl-banners",
      secondaryLabel: "Start Your Banner",
      secondaryHref: "/",
    },
  },
  "best-resolution-for-large-print": {
    slug: "best-resolution-for-large-print",
    path: "/resources/best-resolution-for-large-print",
    title: "Best Resolution for Large Print | Banner File Guide | MakeItBig",
    description:
      "Learn the best resolution for large print and how to judge effective quality for banners, backdrops, and large-format files.",
    h1: "Best resolution for large print starts with the final size, not a random DPI rule",
    eyebrow: "Resolution guide",
    intro:
      "Large-format printing does not reward guessing. The only useful question is how much real detail the file keeps once it is stretched to the final banner size.",
    readTime: "6 min read",
    takeaways: [
      { title: "Final size changes everything", body: "A file that works at 24 inches may fail at 96 inches." },
      { title: "Viewing distance matters", body: "Banners read from farther away can tolerate less detail than close-view photo prints." },
      { title: "Complex artwork needs more", body: "Small text, dense graphics, and detailed photos need stronger source files." },
    ],
    sections: [
      {
        kind: "body",
        title: "Think in effective detail, not just a number",
        paragraphs: [
          "The phrase resolution for large print can be misleading because it suggests there is one magic number. There is not. A bold headline banner and a sponsor-heavy event wall do not need the same file strength.",
          "What matters is the effective quality at the final dimensions. A file with enough detail for a 3 x 6 banner may look weak when pushed to 4 x 8, especially if it includes small type or photo detail.",
        ],
      },
      {
        kind: "checklist",
        title: "When to be stricter with file quality",
        items: [
          "The design includes fine lines or small print.",
          "The banner will be photographed up close.",
          "There are multiple sponsor logos or dense graphic elements.",
          "The source image came from social media or a website export.",
        ],
        asideTitle: "Safer file types",
        asideBody: "Vector PDFs and higher-resolution original exports give you more room to print large cleanly.",
      },
      {
        kind: "cards",
        title: "How different artwork behaves",
        cards: [
          { title: "Simple logo banners", body: "Usually the most forgiving if the source logo is clean." },
          { title: "Photo banners", body: "Can work well, but close-up faces reveal softness quickly." },
          { title: "Text-heavy banners", body: "Often the least forgiving because thin or small text shows weakness fast." },
        ],
      },
    ],
    relatedLinks: [
      { href: "/file-guidelines", label: "File guidelines", description: "See the practical export checklist." },
      { href: "/resources/can-i-print-this-image-large", label: "Can I print this image large?", description: "A faster way to judge a real file." },
      { href: "/48x96-banner", label: "48 x 96 banner", description: "See how file quality matters more at larger sizes." },
    ],
    cta: {
      title: "Use the file and size together",
      body: "Upload your design and check how it behaves at the banner size you actually want to print.",
      primaryLabel: "Check Your File",
      primaryHref: "/#file-confidence",
      secondaryLabel: "Start Your Banner",
      secondaryHref: "/",
    },
  },
  "how-to-design-a-banner": {
    slug: "how-to-design-a-banner",
    path: "/resources/how-to-design-a-banner",
    title: "How to Design a Banner | Large Format Design Tips | MakeItBig",
    description:
      "Learn how to design a banner that stays readable, prints cleanly, and converts attention into action.",
    h1: "How to design a banner that still works once it is printed large",
    eyebrow: "Design guide",
    intro:
      "Banner design is not about adding more. It is about deciding what the viewer needs to understand first and making the layout support that instantly.",
    readTime: "5 min read",
    takeaways: [
      { title: "Lead with one message", body: "The banner should have a clear first read." },
      { title: "Design for distance", body: "People rarely read banners as closely as they read a screen." },
      { title: "Use the file preview", body: "The banner should be judged at size, not only in the design app." },
    ],
    sections: [
      {
        kind: "steps",
        title: "A simple banner design process",
        steps: [
          { title: "Pick the main job", body: "Is the banner promotional, directional, celebratory, or decorative?" },
          { title: "Write the first read", body: "Choose the one message someone should understand in two seconds." },
          { title: "Build the hierarchy", body: "Make the headline largest, then add only the support details that matter." },
        ],
      },
      {
        kind: "compare",
        title: "What usually improves a banner fast",
        leftTitle: "Stronger design moves",
        leftItems: ["Fewer words", "Bigger type", "Higher contrast", "More breathing room"],
        rightTitle: "Common mistakes",
        rightItems: ["Crowded logos", "Weak contrast", "Tiny details", "Multiple competing headlines"],
      },
      {
        kind: "body",
        title: "Designing for print confidence",
        paragraphs: [
          "A banner can look polished on your screen and still break down in print if the crop is too tight or the source artwork is weak. That is why the final proof point should be the preview and the file check, not only the design software canvas.",
        ],
        links: [
          { href: "/resources/how-to-make-a-banner-look-professional", label: "Make a banner look professional", description: "A tighter follow-up on polish and hierarchy." },
          { href: "/file-guidelines", label: "File guidelines", description: "Make sure the export supports the design." },
        ],
      },
    ],
    relatedLinks: [...popularSizeLinks, ...trustLinks],
    cta: {
      title: "Upload the design and test it at size",
      body: "Once the hierarchy feels right, the next move is checking how it behaves in the real banner format.",
      primaryLabel: "Upload Your Design",
      primaryHref: "/",
      secondaryLabel: "See Banner Sizes",
      secondaryHref: "/vinyl-banners",
    },
  },
  "vinyl-vs-mesh-banner": {
    slug: "vinyl-vs-mesh-banner",
    path: "/resources/vinyl-vs-mesh-banner",
    title: "Vinyl vs Mesh Banner | Which Banner Material Fits? | MakeItBig",
    description:
      "Compare vinyl vs mesh banner material and learn when standard vinyl banners make the most sense for your print project.",
    h1: "Vinyl vs mesh banner comes down to placement, airflow, and how the design needs to read",
    eyebrow: "Material guide",
    intro:
      "This site is centered on vinyl banners, but customers still ask when vinyl makes sense compared to mesh. The answer depends mostly on where the banner lives and what the design needs to do.",
    readTime: "4 min read",
    takeaways: [
      { title: "Vinyl is the default", body: "It works well for most indoor and many outdoor banner situations." },
      { title: "Mesh is situational", body: "It is mainly useful when wind and airflow become the bigger concern." },
      { title: "Readability still matters", body: "The cleaner the design, the better either material performs visually." },
    ],
    sections: [
      {
        kind: "compare",
        title: "Quick material comparison",
        leftTitle: "Vinyl banners",
        leftItems: [
          "Good all-purpose material for many common banner jobs",
          "Strong choice for storefronts, events, interiors, and backdrops",
          "Often the simplest choice when design quality is the focus",
        ],
        rightTitle: "Mesh banners",
        rightItems: [
          "Better for windy fence-style placements",
          "Useful when airflow matters more than a fully solid surface",
          "Can change how the design appears at close range",
        ],
      },
      {
        kind: "body",
        title: "Why vinyl is the main product focus here",
        paragraphs: [
          "MakeItBig is organized around helping customers order custom vinyl banners online. That focus keeps sizing, file prep, and preview guidance simpler and more useful.",
          "If your install is a standard event banner, storefront banner, celebration banner, or backdrop, vinyl is usually the material buyers mean when they are searching for banner printing online.",
        ],
      },
    ],
    relatedLinks: [
      { href: "/vinyl-banners", label: "Vinyl banners", description: "Return to the main vinyl banner page." },
      { href: "/event-banners", label: "Event banners", description: "See event-specific design and size guidance." },
      { href: "/resources/what-size-banner-do-i-need", label: "Banner size guide", description: "Choose dimensions after material." },
    ],
    cta: {
      title: "Start with the standard vinyl workflow",
      body: "If vinyl fits the job, upload the design and use the preview-first order flow to keep moving.",
      primaryLabel: "Start Your Banner",
      primaryHref: "/",
      secondaryLabel: "View Vinyl Banners",
      secondaryHref: "/vinyl-banners",
    },
  },
  "how-to-make-a-banner-look-professional": {
    slug: "how-to-make-a-banner-look-professional",
    path: "/resources/how-to-make-a-banner-look-professional",
    title: "How to Make a Banner Look Professional | Design Tips | MakeItBig",
    description:
      "Learn how to make a banner look professional with stronger hierarchy, better spacing, cleaner copy, and print-ready file choices.",
    h1: "How to make a banner look professional without making it crowded or overdesigned",
    eyebrow: "Design polish",
    intro:
      "Professional-looking banners are usually quieter than amateur ones. They make one main point, give it room, and avoid asking the eye to do too much work.",
    readTime: "5 min read",
    takeaways: [
      { title: "Use one hero message", body: "The banner should have a clear center of gravity." },
      { title: "Space improves trust", body: "Breathing room makes banners feel intentional and easier to scan." },
      { title: "Professional is readable", body: "Polish does not matter if nobody can read the design." },
    ],
    sections: [
      {
        kind: "cards",
        title: "The easiest banner upgrades",
        cards: [
          { title: "Cut copy", body: "Remove anything that does not change the decision or action." },
          { title: "Increase contrast", body: "Give the headline more visual separation from the background." },
          { title: "Scale the type up", body: "A banner almost always benefits from larger text than you think." },
        ],
      },
      {
        kind: "body",
        title: "What professional really means in large format",
        paragraphs: [
          "Professional does not mean fancy. It means the banner feels controlled. The message is clear, the elements align, and the file quality supports the layout instead of fighting it.",
          "That often means resisting the urge to add more badges, gradients, outlines, or decorative graphics. Clean hierarchy wins more often than extra embellishment.",
        ],
      },
      {
        kind: "checklist",
        title: "Professional banner checklist",
        items: [
          "One strong headline",
          "One support line or call to action",
          "Enough margin around the edges",
          "A file that stays sharp at the chosen size",
        ],
      },
    ],
    relatedLinks: [
      { href: "/resources/how-to-design-a-banner", label: "How to design a banner", description: "The broader process guide." },
      { href: "/gallery", label: "Banner gallery", description: "See layout directions that feel more intentional." },
      { href: "/file-guidelines", label: "File guidelines", description: "Support the design with a stronger export." },
    ],
    cta: {
      title: "Check the design at real banner scale",
      body: "The fastest way to judge whether a banner feels polished is to preview it in the size you want to print.",
      primaryLabel: "Upload Your Design",
      primaryHref: "/",
      secondaryLabel: "Check Your File",
      secondaryHref: "/#file-confidence",
    },
  },
  "can-i-print-this-image-large": {
    slug: "can-i-print-this-image-large",
    path: "/resources/can-i-print-this-image-large",
    title: "Can I Print This Image Large? | Banner Quality Guide | MakeItBig",
    description:
      "Use this guide to decide whether your image can print large for a banner without turning soft, cropped awkwardly, or losing important detail.",
    h1: "Can I print this image large enough for a banner without it falling apart?",
    eyebrow: "Image check",
    intro:
      "This is one of the most important banner questions because it gets to the real risk. The answer depends on the source image, the final size, and how much detail the design needs to preserve.",
    readTime: "4 min read",
    takeaways: [
      { title: "Start with the source", body: "Original exports beat screenshots almost every time." },
      { title: "Size changes the verdict", body: "An image that works at 2 x 4 may not work at 4 x 8." },
      { title: "Faces and fine text show problems first", body: "These are often the first details to look soft." },
    ],
    sections: [
      {
        kind: "body",
        title: "Three questions to ask about the image",
        paragraphs: [
          "Where did the image come from? A design export, camera original, or vector PDF gives you more confidence than a compressed social image.",
          "How large are you trying to print it? Bigger banner sizes expose weakness more quickly, especially if the design includes close-up faces or detailed text.",
          "How close will people stand? A banner read from across a room can tolerate more softness than a photo wall where guests stand right in front of it.",
        ],
      },
      {
        kind: "checklist",
        title: "Warning signs the image may not scale well",
        items: [
          "The file is small or was saved from a website.",
          "Text inside the image already looks soft on screen.",
          "The image needs a heavy crop to fit the banner shape.",
          "You are stretching a photo far beyond its original purpose.",
        ],
      },
      {
        kind: "body",
        title: "The safest next move",
        paragraphs: [
          "Do not guess from thumbnails. Upload the image, pair it with the banner size you want, and check the preview and file quality feedback before ordering.",
        ],
        links: [
          { href: "/file-guidelines", label: "File guidelines", description: "See what stronger source files look like." },
          { href: "/resources/best-resolution-for-large-print", label: "Resolution guide", description: "Understand why the image may pass or fail." },
        ],
      },
    ],
    relatedLinks: [...popularSizeLinks, ...trustLinks],
    cta: {
      title: "Find out before you spend money on print",
      body: "Upload the image and check how it behaves in the actual banner format you want.",
      primaryLabel: "Check Your File",
      primaryHref: "/#file-confidence",
      secondaryLabel: "Start Your Banner",
      secondaryHref: "/",
    },
  },
};

export const resourcesIndex = {
  title: "Banner Resources | Size, File, and Design Guides | MakeItBig",
  description:
    "Explore banner resources on sizing, large-print resolution, design, image quality, and buying decisions before ordering a custom vinyl banner.",
  h1: "Banner resources built for the questions people ask before printing large",
  intro:
    "These guides are here to help with the decision work that comes before checkout: choosing the right banner size, knowing whether the file will scale, and designing a banner that reads well in the real world.",
};

export const singlePageSlugs = Object.keys(singlePages);
export const resourceArticleSlugs = Object.keys(resourceArticles);

export function getSinglePage(slug: string) {
  return singlePages[slug];
}

export function getResourceArticle(slug: string) {
  return resourceArticles[slug];
}

export const sitemapEntries = [
  "/",
  "/order",
  "/privacy",
  "/terms",
  "/resources",
  ...singlePageSlugs.map((slug) => `/${slug}`),
  ...resourceArticleSlugs.map((slug) => `/resources/${slug}`),
];

export const defaultFooterLinks = [
  ...popularSizeLinks,
  ...trustLinks,
  ...resourceLinks,
];

export const homeSeoLinkGroups = {
  sizes: popularSizeLinks,
  trust: trustLinks,
  resources: resourceLinks,
  uses: [
    { href: "/business-banners", label: "Business banners", description: "Promotions, launches, and branded installs." },
    { href: "/event-banners", label: "Event banners", description: "Directional signs, sponsor walls, and stage graphics." },
    { href: "/real-estate-banners", label: "Real estate banners", description: "Listings, open houses, and property marketing." },
    { href: "/birthday-banners", label: "Birthday banners", description: "Celebration banners with photos, names, and dates." },
  ],
};

export const sizeProductData = BANNER_SIZES.reduce<Record<string, { width: string; height: string; price: number }>>(
  (acc, size) => {
    acc[size.id] = {
      width: `${size.shortIn} in`,
      height: `${size.longIn} in`,
      price: size.priceCents / 100,
    };
    return acc;
  },
  {},
);
