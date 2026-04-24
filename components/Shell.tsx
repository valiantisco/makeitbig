import { ReactNode } from 'react'

type ShellProps = {
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav'
  className?: string
  children: ReactNode
}

export function Shell({ as: Tag = 'div', className, children }: ShellProps) {
  return <Tag className={['mib-shell', className].filter(Boolean).join(' ')}>{children}</Tag>
}

