'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { CSSProperties, ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { HomeSeoSections } from '@/components/HomeSeoSections'
import { PillSequence } from '@/components/PillSequence'
import { SectionArtwork } from '@/components/SectionArtwork'
import { Shell } from '@/components/Shell'
import { SocialProofBar } from '@/components/SocialProofBar'
import { VisualCard } from '@/components/VisualCard'
import {
  BANNER_SIZES,
  PRINT_ORIENTATIONS,
  clamp,
  formatBannerLabel,
  formatFileSize,
  getBannerPrintDimensions,
  getBannerSizeById,
  getCustomOrderHref,
  getFormatLabel,
  getOrderHref,
  getShortFormatLabel,
  PRICING_OPTIONS as BASE_PRICING_OPTIONS,
  type BannerSize,
  type PrintOrientation,
  type PrintSizeId,
} from '@/lib/banner-config'
import { homeImageSlots } from '@/src/content/siteImages'

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

type PricingOptionId = PrintSizeId | 'custom'

const PRICING_OPTIONS: Array<{
  id: PricingOptionId
  size: string
  price: string
  bestFor: string
}> = [
  ...BASE_PRICING_OPTIONS,
  {
    id: 'custom',
    size: 'Custom',
    price: '$6 / sq ft',
    bestFor: 'Sized to your space, priced at six dollars per square foot.',
  },
]

