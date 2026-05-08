'use client'

import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

export function ProgressRing({ progress, size = 48, strokeWidth = 4, className, showLabel = true }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const color = progress >= 70 ? 'text-emerald-500' : progress >= 40 ? 'text-yellow-500' : 'text-red-500'
  const strokeColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      {showLabel && (
        <span className={cn('absolute text-xs font-medium', color)}>
          {Math.round(progress)}
        </span>
      )}
    </div>
  )
}
