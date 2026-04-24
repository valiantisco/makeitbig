import {
  clamp,
  computeCustomPriceCents,
  CUSTOM_BANNER_PRODUCT_ID,
  CUSTOM_FT_MAX,
  CUSTOM_FT_MIN,
  formatFeet,
  getProductFormatLabel,
  getProductPrintDimensions,
  getProductSizeLabel,
  type PrintOrientation,
} from '@/lib/banner-config'
import { STATIC_PRODUCTS } from '@/lib/products'

export type CheckoutPayload = {
  productId?: unknown
  orientation?: unknown
  customWidthFt?: unknown
  customHeightFt?: unknown
  fileName?: unknown
  fileType?: unknown
  validationStatus?: unknown
}

export type ResolvedCheckoutOrder = {
  productId: string
  orientation: PrintOrientation
  productName: string
  sizeLabel: string
  formatLabel: string
  widthFt: number
  heightFt: number
  widthIn: number
  heightIn: number
  amountCents: number
}

function parseOrientation(value: unknown): PrintOrientation {
  return value === 'vertical' ? 'vertical' : 'horizontal'
}

function parseOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseCustomFeet(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return clamp(value, CUSTOM_FT_MIN, CUSTOM_FT_MAX)
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseFloat(value)

    if (Number.isFinite(parsed)) {
      return clamp(parsed, CUSTOM_FT_MIN, CUSTOM_FT_MAX)
    }
  }

  return fallback
}

export function parseCheckoutPayload(payload: CheckoutPayload) {
  const productId = parseOptionalString(payload.productId)

  if (!productId) {
    throw new Error('Missing banner size selection.')
  }

  return {
    productId,
    orientation: parseOrientation(payload.orientation),
    customWidthFt: parseCustomFeet(payload.customWidthFt, 4),
    customHeightFt: parseCustomFeet(payload.customHeightFt, 8),
    fileName: parseOptionalString(payload.fileName),
    fileType: parseOptionalString(payload.fileType),
    validationStatus: parseOptionalString(payload.validationStatus),
  }
}

export function resolveCheckoutOrder(input: {
  productId: string
  orientation: PrintOrientation
  customWidthFt: number
  customHeightFt: number
}): ResolvedCheckoutOrder {
  if (input.productId === CUSTOM_BANNER_PRODUCT_ID) {
    const widthFt = clamp(input.customWidthFt, CUSTOM_FT_MIN, CUSTOM_FT_MAX)
    const heightFt = clamp(input.customHeightFt, CUSTOM_FT_MIN, CUSTOM_FT_MAX)
    const shortIn = Math.min(widthFt, heightFt) * 12
    const longIn = Math.max(widthFt, heightFt) * 12
    const product = {
      id: CUSTOM_BANNER_PRODUCT_ID,
      name: `Custom ${formatFeet(widthFt)} x ${formatFeet(heightFt)} ft Vinyl Banner`,
      width_in: shortIn,
      height_in: longIn,
      price_cents: computeCustomPriceCents(widthFt, heightFt),
    }
    const printDimensions = getProductPrintDimensions(product, input.orientation)

    return {
      productId: product.id,
      orientation: input.orientation,
      productName: product.name,
      sizeLabel: getProductSizeLabel(product),
      formatLabel: getProductFormatLabel(product, input.orientation),
      widthFt: printDimensions.widthIn / 12,
      heightFt: printDimensions.heightIn / 12,
      widthIn: printDimensions.widthIn,
      heightIn: printDimensions.heightIn,
      amountCents: product.price_cents,
    }
  }

  const product = STATIC_PRODUCTS.find(
    (item) => item.id === input.productId && item.id !== CUSTOM_BANNER_PRODUCT_ID,
  )

  if (!product) {
    throw new Error('Selected banner size is not available.')
  }

  const printDimensions = getProductPrintDimensions(product, input.orientation)

  return {
    productId: product.id,
    orientation: input.orientation,
    productName: product.name,
    sizeLabel: getProductSizeLabel(product),
    formatLabel: getProductFormatLabel(product, input.orientation),
    widthFt: printDimensions.widthIn / 12,
    heightFt: printDimensions.heightIn / 12,
    widthIn: printDimensions.widthIn,
    heightIn: printDimensions.heightIn,
    amountCents: product.price_cents,
  }
}
