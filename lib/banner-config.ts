export const CUSTOM_BANNER_PRODUCT_ID = 'banner-custom' as const

/** Priced custom banners: width × height (ft), horizontal layout; price = W×H×$6/sq ft. */
export const CUSTOM_PRICE_PER_SQ_FT = 6
export const CUSTOM_FT_MIN = 0.5
export const CUSTOM_FT_MAX = 50

export function computeCustomPriceCents(widthFt: number, heightFt: number) {
  const w = Math.max(0, widthFt)
  const h = Math.max(0, heightFt)
  return Math.round(w * h * CUSTOM_PRICE_PER_SQ_FT * 100)
}

export const BANNER_SIZES = [
  {
    id: '2x4',
    productId: 'banner-24x48',
    label: '2 x 4',
    shortIn: 24,
    longIn: 48,
    priceCents: 4000,
    baseAcceptablePpi: 72,
    bestFor: 'Compact signage for tables, small booths, and tight spaces.',
  },
  {
    id: '3x6',
    productId: 'banner-36x72',
    label: '3 x 6',
    shortIn: 36,
    longIn: 72,
    priceCents: 9000,
    baseAcceptablePpi: 56,
    bestFor: 'The easy default for booths, walls, and storefront visibility.',
  },
  {
    id: '4x8',
    productId: 'banner-48x96',
    label: '4 x 8',
    shortIn: 48,
    longIn: 96,
    priceCents: 16000,
    baseAcceptablePpi: 44,
    bestFor: 'Large backdrops, wide walls, and big-room impact.',
  },
] as const

export const PRINT_ORIENTATIONS = [
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'vertical', label: 'Vertical' },
] as const

export type BannerSize = (typeof BANNER_SIZES)[number]
export type PrintSizeId = BannerSize['id']
export type PrintOrientation = (typeof PRINT_ORIENTATIONS)[number]['id']

export type ProductLike = {
  id?: string
  width_in: number
  height_in: number
  price_cents?: number
}

export const PRICING_OPTIONS = BANNER_SIZES.map((size) => ({
  id: size.id,
  size: size.label,
  price: formatPrice(size.priceCents),
  bestFor: size.bestFor,
}))

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatBannerLabel(label: string) {
  return label.replace(' x ', ' \u00d7 ')
}

export function formatFeet(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)
}

export function getBannerSizeById(id: PrintSizeId) {
  return BANNER_SIZES.find((size) => size.id === id) ?? BANNER_SIZES[0]
}

export function getOrderHref(sizeId: PrintSizeId, orientation: PrintOrientation) {
  const productId = getBannerSizeById(sizeId).productId
  return `/order?size=${productId}&orientation=${orientation}`
}

export function getCustomOrderHref(
  orientation: PrintOrientation,
  widthFt = 4,
  heightFt = 8,
) {
  const w = clamp(widthFt, CUSTOM_FT_MIN, CUSTOM_FT_MAX)
  const h = clamp(heightFt, CUSTOM_FT_MIN, CUSTOM_FT_MAX)
  return `/order?size=${CUSTOM_BANNER_PRODUCT_ID}&orientation=${orientation}&cw=${w}&ch=${h}`
}

export function getBannerPrintDimensions(size: BannerSize, orientation: PrintOrientation) {
  return {
    widthIn: orientation === 'horizontal' ? size.longIn : size.shortIn,
    heightIn: orientation === 'horizontal' ? size.shortIn : size.longIn,
  }
}

export function getFormatLabel(size: BannerSize, orientation: PrintOrientation) {
  return `${formatBannerLabel(size.label)} ft ${orientationLabel(orientation)}`
}

export function getShortFormatLabel(size: BannerSize, orientation: PrintOrientation) {
  return `${formatBannerLabel(size.label)} ${orientationLabel(orientation)}`
}

export function getProductSizeLabel(product: ProductLike) {
  const { shortIn, longIn } = getProductShortLong(product)
  return `${formatFeet(shortIn / 12)} \u00d7 ${formatFeet(longIn / 12)} ft`
}

export function getProductInchLabel(product: ProductLike) {
  const { shortIn, longIn } = getProductShortLong(product)
  return `${shortIn} \u00d7 ${longIn} in`
}

export function getProductFormatLabel(product: ProductLike, orientation: PrintOrientation) {
  return `${getProductSizeLabel(product)} ${orientationLabel(orientation)}`
}

export function getProductPrintDimensions(product: ProductLike, orientation: PrintOrientation) {
  const { shortIn, longIn } = getProductShortLong(product)
  return orientation === 'horizontal'
    ? { widthIn: longIn, heightIn: shortIn }
    : { widthIn: shortIn, heightIn: longIn }
}

export function getProductTier(product: ProductLike) {
  const longIn = Math.max(product.width_in, product.height_in)
  if (product.price_cents === 9000 || longIn === 72) return 'featured'
  if (longIn >= 96 || (product.price_cents ?? 0) >= 16000) return 'large'
  return 'small'
}

export function getProductUse(product: ProductLike) {
  if (product.id === CUSTOM_BANNER_PRODUCT_ID) {
    return 'Any width and height in feet—priced at $6 per square foot.'
  }
  const tier = getProductTier(product)
  if (tier === 'featured') return 'The easy default for booths, walls, and storefront visibility.'
  if (tier === 'large') return 'Big-room impact for backdrops, fences, and wide walls.'
  return 'Quick signage for tables, small booths, and tight spaces.'
}

export function getRecommendedProduct<T extends ProductLike>(products: T[]) {
  return (
    products.find((product) => product.price_cents === 9000) ??
    products.find((product) => Math.max(product.width_in, product.height_in) === 72) ??
    products.find((product) => product.id !== CUSTOM_BANNER_PRODUCT_ID) ??
    products[0] ??
    null
  )
}

function orientationLabel(orientation: PrintOrientation) {
  return orientation === 'horizontal' ? 'Horizontal' : 'Vertical'
}

function getProductShortLong(product: ProductLike) {
  return {
    shortIn: Math.min(product.width_in, product.height_in),
    longIn: Math.max(product.width_in, product.height_in),
  }
}
