import { SiteImage } from "@/components/SiteImage";
import { getSiteImage, type SiteImageKey } from "@/src/content/siteImages";

type SectionArtworkProps = {
  imageKey: SiteImageKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function SectionArtwork({
  imageKey,
  className,
  sizes,
  priority = false,
  decorative = false,
}: SectionArtworkProps) {
  const image = getSiteImage(imageKey);

  return (
    <figure className={cx("mib-sectionArtwork", className)}>
      <SiteImage
        image={image}
        className="mib-sectionArtwork__image"
        sizes={sizes}
        priority={priority}
        decorative={decorative}
      />
    </figure>
  );
}
