import { Suspense } from 'react'
import OrderFlow from './order-flow'

const STATIC_PRODUCTS = [
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

async function loadProducts() {
  // Use Supabase when env vars are available, otherwise fall back to static data
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return STATIC_PRODUCTS
  }
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('width_in', { ascending: true })
    if (error || !data || data.length === 0) return STATIC_PRODUCTS
    return data
  } catch {
    return STATIC_PRODUCTS
  }
}

export default async function OrderPage() {
  const products = await loadProducts()

  return (
    <Suspense>
      <OrderFlow products={products} />
    </Suspense>
  )
}
