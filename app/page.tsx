'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { CSSProperties, ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react'

type ValidationFeedback = {
  sharpTone: 'good' | 'warn'
  softnessTone: 'good' | 'warn'
  recommendationTone: 'good' | 'warn' | 'info'
  recommendedSizeId: PrintSizeId
  selectedFormatLabel: string
  distanceTitle: string
  distanceBody: string
  distanceHint: string
  detailTitle: string
  detailBody: string
  detailHint: string
  sizeTitle: string
  sizeBody: string
  sizeHint: string
}

const BANNER_SIZES = [
  { id: '2x3', label: '2 x 3', shortIn: 24, longIn: 36, baseAcceptablePpi: 72 },
  { id: '3-5x6', label: '3.5 x 6', shortIn: 42, longIn: 72, baseAcceptablePpi: 56 },
  { id: '5-5x10', label: '5.5 x 10', shortIn: 66, longIn: 120, baseAcceptablePpi: 42 },
] as const

const PRINT_ORIENTATIONS = [
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'vertical', label: 'Vertical' },
] as const

type BannerSize = (typeof BANNER_SIZES)[number]
type PrintSizeId = BannerSize['id']
type PrintOrientation = (typeof PRINT_ORIENTATIONS)[number]['id']

const PRICING_OPTIONS: Array<{
  id: PrintSizeId
  size: string
  price: string
  bestFor: string
}> = [
    {
      id: '2x3',
      size: '2 x 3',
      price: '$30',
      bestFor: 'Small booths, tabletop displays, and quick event signage.',
    },
    {
      id: '3-5x6',
      size: '3.5 x 6',
      price: '$75',
      bestFor: 'The easy default for booths, walls, and storefront visibility.',
    },
    {
      id: '5-5x10',
      size: '5.5 x 10',
      price: '$150',
      bestFor: 'Large backdrops, wide walls, and big-room impact.',
    },
  ]

function getBannerSizeById(id: PrintSizeId) {
  return BANNER_SIZES.find((size) => size.id === id) ?? BANNER_SIZES[0]
}

function getPricingVisualDimensions(id: PrintSizeId, orientation: PrintOrientation) {
  const dimensions = {
    horizontal: {
      '2x3': { width: 126, height: 58 },
      '3-5x6': { width: 146, height: 64 },
      '5-5x10': { width: 166, height: 70 },
    },
    vertical: {
      '2x3': { width: 48, height: 82 },
      '3-5x6': { width: 58, height: 104 },
      '5-5x10': { width: 68, height: 126 },
    },
  } satisfies Record<PrintOrientation, Record<PrintSizeId, { width: number; height: number }>>

  return dimensions[orientation][id]
}

