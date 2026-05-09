'use client'

import './card.css'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  children: React.ReactNode
}

export function Card({ interactive = false, className = '', children, ...props }: CardProps) {
  const classes = ['card', interactive ? 'card-interactive' : '', className].filter(Boolean).join(' ')
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card-header ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card-title ${className}`}>{children}</div>
}