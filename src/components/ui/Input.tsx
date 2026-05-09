'use client'

import { useId } from 'react'
import './input.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id || props.name || generatedId
  return (
    <div>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input id={inputId} className={`input ${className}`} {...props} />
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={`select ${className}`} {...props}>
      {children}
    </select>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const classes = ['badge', variant !== 'default' ? `badge-${variant}` : '', className].filter(Boolean).join(' ')
  return <span className={classes}>{children}</span>
}