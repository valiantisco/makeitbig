'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, DragEvent, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { BrandLogo } from '@/components/BrandLogo'
import { Shell } from '@/components/Shell'
import {
  clamp,
  computeCustomPriceCents,
  CUSTOM_BANNER_PRODUCT_ID,
  CUSTOM_FT_MAX,
  CUSTOM_FT_MIN,
  CUSTOM_PRICE_PER_SQ_FT,
  cx,
  formatFeet,
  formatFileSize,
  formatPrice,
  getProductFormatLabel,
  getProductInchLabel,
  getProductPrintDimensions,
  getProductSizeLabel,
  getProductTier,
  getProductUse,
  getRecommendedProduct,
  type PrintOrientation,
} from '@/lib/banner-config'
import type { Product } from '@/lib/products'

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
  orientation: PrintOrientation
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

type ResumeDraft = {
  productId: string
  orientation: PrintOrientation
  fileName: string
  fileType: string
}

type OrderFlowProps = {
  products: Product[]
}

const FILE_SIZE_LIMIT_MB = 50
const RESUME_DRAFT_KEY = 'mib_resume_draft'

function parseFtParam(value: string | null, fallback: number) {
  if (value === null || value === '') return fallback
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

const STANDARD_DELIVERY: DeliveryEstimate = {
  range: 'Ships in 3-5 days',
  note: 'After file approval',
}

const CHECKOUT_ENABLED = true

function saveResumeDraft(draft: ResumeDraft): void {
  try {
    sessionStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // sessionStorage may be unavailable in private mode.
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
  } catch {
    // Ignore storage failures.
  }
}

function getPpiThresholds(product: Pick<Product, 'width_in' | 'height_in'>) {
  const longIn = Math.max(product.width_in, product.height_in)
  if (longIn >= 100) return { good: 60, warn: 38 }
  if (longIn >= 72) return { good: 72, warn: 48 }
  return { good: 100, warn: 70 }
}

function getViewingDistance(product: Pick<Product, 'width_in' | 'height_in'>) {
  const longIn = Math.max(product.width_in, product.height_in)
  if (longIn >= 100) return 'from across a room'
  if (longIn >= 72) return 'from a few feet away'
  return 'up close'
}

function validateImageDpi(
  imgWidth: number,
  imgHeight: number,
  product: Pick<Product, 'width_in' | 'height_in'>,
  orientation: PrintOrientation,
): ValidationResult {
  const printDimensions = getProductPrintDimensions(product, orientation)
  const ppi = Math.min(imgWidth / printDimensions.widthIn, imgHeight / printDimensions.heightIn)
  const roundedPpi = Math.round(ppi)
  const thresholds = getPpiThresholds(product)
  const formatLabel = getProductFormatLabel(product, orientation)
  const distance = getViewingDistance(product)

  if (ppi >= thresholds.good) {
    return {
      status: 'good',
      message: `Ready for ${formatLabel}.`,
      payoff: `${roundedPpi} effective PPI should hold up ${distance}.`,
      dpi: roundedPpi,
    }
  }

  if (ppi >= thresholds.warn) {
    return {
      status: 'warn',
      message: `Usable, but detail may soften at ${formatLabel}.`,
      recommendation: 'Best for simple designs, photos, and bold type. Use a higher-res file for small text.',
      payoff: `${roundedPpi} effective PPI is workable for banners viewed ${distance}.`,
      dpi: roundedPpi,
    }
  }

  return {
    status: 'bad',
    message: `Too small for ${formatLabel}.`,
    recommendation: 'Upload a higher-resolution file or choose a smaller banner before checkout.',
    dpi: roundedPpi,
  }
}

function validatePdf(product: Pick<Product, 'width_in' | 'height_in'>, orientation: PrintOrientation): ValidationResult {
  return {
    status: 'warn',
    message: `PDF ready for manual check at ${getProductFormatLabel(product, orientation)}.`,
    payoff: 'PDFs often print well. We verify the file before production.',
  }
}

function getFileSizeError(file: File): string | null {
  if (file.size > FILE_SIZE_LIMIT_MB * 1024 * 1024) {
    return `File is too large. Maximum size is ${FILE_SIZE_LIMIT_MB} MB.`
  }
  return null
}

/** Scene content area inside `.mib-orderSizeCard__scene` (padding ~12px each side). */
const ORDER_CARD_PREVIEW_BOX = { w: 184, h: 112 }

function resolveCardLayoutProduct(
  product: Product,
  selectedId: string | null,
  selectedProduct: Product | null,
): Product {
  if (
    product.id === CUSTOM_BANNER_PRODUCT_ID &&
    selectedId === CUSTOM_BANNER_PRODUCT_ID &&
    selectedProduct
  ) {
    return selectedProduct
  }
  return product
}

function computeOrderCardPreviewPxPerInch(
  products: Product[],
  orientation: PrintOrientation,
  selectedId: string | null,
  selectedProduct: Product | null,
): number {
  let maxW = 0
  let maxH = 0
  for (const p of products) {
    const layout = resolveCardLayoutProduct(p, selectedId, selectedProduct)
    const { widthIn, heightIn } = getProductPrintDimensions(layout, orientation)
    maxW = Math.max(maxW, widthIn)
    maxH = Math.max(maxH, heightIn)
  }
  if (maxW <= 0 || maxH <= 0) return 1
  return Math.min(ORDER_CARD_PREVIEW_BOX.w / maxW, ORDER_CARD_PREVIEW_BOX.h / maxH)
}

function getCardPreviewStyle(
  product: Pick<Product, 'width_in' | 'height_in'>,
  orientation: PrintOrientation,
  pxPerInch: number,
) {
  const { widthIn, heightIn } = getProductPrintDimensions(product, orientation)
  const pxW = widthIn * pxPerInch
  const pxH = heightIn * pxPerInch

  return {
    '--mib-card-shape-w': `${Math.round(pxW)}px`,
    '--mib-card-shape-h': `${Math.round(pxH)}px`,
  } as CSSProperties
}

export default function OrderFlow({ products }: OrderFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedId = searchParams.get('size')
  const orientationParam = searchParams.get('orientation')
  const selectedOrientation: PrintOrientation = orientationParam === 'vertical' ? 'vertical' : 'horizontal'

  const customWRaw = parseFtParam(searchParams.get('cw'), 4)
  const customHRaw = parseFtParam(searchParams.get('ch'), 8)
  const customW = clamp(customWRaw, CUSTOM_FT_MIN, CUSTOM_FT_MAX)
  const customH = clamp(customHRaw, CUSTOM_FT_MIN, CUSTOM_FT_MAX)

  const rawSelected = useMemo(() => {
    if (!selectedId) return getRecommendedProduct(products)
    return products.find((product) => product.id === selectedId) ?? getRecommendedProduct(products)
  }, [products, selectedId])

  const selectedProduct = useMemo(() => {
    if (!rawSelected) return null
    if (rawSelected.id !== CUSTOM_BANNER_PRODUCT_ID) return rawSelected
    const shortIn = Math.min(customW, customH) * 12
    const longIn = Math.max(customW, customH) * 12
    return {
      ...rawSelected,
      width_in: shortIn,
      height_in: longIn,
      price_cents: computeCustomPriceCents(customW, customH),
      name: `Custom ${formatFeet(customW)} × ${formatFeet(customH)} ft Vinyl Banner`,
    }
  }, [rawSelected, customW, customH])

  const cardPreviewPxPerInch = useMemo(
    () => computeOrderCardPreviewPxPerInch(products, selectedOrientation, selectedId, selectedProduct),
    [products, selectedOrientation, selectedId, selectedProduct],
  )

  const [hasActiveFile, setHasActiveFile] = useState(false)
  const [pendingProductId, setPendingProductId] = useState<string | null>(null)

  const pendingProduct = useMemo(
    () => (pendingProductId ? products.find((product) => product.id === pendingProductId) ?? null : null),
    [products, pendingProductId],
  )

  function replaceQuery(nextSizeId: string | null, nextOrientation: PrintOrientation) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextSizeId) params.set('size', nextSizeId)
    params.set('orientation', nextOrientation)
    if (nextSizeId === CUSTOM_BANNER_PRODUCT_ID) {
      const w = clamp(parseFtParam(params.get('cw'), 4), CUSTOM_FT_MIN, CUSTOM_FT_MAX)
      const h = clamp(parseFtParam(params.get('ch'), 8), CUSTOM_FT_MIN, CUSTOM_FT_MAX)
      params.set('cw', String(w))
      params.set('ch', String(h))
    } else if (nextSizeId) {
      params.delete('cw')
      params.delete('ch')
    }
    router.replace(`/order?${params.toString()}`, { scroll: false })
  }

  function commitSizeChange(productId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('size', productId)
    params.set('orientation', selectedOrientation)
    if (productId === CUSTOM_BANNER_PRODUCT_ID) {
      const w = clamp(parseFtParam(params.get('cw'), 4), CUSTOM_FT_MIN, CUSTOM_FT_MAX)
      const h = clamp(parseFtParam(params.get('ch'), 8), CUSTOM_FT_MIN, CUSTOM_FT_MAX)
      params.set('cw', String(w))
      params.set('ch', String(h))
    } else {
      params.delete('cw')
      params.delete('ch')
    }
    router.replace(`/order?${params.toString()}`, { scroll: false })
  }

  function handleSelect(productId: string) {
    if (productId === selectedProduct?.id) return
    if (hasActiveFile) {
      setPendingProductId(productId)
      return
    }
    commitSizeChange(productId)
  }

  function handleOrientationChange(nextOrientation: PrintOrientation) {
    if (nextOrientation === selectedOrientation) return
    if (hasActiveFile) {
      setHasActiveFile(false)
      clearResumeDraft()
    }
    replaceQuery(selectedId ?? selectedProduct?.id ?? null, nextOrientation)
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
    <div className="mib-order">
      <nav className="mib-nav mib-orderNav" aria-label="Order navigation">
        <Shell className="mib-nav__inner">
          <BrandLogo
            className="mib-nav__logo"
            aria-label="MakeItBig home"
            width={140}
            height={43}
            inverted
            priority
          />

          <div className="mib-orderProgress" aria-label="Order progress">
            <StepPill number="01" label="Size" state={selectedProduct ? 'done' : 'active'} />
            <span className="mib-orderProgress__line" aria-hidden />
            <StepPill
              number="02"
              label="Upload"
              state={selectedProduct && hasActiveFile ? 'done' : selectedProduct ? 'active' : 'inactive'}
            />
            <span className="mib-orderProgress__line" aria-hidden />
            <StepPill number="03" label="Review" state={hasActiveFile ? 'active' : 'inactive'} />
          </div>
        </Shell>
      </nav>

      <main className="mib-orderMain">
        <Shell as="section" className="mib-orderHero" aria-labelledby="order-title">
          <p className="mib-orderEyebrow mib-p3">Order your banner</p>
          <h1 id="order-title" className="mib-orderTitle mib-h1">
            Pick the <span>right size</span>. Upload the file. We check the print.
          </h1>
          <p className="mib-orderIntro mib-p1">
            Choose a banner format, then send us your design. We preview the crop, check resolution,
            and help you avoid bad prints before you buy.
          </p>
        </Shell>

        <Shell as="section" className="mib-orderPanel" aria-labelledby="size-heading">
          <div className="mib-orderPanel__head">
            <div>
              <span className="mib-orderStepLabel">Step 01</span>
              <h2 id="size-heading" className="mib-orderPanel__title mib-h2">Choose size and direction</h2>
            </div>

            <div className="mib-orderOrientation" aria-label="Choose banner orientation">
              <button
                type="button"
                className={cx(
                  'mib-orderOrientation__button',
                  selectedOrientation === 'horizontal' && 'is-active',
                )}
                onClick={() => handleOrientationChange('horizontal')}
              >
                Horizontal
              </button>
              <button
                type="button"
                className={cx(
                  'mib-orderOrientation__button',
                  selectedOrientation === 'vertical' && 'is-active',
                )}
                onClick={() => handleOrientationChange('vertical')}
              >
                Vertical
              </button>
            </div>
          </div>

          <div className="mib-orderSizeGrid">
            {products.map((product) => {
              const layoutProduct = resolveCardLayoutProduct(product, selectedId, selectedProduct)
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  layoutProduct={layoutProduct}
                  orientation={selectedOrientation}
                  previewPxPerInch={cardPreviewPxPerInch}
                  isSelected={selectedProduct?.id === product.id}
                  onSelect={handleSelect}
                  displayPriceCents={
                    product.id === CUSTOM_BANNER_PRODUCT_ID
                      ? computeCustomPriceCents(customW, customH)
                      : product.price_cents
                  }
                  sizeHeading={
                    product.id === CUSTOM_BANNER_PRODUCT_ID
                      ? selectedId === CUSTOM_BANNER_PRODUCT_ID
                        ? `${formatFeet(customW)} × ${formatFeet(customH)} ft`
                        : 'Custom size'
                      : undefined
                  }
                />
              )
            })}
          </div>

          {selectedId === CUSTOM_BANNER_PRODUCT_ID && (
            <CustomSizeFields
              key={`custom-${customW}-${customH}`}
              widthFt={customW}
              heightFt={customH}
              onApply={(nextW, nextH) => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('size', CUSTOM_BANNER_PRODUCT_ID)
                params.set('orientation', selectedOrientation)
                params.set('cw', String(clamp(nextW, CUSTOM_FT_MIN, CUSTOM_FT_MAX)))
                params.set('ch', String(clamp(nextH, CUSTOM_FT_MIN, CUSTOM_FT_MAX)))
                router.replace(`/order?${params.toString()}`, { scroll: false })
              }}
            />
          )}

          {pendingProduct !== null && (
            <SizeChangeConfirmation
              pendingProduct={pendingProduct}
              onConfirm={handleConfirmSizeChange}
              onCancel={handleCancelSizeChange}
            />
          )}
        </Shell>

        {selectedProduct !== null && pendingProduct === null && (
          <UploadSection
            key={`${selectedProduct.id}-${selectedOrientation}`}
            selectedProduct={selectedProduct}
            orientation={selectedOrientation}
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
  return (
    <span className={cx('mib-orderStepPill', `is-${state}`)}>
      {state === 'done' && (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
          <path d="M1.8 5.6 4.5 8.2 9.2 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span>{number}</span> {label}
    </span>
  )
}

function CustomSizeFields({
  widthFt,
  heightFt,
  onApply,
}: {
  widthFt: number
  heightFt: number
  onApply: (w: number, h: number) => void
}) {
  const [wInput, setWInput] = useState(() => String(widthFt))
  const [hInput, setHInput] = useState(() => String(heightFt))

  function handleApply() {
    const w = Number.parseFloat(wInput)
    const h = Number.parseFloat(hInput)
    if (!Number.isFinite(w) || !Number.isFinite(h)) return
    onApply(w, h)
  }

  const previewCents = computeCustomPriceCents(
    clamp(Number.parseFloat(wInput) || 0, CUSTOM_FT_MIN, CUSTOM_FT_MAX),
    clamp(Number.parseFloat(hInput) || 0, CUSTOM_FT_MIN, CUSTOM_FT_MAX),
  )

  return (
    <div className="mib-orderCustomSize" aria-labelledby="custom-size-heading">
      <h3 id="custom-size-heading" className="mib-orderCustomSize__title mib-h3">Custom dimensions (feet)</h3>
      <p className="mib-orderCustomSize__copy mib-p2">
        Enter width and height for a horizontal layout. Price is{' '}
        <strong>${CUSTOM_PRICE_PER_SQ_FT} per square foot</strong> (width × height).
      </p>
      <div className="mib-orderCustomSize__row">
        <label className="mib-orderCustomSize__field">
          <span className="mib-orderCustomSize__label">Width (ft)</span>
          <input
            type="number"
            inputMode="decimal"
            min={CUSTOM_FT_MIN}
            max={CUSTOM_FT_MAX}
            step="0.25"
            value={wInput}
            onChange={(e) => setWInput(e.target.value)}
            className="mib-orderCustomSize__input"
          />
        </label>
        <span className="mib-orderCustomSize__times" aria-hidden>×</span>
        <label className="mib-orderCustomSize__field">
          <span className="mib-orderCustomSize__label">Height (ft)</span>
          <input
            type="number"
            inputMode="decimal"
            min={CUSTOM_FT_MIN}
            max={CUSTOM_FT_MAX}
            step="0.25"
            value={hInput}
            onChange={(e) => setHInput(e.target.value)}
            className="mib-orderCustomSize__input"
          />
        </label>
      </div>
      <div className="mib-orderCustomSize__footer">
        <p className="mib-orderCustomSize__price mib-p2">
          Estimated price: <strong>{formatPrice(previewCents)}</strong>
        </p>
        <button type="button" className="mib-orderButton mib-orderButton--gradient" onClick={handleApply}>
          Update dimensions
        </button>
      </div>
    </div>
  )
}

function SizeChangeConfirmation({
  pendingProduct,
  onConfirm,
  onCancel,
}: {
  pendingProduct: Pick<Product, 'width_in' | 'height_in'>
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="mib-orderConfirm" role="alertdialog" aria-label="Confirm size change">
      <div>
        <strong>Switch to {getProductSizeLabel(pendingProduct)}?</strong>
        <p>Your current upload will be cleared so we can re-check the file at the new size.</p>
      </div>
      <div className="mib-orderConfirm__actions">
        <button type="button" className="mib-orderButton mib-orderButton--gradient" onClick={onConfirm}>
          Switch size
        </button>
        <button type="button" className="mib-orderButton mib-orderButton--dark" onClick={onCancel}>
          Keep current
        </button>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  layoutProduct,
  orientation,
  previewPxPerInch,
  isSelected,
  onSelect,
  displayPriceCents,
  sizeHeading,
}: {
  product: Product
  layoutProduct: Product
  orientation: PrintOrientation
  previewPxPerInch: number
  isSelected: boolean
  onSelect: (id: string) => void
  displayPriceCents: number
  sizeHeading?: string
}) {
  const tier = getProductTier(layoutProduct)
  const isFeatured = tier === 'featured'
  const style = getCardPreviewStyle(layoutProduct, orientation, previewPxPerInch)

  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      aria-pressed={isSelected}
      className={cx(
        'mib-orderSizeCard',
        isSelected && 'is-selected',
        isFeatured && 'is-featured',
      )}
      style={style}
    >
      {isFeatured && <span className="mib-orderSizeCard__badge">Most picked</span>}

      <div className="mib-orderSizeCard__scene" aria-hidden>
        <div className="mib-orderSizeCard__shape">
          <span className="mib-orderSizeCard__line mib-orderSizeCard__line--x" />
          <span className="mib-orderSizeCard__line mib-orderSizeCard__line--y" />
        </div>
      </div>

      <div className="mib-orderSizeCard__header">
        <div>
          <h3 className="mib-orderSizeCard__size">{sizeHeading ?? getProductSizeLabel(product)}</h3>
          <p className="mib-orderSizeCard__meta">{orientation} preview</p>
        </div>
        <strong className="mib-orderSizeCard__price">{formatPrice(displayPriceCents)}</strong>
      </div>

      <div className="mib-orderSizeCard__body">
        <p className="mib-orderSizeCard__label">Best for</p>
        <p className="mib-orderSizeCard__use">{getProductUse(product)}</p>
      </div>

      <span className="mib-orderSizeCard__cta">
        {isSelected ? 'Selected size' : 'Choose this size'}
      </span>
    </button>
  )
}

function UploadSection({
  selectedProduct,
  orientation,
  onFileStateChange,
}: {
  selectedProduct: Pick<Product, 'id' | 'name' | 'width_in' | 'height_in' | 'price_cents'>
  orientation: PrintOrientation
  onFileStateChange: (hasFile: boolean) => void
}) {
  const [fileState, setFileState] = useState<FileState | null>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [resumeHint, setResumeHint] = useState<string | null>(() => {
    const saved = loadResumeDraft()
    return saved && saved.productId === selectedProduct.id && saved.orientation === orientation
      ? saved.fileName
      : null
  })
  const [isDragging, setIsDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const activePreviewUrl = useRef<string | null>(null)
  const imgLoadRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    onFileStateChange(fileState !== null)
  }, [fileState, onFileStateChange])

  useEffect(() => {
    return () => {
      if (activePreviewUrl.current) URL.revokeObjectURL(activePreviewUrl.current)
      if (imgLoadRef.current) {
        imgLoadRef.current.onload = null
        imgLoadRef.current.onerror = null
      }
    }
  }, [])

  const orderDraft: OrderDraft | null = useMemo(
    () =>
      fileState?.validation != null
        ? {
          product: selectedProduct,
          orientation,
          fileName: fileState.file.name,
          fileSizeBytes: fileState.file.size,
          fileType: fileState.file.type,
          validation: fileState.validation,
        }
        : null,
    [fileState, orientation, selectedProduct],
  )

  useEffect(() => {
    if (!orderDraft) return
    saveResumeDraft({
      productId: orderDraft.product.id,
      orientation: orderDraft.orientation,
      fileName: orderDraft.fileName,
      fileType: orderDraft.fileType,
    })
  }, [orderDraft])

  function openFilePicker() {
    inputRef.current?.click()
  }

  function resetActiveImageLoad() {
    if (activePreviewUrl.current) {
      URL.revokeObjectURL(activePreviewUrl.current)
      activePreviewUrl.current = null
    }
    if (imgLoadRef.current) {
      imgLoadRef.current.onload = null
      imgLoadRef.current.onerror = null
      imgLoadRef.current = null
    }
  }

  function handleIncomingFile(selected: File) {
    resetActiveImageLoad()
    setSizeError(null)
    setResumeHint(null)
    setCheckoutState('idle')
    setCheckoutError(null)

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

      const img = new window.Image()
      imgLoadRef.current = img

      img.onload = () => {
        if (imgLoadRef.current !== img) return
        const result = validateImageDpi(img.width, img.height, selectedProduct, orientation)
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
                message: 'Could not read image dimensions.',
                recommendation: 'Try a PNG, JPG, or PDF export from your design tool.',
              },
            }
            : prev,
        )
        imgLoadRef.current = null
      }

      img.src = url
      return
    }

    setFileState({ file: selected, previewUrl: null, validation: validatePdf(selectedProduct, orientation) })
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    if (!selected) return
    handleIncomingFile(selected)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    if (!dropped) return
    handleIncomingFile(dropped)
  }

  function handleRemove() {
    resetActiveImageLoad()
    setFileState(null)
    setSizeError(null)
    setCheckoutState('idle')
    setCheckoutError(null)
    setResumeHint(null)
    clearResumeDraft()
  }

  async function handleCheckout() {
    if (!CHECKOUT_ENABLED || !orderDraft || !fileState) return
    setCheckoutState('submitting')
    setCheckoutError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: orderDraft.product.id,
          orientation: orderDraft.orientation,
          customWidthFt:
            orderDraft.product.id === CUSTOM_BANNER_PRODUCT_ID
              ? orderDraft.product.width_in / 12
              : undefined,
          customHeightFt:
            orderDraft.product.id === CUSTOM_BANNER_PRODUCT_ID
              ? orderDraft.product.height_in / 12
              : undefined,
          fileName: orderDraft.fileName,
          fileType: orderDraft.fileType,
          validationStatus: orderDraft.validation.status,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null

      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.error || 'Could not start secure checkout. Please try again.',
        )
      }

      window.location.assign(payload.url)
    } catch (error) {
      setCheckoutState('error')
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Could not start secure checkout. Please try again.',
      )
    }
  }

  return (
    <Shell as="section" className="mib-orderUpload" aria-labelledby="upload-heading">
      <div className="mib-orderPanel__head mib-orderPanel__head--upload">
        <div>
          <span className="mib-orderStepLabel mib-p3">Step 02</span>
          <h2 id="upload-heading" className="mib-orderPanel__title mib-h2">Upload your design</h2>
          <p className="mib-orderPanel__copy mib-p2">
            Selected format: {getProductFormatLabel(selectedProduct, orientation)}. We will check resolution before you checkout.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        onChange={handleFileChange}
        className="mib-srOnly"
        aria-label="Upload your design file"
        tabIndex={-1}
      />

      <div className="mib-orderUploadGrid">
        <div
          className={cx(
            'mib-orderDropzone',
            fileState && 'has-file',
            isDragging && 'is-dragging',
          )}
          onClick={fileState ? undefined : openFilePicker}
          onKeyDown={(event) => {
            if (fileState) return
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openFilePicker()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          role={fileState ? undefined : 'button'}
          tabIndex={fileState ? undefined : 0}
          aria-label={fileState ? undefined : 'Upload your banner design'}
        >
          {fileState === null ? (
            <EmptyUpload
              onChoose={openFilePicker}
              sizeError={sizeError}
              resumeHint={resumeHint}
              selectedLabel={getProductFormatLabel(selectedProduct, orientation)}
            />
          ) : (
            <FilePreview fileState={fileState} onRemove={handleRemove} onReplace={openFilePicker} />
          )}
        </div>

        {orderDraft === null ? (
          <UploadGuidePanel selectedProduct={selectedProduct} orientation={orientation} />
        ) : (
          <OrderSummary
            draft={orderDraft}
            delivery={STANDARD_DELIVERY}
            checkoutState={checkoutState}
            checkoutEnabled={CHECKOUT_ENABLED}
            checkoutError={checkoutError}
            onCheckout={handleCheckout}
          />
        )}
      </div>
    </Shell>
  )
}

function EmptyUpload({
  onChoose,
  sizeError,
  resumeHint,
  selectedLabel,
}: {
  onChoose: () => void
  sizeError: string | null
  resumeHint: string | null
  selectedLabel: string
}) {
  return (
    <div className="mib-orderEmpty">
      <div className="mib-orderBubbles" aria-hidden>
        <span className="mib-orderBubble mib-orderBubble--one" />
        <span className="mib-orderBubble mib-orderBubble--two" />
        <span className="mib-orderBubble mib-orderBubble--three" />
      </div>

      <span className="mib-orderUploadIcon" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 16V7.5m0 0-3.2 3.2M12 7.5l3.2 3.2" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16.5v.6c0 2 1.6 3.6 3.6 3.6h8.8c2 0 3.6-1.6 3.6-3.6v-.6" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
        </svg>
      </span>

      <h3 className="mib-h3">Upload your design to run a print check.</h3>
      <p className="mib-p2">Drop a PNG, JPG, or PDF here. We will preview it for {selectedLabel}.</p>

      <button type="button" className="mib-orderButton mib-orderButton--gradient" onClick={(event) => {
        event.stopPropagation()
        onChoose()
      }}>
        Choose file
      </button>

      {sizeError ? (
        <p className="mib-orderUploadNote mib-p3 is-error" role="alert">{sizeError}</p>
      ) : resumeHint ? (
        <p className="mib-orderUploadNote mib-p3">Last file: <strong>{resumeHint}</strong>. Upload it again to continue.</p>
      ) : (
        <p className="mib-orderUploadNote mib-p3">PNG · JPG · PDF · Max {FILE_SIZE_LIMIT_MB} MB</p>
      )}
    </div>
  )
}

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
    <div className="mib-orderPreview">
      <div className="mib-orderPreview__top">
        <div>
          <span className="mib-orderPreview__label">Uploaded file preview</span>
          <p className="mib-orderPreview__file" title={file.name}>{file.name}</p>
        </div>
        <span className="mib-orderPreview__chip">{formatFileSize(file.size)}</span>
      </div>

      <div className="mib-orderPreview__canvas">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            width={900}
            height={600}
            unoptimized
            className="mib-orderPreview__image"
          />
        ) : (
          <div className="mib-orderPreview__pdf">PDF selected. We will verify it before production.</div>
        )}
      </div>

      {validation === null ? (
        <p className="mib-orderChecking mib-p2" aria-live="polite">
          Checking print quality<span><i /><i /><i /></span>
        </p>
      ) : (
        <ValidationBadge validation={validation} />
      )}

      <div className="mib-orderPreview__actions">
        <button type="button" onClick={onReplace}>Replace file</button>
        <button type="button" onClick={onRemove}>Remove</button>
      </div>
    </div>
  )
}

