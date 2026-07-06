'use client'

import type { CSSProperties, ReactNode } from 'react'

/* ---------- icons (lucide-ish, stroke 1.7) ---------- */

export type IconProps = { size?: number; fill?: string; style?: CSSProperties }

function I({ size = 16, fill = 'none', style, children }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  )
}

export const Icon = {
  Sparkle: (p: IconProps) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></I>,
  Star: (p: IconProps) => <I {...p}><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" /></I>,
  Fork: (p: IconProps) => <I {...p}><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="20" r="2" /><path d="M6 8v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8M12 14v4" /></I>,
  Eye: (p: IconProps) => <I {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></I>,
  Search: (p: IconProps) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></I>,
  Bell: (p: IconProps) => <I {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" /><path d="M10 21a2 2 0 0 0 4 0" /></I>,
  Plus: (p: IconProps) => <I {...p}><path d="M12 5v14M5 12h14" /></I>,
  Settings: (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></I>,
  Home: (p: IconProps) => <I {...p}><path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2V10z" /></I>,
  User: (p: IconProps) => <I {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></I>,
  Chart: (p: IconProps) => <I {...p}><path d="M3 3v18h18" /><path d="M7 16l4-6 4 3 5-7" /></I>,
  Compass: (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10" /><polygon points="16 8 13.5 13.5 8 16 10.5 10.5" /></I>,
  Github: (p: IconProps) => <I {...p}><path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19 4.5a4.9 4.9 0 0 0-.1-3.6S17.6.6 15 2.4a13 13 0 0 0-6 0C6.4.6 5.1.9 5.1.9A4.9 4.9 0 0 0 5 4.5a5.2 5.2 0 0 0-1.3 3.3c0 5.2 3.2 6.4 6.2 6.7A3.4 3.4 0 0 0 9 17v3.9" /></I>,
  Code: (p: IconProps) => <I {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></I>,
  Check: (p: IconProps) => <I {...p}><polyline points="20 6 9 17 4 12" /></I>,
  ChevronR: (p: IconProps) => <I {...p}><polyline points="9 18 15 12 9 6" /></I>,
  ChevronD: (p: IconProps) => <I {...p}><polyline points="6 9 12 15 18 9" /></I>,
  ArrowR: (p: IconProps) => <I {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></I>,
  TrendUp: (p: IconProps) => <I {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></I>,
  Globe: (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" /></I>,
  Twitter: (p: IconProps) => <I {...p}><path d="M22 5.8a8.5 8.5 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.6 1 4.2 4.2 0 0 0-7.2 3.8A12 12 0 0 1 3 4.8a4.2 4.2 0 0 0 1.3 5.6A4.2 4.2 0 0 1 2.4 10v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 4 2.9A8.5 8.5 0 0 1 2 18.7a12 12 0 0 0 6.5 1.9c7.8 0 12-6.5 12-12v-.5A8.6 8.6 0 0 0 22 5.8z" /></I>,
  MapPin: (p: IconProps) => <I {...p}><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></I>,
  Calendar: (p: IconProps) => <I {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></I>,
  Building: (p: IconProps) => <I {...p}><rect x="4" y="2" width="16" height="20" /><line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="7" x2="9" y2="9" /><line x1="15" y1="7" x2="15" y2="9" /><line x1="9" y1="12" x2="9" y2="14" /><line x1="15" y1="12" x2="15" y2="14" /></I>,
  Link: (p: IconProps) => <I {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></I>,
  Bolt: (p: IconProps) => <I {...p} fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></I>,
  Logout: (p: IconProps) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></I>,
  Filter: (p: IconProps) => <I {...p}><polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5" /></I>,
  Clock: (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></I>,
  Share: (p: IconProps) => <I {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></I>,
  Copy: (p: IconProps) => <I {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></I>,
  Edit: (p: IconProps) => <I {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></I>,
  X: (p: IconProps) => <I {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></I>,
  Grid: (p: IconProps) => <I {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></I>,
  List: (p: IconProps) => <I {...p}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></I>,
  Layers: (p: IconProps) => <I {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></I>,
  Repo: (p: IconProps) => <I {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></I>,
  Sun: (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></I>,
  Moon: (p: IconProps) => <I {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></I>,
}

export type IconName = keyof typeof Icon

/* ---------- logo ---------- */

export function Logo({ size = 28, mark = false }: { size?: number; mark?: boolean }) {
  const svg = (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 6 L8 26" stroke="var(--text)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 14 C 8 18, 12 18, 16 18 L 22 18" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M22 18 C 26 18, 26 14, 26 10" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="6" r="3.2" fill="var(--text)" />
      <circle cx="8" cy="26" r="3.2" fill="var(--text)" />
      <circle cx="22" cy="18" r="3.2" fill="var(--accent)" />
      <circle cx="26" cy="10" r="3.2" fill="var(--accent)" />
    </svg>
  )
  if (mark) return svg
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
      {svg}
      <span style={{ fontSize: size * 0.62, fontWeight: 600, letterSpacing: -0.4 }}>
        Git<span style={{ color: 'var(--accent)' }}>Folio</span>
      </span>
    </span>
  )
}

/* ---------- button ---------- */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'surface' | 'ai' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BTN_SIZES: Record<ButtonSize, { h: number; px: number; fs: number; gap: number; r: number }> = {
  sm: { h: 28, px: 10, fs: 12, gap: 6, r: 6 },
  md: { h: 36, px: 14, fs: 13, gap: 8, r: 8 },
  lg: { h: 44, px: 20, fs: 14, gap: 8, r: 10 },
}

const BTN_VARIANTS: Record<ButtonVariant, { bg: string; color: string; border: string; shadow: string }> = {
  primary: { bg: 'var(--accent)', color: '#fff', border: '1px solid transparent', shadow: '0 1px 0 rgba(255,255,255,.15) inset, 0 1px 2px rgba(0,0,0,.18)' },
  secondary: { bg: 'transparent', color: 'var(--text)', border: '1px solid var(--border-strong)', shadow: 'none' },
  ghost: { bg: 'transparent', color: 'var(--text-2)', border: '1px solid transparent', shadow: 'none' },
  surface: { bg: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', shadow: 'none' },
  ai: { bg: 'linear-gradient(135deg, var(--ai) 0%, var(--accent) 100%)', color: '#fff', border: '1px solid transparent', shadow: '0 0 0 1px var(--ai-soft), 0 8px 24px -8px var(--ai)' },
  danger: { bg: 'transparent', color: 'var(--danger)', border: '1px solid color-mix(in oklab, var(--danger) 30%, transparent)', shadow: 'none' },
}

export function Button({
  children, variant = 'primary', size = 'md', icon, iconRight, fullWidth, style, onClick, href, type, disabled,
}: {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  style?: CSSProperties
  onClick?: () => void
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const s = BTN_SIZES[size]
  const v = BTN_VARIANTS[variant]
  const css: CSSProperties = {
    height: s.h, padding: `0 ${s.px}px`, gap: s.gap, fontSize: s.fs, fontWeight: 500, letterSpacing: '-0.01em',
    borderRadius: s.r, border: v.border, background: v.bg, color: v.color, boxShadow: v.shadow,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined, textDecoration: 'none', opacity: disabled ? 0.55 : undefined, ...style,
  }
  const inner = <>{icon}{children}{iconRight}</>
  if (href) return <a href={href} style={css}>{inner}</a>
  return <button type={type || 'button'} onClick={onClick} disabled={disabled} style={css}>{inner}</button>
}

/* ---------- card ---------- */

export function Card({ children, style, padding = 20 }: { children: ReactNode; style?: CSSProperties; padding?: number }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
      padding, boxShadow: 'var(--shadow-sm)', position: 'relative', ...style,
    }}>
      {children}
    </div>
  )
}

/* ---------- chip ---------- */

export function Chip({ children, color, dot, style }: { children: ReactNode; color?: string; dot?: boolean; style?: CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 999,
      background: color ? `color-mix(in oklab, ${color} 14%, transparent)` : 'var(--surface-2)',
      border: `1px solid ${color ? `color-mix(in oklab, ${color} 30%, transparent)` : 'var(--border)'}`,
      color: color || 'var(--text-2)', fontSize: 11, fontWeight: 500, ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: color || 'currentColor' }} />}
      {children}
    </span>
  )
}

export function LangDot({ lang, size = 10 }: { lang: string; size?: number }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: size, background: `var(--lang-${lang.toLowerCase()}, var(--accent))` }} />
}

/* ---------- avatar ---------- */

export function Avatar({ src, name = '', size = 36, ring }: { src?: string | null; name?: string; size?: number; ring?: boolean }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('') || '?'
  // longhand only — mixing the `background` shorthand with `backgroundColor` warns in React 19
  const bg: CSSProperties = src
    ? { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: 'var(--surface-2)' }
    : { backgroundImage: 'linear-gradient(135deg, var(--ai) 0%, var(--accent) 100%)', backgroundColor: 'var(--surface-2)' }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      ...bg, color: '#fff', fontWeight: 600, fontSize: size * 0.4,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: ring ? '0 0 0 2px var(--bg), 0 0 0 4px var(--accent)' : undefined,
    }}>
      {!src && initials}
    </div>
  )
}

/* ---------- ai badge ---------- */

export function AIBadge({ children = 'AI', icon = true, style }: { children?: ReactNode; icon?: boolean; style?: CSSProperties }) {
  return (
    <span className="gf-ai-chip" style={style}>
      {icon && <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l1.4 3.6L11 5l-3.6 1.4L6 10 4.6 6.4 1 5l3.6-1.4z" /></svg>}
      {children}
    </span>
  )
}

/* ---------- kbd / divider ---------- */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 6px', border: '1px solid var(--border)',
      borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-2)', lineHeight: 1,
    }}>{children}</span>
  )
}

export function Divider({ vertical, style }: { vertical?: boolean; style?: CSSProperties }) {
  return <div style={{ background: 'var(--border)', width: vertical ? 1 : '100%', height: vertical ? '100%' : 1, flexShrink: 0, ...style }} />
}
