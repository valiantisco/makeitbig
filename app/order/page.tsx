import { Suspense } from 'react'
import OrderFlow from './order-flow'
import { STATIC_PRODUCTS, type Product } from '@/lib/products'

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
