export const DEFAULT_IMAGE_MODEL = "gpt-image-1.5";
export const DEFAULT_IMAGE_QUALITY = "medium";
export const DEFAULT_IMAGE_FORMAT = "png";

export const COMMON_ART_DIRECTION = [
  "Clean premium large-format print company.",
  "Realistic editorial photography.",
  "White or light-gray production environment.",
  "Soft natural light and warm neutral shadows.",
  "Tactile print materials like premium vinyl, grommets, rolled banners, proofing tables, and packaging details.",
  "No readable fake text.",
  "No logos or brand marks.",
  "No cartoon style.",
  "No generic SaaS 3D icons.",
  "No busy backgrounds.",
  "Avoid weird AI hands or over-polished stock-photo people.",
].join(" ");

export const SITE_IMAGE_SPECS = [
  {
    key: "homeHeroVisual",
    filename: "proofing-table-file-check.png",
    alt: "Hands reviewing a large banner proof on a clean worktable with soft studio light",
    usage: "homepage hero visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic editorial photograph of a banner proof review on a clean worktable. Show tactile print samples, crop marks, soft shadows, and careful hands checking materials. Keep the environment bright, minimal, and premium.",
  },
  {
    key: "homeFinalCtaVisual",
    filename: "large-banner-storefront-install.png",
    alt: "Large custom vinyl banner installed neatly on a light storefront wall",
    usage: "homepage closing visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic large-format vinyl banner installed on a clean storefront wall with simple architecture, warm daylight, and plenty of negative space. Focus on material quality and neat installation, not branding.",
  },
  {
    key: "textureVinylGrainSoft",
    filename: "vinyl-texture-closeup.png",
    alt: "Soft close-up of matte vinyl banner material with gentle natural shadow",
    usage: "background texture accent",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A premium close-up photograph of matte vinyl banner texture with soft natural light, subtle surface grain, and warm neutral shadow. Abstract but realistic, no text or objects.",
  },
  {
    key: "textureProofGridWarm",
    filename: "proof-grid-surface-detail.png",
    alt: "Warm neutral proofing surface with subtle guide marks and paper texture",
    usage: "background graphic accent",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic proofing surface photographed from above with subtle measurement lines, warm neutral paper texture, and faint production marks. Minimal, tactile, and premium.",
  },
  {
    key: "vinylBannersHero",
    filename: "hero-vinyl-roll-production.png",
    alt: "Rolled vinyl banner material on a clean packaging table",
    usage: "main product page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic editorial photo of rolled premium vinyl banner material on a clean production or packaging table. Soft daylight, light-gray environment, tactile material focus, no branding.",
  },
  {
    key: "size24x36Hero",
    filename: "compact-banner-entry-install.png",
    alt: "Compact vinyl banner installed on a tidy storefront entry wall",
    usage: "24 x 36 banner size page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic compact vinyl banner installed near a clean storefront or entry area. The setting should feel practical and minimal, with the banner as a small but intentional visual element.",
  },
  {
    key: "size36x72Hero",
    filename: "mid-size-banner-booth-wall.png",
    alt: "Mid-size vinyl banner displayed on a clean booth wall with even light",
    usage: "36 x 72 banner size page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic mid-size vinyl banner displayed on a clean trade show booth wall or interior display wall, photographed with soft even lighting and minimal distractions.",
  },
  {
    key: "size48x96Hero",
    filename: "wide-event-backdrop-install.png",
    alt: "Wide vinyl banner used as a simple event backdrop in a bright room",
    usage: "48 x 96 banner size page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic wide vinyl banner installed as a simple event backdrop in a bright room. Focus on scale, clean installation, and premium material detail.",
  },
  {
    key: "fileGuidelinesHero",
    filename: "file-guidelines-proofing-table.png",
    alt: "Print proof, ruler, and banner material sample arranged on a clean table",
    usage: "file guidelines hero visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic proofing table scene with a print proof, ruler, swatches, and banner material sample. The layout should feel tidy, useful, and print-focused.",
  },
  {
    key: "fileGuidelinesSection",
    filename: "banner-grommet-detail.png",
    alt: "Close-up of banner hem, grommet, and vinyl edge detail under soft light",
    usage: "file guidelines section illustration",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A close-up realistic photo of a premium vinyl banner edge with hem and metal grommet detail under soft natural light. Very tactile, premium, and minimal.",
  },
  {
    key: "faqHero",
    filename: "rolled-banners-packaging.png",
    alt: "Banner packaging supplies and rolled prints on a light work surface",
    usage: "faq page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic packaging table with rolled banners, protective wrap, and clean production supplies on a bright neutral surface. Practical and premium, no text.",
  },
  {
    key: "galleryHero",
    filename: "installed-banner-clean-interior.png",
    alt: "Installed banner photographed in a clean interior setting with natural light",
    usage: "gallery page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic editorial interior scene featuring a cleanly installed large-format banner in soft natural light. Minimal environment, premium materials, no branding.",
  },
  {
    key: "aboutHero",
    filename: "print-studio-material-detail.png",
    alt: "Large-format print studio detail with banner material, tools, and soft shadows",
    usage: "about page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic close editorial view of a large-format print studio setup with banner material, tools, and neutral tabletop surfaces. Clean, tactile, and grounded.",
  },
  {
    key: "contactHero",
    filename: "proof-review-hands-neutral-desk.png",
    alt: "Hands comparing a banner proof and sample materials on a neutral table",
    usage: "contact page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic editorial scene of hands comparing a banner proof with material samples on a light neutral table. Practical, helpful, and premium. Keep the hands natural and believable.",
  },
  {
    key: "shippingReturnsHero",
    filename: "banner-roll-packaging-table.png",
    alt: "Packed banner roll and clean shipping materials prepared on a table",
    usage: "shipping and returns page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic packaging scene with a packed banner roll, protective materials, and shipping prep details on a clean worktable. No labels or readable text.",
  },
  {
    key: "businessBannersHero",
    filename: "business-storefront-banner-install.png",
    alt: "Business banner mounted on a clean storefront wall with minimal surroundings",
    usage: "business banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic business storefront scene with a custom vinyl banner installed neatly on a clean wall. Minimal architecture, soft daylight, and no readable text.",
  },
  {
    key: "birthdayBannersHero",
    filename: "birthday-banner-neutral-party-scene.png",
    alt: "Celebration banner detail installed in a bright neutral party setup",
    usage: "birthday banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic celebration setup with a large-format banner in a bright neutral party environment. Keep it tasteful and minimal, with no readable text or exaggerated decorations.",
  },
  {
    key: "graduationBannersHero",
    filename: "graduation-banner-indoor-celebration.png",
    alt: "Graduation banner displayed in a simple indoor celebration space",
    usage: "graduation banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic indoor celebration scene featuring a graduation banner in a simple refined environment. Bright natural light, neutral colors, no readable text.",
  },
  {
    key: "realEstateBannersHero",
    filename: "real-estate-banner-property-install.png",
    alt: "Real estate banner installed outdoors in a clean property setting",
    usage: "real estate banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic outdoor property setting with a cleanly installed real estate banner. Keep the environment bright and minimal, with the banner visible but no readable text.",
  },
  {
    key: "eventBannersHero",
    filename: "event-banner-step-repeat-clean.png",
    alt: "Event banner installed as a clean branded backdrop in soft light",
    usage: "event banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic event backdrop scene with a large-format banner installed cleanly in soft light. Premium event environment, no logos or readable text.",
  },
  {
    key: "churchBannersHero",
    filename: "church-lobby-banner-welcome.png",
    alt: "Welcome banner installed in a simple church lobby with warm natural light",
    usage: "church banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic warm church lobby scene with a large-format welcome banner. Soft natural light, simple environment, and no readable text or symbols.",
  },
  {
    key: "schoolBannersHero",
    filename: "school-event-banner-open-room.png",
    alt: "School banner displayed in a clean gym or event space with open room around it",
    usage: "school banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic school gym or event space with a banner installed in a clean, open room. Neutral composition, practical and polished, no readable text.",
  },
  {
    key: "restaurantBannersHero",
    filename: "restaurant-window-banner-promo.png",
    alt: "Restaurant promotion banner installed near a bright storefront window",
    usage: "restaurant banners visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic restaurant storefront scene with a promotional banner installed near a bright window. Clean, practical, and premium. No readable text.",
  },
  {
    key: "resourcesHero",
    filename: "banner-size-planning-wall.png",
    alt: "Banner sizing notes, measuring tape, and print samples arranged neatly on a wall board",
    usage: "resources hub visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic planning wall or board with banner sizing notes, measuring tape, and print samples. Editorial and minimal, with tactile materials and no readable text.",
  },
  {
    key: "resourceSizeGuideHero",
    filename: "banner-size-planning-wall.png",
    alt: "Banner sizing notes, measuring tape, and print samples arranged neatly on a wall board",
    usage: "what size banner guide visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic planning wall or board with banner sizing notes, measuring tape, and print samples. Editorial and minimal, with tactile materials and no readable text.",
  },
  {
    key: "resourceResolutionHero",
    filename: "resolution-proof-screen-detail.png",
    alt: "Close-up of a print proof review with image details on screen and material samples nearby",
    usage: "resolution guide visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic editorial close-up of a print proof review with a screen showing image detail and physical banner samples nearby. No readable UI text.",
  },
  {
    key: "resourceDesignHero",
    filename: "banner-layout-desk-planning.png",
    alt: "Banner layout draft, color swatches, and proof notes on a warm neutral desk",
    usage: "banner design guide visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic design planning desk with banner layout drafts, color swatches, and proof notes on a warm neutral surface. Minimal, tactile, no readable text.",
  },
  {
    key: "resourceVinylVsMeshHero",
    filename: "vinyl-material-closeup-detail.png",
    alt: "Close-up of banner material texture with soft shadow and edge detail",
    usage: "vinyl versus mesh guide visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic close-up editorial photo of banner material texture and edge detail in soft light. Premium, minimal, tactile, and abstract enough for a guide header.",
  },
  {
    key: "resourceProfessionalHero",
    filename: "professional-proof-board-detail.png",
    alt: "Pinned banner proof board with restrained layout notes and clean studio light",
    usage: "professional banner guide visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic proof board with pinned banner layout sheets and restrained design notes in clean studio light. Premium editorial style, no readable text.",
  },
  {
    key: "resourcePrintLargeHero",
    filename: "image-quality-crop-review.png",
    alt: "Image quality review for large-format printing with crop marks and proof details",
    usage: "print large image guide visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic editorial close-up of image quality review for large-format printing, with crop marks, proof edges, and tactile material details. No readable text.",
  },
  {
    key: "phoenixBannerPrintingHero",
    filename: "phoenix-storefront-banner-light.png",
    alt: "Large custom banner installed outside a clean storefront in bright desert light",
    usage: "Phoenix banner printing page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic storefront banner installation in bright desert light with a clean southwestern commercial setting. Minimal background, premium material detail, no readable text.",
  },
  {
    key: "customBannersArizonaHero",
    filename: "arizona-event-banner-neutral-light.png",
    alt: "Custom banner installed in a simple Arizona event setting with warm natural light",
    usage: "Arizona banner printing page visual",
    width: 1536,
    height: 1024,
    size: "1536x1024",
    prompt:
      "A realistic Arizona event or business setting with a cleanly installed custom banner in warm natural light. Practical, premium, and uncluttered with no readable text.",
  },
];

