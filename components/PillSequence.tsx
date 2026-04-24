import { ReactNode } from 'react'

type PillSequenceVariant = 'filled' | 'neutral' | 'dark'

type PillSequenceItem = {
  key: string
  label: ReactNode
  active?: boolean
}

type PillSequenceProps = {
  className?: string
  variant?: PillSequenceVariant
  items: PillSequenceItem[]
  'aria-label'?: string
}

export function PillSequence({ className, variant = 'neutral', items, ...rest }: PillSequenceProps) {
  return (
    <span
      className={[
        'mib-pillSequence',
        variant === 'filled' && 'mib-pillSequence--filled',
        variant === 'neutral' && 'mib-pillSequence--neutral',
        variant === 'dark' && 'mib-pillSequence--dark',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {items.map((item, index) => (
        <span key={item.key} className={`mib-pillSequence__item${item.active ? ' is-active' : ''}`}>
          {item.label}
          {index < items.length - 1 && (
            <svg
              className="mib-pillSequence__arrow"
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </span>
      ))}
    </span>
  )
}