function formatBannerLabel(label: string) {
  return label.replace(' x ', ' \u00d7 ')
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getPrintDimensions(size: BannerSize, orientation: PrintOrientation) {
  return {
    widthIn: orientation === 'horizontal' ? size.longIn : size.shortIn,
    heightIn: orientation === 'horizontal' ? size.shortIn : size.longIn,
  }
}

function getFormatLabel(size: BannerSize, orientation: PrintOrientation) {
  return `${formatBannerLabel(size.label)} ft ${orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}`
}

function getShortFormatLabel(size: BannerSize, orientation: PrintOrientation) {
  return `${formatBannerLabel(size.label)} ${orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function createFallbackFeedback(size: BannerSize, orientation: PrintOrientation): ValidationFeedback {
  const selectedFormatLabel = getFormatLabel(size, orientation)

  return {
    sharpTone: 'warn',
    softnessTone: 'warn',
    recommendationTone: 'warn',
    recommendedSizeId: size.id,
    selectedFormatLabel,
    distanceTitle: `Cannot Verify ${getShortFormatLabel(size, orientation)}`,
    distanceBody: 'We could not read the image pixels, so this format needs manual review.',
    distanceHint: 'Try a PNG or JPG',
    detailTitle: 'Detail Check Paused',
    detailBody: 'Upload a clearer image file so we can check crop and resolution.',
    detailHint: 'Use an image file',
    sizeTitle: 'Choose A Verified File',
    sizeBody: 'We need a readable image before recommending a safer format.',
    sizeHint: 'Upload again',
  }
}

function analyzePrintReadiness(
  image: HTMLImageElement,
  selectedSize: BannerSize,
  selectedOrientation: PrintOrientation
): ValidationFeedback {
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const sampleMax = 260
  const sampleScale = Math.min(1, sampleMax / Math.max(sourceWidth, sourceHeight))
  const sampleWidth = Math.max(24, Math.round(sourceWidth * sampleScale))
  const sampleHeight = Math.max(24, Math.round(sourceHeight * sampleScale))
  const canvas = document.createElement('canvas')
  canvas.width = sampleWidth
  canvas.height = sampleHeight

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    return createFallbackFeedback(selectedSize, selectedOrientation)
  }

  context.drawImage(image, 0, 0, sampleWidth, sampleHeight)
  const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight)
  const luminance = new Float32Array(sampleWidth * sampleHeight)
  let luminanceSum = 0
  let skinPixels = 0

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    luminance[p] = lum
    luminanceSum += lum

    const maxChannel = Math.max(r, g, b)
    const minChannel = Math.min(r, g, b)
    if (r > 95 && g > 40 && b > 20 && maxChannel - minChannel > 15 && Math.abs(r - g) > 15 && r > g && r > b) {
      skinPixels += 1
    }
  }

  const pixelCount = sampleWidth * sampleHeight
  const meanLum = luminanceSum / pixelCount
  let varianceSum = 0
  let edgePixels = 0
  let fineEdgePixels = 0

  for (let i = 0; i < luminance.length; i += 1) {
    const delta = luminance[i] - meanLum
    varianceSum += delta * delta
  }

  for (let y = 1; y < sampleHeight - 1; y += 1) {
    for (let x = 1; x < sampleWidth - 1; x += 1) {
      const index = y * sampleWidth + x
      const dx = Math.abs(luminance[index + 1] - luminance[index - 1])
      const dy = Math.abs(luminance[index + sampleWidth] - luminance[index - sampleWidth])
      const edge = dx + dy
      if (edge > 46) edgePixels += 1
      if (edge > 26) fineEdgePixels += 1
    }
  }

  const contrast = Math.sqrt(varianceSum / pixelCount)
  const measuredPixels = Math.max(1, (sampleWidth - 2) * (sampleHeight - 2))
  const edgeDensity = edgePixels / measuredPixels
  const fineDetailDensity = fineEdgePixels / measuredPixels
  const skinRatio = skinPixels / pixelCount
  const textSensitivity = clamp((fineDetailDensity - 0.16) / 0.22 + (contrast - 42) / 70, 0, 1)
  const isDenseArtwork = edgeDensity > 0.22 || (fineDetailDensity > 0.34 && contrast > 58)
  const isDetailedArtwork = !isDenseArtwork && (edgeDensity > 0.13 || fineDetailDensity > 0.24)
  const likelyPeoplePhoto = skinRatio > 0.025 && !isDenseArtwork
  const contentMultiplier = isDenseArtwork ? 1.36 : isDetailedArtwork ? 1.16 : likelyPeoplePhoto ? 0.96 : 0.9
  const detailMultiplier = textSensitivity > 0.66 ? 1.16 : 1
  const imageAspect = sourceWidth / sourceHeight
  const imageIsWide = imageAspect > 1.12
  const imageIsTall = imageAspect < 0.88

  const scoreFormat = (size: BannerSize, orientation: PrintOrientation) => {
    const { widthIn, heightIn } = getPrintDimensions(size, orientation)
    const targetAspect = widthIn / heightIn
    const cropRetained = clamp(Math.min(imageAspect / targetAspect, targetAspect / imageAspect), 0, 1)
    const ppi = Math.min(sourceWidth / widthIn, sourceHeight / heightIn)
    const acceptablePpi = size.baseAcceptablePpi * contentMultiplier * detailMultiplier
    const idealPpi = acceptablePpi + 22 * contentMultiplier
    const qualityRating = ppi >= idealPpi ? 'good' : ppi >= acceptablePpi ? 'ok' : 'poor'
    const fitRating = cropRetained >= 0.86 ? 'good' : cropRetained >= 0.7 ? 'ok' : 'poor'
    const naturalOrientation =
      (!imageIsWide && !imageIsTall) ||
      (imageIsWide && orientation === 'horizontal') ||
      (imageIsTall && orientation === 'vertical')
    const qualityScore = clamp(ppi / idealPpi, 0, 1.35)
    const fitScore = cropRetained
    const total = qualityScore * 0.58 + fitScore * 0.34 + (naturalOrientation ? 0.08 : 0)

    return {
      size,
      orientation,
      widthIn,
      heightIn,
      targetAspect,
      cropRetained,
      ppi,
      acceptablePpi,
      idealPpi,
      qualityRating,
      fitRating,
      naturalOrientation,
      total,
    }
  }

  const selectedScore = scoreFormat(selectedSize, selectedOrientation)
  const formatScores = BANNER_SIZES.flatMap((size) =>
    PRINT_ORIENTATIONS.map((orientation) => scoreFormat(size, orientation.id))
  )
  const selectedFormatLabel = getFormatLabel(selectedSize, selectedOrientation)
  const selectedShortLabel = getShortFormatLabel(selectedSize, selectedOrientation)
  const selectedPpi = Math.round(selectedScore.ppi)
  const cropPercent = Math.round(selectedScore.cropRetained * 100)
  const cropLossPercent = Math.max(0, 100 - cropPercent)
  const qualityNeedsFix = selectedScore.qualityRating === 'poor'
  const fitNeedsFix = selectedScore.fitRating === 'poor'
  const selectedNeedsAlternative = qualityNeedsFix || fitNeedsFix

  const betterScores = formatScores
    .filter((score) => score.size.id !== selectedSize.id || score.orientation !== selectedOrientation)
    .sort((a, b) => b.total - a.total)
  const sameSizeOtherOrientation = formatScores.find(
    (score) => score.size.id === selectedSize.id && score.orientation !== selectedOrientation
  )
  const recommendedScore =
    betterScores.find((score) => score.qualityRating !== 'poor' && score.fitRating !== 'poor') ??
    betterScores[0] ??
    selectedScore
  const recommendedLabel = getFormatLabel(recommendedScore.size, recommendedScore.orientation)
  const recommendedShortLabel = getShortFormatLabel(recommendedScore.size, recommendedScore.orientation)

  const contentReason = isDenseArtwork
    ? 'Dense artwork or small text needs more resolution than a simple photo.'
    : likelyPeoplePhoto
      ? 'Fine facial detail is the first thing to soften when the print gets too large.'
      : isDetailedArtwork
        ? 'Fine lines and small details need a little extra pixel room.'
        : 'This is a simpler image, so it can tolerate normal banner viewing distance.'

  const qualityTitle = qualityNeedsFix
    ? `Too Soft For ${selectedShortLabel}`
    : selectedScore.qualityRating === 'ok'
      ? `Usable For ${selectedShortLabel}`
      : `Ready For ${selectedShortLabel}`
  const qualityBody = qualityNeedsFix
    ? `About ${selectedPpi} PPI at this size. ${contentReason}`
    : selectedScore.qualityRating === 'ok'
      ? `About ${selectedPpi} PPI. It should read from distance, but close-up detail may soften.`
      : `About ${selectedPpi} PPI. Strong enough for this selected banner size.`

  const orientationLabel = selectedOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'
  const fitTitle = fitNeedsFix
    ? `${orientationLabel} Crop Is Tight`
    : selectedScore.fitRating === 'ok'
      ? `${orientationLabel} Crop Needs Care`
      : `${orientationLabel} Crop Works`
  const fitBody = fitNeedsFix
    ? `This crop may cut away about ${cropLossPercent}% of the image. Important text or faces could land too close to the edge.`
    : selectedScore.fitRating === 'ok'
      ? `This crop keeps about ${cropPercent}% of the image. Keep key details away from the edges.`
      : 'The image matches this format naturally with very little crop risk.'
  const fitHint =
    sameSizeOtherOrientation && sameSizeOtherOrientation.cropRetained > selectedScore.cropRetained + 0.1
      ? `Try ${sameSizeOtherOrientation.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}`
      : fitNeedsFix
        ? 'Reframe before ordering'
        : ''

  const recommendationTitle = selectedNeedsAlternative
    ? `Try ${recommendedShortLabel}`
    : selectedScore.qualityRating === 'ok' || selectedScore.fitRating === 'ok'
      ? 'Selected Format Works'
      : 'Selected Format Is Best'
  const recommendationBody = selectedNeedsAlternative
    ? `${recommendedLabel} gives about ${Math.round(recommendedScore.ppi)} PPI and keeps ${Math.round(recommendedScore.cropRetained * 100)}% of the image.`
    : selectedScore.qualityRating === 'ok' || selectedScore.fitRating === 'ok'
      ? 'This choice is acceptable. Use a higher-res file if you want extra crisp close-up detail.'
      : 'This is the cleanest match for the file, size, and orientation you selected.'

  return {
    sharpTone: qualityNeedsFix ? 'warn' : 'good',
    softnessTone: fitNeedsFix ? 'warn' : 'good',
    recommendationTone: selectedNeedsAlternative ? 'warn' : selectedScore.qualityRating === 'ok' || selectedScore.fitRating === 'ok' ? 'info' : 'good',
    recommendedSizeId: selectedNeedsAlternative ? recommendedScore.size.id : selectedSize.id,
    selectedFormatLabel,
    distanceTitle: qualityTitle,
    distanceBody: qualityBody,
    distanceHint: qualityNeedsFix ? 'Use a higher-res file or smaller size' : selectedScore.qualityRating === 'ok' ? 'Good from normal distance' : '',
    detailTitle: fitTitle,
    detailBody: fitBody,
    detailHint: fitHint,
    sizeTitle: recommendationTitle,
    sizeBody: recommendationBody,
    sizeHint: selectedNeedsAlternative ? 'Better fit and quality' : selectedFormatLabel,
  }
}
export default function Home() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dropzoneRef = useRef<HTMLLabelElement | null>(null)
  const confidenceInputRef = useRef<HTMLInputElement | null>(null)
  const fileToolRef = useRef<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isConfidenceDragging, setIsConfidenceDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPrintSizeId, setSelectedPrintSizeId] = useState<PrintSizeId>('2x3')
  const [selectedOrientation, setSelectedOrientation] = useState<PrintOrientation>('horizontal')
  const [selectedPricingSizeId, setSelectedPricingSizeId] = useState<PrintSizeId | null>(null)
  const [hoveredPricingSizeId, setHoveredPricingSizeId] = useState<PrintSizeId | null>(null)
  const [pricingOrientation, setPricingOrientation] = useState<PrintOrientation>('horizontal')
  const [isCheckingFile, setIsCheckingFile] = useState(false)
  const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress: fileToolScroll } = useScroll({
    target: fileToolRef,
    offset: ['start end', 'end start'],
  })
  const cloudNearX = useTransform(fileToolScroll, [0, 1], [-90, 90])
  const cloudFarX = useTransform(fileToolScroll, [0, 1], [70, -70])
  const selectedPrintSize = getBannerSizeById(selectedPrintSizeId)
  const selectedPrintDimensions = getPrintDimensions(selectedPrintSize, selectedOrientation)
  const selectedFormatLabel = getFormatLabel(selectedPrintSize, selectedOrientation)
  const featuredPricingSizeId = validationFeedback?.recommendedSizeId ?? '3-5x6'
  const pickedPricingSizeId = selectedPricingSizeId ?? featuredPricingSizeId
  const activePricingSizeId = hoveredPricingSizeId ?? pickedPricingSizeId
  const previewAspectStyle = {
    '--mib-preview-aspect': `${selectedPrintDimensions.widthIn} / ${selectedPrintDimensions.heightIn}`,
    '--mib-preview-ratio': selectedPrintDimensions.widthIn / selectedPrintDimensions.heightIn,
  } as CSSProperties

  const fileMeta = useMemo(() => {
    if (!selectedFile) return null
    return `${selectedFile.name} - ${formatFileSize(selectedFile.size)}`
  }, [selectedFile])
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!selectedFile || !previewUrl || !selectedFile.type.startsWith('image/')) {
      let cancelled = false
      queueMicrotask(() => {
        if (cancelled) return
        setIsCheckingFile(false)
        setValidationFeedback(null)
      })
      return () => {
        cancelled = true
      }
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    queueMicrotask(() => {
      if (cancelled) return
      setIsCheckingFile(true)
      setValidationFeedback(null)
    })

    const imageProbe = new window.Image()
    imageProbe.onload = () => {
      if (cancelled) return

      const feedback = analyzePrintReadiness(imageProbe, selectedPrintSize, selectedOrientation)

      timer = setTimeout(() => {
        if (cancelled) return
        setValidationFeedback(feedback)
        setIsCheckingFile(false)
      }, 520)
    }

    imageProbe.onerror = () => {
      if (cancelled) return
      timer = setTimeout(() => {
        if (cancelled) return
        setValidationFeedback(createFallbackFeedback(selectedPrintSize, selectedOrientation))
        setIsCheckingFile(false)
      }, 420)
    }

    imageProbe.src = previewUrl

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [selectedFile, previewUrl, selectedPrintSize, selectedOrientation])

  const isImageFile = selectedFile?.type.startsWith('image/') ?? false

  function handleFile(file: File | null) {
    if (!file) return
    setSelectedFile(file)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    handleFile(file)
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    handleFile(file)
  }

  function handleConfidenceFile(file: File | null) {
    if (!file || !file.type.startsWith('image/')) return
    setSelectedFile(file)
  }

  function handleConfidenceInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    handleConfidenceFile(file)
  }

  function handleConfidenceDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsConfidenceDragging(true)
  }

  function handleConfidenceDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsConfidenceDragging(false)
  }

  function handleConfidenceDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsConfidenceDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    handleConfidenceFile(file)
  }

  function handleContinue() {
    router.push('/order')
  }

  function handleTiltMove(e: React.MouseEvent<HTMLLabelElement>) {
    const el = dropzoneRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1200px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateZ(4px)`
  }

  function handleTiltLeave() {
    const el = dropzoneRef.current
    if (!el) return
    el.style.transform = ''
  }

  return (
    <main className="mib-home">

      {/* STICKY NAV */}
      <header className="mib-nav">
        <div className="mib-shell mib-nav__inner">
          <Link href="/" className="mib-nav__logo">
            <Image
              src="/mib-logo.svg"
              alt="MakeItBig"
              width={160}
              height={49}
              style={{ filter: 'brightness(0) invert(1)' }}
              priority
            />
          </Link>
          <nav className="mib-nav__links" aria-label="Support">
            <Link href="#pricing" className="mib-nav__help">Pricing</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mib-hero" id="hero">
        <div className="mib-hero__top">
          <div className="mib-hero__bg" aria-hidden="true" />
          <div className="mib-shell">
            <div className="mib-hero__content">
              <p className="mib-hero__eyebrow">Upload. Preview. Print.</p>

              <h1 className="mib-hero__title">
                <span className="mib-hero__titleLine mib-hero__titleLine--first">MAKE IT BIG.</span>
                <span className="mib-hero__titleLine mib-hero__titleLine--second">PUT IT WHERE IT MATTERS.</span>
              </h1>

              <div className="mib-upload">
                <input
                  ref={inputRef}
                  type="file"
                  id="hero-upload"
                  className="mib-upload__input"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleInputChange}
                />

                {!selectedFile ? (
                  <label
                    ref={dropzoneRef}
                    htmlFor="hero-upload"
                    className={`mib-upload__dropzone${isDragging ? ' is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onMouseMove={handleTiltMove}
                    onMouseLeave={handleTiltLeave}
                  >
                    <span className="mib-upload__swirl" aria-hidden="true" />
                    <span className="mib-upload__grain" aria-hidden="true" />
                    <span className="mib-upload__glass" aria-hidden="true" />
                    <div className="mib-upload__inner">
                      <div className="mib-upload__icon" aria-hidden="true">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div className="mib-upload__contentBlock">
                        <p className="mib-upload__title">Drag and drop your design</p>
                        <p className="mib-upload__subtext">or click to upload - we&apos;ll guide you from there</p>
                      </div>
                      <span className="mib-upload__button">Choose File</span>
                    </div>
                  </label>
                ) : (
                  <div className="mib-upload__dropzone has-file">
                    <span className="mib-upload__swirl" aria-hidden="true" />
                    <span className="mib-upload__grain" aria-hidden="true" />
                    <span className="mib-upload__glass" aria-hidden="true" />
                    <div className="mib-upload__inner">
                      <div className="mib-upload__successIcon" aria-hidden="true">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                      <div className="mib-upload__successText">
                        <p className="mib-upload__successTitle">Your design is ready</p>
                        <p className="mib-upload__successMeta">{fileMeta}</p>
                      </div>
                      <button
                        type="button"
                        className="mib-upload__replaceLink"
                        onClick={() => { setSelectedFile(null); inputRef.current?.click() }}
                      >
                        Replace
                      </button>
                    </div>
                    <div className="mib-upload__nextStep">
                      <button
                        type="button"
                        className="mib-upload__nextBtn"
                        onClick={handleContinue}
                      >
                        Choose Your Size
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                      <p className="mib-upload__nextNote">Pick your size, preview it, then checkout</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="mib-hero__subcopy">
                Upload your file and we take it from there. We check it, show you a full-size preview, then print and ship fast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <div className="mib-proofBar">
        <div className="mib-shell mib-proofBar__inner">
          <span className="mib-proofBar__stars">
            <span className="mib-proofBar__starsIcons" aria-label="5 stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f4c33d" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </span>
            Rated 5.0
          </span>
          <span className="mib-proofBar__divider" aria-hidden="true" />
          <span className="mib-proofBar__item">500+ Banners Printed</span>
          <span className="mib-proofBar__divider" aria-hidden="true" />
          <span className="mib-proofBar__item">Ships in 3-5 Days</span>
          <span className="mib-proofBar__divider" aria-hidden="true" />
          <span className="mib-proofBar__item">Reprinted if it&apos;s not right</span>
          <span className="mib-proofBar__divider" aria-hidden="true" />
          <span className="mib-proofBar__item mib-proofBar__item--quote">
            &quot;Exactly what I needed for my booth.&quot; Sarah M., Phoenix AZ
          </span>
        </div>
      </div>

      {/* FILE CONFIDENCE TOOL */}
      <section ref={fileToolRef} className="mib-fileTool" id="file-confidence">
        <motion.div
          className="mib-fileTool__clouds mib-fileTool__clouds--far"
          aria-hidden="true"
          style={{ x: shouldReduceMotion ? 0 : cloudFarX }}
        />
        <motion.div
          className="mib-fileTool__clouds mib-fileTool__clouds--near"
          aria-hidden="true"
          style={{ x: shouldReduceMotion ? 0 : cloudNearX }}
        />
        <div className="mib-shell">
          <motion.div
            className="mib-fileTool__intro"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mib-fileTool__steps" aria-label="Upload, check, then print">
              <span className="mib-fileTool__step">Upload</span>
              <svg className="mib-fileTool__stepArrow" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="mib-fileTool__step mib-fileTool__step--active">Check</span>
              <svg className="mib-fileTool__stepArrow" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="mib-fileTool__step">Print</span>
            </div>

            <h2 className="mib-fileTool__heading">
              Check Your File <span className="mib-fileTool__mark">Before</span> You Print.
            </h2>

            <p className="mib-fileTool__subhead">
              Upload your design, we run 3 quick checks, and you avoid bad prints before you buy.
            </p>
          </motion.div>

          <motion.div
            className="mib-fileTool__layout"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mib-fileTool__selector" aria-label="Choose print size and orientation">
              <div className="mib-fileTool__selectorIntro">
                <span className="mib-fileTool__selectorKicker">Print format</span>
                <p className="mib-fileTool__selectorTitle">Choose your size and crop before we score the file.</p>
              </div>
              <div className="mib-fileTool__selectorControls">
                <div className="mib-fileTool__segmented" aria-label="Banner size">
                  {BANNER_SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      className={`mib-fileTool__selectorButton${selectedPrintSizeId === size.id ? ' is-active' : ''}`}
                      onClick={() => setSelectedPrintSizeId(size.id)}
                      aria-pressed={selectedPrintSizeId === size.id}
                    >
                      {formatBannerLabel(size.label)}
                    </button>
                  ))}
                </div>
                <div className="mib-fileTool__segmented mib-fileTool__segmented--orientation" aria-label="Banner orientation">
                  {PRINT_ORIENTATIONS.map((orientation) => (
                    <button
                      key={orientation.id}
                      type="button"
                      className={`mib-fileTool__selectorButton${selectedOrientation === orientation.id ? ' is-active' : ''}`}
                      onClick={() => setSelectedOrientation(orientation.id)}
                      aria-pressed={selectedOrientation === orientation.id}
                    >
                      {orientation.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label
              className={`mib-fileTool__upload${isConfidenceDragging ? ' is-dragging' : ''}`}
              onDragOver={handleConfidenceDragOver}
              onDragLeave={handleConfidenceDragLeave}
              onDrop={handleConfidenceDrop}
            >
              <input
                ref={confidenceInputRef}
                type="file"
                accept="image/*"
                className="mib-fileTool__input"
                onChange={handleConfidenceInputChange}
              />
              {previewUrl && isImageFile ? (
                <>
                  <div className="mib-fileTool__previewHeader">
                    <span className="mib-fileTool__previewLabel">Uploaded file preview</span>
                    <span className="mib-fileTool__previewSub">{selectedFormatLabel} crop check</span>
                  </div>
                  <div className="mib-fileTool__previewCanvas">
                    <div className="mib-fileTool__previewFrame" style={previewAspectStyle}>
                      <img
                        src={previewUrl}
                        alt={selectedFile ? `${selectedFile.name} preview` : 'Uploaded image preview'}
                        className="mib-fileTool__preview"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="mib-fileTool__prompt">
                  <span className="mib-fileTool__bubbles" aria-hidden="true">
                    <span className="mib-fileTool__bubble mib-fileTool__bubble--one" />
                    <span className="mib-fileTool__bubble mib-fileTool__bubble--two" />
                    <span className="mib-fileTool__bubble mib-fileTool__bubble--three" />
                  </span>
                  <span className="mib-fileTool__promptIcon" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <p className="mib-fileTool__promptTitle">Upload your design to run a print-readiness check.</p>
                  <p className="mib-fileTool__promptText">Selected format: {selectedFormatLabel}. We will preview the crop here.</p>
                </div>
              )}
              {fileMeta && (
                <p className="mib-fileTool__meta">
                  <span className="mib-fileTool__metaDot" aria-hidden="true" />
                  {fileMeta}
                </p>
              )}
            </label>

            <aside className="mib-fileTool__feedback" aria-live="polite">
              <ul className="mib-fileTool__modules">
                {(() => {
                  type ModuleState = 'idle' | 'checking' | 'good' | 'warn' | 'info'
                  const ready = isImageFile && !isCheckingFile && !!validationFeedback
                  const running = isImageFile && isCheckingFile
                  const blocked = !!selectedFile && !isImageFile

                  const sharpState: ModuleState = running
                    ? 'checking'
                    : ready
                      ? validationFeedback!.sharpTone === 'good' ? 'good' : 'warn'
                      : 'idle'
                  const softState: ModuleState = running
                    ? 'checking'
                    : ready
                      ? validationFeedback!.softnessTone === 'good' ? 'good' : 'warn'
                      : 'idle'
                  const sizeState: ModuleState = running
                    ? 'checking'
                    : ready
                      ? validationFeedback!.recommendationTone
                      : 'idle'

                  const statusLabel = (s: ModuleState) => {
                    if (s === 'checking') return 'Checking'
                    if (s === 'good') return 'Ready'
                    if (s === 'warn') return 'Needs Fix'
                    if (s === 'info') return 'Ready'
                    return blocked ? 'Image Needed' : 'Runs after upload'
                  }

                  const modules = [
                    {
                      key: 'sharp',
                      accent: 'red' as const,
                      step: '01',
                      eyebrow: 'Quality',
                      state: sharpState,
                      title:
                        ready
                          ? validationFeedback!.distanceTitle
                          : 'Selected Size Quality',
                      body:
                        ready
                          ? validationFeedback!.distanceBody
                          : sharpState === 'checking'
                            ? 'Checking PPI and image detail.'
                            : `Checks effective print quality for ${selectedFormatLabel}.`,
                      hint:
                        ready ? validationFeedback!.distanceHint : '',
                      icon: (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ),
                    },
                    {
                      key: 'detail',
                      accent: 'orange' as const,
                      step: '02',
                      eyebrow: 'Crop Fit',
                      state: softState,
                      title:
                        ready
                          ? validationFeedback!.detailTitle
                          : 'Crop Fit',
                      body:
                        ready
                          ? validationFeedback!.detailBody
                          : softState === 'checking'
                            ? 'Checking selected orientation.'
                            : 'Checks whether the chosen crop keeps the important parts.',
                      hint:
                        ready ? validationFeedback!.detailHint : '',
                      icon: (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7h16" />
                          <path d="M4 12h10" />
                          <path d="M4 17h7" />
                          <path d="M18 13l3 3-3 3" />
                        </svg>
                      ),
                    },
                    {
                      key: 'size',
                      accent: 'amber' as const,
                      step: '03',
                      eyebrow: 'Best Pick',
                      state: sizeState,
                      title:
                        ready
                          ? validationFeedback!.sizeTitle
                          : 'Recommendation',
                      body:
                        ready
                          ? validationFeedback!.sizeBody
                          : sizeState === 'checking'
                            ? 'Comparing size and orientation options.'
                            : 'Shows a safer format if this selection is not the best fit.',
                      hint:
                        ready ? validationFeedback!.sizeHint : '',
                      icon: (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 18V6" />
                          <path d="M20 18V6" />
                          <path d="M7 8h10" />
                          <path d="M7 16h10" />
                          <path d="M9 6L7 8l2 2" />
                          <path d="M15 14l2 2-2 2" />
                        </svg>
                      ),
                    },
                  ]

                  return modules.map((m, index) => (
                    <motion.li
                      key={m.key}
                      className={`mib-fileTool__module mib-fileTool__module--${m.accent} is-${m.state}`}
                      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
                      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.008 }}
                      viewport={{ once: true, amount: 0.55 }}
                      transition={{ duration: 0.36, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="mib-fileTool__moduleIcon" aria-hidden="true">
                        {m.icon}
                      </span>
                      <div className="mib-fileTool__moduleText">
                        <div className="mib-fileTool__moduleHead">
                          <span className="mib-fileTool__moduleStep">{m.eyebrow}</span>
                          <span className={`mib-fileTool__moduleStatus is-${m.state}`}>
                            {m.state === 'checking' && (
                              <span className="mib-fileTool__moduleStatusDots" aria-hidden="true">
                                <span></span><span></span><span></span>
                              </span>
                            )}
                            {statusLabel(m.state)}
                          </span>
                        </div>
                        <p className="mib-fileTool__moduleTitle">{m.title}</p>
                        <p className="mib-fileTool__moduleBody">{m.body}</p>
                        {m.hint && <p className="mib-fileTool__moduleHint">{m.hint}</p>}
                      </div>
                    </motion.li>
                  ))
                })()}
              </ul>
            </aside>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section className="mib-pricing mib-pricing--selector" id="pricing">
        <div className="mib-shell">
          <div className="mib-pricing__topline">
            <div>
              <span className="mib-pricing__eyebrow">Pricing selector</span>
              <h2 className="mib-pricing__title">
                Choose Your <span className="mib-pricing__mark">Size</span>. That&apos;s it.
              </h2>
            </div>
            <div className="mib-pricing__side">
              <p className="mib-pricing__note">Every size is available horizontal or vertical. Pick the one that fits your space.</p>
              <div className="mib-pricing__orientation" aria-label="Preview orientation">
                {PRINT_ORIENTATIONS.map((orientation) => (
                  <button
                    key={orientation.id}
                    type="button"
                    className={`mib-pricing__orientationButton${pricingOrientation === orientation.id ? ' is-active' : ''}`}
                    onClick={() => setPricingOrientation(orientation.id)}
                    aria-pressed={pricingOrientation === orientation.id}
                  >
                    {orientation.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="mib-pricingGrid"
            aria-label="Banner pricing options"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.28 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.04,
                },
              },
            }}
          >
            {PRICING_OPTIONS.map((option) => {
              const visualDimensions = getPricingVisualDimensions(option.id, pricingOrientation)
              const isFeatured = option.id === pickedPricingSizeId
              const isActive = option.id === activePricingSizeId
              const isSoftened = option.id !== activePricingSizeId
              const featuredLabel = validationFeedback ? 'Checker pick' : 'Most popular'

              return (
                <motion.article
                  key={option.id}
                  className={`mib-priceCard${isFeatured ? ' mib-priceCard--featured' : ''}${isActive ? ' is-active' : ''}${isSoftened ? ' is-softened' : ''}`}
                  tabIndex={0}
                  aria-selected={isFeatured}
                  onMouseEnter={() => setHoveredPricingSizeId(option.id)}
                  onMouseLeave={() => setHoveredPricingSizeId(null)}
                  onFocus={() => setHoveredPricingSizeId(option.id)}
                  onBlur={() => setHoveredPricingSizeId(null)}
                  onClick={() => setSelectedPricingSizeId(option.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedPricingSizeId(option.id)
                    }
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.42,
                        delay: option.id === '3-5x6' ? 0.08 : 0,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    },
                  }}
                  animate={shouldReduceMotion ? undefined : {
                    y: isActive ? -5 : 0,
                    scale: isActive ? 1.014 : 1,
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.016 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 24,
                  }}
                >
                  {isFeatured && <span className="mib-priceCard__badge">{featuredLabel}</span>}
                  <div className="mib-priceCard__visual" aria-hidden="true">
                    <motion.div
                      className="mib-priceCard__shape"
                      animate={{
                        width: visualDimensions.width,
                        height: visualDimensions.height,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 230,
                        damping: 22,
                      }}
                    >
                      <span className="mib-priceCard__shapeLine mib-priceCard__shapeLine--top" />
                      <span className="mib-priceCard__shapeLine mib-priceCard__shapeLine--side" />
                    </motion.div>
                  </div>
                  <div className="mib-priceCard__header">
                    <div>
                      <span className="mib-priceCard__size">{formatBannerLabel(option.size)} ft</span>
                      <p className="mib-priceCard__availability">
                        {pricingOrientation === 'horizontal' ? 'Horizontal preview' : 'Vertical preview'}
                      </p>
                    </div>
                    <div className="mib-priceCard__price">{option.price}</div>
                  </div>
                  <p className="mib-priceCard__label">Best for</p>
                  <p className="mib-priceCard__use">{option.bestFor}</p>
                  <Link
                    href="#hero"
                    className={`mib-priceCard__cta${isActive ? ' mib-priceCard__cta--featured' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedPricingSizeId(option.id)
                    }}
                  >
                    {isActive ? 'Start with this size' : 'Choose this size'}
                  </Link>
                </motion.article>
              )
            })}
          </motion.div>

          <p className="mib-pricing__finePrint">
            Printed in the USA &middot; Reprinted if it&apos;s not right &middot; Ships in 3&ndash;5 days.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mib-finalCta">
        <div className="mib-shell">
          <div className="mib-finalCta__split">
            <div className="mib-finalCta__content">
              <span className="mib-finalCta__eyebrow">Ready when you are</span>
              <h2 className="mib-finalCta__title">Your banner should look big before you buy it.</h2>
              <p className="mib-finalCta__copy">
                Upload your design, preview the size, and order with a quick print-readiness check built in.
              </p>

              <div className="mib-finalCta__actions">
                <Link href="#hero" className="mib-btn mib-btn--light mib-btn--xl">
                  <span>Start Your Banner</span>
                </Link>
              </div>

              <div className="mib-finalCta__trustRow">
                <span className="mib-finalCta__trustMark">Reprinted if it&apos;s not right</span>
                <span className="mib-finalCta__trustMark">Printed in the USA</span>
                <span className="mib-finalCta__trustMark">Ships in 3-5 days</span>
              </div>
            </div>

            <div className="mib-finalCta__visual" aria-label="Illustrated storefront and banner scene">
              <div className="mib-finalCta__testimonial">
                <p className="mib-finalCta__quote">
                  &quot;I uploaded my logo, got a preview in seconds, and the banner arrived before my event.&quot;
                </p>
                <p className="mib-finalCta__attribution">Sarah M. - Phoenix, AZ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mib-footer">
        <div className="mib-shell">
          <div className="mib-footer__top">
            <div className="mib-footer__brand">
              <Image
                src="/mib-logo.svg"
                alt="MakeItBig"
                width={160}
                height={49}
                className="mib-footer__logo"
              />
              <p className="mib-footer__tagline">
                The fastest way to turn your file into something impossible to ignore.
              </p>
            </div>

            <nav className="mib-footer__nav" aria-label="Footer">
              <Link href="#pricing">Pricing</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="#hero">Start Your Banner</Link>
            </nav>

            <div className="mib-footer__contact">
              <p className="mib-footer__contactEmail">hello@makeitbig.com</p>
              <p className="mib-footer__contactNote">Printed in the USA</p>
            </div>
          </div>

          <div className="mib-footer__bottom">
            <p className="mib-footer__copy">(c) 2025 MakeItBig. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
