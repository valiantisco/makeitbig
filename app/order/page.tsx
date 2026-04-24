import { Suspense } from 'react'
import OrderFlow from './order-flow'
import { CUSTOM_BANNER_PRODUCT_ID } from '@/lib/banner-config'
import { STATIC_PRODUCTS, type Product } from '@/lib/products'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Order Custom Vinyl Banners | MakeItBig',
  description: 'Choose your banner size, upload your design, and review print quality before checkout.',
  path: '/order',
})

function withCustomProduct(list: Product[]): Product[] {
  if (list.some((p) => p.id === CUSTOM_BANNER_PRODUCT_ID)) return list
  const fallback = STATIC_PRODUCTS.find((p) => p.id === CUSTOM_BANNER_PRODUCT_ID)
  return fallback ? [...list, fallback] : list
}

async function loadProducts(): Promise<Product[]> {
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
    return withCustomProduct(data)
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
