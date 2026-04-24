import Image from "next/image";
import type { CSSProperties } from "react";
import type { SiteImageEntry } from "@/src/content/siteImages";

type SiteImageProps = {
  image: SiteImageEntry;
  className?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function SiteImage({
  image,
  className,
  sizes = "100vw",
  priority = false,
  decorative = false,
}: SiteImageProps) {
  const ratioStyle = {
    aspectRatio: `${image.width} / ${image.height}`,
  } as CSSProperties;

  if (image.status !== "ready") {
    return (
      <div
        className={cx("mib-siteImage", "is-planned", className)}
        style={ratioStyle}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : image.alt}
      >
        <span className="mib-siteImage__layer mib-siteImage__layer--base" aria-hidden="true" />
        <span className="mib-siteImage__layer mib-siteImage__layer--sheet" aria-hidden="true" />
        <span className="mib-siteImage__layer mib-siteImage__layer--guide" aria-hidden="true" />
        <span className="mib-siteImage__layer mib-siteImage__layer--grommet" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={decorative ? "" : image.alt}
      width={image.width}
      height={image.height}
      className={cx("mib-siteImage", className)}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  );
}
