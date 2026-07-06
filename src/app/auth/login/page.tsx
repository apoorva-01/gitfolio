'use client'

import { Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo, Card, Button, Icon, type IconName } from '@/components/gf/primitives'

const FEATURES: { icon: IconName; color: string; title: string; body: string }[] = [
  { icon: 'Compass', color: 'var(--accent)', title: 'Interactive codebase graph', body: 'See every repo and how your work connects.' },
  { icon: 'Sparkle', color: 'var(--ai)', title: 'AI repo improvements', body: 'Claude drafts READMEs, bios, and fixes.' },
  { icon: 'User', color: 'var(--info)', title: 'Developer profile insights', body: 'Understand your stack, cadence, and strengths.' },
]

function FeatureRow({ icon, color, title, body }: { icon: IconName; color: string; title: string; body: string }) {
  const Ico = Icon[icon]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color, background: `color-mix(in oklab, ${color} 14%, transparent)`, border: `1px solid color-mix(in oklab, ${color} 24%, transparent)` }}>
        <Ico size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  )
}

function LoginContent() {
  const callbackUrl = useSearchParams().get('callbackUrl') || '/dashboard'
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', background: 'var(--bg)', color: 'var(--text)' }}>
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle at 22% 18%, color-mix(in oklab, var(--accent) 13%, transparent) 0%, transparent 45%), radial-gradient(circle at 80% 82%, color-mix(in oklab, var(--ai) 11%, transparent) 0%, transparent 45%)',
        }}
      />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px color-mix(in oklab, var(--accent) 8%, transparent), var(--shadow-lg)' }}>
            <Logo mark size={34} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Git<span style={{ color: 'var(--accent)' }}>Folio</span></div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Your GitHub story, beautifully told.</div>
          </div>
        </div>

        {/* card */}
        <Card padding={28} style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 22 }}>
            {FEATURES.map((f) => <FeatureRow key={f.title} {...f} />)}
          </div>

          <Button variant="primary" size="lg" fullWidth icon={<Icon.Github size={16} />} onClick={() => signIn('github', { callbackUrl })}>
            Continue with GitHub
          </Button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 14, lineHeight: 1.5 }}>
            Read-only access to analyze your code. Your private repos are never shared.
          </p>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--text-3)' }}>
          Free &amp; open source · <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Back to home</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-3)' }}>Loading…</div>}>
      <LoginContent />
    </Suspense>
  )
}