function UploadGuidePanel({
  selectedProduct,
  orientation,
}: {
  selectedProduct: Pick<Product, 'width_in' | 'height_in'>
  orientation: PrintOrientation
}) {
  const checks = [
    ['Resolution', `Checks effective print quality for ${getProductFormatLabel(selectedProduct, orientation)}.`],
    ['Crop fit', 'Shows whether the file works naturally in this direction.'],
    ['Review', 'Summarizes price, file quality, and delivery before checkout.'],
  ]

  return (
    <aside className="mib-orderGuide" aria-label="Print checks that run after upload">
      <span className="mib-orderStepLabel mib-p3">Step 03</span>
      <h3 className="mib-h3">Live print check</h3>
      <p className="mib-p2">Upload a file and this panel turns into your order review.</p>
      <ul>
        {checks.map(([title, body]) => (
          <li key={title}>
            <span>Runs after upload</span>
            <strong className="mib-h3">{title}</strong>
            <p className="mib-p3">{body}</p>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function ValidationBadge({ validation }: { validation: ValidationResult }) {
  return (
    <div className={cx('mib-orderValidation', `is-${validation.status}`)} role="status" aria-live="polite">
      <strong className="mib-h3">{validation.message}</strong>
      {validation.recommendation && <p className="mib-p3">{validation.recommendation}</p>}
      {validation.payoff && <p className="mib-p3">{validation.payoff}</p>}
    </div>
  )
}

const QUALITY_LABELS: Record<ValidationStatus, string> = {
  good: 'Ready',
  warn: 'Needs review',
  bad: 'Needs fix',
}

function OrderSummary({
  draft,
  delivery,
  checkoutState,
  checkoutEnabled,
  checkoutError,
  onCheckout,
}: {
  draft: OrderDraft
  delivery: DeliveryEstimate
  checkoutState: CheckoutState
  checkoutEnabled: boolean
  checkoutError: string | null
  onCheckout: () => void
}) {
  const { product, orientation, fileName, validation } = draft
  const blocked = validation.status === 'bad'
  const submitting = checkoutState === 'submitting'
  const ctaDisabled = !checkoutEnabled || blocked || submitting

  return (
    <aside className={cx('mib-orderSummary', `is-${validation.status}`)} aria-label="Order summary">
      <div className="mib-orderSummary__head">
        <span className="mib-orderStepLabel mib-p3">Step 03</span>
        <span className={cx('mib-orderStatusChip', `is-${validation.status}`)}>{QUALITY_LABELS[validation.status]}</span>
      </div>

      <h3 className="mib-h3">Review before checkout</h3>
      <p className="mib-orderSummary__copy mib-p2">We checked the file against your selected banner format.</p>

      <div className="mib-orderSummary__rows">
        <SummaryRow label="Banner">
          {getProductFormatLabel(product, orientation)} <span>{getProductInchLabel(product)}</span>
        </SummaryRow>
        <SummaryRow label="Price">{formatPrice(product.price_cents)}</SummaryRow>
        <SummaryRow label="File"><span title={fileName}>{fileName}</span></SummaryRow>
        <SummaryRow label="Quality"><QualityIndicator status={validation.status} /></SummaryRow>
        <SummaryRow label="Delivery">
          {delivery.range} {delivery.note && <span>{delivery.note}</span>}
        </SummaryRow>
      </div>

      {blocked && <p className="mib-orderSummary__alert mib-p3" role="alert">Upload a higher-resolution file to continue.</p>}
      {checkoutError && (
        <p className="mib-orderSummary__alert mib-p3" role="alert">{checkoutError}</p>
      )}

      <button
        type="button"
        onClick={onCheckout}
        disabled={ctaDisabled}
        aria-disabled={ctaDisabled}
        className="mib-orderCheckout"
      >
        {submitting
          ? 'Processing...'
          : blocked
              ? 'Upload sharper file'
              : 'Continue to checkout'}
      </button>

      <p className="mib-orderSummary__fine mib-p3">You will not be charged until checkout is complete.</p>
    </aside>
  )
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mib-orderSummaryRow">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  )
}

function QualityIndicator({ status }: { status: ValidationStatus }) {
  return (
    <span className={cx('mib-orderQuality', `is-${status}`)}>
      <i aria-hidden />
      {QUALITY_LABELS[status]}
    </span>
  )
}
