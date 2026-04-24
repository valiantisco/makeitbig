import { NextResponse } from 'next/server'
import {
  parseCheckoutPayload,
  resolveCheckoutOrder,
  type CheckoutPayload,
} from '@/lib/checkout'
import { attachStripeSessionToOrder, createPendingOrder } from '@/lib/orders'
import { getSiteUrl, getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutPayload
    const parsed = parseCheckoutPayload(payload)
    const order = resolveCheckoutOrder(parsed)

    const createdOrder = await createPendingOrder({
      productId: order.productId,
      productName: order.productName,
      orientation: order.orientation,
      sizeLabel: order.sizeLabel,
      widthFt: order.widthFt,
      heightFt: order.heightFt,
      widthIn: order.widthIn,
      heightIn: order.heightIn,
      amountCents: order.amountCents,
      currency: 'usd',
      fileName: parsed.fileName,
      fileType: parsed.fileType,
      validationStatus: parsed.validationStatus,
    })

    const stripe = getStripe()
    const siteUrl = getSiteUrl()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}&order_id=${createdOrder.id}`,
      cancel_url: `${siteUrl}/order/cancel?order_id=${createdOrder.id}`,
      client_reference_id: createdOrder.id,
      metadata: {
        order_id: createdOrder.id,
        size: order.formatLabel,
        width: String(order.widthIn),
        height: String(order.heightIn),
        file_name: parsed.fileName ?? '',
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: order.amountCents,
            product_data: {
              name: order.productName,
              description: order.formatLabel,
            },
          },
        },
      ],
    })

    if (!session.url) {
      throw new Error('Stripe Checkout did not return a hosted URL.')
    }

    await attachStripeSessionToOrder({
      orderId: createdOrder.id,
      checkoutSessionId: session.id,
    })

    return NextResponse.json({
      url: session.url,
      orderId: createdOrder.id,
      sessionId: session.id,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not start Stripe Checkout right now.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
