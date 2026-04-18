import { BANNER_SIZES } from './banner-config'

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

export const STATIC_PRODUCTS: Product[] = BANNER_SIZES.map((size) => ({
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
