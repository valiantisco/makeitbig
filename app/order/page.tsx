import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import OrderFlow from './order-flow'

export default async function OrderPage() {
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('width_in', { ascending: true })

  if (error || !products) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Order</h1>
          <p className="mt-6 text-red-400">Failed to load products.</p>
        </div>
      </main>
    )
  }

  return (
    // Suspense boundary required because OrderFlow calls useSearchParams
    <Suspense>
      <OrderFlow products={products} />
    </Suspense>
  )
}
