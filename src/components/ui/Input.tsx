'use client'

import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100',
        'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
        'focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'flex h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-gray-800 text-gray-300': variant === 'default',
          'bg-emerald-900 text-emerald-300': variant === 'success',
          'bg-yellow-900 text-yellow-300': variant === 'warning',
          'bg-red-900 text-red-300': variant === 'danger',
          'bg-blue-900 text-blue-300': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
