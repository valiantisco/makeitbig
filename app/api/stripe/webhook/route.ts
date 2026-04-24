import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { markOrderPaidFromCheckoutSession } from '@/lib/orders'
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature header.' },
      { status: 400 },
    )
  }

  const payload = await request.text()

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid webhook signature.'

    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await markOrderPaidFromCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Webhook handling failed.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
