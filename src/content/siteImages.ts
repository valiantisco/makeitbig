export type SiteImageEntry = {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  usage: string;
  status: "planned" | "ready";
};

export type SiteImageKey = keyof typeof siteImages;

export type PageImageSlots = {
  hero?: SiteImageKey;
  section?: SiteImageKey;
  accent?: SiteImageKey;
};

export const siteImages = {
  homeHeroVisual: {
    key: "homeHeroVisual",
    src: "/images/site/proofing-table-file-check.png",
    alt: "Hands reviewing a large banner proof on a clean worktable with soft studio light",
    width: 1536,
    height: 1024,
    usage: "homepage hero visual",
    status: "ready",
  },
  homeFinalCtaVisual: {
    key: "homeFinalCtaVisual",
    src: "/images/site/large-banner-storefront-install.png",
    alt: "Large custom vinyl banner installed neatly on a light storefront wall",
    width: 1536,
    height: 1024,
    usage: "homepage closing visual",
    status: "ready",
  },
  textureVinylGrainSoft: {
    key: "textureVinylGrainSoft",
    src: "/images/site/vinyl-texture-closeup.png",
    alt: "Soft close-up of matte vinyl banner material with gentle natural shadow",
    width: 1536,
    height: 1024,
    usage: "background texture accent",
    status: "ready",
  },
  textureProofGridWarm: {
    key: "textureProofGridWarm",
    src: "/images/site/proof-grid-surface-detail.png",
    alt: "Warm neutral proofing surface with subtle guide marks and paper texture",
    width: 1536,
    height: 1024,
    usage: "background graphic accent",
    status: "ready",
  },
  vinylBannersHero: {
    key: "vinylBannersHero",
    src: "/images/site/hero-vinyl-roll-production.png",
    alt: "Rolled vinyl banner material on a clean packaging table",
    width: 1536,
    height: 1024,
    usage: "main product page visual",
    status: "ready",
  },
  size24x36Hero: {
    key: "size24x36Hero",
    src: "/images/site/compact-banner-entry-install.png",
    alt: "Compact vinyl banner installed on a tidy storefront entry wall",
    width: 1536,
    height: 1024,
    usage: "24 x 36 banner size page visual",
    status: "ready",
  },
  size36x72Hero: {
    key: "size36x72Hero",
    src: "/images/site/mid-size-banner-booth-wall.png",
    alt: "Mid-size vinyl banner displayed on a clean booth wall with even light",
    width: 1536,
    height: 1024,
    usage: "36 x 72 banner size page visual",
    status: "ready",
  },
  size48x96Hero: {
    key: "size48x96Hero",
    src: "/images/site/wide-event-backdrop-install.png",
    alt: "Wide vinyl banner used as a simple event backdrop in a bright room",
    width: 1536,
    height: 1024,
    usage: "48 x 96 banner size page visual",
    status: "ready",
  },
  fileGuidelinesHero: {
    key: "fileGuidelinesHero",
    src: "/images/site/file-guidelines-proofing-table.png",
    alt: "Print proof, ruler, and banner material sample arranged on a clean table",
    width: 1536,
    height: 1024,
    usage: "file guidelines hero visual",
    status: "ready",
  },
  fileGuidelinesSection: {
    key: "fileGuidelinesSection",
    src: "/images/site/banner-grommet-detail.png",
    alt: "Close-up of banner hem, grommet, and vinyl edge detail under soft light",
    width: 1536,
    height: 1024,
    usage: "file guidelines section illustration",
    status: "ready",
  },
  faqHero: {
    key: "faqHero",
    src: "/images/site/rolled-banners-packaging.png",
    alt: "Banner packaging supplies and rolled prints on a light work surface",
    width: 1536,
    height: 1024,
    usage: "faq page visual",
    status: "ready",
  },
  galleryHero: {
    key: "galleryHero",
    src: "/images/site/installed-banner-clean-interior.png",
    alt: "Installed banner photographed in a clean interior setting with natural light",
    width: 1536,
    height: 1024,
    usage: "gallery page visual",
    status: "ready",
  },
  aboutHero: {
    key: "aboutHero",
    src: "/images/site/print-studio-material-detail.png",
    alt: "Large-format print studio detail with banner material, tools, and soft shadows",
    width: 1536,
    height: 1024,
    usage: "about page visual",
    status: "ready",
  },
  contactHero: {
    key: "contactHero",
    src: "/images/site/proof-review-hands-neutral-desk.png",
    alt: "Hands comparing a banner proof and sample materials on a neutral table",
    width: 1536,
    height: 1024,
    usage: "contact page visual",
    status: "ready",
  },
  shippingReturnsHero: {
    key: "shippingReturnsHero",
    src: "/images/site/banner-roll-packaging-table.png",
    alt: "Packed banner roll and clean shipping materials prepared on a table",
    width: 1536,
    height: 1024,
    usage: "shipping and returns page visual",
    status: "ready",
  },
  businessBannersHero: {
    key: "businessBannersHero",
    src: "/images/site/business-storefront-banner-install.png",
    alt: "Business banner mounted on a clean storefront wall with minimal surroundings",
    width: 1536,
    height: 1024,
    usage: "business banners visual",
    status: "ready",
  },
  birthdayBannersHero: {
    key: "birthdayBannersHero",
    src: "/images/site/birthday-banner-neutral-party-scene.png",
    alt: "Celebration banner detail installed in a bright neutral party setup",
    width: 1536,
    height: 1024,
    usage: "birthday banners visual",
    status: "ready",
  },
  graduationBannersHero: {
    key: "graduationBannersHero",
    src: "/images/site/graduation-banner-indoor-celebration.png",
    alt: "Graduation banner displayed in a simple indoor celebration space",
    width: 1536,
    height: 1024,
    usage: "graduation banners visual",
    status: "ready",
  },
  realEstateBannersHero: {
    key: "realEstateBannersHero",
    src: "/images/site/real-estate-banner-property-install.png",
    alt: "Real estate banner installed outdoors in a clean property setting",
    width: 1536,
    height: 1024,
    usage: "real estate banners visual",
    status: "ready",
  },
  eventBannersHero: {
    key: "eventBannersHero",
    src: "/images/site/event-banner-step-repeat-clean.png",
    alt: "Event banner installed as a clean branded backdrop in soft light",
    width: 1536,
    height: 1024,
    usage: "event banners visual",
    status: "ready",
  },
  churchBannersHero: {
    key: "churchBannersHero",
    src: "/images/site/church-lobby-banner-welcome.png",
    alt: "Welcome banner installed in a simple church lobby with warm natural light",
    width: 1536,
    height: 1024,
    usage: "church banners visual",
    status: "ready",
  },
  schoolBannersHero: {
    key: "schoolBannersHero",
    src: "/images/site/school-event-banner-open-room.png",
    alt: "School banner displayed in a clean gym or event space with open room around it",
    width: 1536,
    height: 1024,
    usage: "school banners visual",
    status: "ready",
  },
  restaurantBannersHero: {
    key: "restaurantBannersHero",
    src: "/images/site/restaurant-window-banner-promo.png",
    alt: "Restaurant promotion banner installed near a bright storefront window",
    width: 1536,
    height: 1024,
    usage: "restaurant banners visual",
    status: "ready",
  },
  resourcesHero: {
    key: "resourcesHero",
    src: "/images/site/banner-size-planning-wall.png",
    alt: "Banner sizing notes, measuring tape, and print samples arranged neatly on a wall board",
    width: 1536,
    height: 1024,
    usage: "resources hub visual",
    status: "ready",
  },
  resourceSizeGuideHero: {
    key: "resourceSizeGuideHero",
    src: "/images/site/banner-size-planning-wall.png",
    alt: "Banner sizing notes, measuring tape, and print samples arranged neatly on a wall board",
    width: 1536,
    height: 1024,
    usage: "what size banner guide visual",
    status: "ready",
  },
  resourceResolutionHero: {
    key: "resourceResolutionHero",
    src: "/images/site/resolution-proof-screen-detail.png",
    alt: "Close-up of a print proof review with image details on screen and material samples nearby",
    width: 1536,
    height: 1024,
    usage: "resolution guide visual",
    status: "ready",
  },
  resourceDesignHero: {
    key: "resourceDesignHero",
    src: "/images/site/banner-layout-desk-planning.png",
    alt: "Banner layout draft, color swatches, and proof notes on a warm neutral desk",
    width: 1536,
    height: 1024,
    usage: "banner design guide visual",
    status: "ready",
  },
  resourceVinylVsMeshHero: {
    key: "resourceVinylVsMeshHero",
    src: "/images/site/vinyl-material-closeup-detail.png",
    alt: "Close-up of banner material texture with soft shadow and edge detail",
    width: 1536,
    height: 1024,
    usage: "vinyl versus mesh guide visual",
    status: "ready",
  },
  resourceProfessionalHero: {
    key: "resourceProfessionalHero",
    src: "/images/site/professional-proof-board-detail.png",
    alt: "Pinned banner proof board with restrained layout notes and clean studio light",
    width: 1536,
    height: 1024,
    usage: "professional banner guide visual",
    status: "ready",
  },
  resourcePrintLargeHero: {
    key: "resourcePrintLargeHero",
    src: "/images/site/image-quality-crop-review.png",
    alt: "Image quality review for large-format printing with crop marks and proof details",
    width: 1536,
    height: 1024,
    usage: "print large image guide visual",
    status: "ready",
  },
  phoenixBannerPrintingHero: {
    key: "phoenixBannerPrintingHero",
    src: "/images/site/phoenix-storefront-banner-light.png",
    alt: "Large custom banner installed outside a clean storefront in bright desert light",
    width: 1536,
    height: 1024,
    usage: "Phoenix banner printing page visual",
    status: "ready",
  },
  customBannersArizonaHero: {
    key: "customBannersArizonaHero",
    src: "/images/site/arizona-event-banner-neutral-light.png",
    alt: "Custom banner installed in a simple Arizona event setting with warm natural light",
    width: 1536,
    height: 1024,
    usage: "Arizona banner printing page visual",
    status: "ready",
  },
} as const satisfies Record<string, SiteImageEntry>;

