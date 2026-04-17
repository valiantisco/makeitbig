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

export const STATIC_PRODUCTS: Product[] = [
  {
    id: 'banner-24x36',
    name: '24×36 Vinyl Banner',
    width_in: 24,
    height_in: 36,
    material: 'Matte Vinyl',
    finish: 'Matte',
    price_cents: 3000,
    cost_cents: null,
    active: true,
  },
  {
    id: 'banner-36x72',
    name: '36×72 Vinyl Banner',
    width_in: 36,
    height_in: 72,
    material: 'Matte Vinyl',
    finish: 'Matte',
    price_cents: 7500,
    cost_cents: null,
    active: true,
  },
  {
    id: 'banner-48x96',
    name: '48×96 Vinyl Banner',
    width_in: 48,
    height_in: 96,
    material: 'Matte Vinyl',
    finish: 'Matte',
    price_cents: 15000,
    cost_cents: null,
    active: true,
  },
]
