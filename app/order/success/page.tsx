import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Checkout Complete | MakeItBig',
  description: 'Stripe Checkout is complete. We are confirming your custom banner order now.',
  path: '/order/success',
})

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; session_id?: string }>
}) {
  const params = await searchParams

  return (
    <main className="mib-orderStatusPage">
      <Shell className="mib-orderStatusCard">
        <p className="mib-orderEyebrow mib-p3">Checkout complete</p>
        <h1 className="mib-orderStatusTitle mib-h1">Your banner order is in.</h1>
        <p className="mib-orderStatusCopy mib-p1">
          Stripe Checkout finished successfully. We are confirming payment and
          marking the order as paid through the webhook now.
        </p>

        {(params.order_id || params.session_id) && (
          <div className="mib-orderStatusMeta">
            {params.order_id && (
              <p className="mib-p3">
                Order ID: <strong>{params.order_id}</strong>
              </p>
            )}
            {params.session_id && (
              <p className="mib-p3">
                Stripe session: <strong>{params.session_id}</strong>
              </p>
            )}
          </div>
        )}

        <div className="mib-orderStatusActions">
          <Link href="/" className="mib-orderButton mib-orderButton--gradient">
            Back to home
          </Link>
          <Link href="/contact" className="mib-orderButton mib-orderButton--dark">
            Contact support
          </Link>
        </div>
      </Shell>
    </main>
  )
}
