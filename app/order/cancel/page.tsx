import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Checkout Canceled | MakeItBig',
  description: 'Return to your MakeItBig order and continue checkout when you are ready.',
  path: '/order/cancel',
})

export default async function OrderCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const params = await searchParams

  return (
    <main className="mib-orderStatusPage">
      <Shell className="mib-orderStatusCard">
        <p className="mib-orderEyebrow mib-p3">Checkout canceled</p>
        <h1 className="mib-orderStatusTitle mib-h1">Your banner setup is still here.</h1>
        <p className="mib-orderStatusCopy mib-p1">
          No charge was completed. You can go back to the order flow, review the
          banner, and try checkout again whenever you are ready.
        </p>

        {params.order_id && (
          <div className="mib-orderStatusMeta">
            <p className="mib-p3">
              Pending order: <strong>{params.order_id}</strong>
            </p>
          </div>
        )}

        <div className="mib-orderStatusActions">
          <Link href="/order" className="mib-orderButton mib-orderButton--gradient">
            Return to order
          </Link>
          <Link href="/faq" className="mib-orderButton mib-orderButton--dark">
            Read ordering FAQ
          </Link>
        </div>
      </Shell>
    </main>
  )
}
