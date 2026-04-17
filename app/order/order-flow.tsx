'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Product = {
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

type ValidationStatus = 'good' | 'warn' | 'bad'

export type ValidationResult = {
  status: ValidationStatus
  message: string
  recommendation?: string
  payoff?: string
  dpi?: number
}

export type OrderDraft = {
  product: Pick<Product, 'id' | 'name' | 'width_in' | 'height_in' | 'price_cents'>
  fileName: string
  fileSizeBytes: number
  fileType: string
  validation: ValidationResult
}

type FileState = {
  file: File
  previewUrl: string | null
  validation: ValidationResult | null
}

type CheckoutState = 'idle' | 'submitting' | 'error'

type DeliveryEstimate = {
  range: string
  note?: string
}

// Serializable subset saved to sessionStorage for refresh continuity
type ResumeDraft = {
  productId: string
  fileName: string
  fileType: string
}

type OrderFlowProps = {
  products: Product[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILE_SIZE_LIMIT_MB = 50
const DPI_GOOD = 150
const DPI_WARN = 100

const STANDARD_DELIVERY: DeliveryEstimate = {
  range: '5–7 business days',
  note: 'After file approval',
}

/**
 * Flip to true once Supabase Storage upload + Stripe session are wired.
 * Controls whether the checkout CTA is active or shows a dev placeholder.
 */
const CHECKOUT_ENABLED = false

const RESUME_DRAFT_KEY = 'mib_resume_draft'

// ---------------------------------------------------------------------------
// Session storage helpers
// ---------------------------------------------------------------------------

function saveResumeDraft(draft: ResumeDraft): void {
  try {
    sessionStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // sessionStorage may be unavailable (private mode, storage full)
  }
}

function loadResumeDraft(): ResumeDraft | null {
  try {
    const raw = sessionStorage.getItem(RESUME_DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ResumeDraft
  } catch {
    return null
  }
}

function clearResumeDraft(): void {
  try {
    sessionStorage.removeItem(RESUME_DRAFT_KEY)
  } catch {}
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns plain-language context for how a banner this size is typically viewed.
 * Used to make validation messages meaningful relative to the actual product.
 */
function getViewingContext(product: Pick<Product, 'width_in' | 'height_in'>): {
  distance: string
  closeness: 'close' | 'medium' | 'far'
} {
  const sqIn = product.width_in * product.height_in
  // 24×36 = 864 sq in → close-up reading distance
  // 36×72 = 2592 sq in → mid-range viewing
  // 48×96 = 4608 sq in → large format, viewed from a distance
  if (sqIn <= 900) return { distance: 'up close', closeness: 'close' }
  if (sqIn <= 2700) return { distance: 'a few feet away', closeness: 'medium' }
  return { distance: '10+ feet away', closeness: 'far' }
}

function validateImageDpi(
  imgWidth: number,
  imgHeight: number,
  product: Pick<Product, 'width_in' | 'height_in'>,
): ValidationResult {
  const dpi = Math.min(imgWidth / product.width_in, imgHeight / product.height_in)
  const roundedDpi = Math.round(dpi)
  const { distance, closeness } = getViewingContext(product)
  const sizeLabel = `${product.width_in}×${product.height_in} in`

  if (dpi >= DPI_GOOD) {
    return {
      status: 'good',
      message: `Looking sharp — ${roundedDpi} DPI for a ${sizeLabel} banner.`,
      payoff:
        closeness === 'close'
          ? 'Great resolution for a banner this size. It will look crisp up close.'
          : 'More than enough quality for this size. This is going to look great.',
      dpi: roundedDpi,
    }
  }

  if (dpi >= DPI_WARN) {
    const recommendation =
      closeness === 'close'
        ? `This banner is read ${distance} — a higher resolution file will look noticeably sharper.`
        : closeness === 'medium'
          ? `This banner is viewed ${distance}. It will print acceptably, but a sharper file is better.`
          : `Large banners are viewed ${distance}, so ${roundedDpi} DPI will likely print fine.`

    return {
      status: 'warn',
      message: `${roundedDpi} DPI — may look slightly soft at ${sizeLabel}.`,
      recommendation,
      payoff: closeness === 'far' ? 'From a distance, this will still look great.' : undefined,
      dpi: roundedDpi,
    }
  }

  const recommendation =
    closeness === 'close'
      ? `This banner is read ${distance} and needs at least ${DPI_WARN} DPI to print clearly. Try a higher resolution export or choose a smaller size.`
      : closeness === 'medium'
        ? `For a ${sizeLabel} banner, aim for at least ${DPI_WARN} DPI. Consider a smaller size or a higher resolution file.`
        : `Even for a large banner viewed ${distance}, ${roundedDpi} DPI may show noticeable softness. A higher resolution file will give better results.`

  return {
    status: 'bad',
    message: `${roundedDpi} DPI is too low for a ${sizeLabel} banner.`,
    recommendation,
    dpi: roundedDpi,
  }
}

function validatePdf(): ValidationResult {
  return {
    status: 'warn',
    message: "PDF received — we'll verify quality after upload.",
    payoff: 'PDFs typically print well. We check them manually before production.',
  }
}

function getFileSizeError(file: File): string | null {
  if (file.size > FILE_SIZE_LIMIT_MB * 1024 * 1024) {
    return `File is too large. Maximum size is ${FILE_SIZE_LIMIT_MB} MB.`
  }
  return null
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

// ---------------------------------------------------------------------------
// OrderFlow
// ---------------------------------------------------------------------------

export default function OrderFlow({ products }: OrderFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedId = searchParams.get('size')

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId],
  )

  // Whether the upload section currently has an active file
  const [hasActiveFile, setHasActiveFile] = useState(false)
  // A size the user clicked while a file was active — awaiting confirmation
  const [pendingProductId, setPendingProductId] = useState<string | null>(null)

  const pendingProduct = useMemo(
    () => (pendingProductId ? products.find((p) => p.id === pendingProductId) ?? null : null),
    [products, pendingProductId],
  )

  function commitSizeChange(productId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('size', productId)
    router.replace(`/order?${params.toString()}`, { scroll: false })
  }

  function handleSelect(productId: string) {
    if (productId === selectedId) return
    if (hasActiveFile) {
      // Intercept — ask for confirmation before clearing file state
      setPendingProductId(productId)
      return
    }
    commitSizeChange(productId)
  }

  function handleConfirmSizeChange() {
    if (!pendingProductId) return
    const idToSwitch = pendingProductId
    setPendingProductId(null)
    setHasActiveFile(false)
    clearResumeDraft()
    commitSizeChange(idToSwitch)
  }

  function handleCancelSizeChange() {
    setPendingProductId(null)
  }

  return (
    <div className="min-h-screen bg-[#f3f1ed]">
      <nav
        style={{ backgroundColor: '#c40036' }}
        className="flex h-[72px] items-center px-6"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/mib-logo.svg"
              alt="MakeItBig"
              width={140}
              height={43}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>

          <div className="flex items-center gap-1">
            <StepPill
              number="01"
              label="Size"
              state={selectedProduct ? 'done' : 'active'}
            />
            <div className="h-px w-6 bg-white/20" />
            <StepPill
              number="02"
              label="Upload"
              state={
                selectedProduct && hasActiveFile
                  ? 'done'
                  : selectedProduct
                  ? 'active'
                  : 'inactive'
              }
            />
            <div className="h-px w-6 bg-white/20" />
            <StepPill
              number="03"
              label="Checkout"
              state="inactive"
            />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pt-14 pb-20">
        <div className="max-w-3xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: '#c40036' }}
          >
            Step 01
          </p>
          <h1
            className="mt-3 font-bold"
            style={{
              fontSize: '52px',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: '#17181c',
            }}
          >
            How big do you want to go?
          </h1>
          <p
            className="mt-4 leading-7"
            style={{ fontSize: '18px', color: 'rgba(23,24,28,0.55)' }}
          >
            Pick your size. We&apos;ll handle the rest.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProduct?.id === product.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {pendingProduct !== null && (
          <SizeChangeConfirmation
            pendingProduct={pendingProduct}
            onConfirm={handleConfirmSizeChange}
            onCancel={handleCancelSizeChange}
          />
        )}

        {selectedProduct !== null && pendingProduct === null && (
          <UploadSection
            key={selectedProduct.id}
            selectedProduct={selectedProduct}
            onFileStateChange={setHasActiveFile}
          />
        )}
      </main>
    </div>
  )
}

function StepPill({
  number,
  label,
  state,
}: {
  number: string
  label: string
  state: 'active' | 'done' | 'inactive'
}) {
  const base = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition'

  if (state === 'active') {
    return (
      <span className={`${base} bg-white`} style={{ color: '#c40036' }}>
        {number} {label}
      </span>
    )
  }

  if (state === 'done') {
    return (
      <span className={`${base}`} style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {number} {label}
      </span>
    )
  }

  return (
    <span
      className={`${base}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
    >
      {number} {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// SizeChangeConfirmation
// ---------------------------------------------------------------------------

function SizeChangeConfirmation({
  pendingProduct,
  onConfirm,
  onCancel,
}: {
  pendingProduct: Pick<Product, 'width_in' | 'height_in'>
  onConfirm: () => void
  onCancel: () => void
}) {
  const sizeLabel = `${pendingProduct.width_in} × ${pendingProduct.height_in} in`

  return (
    <div
      className="mt-8 rounded-2xl bg-white px-6 py-6"
      style={{
        borderTop: '4px solid #f4c33d',
        boxShadow: '0 1px 3px rgba(23,24,28,0.07)',
      }}
      role="alertdialog"
      aria-label="Confirm size change"
    >
      <p className="text-sm font-semibold" style={{ color: '#17181c' }}>
        Switch to {sizeLabel}?
      </p>
      <p className="mt-1 text-sm" style={{ color: 'rgba(23,24,28,0.55)' }}>
        Your current file will be cleared and you&apos;ll need to re-upload it. Quality will be
        re-checked against the new size.
      </p>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#c40036' }}
        >
          Switch size
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#17181c' }}
        >
          Keep current
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

function ProductCard({
  product,
  isSelected,
  onSelect,
}: {
  product: Product
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const sizeLabel = `${product.width_in} × ${product.height_in} in`
  const price = (product.price_cents / 100).toFixed(0)
  const isMostPopular = product.width_in === 36 && product.height_in === 72
  const isBestValue = product.width_in === 48 && product.height_in === 96

  const bannerStyle: React.CSSProperties =
    product.width_in === 24
      ? {
          width: '64px',
          height: '96px',
          background: 'linear-gradient(145deg, #c40036, #8b001f)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }
      : product.width_in === 36
      ? {
          width: '64px',
          height: '128px',
          background: 'linear-gradient(145deg, #17c1ce, #0e8a94)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }
      : {
          width: '76px',
          height: '152px',
          background: 'linear-gradient(145deg, #f4c33d, #c89b00)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }

  const dimLabel = `${product.width_in} × ${product.height_in}`

  const cardStyle: React.CSSProperties = isSelected
    ? {
        borderTop: '4px solid #c40036',
        backgroundColor: 'rgba(196,0,54,0.03)',
        border: '1px solid rgba(196,0,54,0.18)',
        borderTopWidth: '4px',
        borderTopColor: '#c40036',
      }
    : {
        border: '1px solid rgba(23,24,28,0.08)',
        backgroundColor: '#ffffff',
      }

  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      aria-pressed={isSelected}
      className="group relative flex flex-col rounded-3xl p-8 text-left transition-all duration-200"
      style={{
        ...cardStyle,
        borderRadius: '24px',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 12px 32px rgba(23,24,28,0.10)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-medium uppercase"
            style={{
              fontSize: '10px',
              letterSpacing: '0.14em',
              color: 'rgba(23,24,28,0.4)',
            }}
          >
            Vinyl Banner
          </p>
          <h2
            className="mt-1.5 font-bold"
            style={{ fontSize: '28px', letterSpacing: '-0.03em', color: '#17181c' }}
          >
            {sizeLabel}
          </h2>
        </div>

        {isMostPopular ? (
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase"
            style={{
              letterSpacing: '0.1em',
              backgroundColor: '#c40036',
              color: '#fff',
            }}
          >
            Popular
          </span>
        ) : isBestValue ? (
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase"
            style={{
              letterSpacing: '0.1em',
              backgroundColor: 'rgba(244,195,61,0.15)',
              color: '#8b6800',
              border: '1px solid rgba(244,195,61,0.5)',
            }}
          >
            Best Value
          </span>
        ) : null}
      </div>

      <div
        className="mt-5 flex items-end justify-center pb-6"
        style={{
          height: '220px',
          backgroundColor: '#17181c',
          borderRadius: '16px',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div style={bannerStyle} />
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.05em',
            }}
          >
            {dimLabel}
          </span>
        </div>
      </div>

      <p
        className="mt-6 font-extrabold"
        style={{ fontSize: '56px', letterSpacing: '-0.04em', color: '#17181c', lineHeight: 1 }}
      >
        ${price}
      </p>

      <p
        className="mt-2 flex-grow leading-relaxed"
        style={{ fontSize: '15px', color: 'rgba(23,24,28,0.6)', minHeight: '44px' }}
      >
        {isMostPopular
          ? 'Best for events, booths, and all-around visibility.'
          : isBestValue
          ? 'Maximum impact for garages, fences, and big presence.'
          : 'Best for smaller events, tables, and quick setups.'}
      </p>

      <div
        className="mt-6 inline-flex w-full items-center justify-center gap-2 font-semibold text-white transition-all duration-200"
        style={{
          height: '50px',
          borderRadius: '999px',
          backgroundColor: isSelected ? '#c40036' : '#17181c',
          fontSize: '15px',
        }}
      >
        {isSelected ? (
          <>
            Selected
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 7l3.5 3.5 6.5-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        ) : (
          'Select Size'
        )}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// UploadSection
// ---------------------------------------------------------------------------

function UploadSection({
  selectedProduct,
  onFileStateChange,
}: {
  selectedProduct: Pick<Product, 'id' | 'name' | 'width_in' | 'height_in' | 'price_cents'>
  onFileStateChange: (hasFile: boolean) => void
}) {
  const [fileState, setFileState] = useState<FileState | null>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle')
  // File name from previous session — cleared once a new file is selected
  const [resumeHint, setResumeHint] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const activePreviewUrl = useRef<string | null>(null)
  const imgLoadRef = useRef<HTMLImageElement | null>(null)

  // Notify parent whenever file presence changes
  useEffect(() => {
    onFileStateChange(fileState !== null)
  }, [fileState, onFileStateChange])

  // Check sessionStorage for a prior draft on this product
  useEffect(() => {
    const saved = loadResumeDraft()
    if (saved && saved.productId === selectedProduct.id) {
      setResumeHint(saved.fileName)
    }
  }, [selectedProduct.id])

  // Revoke object URL and cancel in-flight image load on unmount
  useEffect(() => {
    return () => {
      if (activePreviewUrl.current) URL.revokeObjectURL(activePreviewUrl.current)
      if (imgLoadRef.current) {
        imgLoadRef.current.onload = null
        imgLoadRef.current.onerror = null
      }
    }
  }, [])

  // Persist draft metadata once validation resolves
  const orderDraft: OrderDraft | null = useMemo(
    () =>
      fileState?.validation != null
        ? {
            product: selectedProduct,
            fileName: fileState.file.name,
            fileSizeBytes: fileState.file.size,
            fileType: fileState.file.type,
            validation: fileState.validation,
          }
        : null,
    [fileState, selectedProduct],
  )

  useEffect(() => {
    if (orderDraft) {
      saveResumeDraft({
        productId: orderDraft.product.id,
        fileName: orderDraft.fileName,
        fileType: orderDraft.fileType,
      })
    }
  }, [orderDraft])

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    if (!selected) return

    if (activePreviewUrl.current) {
      URL.revokeObjectURL(activePreviewUrl.current)
      activePreviewUrl.current = null
    }
    if (imgLoadRef.current) {
      imgLoadRef.current.onload = null
      imgLoadRef.current.onerror = null
      imgLoadRef.current = null
    }

    setSizeError(null)
    setResumeHint(null)
    setCheckoutState('idle')

    const sizeErr = getFileSizeError(selected)
    if (sizeErr) {
      setSizeError(sizeErr)
      setFileState(null)
      return
    }

    if (selected.type.startsWith('image/')) {
      const url = URL.createObjectURL(selected)
      activePreviewUrl.current = url
      setFileState({ file: selected, previewUrl: url, validation: null })

      const img = new Image()
      imgLoadRef.current = img

      img.onload = () => {
        if (imgLoadRef.current !== img) return
        const result = validateImageDpi(img.width, img.height, selectedProduct)
        setFileState((prev) => (prev ? { ...prev, validation: result } : prev))
        imgLoadRef.current = null
      }

      img.onerror = () => {
        if (imgLoadRef.current !== img) return
        setFileState((prev) =>
          prev
            ? {
                ...prev,
                validation: {
                  status: 'bad',
                  message: 'Could not read image dimensions. Please try another file.',
                },
              }
            : prev,
        )
        imgLoadRef.current = null
      }

      img.src = url
    } else {
      setFileState({ file: selected, previewUrl: null, validation: validatePdf() })
    }
  }

  function handleRemove() {
    if (activePreviewUrl.current) {
      URL.revokeObjectURL(activePreviewUrl.current)
      activePreviewUrl.current = null
    }
    if (imgLoadRef.current) {
      imgLoadRef.current.onload = null
      imgLoadRef.current.onerror = null
      imgLoadRef.current = null
    }
    setFileState(null)
    setSizeError(null)
    setCheckoutState('idle')
    setResumeHint(null)
    clearResumeDraft()
  }

  async function handleCheckout() {
    if (!CHECKOUT_ENABLED || !orderDraft || !fileState) return
    setCheckoutState('submitting')

    try {
      // ── Step 1: Upload file to Supabase Storage ──────────────────────────
      // const { data: upload, error: uploadError } = await supabase.storage
      //   .from('designs')
      //   .upload(`orders/${crypto.randomUUID()}/${fileState.file.name}`, fileState.file)
      // if (uploadError) throw uploadError

      // ── Step 2: Create design record ─────────────────────────────────────
      // const { data: design, error: designError } = await supabase
      //   .from('designs')
      //   .insert({ product_id: orderDraft.product.id, storage_path: upload.path, ... })
      //   .select()
      //   .single()
      // if (designError) throw designError

      // ── Step 3: Create Stripe checkout session via route handler ─────────
      // const res = await fetch('/api/checkout', {
      //   method: 'POST',
      //   body: JSON.stringify({ designId: design.id }),
      // })
      // if (!res.ok) throw new Error('Failed to create checkout session')
      // const { url } = await res.json()
      // router.push(url)
    } catch {
      setCheckoutState('error')
    }
  }

  return (
    <section className="mt-16">
      <div className="max-w-3xl">
        <p
          className="text-xs font-semibold uppercase"
          style={{ letterSpacing: '0.16em', color: '#c40036' }}
        >
          Step 02
        </p>
        <h2
          className="mt-3 font-bold"
          style={{ fontSize: '36px', letterSpacing: '-0.03em', color: '#17181c' }}
        >
          Upload your design for {selectedProduct.width_in} × {selectedProduct.height_in} in
        </h2>
        <p className="mt-3 leading-7" style={{ fontSize: '16px', color: 'rgba(23,24,28,0.55)' }}>
          PNG, JPG, or PDF. We&apos;ll check it and let you know if it looks sharp at this size.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload your design file"
        tabIndex={-1}
      />

      <div
        className="mt-8 rounded-[20px] bg-white text-center transition-colors duration-150"
        style={{
          border: '2px dashed rgba(196,0,54,0.25)',
          padding: '48px 32px',
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.style.borderColor = '#c40036'
          e.currentTarget.style.backgroundColor = 'rgba(196,0,54,0.02)'
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(196,0,54,0.25)'
          e.currentTarget.style.backgroundColor = '#ffffff'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.style.borderColor = 'rgba(196,0,54,0.25)'
          e.currentTarget.style.backgroundColor = '#ffffff'
          const dropped = e.dataTransfer.files?.[0]
          if (!dropped) return
          const synth = { target: { files: e.dataTransfer.files, value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>
          handleFileChange(synth)
        }}
      >
        {fileState === null ? (
          <EmptyUpload onChoose={openFilePicker} sizeError={sizeError} resumeHint={resumeHint} />
        ) : (
          <FilePreview
            fileState={fileState}
            onRemove={handleRemove}
            onReplace={openFilePicker}
          />
        )}
      </div>

      {orderDraft !== null && (
        <OrderSummary
          draft={orderDraft}
          delivery={STANDARD_DELIVERY}
          checkoutState={checkoutState}
          checkoutEnabled={CHECKOUT_ENABLED}
          onCheckout={handleCheckout}
        />
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// EmptyUpload
// ---------------------------------------------------------------------------

function EmptyUpload({
  onChoose,
  sizeError,
  resumeHint,
}: {
  onChoose: () => void
  sizeError: string | null
  resumeHint: string | null
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'rgba(196,0,54,0.08)',
          color: '#c40036',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 16V8m0 0-3 3m3-3 3 3"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 16v1a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="mt-4 font-bold" style={{ fontSize: '20px', color: '#17181c' }}>
        Drop your design here
      </p>
      <p className="mt-1 text-sm" style={{ color: 'rgba(23,24,28,0.45)' }}>
        or click to browse
      </p>

      <button
        type="button"
        onClick={onChoose}
        className="mt-5 inline-flex cursor-pointer items-center rounded-full px-8 font-semibold text-white transition hover:opacity-90"
        style={{ height: '48px', backgroundColor: '#c40036', fontSize: '15px' }}
      >
        Choose File
      </button>

      {sizeError ? (
        <p className="mt-3 text-sm font-medium" style={{ color: '#c40036' }} role="alert">
          {sizeError}
        </p>
      ) : resumeHint ? (
        <p className="mt-3 text-sm" style={{ color: 'rgba(23,24,28,0.5)' }}>
          Last time you used{' '}
          <span className="font-semibold" style={{ color: 'rgba(23,24,28,0.75)' }}>
            {resumeHint}
          </span>{' '}
          — upload it again to continue.
        </p>
      ) : (
        <p
          className="mt-3 uppercase"
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'rgba(23,24,28,0.35)',
          }}
        >
          PNG · JPG · PDF · Max {FILE_SIZE_LIMIT_MB} MB
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilePreview
// ---------------------------------------------------------------------------

function FilePreview({
  fileState,
  onRemove,
  onReplace,
}: {
  fileState: FileState
  onRemove: () => void
  onReplace: () => void
}) {
  const { file, previewUrl, validation } = fileState

  return (
    <div className="flex flex-col items-center">
      <p
        className="text-xs font-semibold uppercase"
        style={{ letterSpacing: '0.14em', color: 'rgba(23,24,28,0.4)' }}
      >
        File Selected
      </p>
      <p className="mt-2 break-all font-semibold" style={{ fontSize: '18px', color: '#17181c' }}>
        {file.name}
      </p>
      <p className="mt-1 text-sm" style={{ color: 'rgba(23,24,28,0.5)' }}>
        {(file.size / 1024 / 1024).toFixed(2)} MB
      </p>

      {previewUrl ? (
        <div
          className="mt-6 overflow-hidden rounded-xl p-3"
          style={{
            border: '1px solid rgba(23,24,28,0.08)',
            backgroundColor: 'rgba(23,24,28,0.04)',
          }}
        >
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            className="w-auto object-contain"
            style={{ maxHeight: '280px', maxWidth: '280px' }}
          />
        </div>
      ) : (
        <div
          className="mt-6 rounded-xl px-6 py-8 text-sm"
          style={{
            border: '1px solid rgba(23,24,28,0.08)',
            backgroundColor: 'rgba(23,24,28,0.04)',
            color: 'rgba(23,24,28,0.55)',
          }}
        >
          PDF selected. Preview coming in the next step.
        </div>
      )}

      {validation === null ? (
        <p className="mt-4 text-sm" style={{ color: 'rgba(23,24,28,0.5)' }} aria-live="polite">
          Checking image quality...
        </p>
      ) : (
        <ValidationBadge validation={validation} />
      )}

      <div className="mt-6 flex gap-6">
        <button
          type="button"
          onClick={onReplace}
          className="text-sm font-medium transition hover:opacity-70"
          style={{ color: 'rgba(23,24,28,0.55)' }}
        >
          Replace file
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-medium transition hover:opacity-70"
          style={{ color: '#c40036' }}
        >
          Remove file
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ValidationBadge
// ---------------------------------------------------------------------------

function ValidationBadge({ validation }: { validation: ValidationResult }) {
  const styles: React.CSSProperties =
    validation.status === 'good'
      ? {
          borderColor: 'rgba(23,193,206,0.35)',
          backgroundColor: 'rgba(23,193,206,0.08)',
        }
      : validation.status === 'warn'
      ? {
          borderColor: 'rgba(244,195,61,0.4)',
          backgroundColor: 'rgba(244,195,61,0.08)',
        }
      : {
          borderColor: 'rgba(196,0,54,0.3)',
          backgroundColor: 'rgba(196,0,54,0.06)',
        }

  const titleColor =
    validation.status === 'good'
      ? '#0e8a94'
      : validation.status === 'warn'
      ? '#8b6800'
      : '#c40036'

  return (
    <div
      className="mt-6 w-full max-w-xl rounded-2xl border px-5 py-4 text-left"
      style={styles}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold" style={{ color: titleColor }}>
        {validation.message}
      </p>

      {validation.recommendation && (
        <p className="mt-1 text-sm" style={{ color: 'rgba(23,24,28,0.6)' }}>
          {validation.recommendation}
        </p>
      )}

      {validation.payoff && (
        <p className="mt-2 text-sm font-medium" style={{ color: 'rgba(23,24,28,0.75)' }}>
          {validation.payoff}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrderSummary
// ---------------------------------------------------------------------------

const QUALITY_LABELS: Record<ValidationStatus, string> = {
  good: 'Sharp at this size',
  warn: 'May look slightly soft',
  bad: 'File quality too low',
}

function OrderSummary({
  draft,
  delivery,
  checkoutState,
  checkoutEnabled,
  onCheckout,
}: {
  draft: OrderDraft
  delivery: DeliveryEstimate
  checkoutState: CheckoutState
  checkoutEnabled: boolean
  onCheckout: () => void
}) {
  const { product, fileName, validation } = draft

  const blocked = validation.status === 'bad'
  const submitting = checkoutState === 'submitting'
  const ctaDisabled = !checkoutEnabled || blocked || submitting

  return (
    <div
      className="mt-8 rounded-3xl p-10"
      style={{ backgroundColor: '#17181c' }}
    >
      <p
        className="text-xs font-semibold uppercase"
        style={{ letterSpacing: '0.16em', color: '#c40036' }}
      >
        Step 03
      </p>
      <h3
        className="mt-2 font-bold text-white"
        style={{ fontSize: '28px', letterSpacing: '-0.02em' }}
      >
        Order Summary
      </h3>

      <div className="mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <SummaryRow label="Banner">
          <span className="font-semibold text-white">
            {product.width_in} × {product.height_in} in
          </span>
          <span className="ml-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Vinyl Banner
          </span>
        </SummaryRow>

        <SummaryRow label="Price">
          <span className="font-bold text-white" style={{ fontSize: '20px' }}>
            {formatPrice(product.price_cents)}
          </span>
        </SummaryRow>

        <SummaryRow label="File">
          <span className="max-w-xs truncate font-medium text-white" title={fileName}>
            {fileName}
          </span>
        </SummaryRow>

        <SummaryRow label="Quality">
          <QualityIndicator status={validation.status} />
        </SummaryRow>

        <SummaryRow label="Delivery">
          <span className="font-medium text-white">{delivery.range}</span>
          {delivery.note && (
            <span className="ml-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {delivery.note}
            </span>
          )}
        </SummaryRow>
      </div>

      <div className="mt-8">
        {blocked && (
          <p className="mb-4 text-sm font-medium" style={{ color: '#c40036' }} role="alert">
            Upload a higher resolution file to continue.
          </p>
        )}

        {checkoutState === 'error' && (
          <p className="mb-4 text-sm font-medium" style={{ color: '#c40036' }} role="alert">
            Something went wrong. Please try again.
          </p>
        )}

        {!checkoutEnabled && (
          <p
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{
              border: '1px solid rgba(255,255,255,0.10)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Checkout is not yet available — backend integration in progress.
          </p>
        )}

        <button
          type="button"
          onClick={onCheckout}
          disabled={ctaDisabled}
          aria-disabled={ctaDisabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold text-white transition hover:opacity-90"
          style={{
            height: '56px',
            fontSize: '16px',
            backgroundColor: ctaDisabled ? 'rgba(255,255,255,0.10)' : '#c40036',
            color: ctaDisabled ? 'rgba(255,255,255,0.30)' : '#ffffff',
            cursor: ctaDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? (
            'Processing...'
          ) : (
            <>
              Continue to Checkout
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 8h10m0 0-3.5-3.5M13 8l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>

        <p
          className="mt-3 text-center text-xs"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          You won&apos;t be charged until the next step.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SummaryRow
// ---------------------------------------------------------------------------

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="shrink-0 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <span className="flex flex-wrap items-baseline justify-end gap-1 text-right text-sm">
        {children}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// QualityIndicator
// ---------------------------------------------------------------------------

function QualityIndicator({ status }: { status: ValidationStatus }) {
  const dotColor =
    status === 'good' ? '#17c1ce' : status === 'warn' ? '#f4c33d' : '#c40036'

  return (
    <span className="flex items-center gap-2">
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden
      />
      <span className="font-medium text-white">{QUALITY_LABELS[status]}</span>
    </span>
  )
}