export const homeImageSlots = {
  "hero": "homeHeroVisual",
  "finalCta": "homeFinalCtaVisual",
  "accent": "textureVinylGrainSoft"
} as const satisfies Record<string, SiteImageKey>;

export const marketingPageImageSlots = {
  "vinyl-banners": {
    "hero": "vinylBannersHero",
    "accent": "textureVinylGrainSoft"
  },
  "24x36-banner": {
    "hero": "size24x36Hero",
    "accent": "textureProofGridWarm"
  },
  "36x72-banner": {
    "hero": "size36x72Hero",
    "accent": "textureProofGridWarm"
  },
  "48x96-banner": {
    "hero": "size48x96Hero",
    "accent": "textureVinylGrainSoft"
  },
  "file-guidelines": {
    "hero": "fileGuidelinesHero",
    "section": "fileGuidelinesSection",
    "accent": "textureProofGridWarm"
  },
  "faq": {
    "hero": "faqHero",
    "accent": "textureProofGridWarm"
  },
  "gallery": {
    "hero": "galleryHero",
    "accent": "textureVinylGrainSoft"
  },
  "about": {
    "hero": "aboutHero",
    "accent": "textureVinylGrainSoft"
  },
  "contact": {
    "hero": "contactHero",
    "accent": "textureProofGridWarm"
  },
  "shipping-returns": {
    "hero": "shippingReturnsHero",
    "accent": "textureVinylGrainSoft"
  },
  "business-banners": {
    "hero": "businessBannersHero",
    "accent": "textureVinylGrainSoft"
  },
  "birthday-banners": {
    "hero": "birthdayBannersHero",
    "accent": "textureProofGridWarm"
  },
  "graduation-banners": {
    "hero": "graduationBannersHero",
    "accent": "textureProofGridWarm"
  },
  "real-estate-banners": {
    "hero": "realEstateBannersHero",
    "accent": "textureVinylGrainSoft"
  },
  "event-banners": {
    "hero": "eventBannersHero",
    "accent": "textureProofGridWarm"
  },
  "church-banners": {
    "hero": "churchBannersHero",
    "accent": "textureVinylGrainSoft"
  },
  "school-banners": {
    "hero": "schoolBannersHero",
    "accent": "textureProofGridWarm"
  },
  "restaurant-banners": {
    "hero": "restaurantBannersHero",
    "accent": "textureVinylGrainSoft"
  },
  "phoenix-banner-printing": {
    "hero": "phoenixBannerPrintingHero",
    "accent": "textureVinylGrainSoft"
  },
  "custom-banners-arizona": {
    "hero": "customBannersArizonaHero",
    "accent": "textureProofGridWarm"
  }
} as const satisfies Record<string, PageImageSlots>;

