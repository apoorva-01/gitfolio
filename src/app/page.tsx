'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { SITE_HOST } from '@/lib/site'
import './page.css'

/* ---------- icons (lucide-ish, stroke 1.7) ---------- */

type IconProps = { size?: number; fill?: string; style?: CSSProperties }

function I({ size = 16, fill = 'none', style, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {children}
    </svg>
  )
}

const Icon = {
  ArrowR: (p: IconProps) => (
    <I {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></I>
  ),
  Github: (p: IconProps) => (
    <I {...p}><path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19 4.5a4.9 4.9 0 0 0-.1-3.6S17.6.6 15 2.4a13 13 0 0 0-6 0C6.4.6 5.1.9 5.1.9A4.9 4.9 0 0 0 5 4.5a5.2 5.2 0 0 0-1.3 3.3c0 5.2 3.2 6.4 6.2 6.7A3.4 3.4 0 0 0 9 17v3.9" /></I>
  ),
  Eye: (p: IconProps) => (
    <I {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></I>
  ),
  Check: (p: IconProps) => (
    <I {...p}><polyline points="20 6 9 17 4 12" /></I>
  ),
  Sparkle: (p: IconProps) => (
    <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></I>
  ),
  Chart: (p: IconProps) => (
    <I {...p}><path d="M3 3v18h18" /><path d="M7 16l4-6 4 3 5-7" /></I>
  ),
  Layers: (p: IconProps) => (
    <I {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></I>
  ),
  Bolt: (p: IconProps) => (
    <I {...p} fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></I>
  ),
  Twitter: (p: IconProps) => (
    <I {...p}><path d="M22 5.8a8.5 8.5 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.6 1 4.2 4.2 0 0 0-7.2 3.8A12 12 0 0 1 3 4.8a4.2 4.2 0 0 0 1.3 5.6A4.2 4.2 0 0 1 2.4 10v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 4 2.9A8.5 8.5 0 0 1 2 18.7a12 12 0 0 0 6.5 1.9c7.8 0 12-6.5 12-12v-.5A8.6 8.6 0 0 0 22 5.8z" /></I>
  ),
  Globe: (p: IconProps) => (
    <I {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" /></I>
  ),
}

/* ---------- primitives ---------- */

function Logo({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M8 6 L8 26" stroke="var(--text)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M8 14 C 8 18, 12 18, 16 18 L 22 18" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M22 18 C 26 18, 26 14, 26 10" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="8" cy="6" r="3.2" fill="var(--text)" />
        <circle cx="8" cy="26" r="3.2" fill="var(--text)" />
        <circle cx="22" cy="18" r="3.2" fill="var(--accent)" />
        <circle cx="26" cy="10" r="3.2" fill="var(--accent)" />
      </svg>
      <span style={{ fontSize: size * 0.62, fontWeight: 600, letterSpacing: -0.4 }}>
        Git<span style={{ color: 'var(--accent)' }}>Folio</span>
      </span>
    </span>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const BTN_SIZES: Record<ButtonSize, { h: number; px: number; fs: number; gap: number; r: number }> = {
  sm: { h: 28, px: 10, fs: 12, gap: 6, r: 6 },
  md: { h: 36, px: 14, fs: 13, gap: 8, r: 8 },
  lg: { h: 44, px: 20, fs: 14, gap: 8, r: 10 },
}

const BTN_VARIANTS: Record<ButtonVariant, { bg: string; color: string; border: string; shadow: string }> = {
  primary: { bg: 'var(--accent)', color: '#fff', border: '1px solid transparent', shadow: '0 1px 0 rgba(255,255,255,.15) inset, 0 1px 2px rgba(0,0,0,.18)' },
  secondary: { bg: 'transparent', color: 'var(--text)', border: '1px solid var(--border-strong)', shadow: 'none' },
  ghost: { bg: 'transparent', color: 'var(--text-2)', border: '1px solid transparent', shadow: 'none' },
}

function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
}: {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
}) {
  const s = BTN_SIZES[size]
  const v = BTN_VARIANTS[variant]
  return (
    <Link
      href={href}
      style={{
        height: s.h,
        padding: `0 ${s.px}px`,
        gap: s.gap,
        fontSize: s.fs,
        fontWeight: 500,
        letterSpacing: '-0.01em',
        borderRadius: s.r,
        border: v.border,
        background: v.bg,
        color: v.color,
        boxShadow: v.shadow,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}

function Card({ children, padding = 24, style }: { children: ReactNode; padding?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding,
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function AIBadge({ children = 'AI' }: { children?: ReactNode }) {
  return (
    <span className="gf-ai-chip">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 0l1.4 3.6L11 5l-3.6 1.4L6 10 4.6 6.4 1 5l3.6-1.4z" />
      </svg>
      {children}
    </span>
  )
}

/* ---------- hero git-graph visual ---------- */

function HeroGraph() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 380,
        background: 'radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 60%)',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 800 380" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--ai)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <line x1="40" y1="190" x2="760" y2="190" stroke="var(--border-strong)" strokeWidth="1.2" />
        <path d="M180 190 C 220 190, 220 110, 280 110 L 480 110 C 540 110, 540 190, 580 190" stroke="url(#lineGrad)" strokeWidth="1.6" fill="none" />
        <path d="M260 190 C 300 190, 300 270, 360 270 L 520 270 C 560 270, 560 190, 600 190" stroke="url(#lineGrad)" strokeWidth="1.6" fill="none" opacity=".6" />
        <path d="M380 110 C 420 110, 420 50, 480 50 L 620 50" stroke="var(--ai)" strokeWidth="1.3" fill="none" opacity=".7" />
        {[80, 180, 260, 340, 440, 520, 600, 680, 740].map((x) => (
          <circle key={`m-${x}`} cx={x} cy="190" r="5" fill="var(--bg)" stroke="var(--text-2)" strokeWidth="1.4" />
        ))}
        {[280, 380, 480].map((x) => (
          <circle key={`b1-${x}`} cx={x} cy="110" r="4.5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
        ))}
        {[360, 440, 520].map((x) => (
          <circle key={`b2-${x}`} cx={x} cy="270" r="4.5" fill="var(--ai)" stroke="var(--bg)" strokeWidth="2" />
        ))}
        {[480, 560, 620].map((x) => (
          <circle key={`b3-${x}`} cx={x} cy="50" r="3.5" fill="var(--ai-2)" stroke="var(--bg)" strokeWidth="2" opacity=".8" />
        ))}
        <g fontFamily="var(--font-mono)" fontSize="10" fill="var(--text-3)">
          <text x="40" y="178">main</text>
          <text x="280" y="98">feat/portfolio</text>
          <text x="360" y="290">feat/insights</text>
          <text x="480" y="38">ai/themes</text>
        </g>
        <g transform="translate(680 165)">
          <rect width="58" height="20" rx="4" fill="var(--accent-soft)" stroke="var(--accent-dim)" />
          <text x="29" y="14" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--accent)" fontWeight="600">v1.0.0</text>
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          right: 60,
          top: 30,
          width: 240,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 14,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <AIBadge>AI summary</AIBadge>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>
          Maya is a TypeScript + Rust developer who ships at 09:00 CET and spent Q3 on developer tools.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 60,
          bottom: 30,
          width: 200,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 14,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>contribution streak</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.6, marginTop: 2 }}>84 days</div>
        <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: i < 14 ? 'var(--accent)' : 'var(--surface-2)',
                opacity: 0.4 + (i / 16) * 0.6,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- feature + step ---------- */

function FeatureCard({ icon, title, body, ai }: { icon: ReactNode; title: string; body: string; ai?: boolean }) {
  return (
    <Card padding={24} style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
          }}
        >
          {icon}
        </div>
        {ai && <AIBadge>AI</AIBadge>}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{body}</div>
    </Card>
  )
}

function Step({ n, title, body, code }: { n: number; title: string; body: string; code: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {n}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{body}</div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          padding: '10px 12px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          color: 'var(--text-2)',
        }}
      >
        {code}
      </div>
    </div>
  )
}

/* ---------- page ---------- */

const SECTION_X = 'clamp(20px, 5vw, 56px)'

const GITHUB_URL = 'https://github.com/apoorva-01/gitfolio'

const FOOTER_COLUMNS: [string, [string, string][]][] = [
  ['Product', [['Features', '#features'], ['How it works', '#how'], ['Dashboard', '/dashboard']]],
  ['Project', [['GitHub', GITHUB_URL], ['Sign in', '/auth/login'], ['Get started', '/onboarding']]],
]

export default function LandingPage() {
  return (
    <div className="gf-app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* NAV */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `20px ${SECTION_X}`,
          borderBottom: '1px solid var(--border)',
          background: 'color-mix(in oklab, var(--bg) 80%, transparent)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        <Logo size={28} />
        <div className="gf-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">Docs</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button href="/auth/login" variant="ghost" size="sm">Sign in</Button>
          <Button href="/onboarding" variant="primary" size="sm" iconRight={<Icon.ArrowR size={12} />}>Get GitFolio</Button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: `72px ${SECTION_X} 40px`, position: 'relative' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 999,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: 12,
              color: 'var(--text-2)',
              marginBottom: 28,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />
            <span>v1.0 just shipped — AI insights for every repo</span>
            <Icon.ArrowR size={11} />
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 68px)', fontWeight: 700, letterSpacing: -2.4, lineHeight: 1.02, margin: 0, color: 'var(--text)' }}>
            Your GitHub story,
            <br />
            <span className="gf-ai-text">beautifully told.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 580, margin: '24px auto 0', lineHeight: 1.5 }}>
            GitFolio turns your repos, commits, and contributions into a stunning portfolio with AI-generated insights — in 30 seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            <Button href="/auth/login" size="lg" icon={<Icon.Github size={16} />}>Continue with GitHub</Button>
            <Button href="/dashboard" variant="secondary" size="lg" icon={<Icon.Eye size={14} />}>See an example</Button>
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
            <span><Icon.Check size={11} style={{ verticalAlign: -1, color: 'var(--success)' }} /> Free for public repos</span>
            <span><Icon.Check size={11} style={{ verticalAlign: -1, color: 'var(--success)' }} /> Free &amp; open source</span>
            <span><Icon.Check size={11} style={{ verticalAlign: -1, color: 'var(--success)' }} /> Custom domain</span>
          </div>
        </div>
        <div style={{ marginTop: 48 }}>
          <HeroGraph />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: `32px ${SECTION_X}`, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="gf-proof">
          <span style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.4, whiteSpace: 'nowrap' }}>
            Trusted by 28,000+ developers from
          </span>
          {['Vercel', 'Stripe', 'Linear', 'Supabase', 'Replit', 'PlanetScale', 'Railway', 'Fly.io'].map((co) => (
            <span key={co} style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-2)', letterSpacing: -0.4 }}>{co}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: `96px ${SECTION_X}`, scrollMarginTop: 72 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.6, marginBottom: 12 }}>What you get</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: -1.2, margin: 0, color: 'var(--text)' }}>Everything you build, told well.</h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 520, margin: '12px auto 0' }}>
            Pull every signal from your GitHub. Layer it with AI. Render a portfolio that earns the click.
          </p>
        </div>
        <div className="gf-features-grid">
          <FeatureCard icon={<Icon.Sparkle size={18} />} ai title="AI-written bios" body="Claude reads your repos, READMEs, and commit history and writes a bio that sounds like you, not GPT." />
          <FeatureCard icon={<Icon.Chart size={18} />} title="Real visualizations" body="Contribution heatmaps, language donuts, commit cadence, collaboration graphs. Zero placeholder data." />
          <FeatureCard icon={<Icon.Layers size={18} />} title="20+ themes" body="Vercel, Linear, Brutalist, Terminal — pick a starting point or fork the source. All themes are MDX." />
          <FeatureCard icon={<Icon.Bolt size={18} />} ai title="Auto-updating" body="Push code, your GitFolio updates. Star a repo, it surfaces. AI insights regenerate weekly." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: `64px ${SECTION_X} 96px`, background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', scrollMarginTop: 72 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.6, marginBottom: 12 }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: -1.2, margin: 0, color: 'var(--text)' }}>Live in 30 seconds.</h2>
        </div>
        <div className="gf-steps-grid">
          <Step n={1} title="Connect GitHub" body="One click. Read-only OAuth. We never see your private code, only metadata you authorize." code="$ gh auth · scope: read:user, public_repo" />
          <Step n={2} title="Pick a template" body="Choose from 20+ themes built by the community. Or fork one and edit MDX directly in the browser." code="$ gitfolio init --theme=tessera" />
          <Step n={3} title="Ship to your domain" body={`Deploy to ${SITE_HOST}/you, or bring your own domain. Edge-hosted, ISR, free SSL.`} code="$ gitfolio deploy → mayachen.dev ✓" />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: `88px ${SECTION_X}`, textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(30px, 5.5vw, 44px)', fontWeight: 700, letterSpacing: -1.4, margin: 0, color: 'var(--text)', maxWidth: 680, marginInline: 'auto' }}>
          Your code is good.
          <br />
          The portfolio should be too.
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Button href="/auth/login" size="lg" icon={<Icon.Github size={16} />}>Start with GitHub — free</Button>
          <Button href="/dashboard" variant="secondary" size="lg">View live examples</Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: `40px ${SECTION_X}`, background: 'var(--bg-2)' }}>
        <div className="gf-footer-grid">
          <div>
            <Logo size={26} />
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.5, maxWidth: 260 }}>
              Your GitHub story, beautifully told. AI-generated portfolios in seconds.
            </div>
          </div>
          {FOOTER_COLUMNS.map(([head, items]) => (
            <div key={head}>
              <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{head}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(([label, href]) => {
                  const external = href.startsWith('http')
                  return (
                    <a key={label} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>{label}</a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: 12, color: 'var(--text-3)', gap: 16, flexWrap: 'wrap' }}>
          <span>© 2026 GitFolio · Open source, free forever</span>
          <div style={{ display: 'flex', gap: 14 }}>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" style={{ color: 'var(--text-3)' }}><Icon.Github size={16} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
