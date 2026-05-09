'use client'

import { useEffect, useState } from 'react'
import './theme-toggle.css'

type Theme = 'dark' | 'light' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setTheme(stored)
    }
  }, [])

  const applyTheme = (t: Theme) => {
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-theme', t)
    }
  }

  const handleThemeChange = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  if (!mounted) return <div className="theme-toggle" />

  return (
    <div className="theme-toggle">
      {(['dark', 'light', 'system'] as Theme[]).map((t) => (
        <button
          key={t}
          onClick={() => handleThemeChange(t)}
          className={`theme-toggle-btn ${theme === t ? 'active' : ''}`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}