export const HOME_IMAGE_SLOTS = {
  hero: "homeHeroVisual",
  finalCta: "homeFinalCtaVisual",
  accent: "textureVinylGrainSoft",
};

export const MARKETING_PAGE_IMAGE_SLOTS = {
  "vinyl-banners": { hero: "vinylBannersHero", accent: "textureVinylGrainSoft" },
  "24x36-banner": { hero: "size24x36Hero", accent: "textureProofGridWarm" },
  "36x72-banner": { hero: "size36x72Hero", accent: "textureProofGridWarm" },
  "48x96-banner": { hero: "size48x96Hero", accent: "textureVinylGrainSoft" },
  "file-guidelines": { hero: "fileGuidelinesHero", section: "fileGuidelinesSection", accent: "textureProofGridWarm" },
  faq: { hero: "faqHero", accent: "textureProofGridWarm" },
  gallery: { hero: "galleryHero", accent: "textureVinylGrainSoft" },
  about: { hero: "aboutHero", accent: "textureVinylGrainSoft" },
  contact: { hero: "contactHero", accent: "textureProofGridWarm" },
  "shipping-returns": { hero: "shippingReturnsHero", accent: "textureVinylGrainSoft" },
  "business-banners": { hero: "businessBannersHero", accent: "textureVinylGrainSoft" },
  "birthday-banners": { hero: "birthdayBannersHero", accent: "textureProofGridWarm" },
  "graduation-banners": { hero: "graduationBannersHero", accent: "textureProofGridWarm" },
  "real-estate-banners": { hero: "realEstateBannersHero", accent: "textureVinylGrainSoft" },
  "event-banners": { hero: "eventBannersHero", accent: "textureProofGridWarm" },
  "church-banners": { hero: "churchBannersHero", accent: "textureVinylGrainSoft" },
  "school-banners": { hero: "schoolBannersHero", accent: "textureProofGridWarm" },
  "restaurant-banners": { hero: "restaurantBannersHero", accent: "textureVinylGrainSoft" },
  "phoenix-banner-printing": { hero: "phoenixBannerPrintingHero", accent: "textureVinylGrainSoft" },
  "custom-banners-arizona": { hero: "customBannersArizonaHero", accent: "textureProofGridWarm" },
};

export const RESOURCE_PAGE_IMAGE_SLOTS = {
  "what-size-banner-do-i-need": { hero: "resourceSizeGuideHero", accent: "textureProofGridWarm" },
  "best-resolution-for-large-print": { hero: "resourceResolutionHero", accent: "textureProofGridWarm" },
  "how-to-design-a-banner": { hero: "resourceDesignHero", accent: "textureVinylGrainSoft" },
  "vinyl-vs-mesh-banner": { hero: "resourceVinylVsMeshHero", accent: "textureVinylGrainSoft" },
  "how-to-make-a-banner-look-professional": { hero: "resourceProfessionalHero", accent: "textureProofGridWarm" },
  "can-i-print-this-image-large": { hero: "resourcePrintLargeHero", accent: "textureProofGridWarm" },
};
