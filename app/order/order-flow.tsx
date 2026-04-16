'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
            MakeItBig
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How big do you want to go?
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
            Pick your size first. We'll guide the rest.
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
      </section>
    </main>
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
  const sizeLabel = `${pendingProduct.width_in}×${pendingProduct.height_in} in`

  return (
    <div
      className="mt-10 rounded-2xl border border-yellow-500/25 bg-yellow-500/8 px-6 py-5"
      role="alertdialog"
      aria-label="Confirm size change"
    >
      <p className="text-sm font-semibold text-white">
        Switch to {sizeLabel}?
      </p>
      <p className="mt-1 text-sm text-white/60">
        Your current file will be cleared and you'll need to re-upload it. Quality will be
        re-checked against the new size.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Switch size
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
        >
          Keep current size
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
  const label = `${product.width_in}×${product.height_in}`
  const price = (product.price_cents / 100).toFixed(0)
  const isMostPopular = product.width_in === 36 && product.height_in === 72
  const isBestValue = product.width_in === 48 && product.height_in === 96

  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      aria-pressed={isSelected}
      className={`relative overflow-hidden rounded-3xl border p-6 text-left backdrop-blur transition ${
        isSelected
          ? 'border-orange-500 bg-white/[0.07] shadow-[0_0_0_1px_rgba(249,115,22,0.35)]'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.06]'
      }`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/45">Vinyl Banner</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{label}</h2>
        </div>

        {isMostPopular ? (
          <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white">
            Most Popular
          </span>
        ) : isBestValue ? (
          <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-300">
            Best Value
          </span>
        ) : null}
      </div>

      <div className="flex min-h-[180px] items-end justify-center rounded-2xl border border-white/10 bg-black/30 p-6">
        <div
          className="rounded-md bg-orange-600/90 shadow-[0_0_40px_rgba(234,88,12,0.25)]"
          style={{
            width:
              product.width_in === 24 ? '72px' : product.width_in === 36 ? '110px' : '145px',
            height:
              product.height_in === 36 ? '108px' : product.height_in === 72 ? '140px' : '170px',
          }}
        />
      </div>

      <div className="mt-6">
        <p className="text-3xl font-bold text-white">${price}</p>
        <p className="mt-3 text-sm leading-6 text-white/65">
          {isMostPopular
            ? 'Best for events, booths, and all-around visibility.'
            : isBestValue
              ? 'Maximum impact for garages, fences, and big presence.'
              : 'Best for smaller events, tables, and quick setups.'}
        </p>
      </div>

      <div
        className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
          isSelected ? 'bg-orange-600 text-white' : 'bg-white text-black'
        }`}
      >
        {isSelected ? 'Selected' : 'Select Size'}
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
    <section className="mt-14 space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-400">Upload</p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Upload your design for {selectedProduct.width_in}×{selectedProduct.height_in}
          </h2>

          <p className="mt-4 text-base leading-7 text-white/70">
            PNG, JPG, or PDF. We'll check it and let you know if it looks sharp at this size.
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

        <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-black/30 p-10 text-center">
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
    <>
      <p className="text-lg font-semibold text-white">Drag and drop your file here</p>
      <p className="mt-2 text-sm text-white/50">or tap to browse your device</p>

      <button
        type="button"
        onClick={onChoose}
        className="mt-6 inline-flex cursor-pointer rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
      >
        Choose File
      </button>

      {sizeError ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {sizeError}
        </p>
      ) : resumeHint ? (
        <p className="mt-4 text-sm text-white/50">
          Last time you used{' '}
          <span className="font-medium text-white/80">{resumeHint}</span>
          {' '}— upload it again to continue.
        </p>
      ) : (
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/35">
          Accepted: PNG, JPG, PDF · Max {FILE_SIZE_LIMIT_MB} MB
        </p>
      )}
    </>
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
      <p className="text-sm uppercase tracking-[0.16em] text-white/40">File Selected</p>
      <p className="mt-2 break-all text-lg font-semibold text-white">{file.name}</p>
      <p className="mt-1 text-sm text-white/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

      {previewUrl ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-3">
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            className="max-h-[300px] w-auto object-contain"
          />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-white/10 bg-black/40 px-6 py-8 text-sm text-white/60">
          PDF selected. Preview coming in the next step.
        </div>
      )}

      {validation === null ? (
        <p className="mt-4 text-sm text-white/50" aria-live="polite">
          Checking image quality…
        </p>
      ) : (
        <ValidationBadge validation={validation} />
      )}

      <div className="mt-6 flex gap-6">
        <button
          type="button"
          onClick={onReplace}
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          Replace file
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-medium text-orange-400 transition hover:text-orange-300"
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
  const colorClass =
    validation.status === 'good'
      ? 'border-green-500/30 bg-green-500/10'
      : validation.status === 'warn'
        ? 'border-yellow-500/30 bg-yellow-500/10'
        : 'border-red-500/30 bg-red-500/10'

  return (
    <div
      className={`mt-6 w-full max-w-xl rounded-2xl border px-5 py-4 text-left ${colorClass}`}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-white">{validation.message}</p>

      {validation.recommendation && (
        <p className="mt-1 text-sm text-white/70">{validation.recommendation}</p>
      )}

      {validation.payoff && (
        <p className="mt-2 text-sm font-medium text-white">{validation.payoff}</p>
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-400">
        Order Summary
      </p>

      <div className="mt-6 divide-y divide-white/8">
        <SummaryRow label="Banner">
          <span className="font-medium text-white">
            {product.width_in}×{product.height_in} in
          </span>
          <span className="ml-3 text-white/50">Vinyl Banner</span>
        </SummaryRow>

        <SummaryRow label="Price">
          <span className="text-xl font-bold text-white">{formatPrice(product.price_cents)}</span>
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
          {delivery.note && <span className="ml-2 text-sm text-white/50">{delivery.note}</span>}
        </SummaryRow>
      </div>

      <div className="mt-8">
        {blocked && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            Upload a higher resolution file to continue.
          </p>
        )}

        {checkoutState === 'error' && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            Something went wrong. Please try again.
          </p>
        )}

        {!checkoutEnabled && (
          <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
            Checkout is not yet available — backend integration in progress.
          </p>
        )}

        <button
          type="button"
          onClick={onCheckout}
          disabled={ctaDisabled}
          aria-disabled={ctaDisabled}
          className={`inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-base font-semibold transition ${
            ctaDisabled
              ? 'cursor-not-allowed bg-white/10 text-white/30'
              : 'bg-orange-600 text-white hover:bg-orange-500'
          }`}
        >
          {submitting ? 'Processing…' : 'Continue to Checkout'}
        </button>

        <p className="mt-3 text-center text-xs text-white/35">
          You won't be charged until the next step.
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
    <div className="flex items-baseline justify-between gap-4 py-4">
      <span className="shrink-0 text-sm text-white/50">{label}</span>
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
  const dotClass =
    status === 'good' ? 'bg-green-500' : status === 'warn' ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <span className="flex items-center gap-2">
      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
      <span className="font-medium text-white">{QUALITY_LABELS[status]}</span>
    </span>
  )
}
