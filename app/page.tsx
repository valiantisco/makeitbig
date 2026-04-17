'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react'

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload your design',
    body: "Drop in your file and we take it from there. PDF, PNG, or JPG.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'We check it for you',
    body: "We review your file and flag anything that might not print well before you order.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Preview it at full size',
    body: 'See exactly how your banner will look before committing. No guesswork.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'We print and ship fast',
    body: 'Matte vinyl, printed in the USA. At your door in 3 to 5 days.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
]

const TRUST_BLOCKS = [
  {
    title: 'Smart file check',
    body: "We review your design and let you know if anything needs attention so you're never surprised.",
  },
  {
    title: 'Fast turnaround',
    body: 'No confusing steps. No mystery delays. Just a straightforward path from upload to delivery.',
  },
  {
    title: 'Reprint guarantee',
    body: "If it doesn't look right when it arrives, we'll reprint it. No hassle.",
  },
  {
    title: 'Printed in the USA',
    body: 'Quality matte vinyl built to last, from a process you can trust.',
  },
]

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Home() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileMeta = useMemo(() => {
    if (!selectedFile) return null
    return `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`
  }, [selectedFile])

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

  function handleContinue() {
    router.push('/order')
  }

  return (
    <main className="mib-home">

      {/* ── STICKY NAV ───────────────────────────────────── */}
      <header className="mib-nav">
        <div className="mib-shell mib-nav__inner">
          <Link href="/" className="mib-nav__logo">
            <Image
              src="/mib-logo.svg"
              alt="MakeItBig"
              width={160}
              height={49}
              priority
            />
          </Link>
          <nav className="mib-nav__links" aria-label="Primary">
            <Link href="#how-it-works" className="mib-nav__link">How It Works</Link>
            <Link href="#pricing" className="mib-nav__link">Pricing</Link>
            <Link href="#gallery" className="mib-nav__link">Examples</Link>
            <Link href="#hero" className="mib-nav__cta">Start Your Banner</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="mib-hero" id="hero">
        <div className="mib-hero__top">
          <div className="mib-shell">
            <div className="mib-hero__content">
              <p className="mib-hero__eyebrow">Banner Printing, Made Simple</p>

              <h1 className="mib-hero__title">
                Your design.
                <br />
                Big and impossible
                <br />
                to ignore.
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
                    htmlFor="hero-upload"
                    className={`mib-upload__dropzone${isDragging ? ' is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="mib-upload__iconWrap" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="mib-upload__title">Drop your design here</p>
                    <p className="mib-upload__subtext">or tap to browse your files</p>
                    <span className="mib-upload__button">Choose File</span>
                    <p className="mib-upload__hint">PNG · JPG · PDF &nbsp;·&nbsp; Up to 50 MB</p>
                  </label>
                ) : (
                  <div className="mib-upload__dropzone has-file">
                    <div className="mib-upload__success">
                      <div className="mib-upload__successIcon" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                Upload your file. We check it, preview it at full size, then print and ship it fast. No confusing steps, no surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ─────────────────────────────── */}
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
          <span className="mib-proofBar__item">Reprinted if it's not right</span>
          <span className="mib-proofBar__divider" aria-hidden="true" />
          <span className="mib-proofBar__item mib-proofBar__item--quote">
            "Exactly what I needed for my booth." Sarah M., Phoenix AZ
          </span>
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="mib-section mib-hiw" id="how-it-works">
        <div className="mib-shell">
          <div className="mib-sectionIntro mib-sectionIntro--center">
            <h2 className="mib-sectionIntro__title">Four steps. That's all.</h2>
          </div>

          <div className="mib-hiwGrid">
            {HOW_IT_WORKS.map((item) => (
              <article key={item.title} className="mib-hiwCard">
                <div className="mib-hiwCard__stepIcon" aria-hidden="true">
                  {item.icon}
                </div>
                <div className="mib-hiwCard__num" aria-hidden="true">
                  {item.step}
                </div>
                <h3 className="mib-hiwCard__title">{item.title}</h3>
                <p className="mib-hiwCard__body">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="mib-section mib-pricing" id="pricing">
        <div className="mib-shell">
          <div className="mib-sectionIntro mib-sectionIntro--center">
            <h2 className="mib-sectionIntro__title">Simple, flat pricing</h2>
            <p className="mib-sectionIntro__copy mib-sectionIntro__copy--center">Pick your size. That's it.</p>
          </div>

          <div className="mib-pricingGrid">
            <article className="mib-priceCard">
              <div className="mib-priceCard__size">24" x 36" inches</div>
              <div className="mib-priceCard__price">$30</div>
              <p className="mib-priceCard__shipping">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Shipping included
              </p>
              <p className="mib-priceCard__use">Great for trade show booths, events, and smaller spaces</p>
              <Link href="#hero" className="mib-priceCard__cta">Order This Size</Link>
            </article>

            <article className="mib-priceCard mib-priceCard--featured">
              <span className="mib-priceCard__badge">Most Popular</span>
              <div className="mib-priceCard__size">36" x 72" inches</div>
              <div className="mib-priceCard__price">$75</div>
              <p className="mib-priceCard__shipping">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Shipping included
              </p>
              <p className="mib-priceCard__use">Strong street-level visibility without going overboard</p>
              <Link href="#hero" className="mib-priceCard__cta mib-priceCard__cta--featured">Order This Size</Link>
            </article>

            <article className="mib-priceCard">
              <div className="mib-priceCard__size">48" x 96" inches</div>
              <div className="mib-priceCard__price">$150</div>
              <p className="mib-priceCard__shipping">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Shipping included
              </p>
              <p className="mib-priceCard__use">Maximum presence. When you need to fill a wall or a room</p>
              <Link href="#hero" className="mib-priceCard__cta">Order This Size</Link>
            </article>
          </div>

          <p className="mib-pricing__finePrint">
            All orders: matte vinyl, printed in the USA, reprinted free if anything's off.
          </p>
        </div>
      </section>

      {/* ── WHY MAKEITBIG ────────────────────────────────── */}
      <section className="mib-section mib-reassure" id="why-makeitbig">
        <div className="mib-shell">
          <div className="mib-sectionIntro mib-sectionIntro--center">
            <h2 className="mib-sectionIntro__title">
              We make sure it looks right before it gets printed.
            </h2>
          </div>

          <div className="mib-bentoGrid">
            {/* Top-left: Smart file check -- spans 2 rows, teal accent */}
            <article className="mib-bentoTile mib-bentoTile--file">
              <div className="mib-bentoTile__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="mib-card__title">{TRUST_BLOCKS[0].title}</h3>
              <p className="mib-card__body">{TRUST_BLOCKS[0].body}</p>
            </article>

            {/* Top-right: Fast turnaround -- yellow accent */}
            <article className="mib-bentoTile mib-bentoTile--speed">
              <div className="mib-bentoTile__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="mib-card__title">{TRUST_BLOCKS[1].title}</h3>
              <p className="mib-card__body">{TRUST_BLOCKS[1].body}</p>
            </article>

            {/* Bottom-right: Reprint guarantee -- red accent */}
            <article className="mib-bentoTile mib-bentoTile--guarantee">
              <div className="mib-bentoTile__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6" />
                  <path d="M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </div>
              <h3 className="mib-card__title">{TRUST_BLOCKS[2].title}</h3>
              <p className="mib-card__body">{TRUST_BLOCKS[2].body}</p>
            </article>

            {/* Bottom full-width: Printed in the USA -- dark */}
            <article className="mib-bentoTile mib-bentoTile--usa">
              <div className="mib-bentoTile__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
              </div>
              <div>
                <h3 className="mib-card__title mib-bentoTile__usaTitle">{TRUST_BLOCKS[3].title}</h3>
                <p className="mib-card__body mib-bentoTile__usaBody">{TRUST_BLOCKS[3].body}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────── */}
      <section className="mib-section mib-gallery" id="gallery">
        <div className="mib-shell">
          <h2 className="mib-gallery__heading">Three sizes. All built to stand out.</h2>
          <p className="mib-gallery__subhead">Matte vinyl, printed in the USA. Actual product photos coming soon.</p>

          <div className="mib-galleryGrid">
            <Link href="#hero" className="mib-gallerySlot mib-gallerySlot--sm">
              <div className="mib-gallerySlot__banner" aria-hidden="true" />
              <div className="mib-gallerySlot__info">
                <span className="mib-gallerySlot__size">24" x 36"</span>
                <span className="mib-gallerySlot__price">Starting at $30</span>
              </div>
            </Link>

            <Link href="#hero" className="mib-gallerySlot mib-gallerySlot--md">
              <div className="mib-gallerySlot__banner" aria-hidden="true" />
              <div className="mib-gallerySlot__info">
                <span className="mib-gallerySlot__size">36" x 72"</span>
                <span className="mib-gallerySlot__price">Starting at $75</span>
              </div>
            </Link>

            <Link href="#hero" className="mib-gallerySlot mib-gallerySlot--lg">
              <div className="mib-gallerySlot__banner" aria-hidden="true" />
              <div className="mib-gallerySlot__info">
                <span className="mib-gallerySlot__size">48" x 96"</span>
                <span className="mib-gallerySlot__price">Starting at $150</span>
              </div>
            </Link>
          </div>

          <div className="flex justify-center mt-14">
            <Link href="#hero" className="mib-galleryBtn">Order Your Banner Now</Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="mib-finalCta">
        <div className="mib-shell">
          <div className="mib-finalCta__content">
            <h2 className="mib-finalCta__title">Your event deserves a banner that shows up.</h2>
            <p className="mib-finalCta__copy">
              Upload your file, see it at full size, and order in minutes.
            </p>

            <div className="mib-finalCta__actions">
              <Link href="#hero" className="mib-btn mib-btn--light mib-btn--xl">
                <span>Start Your Banner</span>
              </Link>
            </div>

            <div className="mib-finalCta__trustRow">
              <span className="mib-finalCta__trustMark">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
                Reprinted free if it's not right
              </span>
              <span className="mib-finalCta__trustMark">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
                Printed in the USA
              </span>
              <span className="mib-finalCta__trustMark">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
                Ships in 3-5 days
              </span>
            </div>

            <div className="mib-finalCta__testimonial">
              <p className="mib-finalCta__quote">
                "I uploaded my logo, got a preview in seconds, and the banner arrived before my event. Exactly what I needed."
              </p>
              <p className="mib-finalCta__attribution">Sarah M. — Phoenix, AZ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
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
              <Link href="#how-it-works">How It Works</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="#gallery">Gallery</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="#hero">Start Your Banner</Link>
            </nav>

            <div className="mib-footer__contact">
              <p className="mib-footer__contactEmail">hello@makeitbig.com</p>
              <p className="mib-footer__contactNote">Printed in the USA</p>
            </div>
          </div>

          <div className="mib-footer__bottom">
            <p className="mib-footer__copy">© 2025 MakeItBig. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
