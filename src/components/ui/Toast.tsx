'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toastId = 0
const listeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function updateToasts(newToasts: Toast[]) {
  toasts = newToasts
  listeners.forEach(l => l(toasts))
}

export const toast = {
  success: (message: string) => {
    updateToasts([...toasts, { id: String(++toastId), message, type: 'success' }])
    setTimeout(() => {
      updateToasts(toasts.filter(t => t.id !== String(toastId)))
    }, 4000)
  },
  error: (message: string) => {
    updateToasts([...toasts, { id: String(++toastId), message, type: 'error' }])
    setTimeout(() => {
      updateToasts(toasts.filter(t => t.id !== String(toastId)))
    }, 4000)
  },
  info: (message: string) => {
    updateToasts([...toasts, { id: String(++toastId), message, type: 'info' }])
    setTimeout(() => {
      updateToasts(toasts.filter(t => t.id !== String(toastId)))
    }, 4000)
  },
  warning: (message: string) => {
    updateToasts([...toasts, { id: String(++toastId), message, type: 'warning' }])
    setTimeout(() => {
      updateToasts(toasts.filter(t => t.id !== String(toastId)))
    }, 4000)
  },
}

function ToastItem({ toast: t }: { toast: Toast }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border p-4 shadow-lg',
        {
          'border-emerald-700 bg-emerald-900/90 text-emerald-200': t.type === 'success',
          'border-red-700 bg-red-900/90 text-red-200': t.type === 'error',
          'border-blue-700 bg-blue-900/90 text-blue-200': t.type === 'info',
          'border-yellow-700 bg-yellow-900/90 text-yellow-200': t.type === 'warning',
        }
      )}
    >
      {t.message}
    </div>
  )
}

export function ToastContainer() {
  const [mounted, setMounted] = useState(false)
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    setMounted(true)
    listeners.push(setCurrentToasts)
    return () => {
      listeners.splice(listeners.indexOf(setCurrentToasts), 1)
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  )
}
