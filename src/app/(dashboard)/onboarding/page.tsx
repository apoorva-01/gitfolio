'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useUIStore } from '@/store'
import { toast } from '@/components/ui/Toast'

const steps = [
  { title: 'Connect Your GitHub', subtitle: 'Sign in with GitHub to import your repositories, contributions, and profile information automatically.' },
  { title: 'Import Repositories', subtitle: 'Select which repositories to import to your portfolio.' },
  { title: 'Customize Profile', subtitle: 'Add a bio, location, and links to showcase who you are.' },
  { title: 'Choose Theme', subtitle: 'Pick a theme that matches your style.' },
]

const features = [
  { title: 'Auto-sync repositories', desc: 'All your public repos imported automatically', icon: 'folder' },
  { title: 'Contribution history', desc: 'Track your coding activity over time', icon: 'activity' },
  { title: 'Profile sync', desc: 'Your bio, avatar, and links imported', icon: 'user' },
]

function FeatureIcon({ type }: { type: string }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
  if (type === 'folder') return <svg {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  if (type === 'activity') return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-ui)' }}>
      <div className="flex-1 p-12 flex flex-col justify-center" style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg no-underline mb-12" style={{ color: 'var(--color-text)' }}>
          <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
            <rect width="32" height="32" rx="6" fill="#161b22"/>
            <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" stroke="#58a6ff" strokeWidth="2" fill="none"/>
            <path d="M12 16l3 3 5-6" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          GitFolio
        </Link>

        <div className="flex gap-3 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                background: s < step ? 'var(--color-success)' : s === step ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                border: `2px solid ${s === step ? 'var(--color-accent)' : s < step ? 'var(--color-success)' : 'var(--color-border)'}`,
              }}
            />
          ))}
        </div>

        <h1 className="text-[32px] font-bold mb-4">{step === 1 ? steps[0].title : step === 2 ? steps[1].title : step === 3 ? steps[2].title : steps[3].title}</h1>
        <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {step === 1 ? steps[0].subtitle : step === 2 ? steps[1].subtitle : step === 3 ? steps[2].subtitle : steps[3].subtitle}
        </p>

        {step === 1 && (
          <>
            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded text-sm font-medium cursor-pointer transition-all"
              style={{ background: '#24292f', color: 'white', border: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Continue with GitHub
            </button>
            <p className="text-xs mt-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-3 mb-6">
              {['react-components', 'design-system', 'api-client'].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 px-4 py-3 rounded cursor-pointer"
                  style={{ background: 'var(--color-bg)' }}
                >
                  <input type="checkbox" defaultChecked className="accent-[var(--color-accent)]" />
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{r}</span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>TypeScript</span>
                </label>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full py-3.5 rounded text-sm font-medium cursor-pointer" style={{ background: '#238636', color: 'white', border: 'none' }}>Continue</button>
          </>
        )}

        {step >= 3 && (
          <>
            <div className="flex items-center gap-4 mb-6">
              {['bio', 'location', 'links'].map((f) => (
                <div key={f} className="flex-1 h-2 rounded-full" style={{ background: f === 'bio' ? 'var(--color-surface-hover)' : 'var(--color-success)' }} />
              ))}
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-sm rounded"
                  placeholder="Tell us about yourself..."
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-sm rounded"
                  placeholder="City, Country"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 text-sm rounded"
                  placeholder="https://your-site.com"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
            </div>
            <button onClick={() => setStep(4)} className="w-full py-3.5 rounded text-sm font-medium cursor-pointer mt-6" style={{ background: '#238636', color: 'white', border: 'none' }}>Continue</button>
          </>
        )}

        {step === 3 && <div className="mt-auto"><h3 className="font-semibold mb-4">What you&apos;ll get:</h3><div className="flex flex-col gap-5">{features.map((f) => (<div key={f.title} className="flex gap-4 items-start"><div className="w-12 h-12 flex items-center justify-center rounded flex-shrink-0" style={{ background: 'rgba(88, 166, 255, 0.1)', color: 'var(--color-accent)' }}><FeatureIcon type={f.icon} /></div><div><h3 className="font-semibold mb-1">{f.title}</h3><p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{f.desc}</p></div></div>))}</div></div>}
      </div>

      <div className="flex-1 p-12 flex flex-col justify-center">
        <div className="max-w-[400px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg no-underline mb-8" style={{ color: 'var(--color-text)' }}>
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
              <rect width="32" height="32" rx="6" fill="#161b22"/>
              <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" stroke="#58a6ff" strokeWidth="2" fill="none"/>
              <path d="M12 16l3 3 5-6" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            GitFolio
          </Link>

          {step === 1 && (
            <>
              <h1 className="text-[28px] font-bold mb-4">Or sign up with email</h1>
              <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>Create an account to get started without connecting GitHub.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 text-sm rounded" placeholder="John Doe" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 text-sm rounded" placeholder="you@example.com" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input type="password" className="w-full px-4 py-3 text-sm rounded" placeholder="••••••••" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>Must be at least 8 characters</p>
                </div>
                <button onClick={() => toast.info('Email sign-up coming soon. Use GitHub to get started.')} className="w-full py-3.5 rounded text-sm font-medium cursor-pointer" style={{ background: '#238636', color: 'white', border: 'none' }}>Create Account</button>
              </div>
              <p className="mt-6 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                Already have an account? <Link href="/auth/login" style={{ color: 'var(--color-accent)' }}>Sign in</Link>
              </p>
            </>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(63, 185, 80, 0.15)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className="text-[28px] font-bold mb-4">You&apos;re All Set!</h1>
              <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>Your portfolio is ready to go. Start exploring your dashboard.</p>
              <Link
                href="/dashboard"
                onClick={() => {
                  fetch('/api/onboarding/complete', { method: 'POST' })
                  useUIStore.getState().setOnboardingComplete(true)
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded text-sm font-medium no-underline"
                style={{ background: '#238636', color: 'white' }}
              >
                Go to Dashboard →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}