export const resourcePageImageSlots = {
  "what-size-banner-do-i-need": {
    "hero": "resourceSizeGuideHero",
    "accent": "textureProofGridWarm"
  },
  "best-resolution-for-large-print": {
    "hero": "resourceResolutionHero",
    "accent": "textureProofGridWarm"
  },
  "how-to-design-a-banner": {
    "hero": "resourceDesignHero",
    "accent": "textureVinylGrainSoft"
  },
  "vinyl-vs-mesh-banner": {
    "hero": "resourceVinylVsMeshHero",
    "accent": "textureVinylGrainSoft"
  },
  "how-to-make-a-banner-look-professional": {
    "hero": "resourceProfessionalHero",
    "accent": "textureProofGridWarm"
  },
  "can-i-print-this-image-large": {
    "hero": "resourcePrintLargeHero",
    "accent": "textureProofGridWarm"
  }
} as const satisfies Record<string, PageImageSlots>;

export function getSiteImage(key: SiteImageKey) {
  return siteImages[key];
}

export function getMarketingPageImageSlots(slug: string): PageImageSlots | undefined {
  return marketingPageImageSlots[
    slug as keyof typeof marketingPageImageSlots
  ] as PageImageSlots | undefined;
}

export function getResourcePageImageSlots(slug: string): PageImageSlots | undefined {
  return resourcePageImageSlots[
    slug as keyof typeof resourcePageImageSlots
  ] as PageImageSlots | undefined;
}

