import Image from 'next/image'
import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  width: number
  height: number
  alt?: string
  className?: string
  inverted?: boolean
  priority?: boolean
  'aria-label'?: string
}

export function BrandLogo({
  href = '/',
  width,
  height,
  alt = 'MakeItBig',
  className,
  inverted = false,
  priority = false,
  ...rest
}: BrandLogoProps) {
  return (
    <Link href={href} className={className} {...rest}>
      <Image
        src="/mib-logo.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        style={inverted ? { filter: 'brightness(0) invert(1)' } : undefined}
      />
    </Link>
  )
}

