import { BANNER_SIZES, computeCustomPriceCents, CUSTOM_BANNER_PRODUCT_ID } from './banner-config'

export type Product = {
  id: string
  name: string
  width_in: number
  height_in: number
  material: string
  finish: string
  price_cents: number
  cost_cents: number | null
  active: boolean
}

const STANDARD_PRODUCTS: Product[] = BANNER_SIZES.map((size) => ({
  id: size.productId,
  name: `${size.label.replace(' x ', ' × ')} ft Vinyl Banner`,
  width_in: size.shortIn,
  height_in: size.longIn,
  material: 'Matte Vinyl',
  finish: 'Matte',
  price_cents: size.priceCents,
  cost_cents: null,
  active: true,
}))

const CUSTOM_DEFAULT_W_FT = 4
const CUSTOM_DEFAULT_H_FT = 8

const CUSTOM_PLACEHOLDER_PRODUCT: Product = {
  id: CUSTOM_BANNER_PRODUCT_ID,
  name: 'Custom size Vinyl Banner',
  width_in: Math.min(CUSTOM_DEFAULT_W_FT, CUSTOM_DEFAULT_H_FT) * 12,
  height_in: Math.max(CUSTOM_DEFAULT_W_FT, CUSTOM_DEFAULT_H_FT) * 12,
  material: 'Matte Vinyl',
  finish: 'Matte',
  price_cents: computeCustomPriceCents(CUSTOM_DEFAULT_W_FT, CUSTOM_DEFAULT_H_FT),
  cost_cents: null,
  active: true,
}

export const STATIC_PRODUCTS: Product[] = [...STANDARD_PRODUCTS, CUSTOM_PLACEHOLDER_PRODUCT]