function getPricingVisualDimensions(id: PricingOptionId, orientation: PrintOrientation) {
  if (id === 'custom') {
    return orientation === 'horizontal'
      ? { width: 140, height: 64 }
      : { width: 52, height: 110 }
  }
  const dimensions = {
    horizontal: {
      '2x4': { width: 124, height: 62 },
      '3x6': { width: 148, height: 66 },
      '4x8': { width: 168, height: 70 },
    },
    vertical: {
      '2x4': { width: 50, height: 88 },
      '3x6': { width: 56, height: 108 },
      '4x8': { width: 62, height: 128 },
    },
  } satisfies Record<PrintOrientation, Record<PrintSizeId, { width: number; height: number }>>

  return dimensions[orientation][id]
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
    const { widthIn, heightIn } = getBannerPrintDimensions(size, orientation)
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
  const [selectedPrintSizeId, setSelectedPrintSizeId] = useState<PrintSizeId>('2x4')
  const [selectedOrientation, setSelectedOrientation] = useState<PrintOrientation>('horizontal')
  const [selectedPricingSizeId, setSelectedPricingSizeId] = useState<PricingOptionId | null>(null)
  const [hoveredPricingSizeId, setHoveredPricingSizeId] = useState<PricingOptionId | null>(null)
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
  const selectedPrintDimensions = getBannerPrintDimensions(selectedPrintSize, selectedOrientation)
  const selectedFormatLabel = getFormatLabel(selectedPrintSize, selectedOrientation)
  const featuredPricingSizeId = validationFeedback?.recommendedSizeId ?? '3x6'
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
    router.push(getOrderHref(selectedPrintSizeId, selectedOrientation))
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
    <main className="mib-home" id="main-content">

      {/* STICKY NAV */}
      <header className="mib-nav">
        <Shell className="mib-nav__inner">
          <BrandLogo className="mib-nav__logo" width={160} height={49} inverted priority />
          <nav className="mib-nav__links" aria-label="Cart">
            <Link
              href={getOrderHref(selectedPrintSizeId, selectedOrientation)}
              className="mib-nav__cart"
              aria-label={selectedFile ? 'Open cart with 1 uploaded design' : 'Open cart'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.5 6.5h15l-1.7 8.1a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.3 3.8H2.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M9.4 20.2h.1M18 20.2h.1" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
              {selectedFile && <span className="mib-nav__cartBadge" aria-hidden="true">1</span>}
              <span className="mib-srOnly">Cart</span>
            </Link>
          </nav>
        </Shell>
      </header>

      {/* HERO */}
      <section className="mib-hero" id="hero">
        <div className="mib-hero__top">
          <div className="mib-hero__bg" aria-hidden="true" />
          <Shell>
            <div className="mib-hero__content">
              <div className="mib-hero__artworkSlot" aria-hidden="true">
                <VisualCard className="mib-hero__artworkCard">
                  <SectionArtwork
                    imageKey={homeImageSlots.hero}
                    className="mib-hero__artwork"
                    sizes="(min-width: 1200px) 320px, 0px"
                    priority
                    decorative
                  />
                </VisualCard>
              </div>

              <PillSequence
                className="mib-hero__eyebrow"
                variant="filled"
                items={[
                  { key: 'upload', label: 'Upload' },
                  { key: 'preview', label: 'Preview', active: true },
                  { key: 'print', label: 'Print' },
                ]}
              />

              <h1 className="mib-hero__title mib-h1">
                <span className="mib-hero__titleLine mib-hero__titleLine--first">CUSTOM VINYL BANNERS ONLINE.</span>
                <span className="mib-hero__titleLine mib-hero__titleLine--second">SEE IT BIG BEFORE YOU PRINT.</span>
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

              <p className="mib-hero__subcopy mib-p1">
                Upload your design, check the file, preview the size, and order banner printing online with fewer guesses.
              </p>
            </div>
          </Shell>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <SocialProofBar
        items={[
          { key: 'printed', content: '500+ Banners Printed' },
          { key: 'ship', content: 'Ships in 3-5 Days' },
          { key: 'reprint', content: <>Reprinted if it&apos;s not right</> },
          { key: 'quote', content: <>Upload once. Check the format. Order when it looks right.</>, isQuote: true },
        ]}
      />

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
        <Shell>
          <motion.div
            className="mib-fileTool__intro"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <PillSequence
              className="mib-fileTool__steps"
              variant="neutral"
              aria-label="Upload, check, then print"
              items={[
                { key: 'upload', label: 'Upload' },
                { key: 'check', label: 'Check', active: true },
                { key: 'print', label: 'Print' },
              ]}
            />

            <h2 className="mib-fileTool__heading mib-h2">
              Check Your File <span className="mib-fileTool__mark">Before</span> You Print.
            </h2>

            <p className="mib-fileTool__subhead mib-p2">
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
                      <Image
                        src={previewUrl}
                        alt={selectedFile ? `${selectedFile.name} preview` : 'Uploaded image preview'}
                        width={900}
                        height={600}
                        unoptimized
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

                  <div className="mib-fileTool__promptInner">
                    <p className="mib-fileTool__promptTitle mib-h3">Upload a file to check print quality.</p>
                    <p className="mib-fileTool__promptText mib-p2">
                      Selected format: <strong>{selectedFormatLabel}</strong>. We&apos;ll preview the crop here.
                    </p>

                    <div className="mib-fileTool__promptActions">
                      <span className="mib-fileTool__promptCta">Choose file</span>
                      <span className="mib-fileTool__promptLinkWrap">
                        <Link href="/faq" className="mib-fileTool__promptLink">
                          How to export
                        </Link>
                        <span className="mib-fileTool__promptTipCard" role="tooltip">
                          Export as PNG or JPG at full size. PDF is great too.
                        </span>
                      </span>
                    </div>

                    <p className="mib-fileTool__promptMeta mib-p3">PNG, JPG, PDF · Max 50 MB</p>
                    <p className="mib-fileTool__promptTrust mib-p3">We only use your file to print your banner.</p>

                    <span className="mib-fileTool__promptIcon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </span>
                  </div>
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
              <div className="mib-fileTool__feedbackIntro">
                <h3 className="mib-fileTool__feedbackTitle mib-h3">What we&apos;ll check</h3>
                <p className="mib-fileTool__feedbackCopy mib-p3">Upload once. We score quality, crop fit, and the best format.</p>
              </div>
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
                    return blocked ? 'Image Needed' : 'Locked'
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
                        <p className="mib-fileTool__moduleTitle mib-h3">{m.title}</p>
                        <p className="mib-fileTool__moduleBody mib-p3">{m.body}</p>
                        {m.hint && <p className="mib-fileTool__moduleHint mib-p3">{m.hint}</p>}
                      </div>
                    </motion.li>
                  ))
                })()}
              </ul>
            </aside>
          </motion.div>
        </Shell>
      </section>

      {/* PRICING */}
      <section className="mib-pricing mib-pricing--selector" id="pricing">
        <Shell>
          <div className="mib-pricing__topline">
            <div>
              <PillSequence
                className="mib-pricing__eyebrow"
                variant="neutral"
                items={[
                  { key: 'pricing', label: 'Pricing' },
                  { key: 'select', label: 'Select', active: true },
                  { key: 'order', label: 'Order' },
                ]}
              />
              <h2 className="mib-pricing__title mib-h2">
                Choose Your <span className="mib-pricing__mark">Size</span>. That&apos;s it.
              </h2>
            </div>
            <div className="mib-pricing__side">
              <p className="mib-pricing__note mib-p2">Every size is available horizontal or vertical. Pick the one that fits your space.</p>
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
                        delay: option.id === '3x6' ? 0.08 : 0,
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
                      <span className="mib-priceCard__size">
                        {option.id === 'custom' ? 'Custom size' : `${formatBannerLabel(option.size)} ft`}
                      </span>
                  <p className="mib-priceCard__availability mib-p3">
                        {pricingOrientation === 'horizontal' ? 'Horizontal preview' : 'Vertical preview'}
                      </p>
                    </div>
                    <div className="mib-priceCard__price">{option.price}</div>
                  </div>
                  <p className="mib-priceCard__label">Best for</p>
              <p className="mib-priceCard__use mib-p2">{option.bestFor}</p>
                  <Link
                    href={option.id === 'custom' ? getCustomOrderHref(pricingOrientation) : '#hero'}
                    className={`mib-priceCard__cta${isActive ? ' mib-priceCard__cta--featured' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedPricingSizeId(option.id)
                    }}
                  >
                    {option.id === 'custom'
                      ? 'Configure custom size'
                      : isActive
                        ? 'Start with this size'
                        : 'Choose this size'}
                  </Link>
                </motion.article>
              )
            })}
          </motion.div>

          <p className="mib-pricing__finePrint mib-p3">
            Printed in the USA &middot; Reprinted if it&apos;s not right &middot; Ships in 3&ndash;5 days.
          </p>
        </Shell>
      </section>

      <HomeSeoSections />

      {/* FINAL CTA */}
      <section className="mib-finalCta">
        <Shell>
          <div className="mib-finalCta__split">
            <div className="mib-finalCta__panel">
              <div className="mib-finalCta__content">
                <PillSequence
                  className="mib-finalCta__eyebrow"
                  variant="neutral"
                  items={[
                    { key: 'upload', label: 'Upload' },
                    { key: 'review', label: 'Review', active: true },
                    { key: 'print', label: 'Print' },
                  ]}
                />
                <h2 className="mib-finalCta__title mib-h2">See It First. Then Order With Confidence.</h2>
                <p className="mib-finalCta__copy mib-p1">
                  Upload your design, choose a size, and check the print fit before you buy.
                </p>

                <div className="mib-finalCta__actions">
                  <Link href="#hero" className="mib-btn mib-btn--accent">
                    <span>Upload Your Design</span>
                  </Link>
                </div>

                <div className="mib-finalCta__trustRow" aria-label="Trust highlights">
                  <span className="mib-finalCta__trustMark">Free reprint if something is not right</span>
                  <span className="mib-finalCta__trustMark">Printed in the USA</span>
                  <span className="mib-finalCta__trustMark">Ships in 3-5 days</span>
                </div>
              </div>
            </div>

            <div className="mib-finalCta__visual">
              <VisualCard className="mib-finalCta__visualCard">
                <SectionArtwork
                  imageKey={homeImageSlots.finalCta}
                  className="mib-finalCta__artwork"
                  sizes="(min-width: 1000px) 42vw, 100vw"
                />
              </VisualCard>
              <div className="mib-finalCta__testimonial">
                <p className="mib-finalCta__quote mib-p2">
                  Upload your design, preview the size, and move into ordering once the file feels right.
                </p>
                <p className="mib-finalCta__attribution">Built for confidence before printing</p>
              </div>
            </div>
          </div>
        </Shell>
      </section>

    </main>
  )
}
