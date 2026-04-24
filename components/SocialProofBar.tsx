import { Fragment, ReactNode } from 'react'
import { Shell } from '@/components/Shell'

type SocialProofBarProps = {
  ratingText?: ReactNode
  items: Array<{ key: string; content: ReactNode; isQuote?: boolean }>
}

export function SocialProofBar({ ratingText = 'Rated 5.0', items }: SocialProofBarProps) {
  return (
    <div className="mib-proofBar">
      <Shell className="mib-proofBar__inner">
        <span className="mib-proofBar__stars">
          <span className="mib-proofBar__starsIcons" aria-label="5 stars">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f4c33d" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </span>
          {ratingText}
        </span>

        {items.map((item) => (
          <Fragment key={item.key}>
            <span className="mib-proofBar__divider" aria-hidden="true" />
            <span className={`mib-proofBar__item${item.isQuote ? ' mib-proofBar__item--quote' : ''}`}>
              {item.content}
            </span>
          </Fragment>
        ))}
      </Shell>
    </div>
  )
}

