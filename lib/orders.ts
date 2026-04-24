import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export type CreateOrderInput = {
  productId: string
  productName: string
  orientation: string
  sizeLabel: string
  widthFt: number
  heightFt: number
  widthIn: number
  heightIn: number
  amountCents: number
  currency: string
  fileName: string | null
  fileType: string | null
  validationStatus: string | null
}

export async function createPendingOrder(input: CreateOrderInput) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      product_id: input.productId,
      product_name: input.productName,
      orientation: input.orientation,
      size_label: input.sizeLabel,
      width_ft: input.widthFt,
      height_ft: input.heightFt,
      width_in: input.widthIn,
      height_in: input.heightIn,
      amount_cents: input.amountCents,
      currency: input.currency,
      file_name: input.fileName,
      file_type: input.fileType,
      validation_status: input.validationStatus,
      payment_status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Could not create the order record.')
  }

  return data
}

export async function attachStripeSessionToOrder(input: {
  orderId: string
  checkoutSessionId: string
}) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({
      stripe_checkout_session_id: input.checkoutSessionId,
      payment_status: 'checkout_created',
    })
    .eq('id', input.orderId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function markOrderPaidFromCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  const supabase = createAdminClient()
  const orderId = session.metadata?.order_id

  if (!orderId) {
    throw new Error('Missing order_id metadata on the Stripe Checkout Session.')
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      customer_email: session.customer_details?.email ?? null,
    })
    .eq('id', orderId)

  if (error) {
    throw new Error(error.message)
  }
}