export const siteImageFilenamesToGenerate = [
  "proofing-table-file-check.png",
  "large-banner-storefront-install.png",
  "vinyl-texture-closeup.png",
  "proof-grid-surface-detail.png",
  "hero-vinyl-roll-production.png",
  "compact-banner-entry-install.png",
  "mid-size-banner-booth-wall.png",
  "wide-event-backdrop-install.png",
  "file-guidelines-proofing-table.png",
  "banner-grommet-detail.png",
  "rolled-banners-packaging.png",
  "installed-banner-clean-interior.png",
  "print-studio-material-detail.png",
  "proof-review-hands-neutral-desk.png",
  "banner-roll-packaging-table.png",
  "business-storefront-banner-install.png",
  "birthday-banner-neutral-party-scene.png",
  "graduation-banner-indoor-celebration.png",
  "real-estate-banner-property-install.png",
  "event-banner-step-repeat-clean.png",
  "church-lobby-banner-welcome.png",
  "school-event-banner-open-room.png",
  "restaurant-window-banner-promo.png",
  "banner-size-planning-wall.png",
  "resolution-proof-screen-detail.png",
  "banner-layout-desk-planning.png",
  "vinyl-material-closeup-detail.png",
  "professional-proof-board-detail.png",
  "image-quality-crop-review.png",
  "phoenix-storefront-banner-light.png",
  "arizona-event-banner-neutral-light.png",
];
