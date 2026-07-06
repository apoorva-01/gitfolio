'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRepositories } from '@/hooks/useRepositories'
import { useUser, useUpdateUser } from '@/hooks/useUser'
import { Logo, Card, Button, Icon, Avatar, Chip, AIBadge, type IconName } from '@/components/gf/primitives'
import { SITE_HOST } from '@/lib/site'
import { toast } from '@/components/ui/Toast'
import type { Repository } from '@/store'

const TOTAL = 4

function OnboardingShell({ step, title, subtitle, children, footer }: { step: number; title: string; subtitle?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ height: 56, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <Logo size={26} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-2)' }}>
          <span>Step {step} of {TOTAL}</span>
          <div style={{ width: 220, height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ width: `${(step / TOTAL) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width .3s' }} />
          </div>
        </div>
        <Button variant="ghost" size="sm" href="/dashboard">Save & exit</Button>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 720, padding: '48px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? 'var(--accent)' : 'var(--surface-2)' }} />
            ))}
          </div>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, color: 'var(--text)', margin: 0 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 15, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.5 }}>{subtitle}</p>}
          </div>
          <div style={{ flex: 1 }}>{children}</div>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{footer}</div>
        </div>
      </div>
    </div>
  )
}

function ScopeRow({ icon, title, body, required }: { icon: IconName; title: string; body: string; required?: boolean }) {
  const Ico = Icon[icon]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ico size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{body}</div>
      </div>
      <Chip color={required ? 'var(--text-2)' : 'var(--success)'} dot>{required ? 'Required' : 'Granted'}</Chip>
    </div>
  )
}

const ACCENTS: [string, string][] = [['Emerald', '#10b981'], ['Violet', '#7c3aed'], ['Cyan', '#06b6d4'], ['Amber', '#f59e0b']]

const inputStyle: React.CSSProperties = { width: '100%', height: 40, padding: '0 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { repos } = useRepositories()
  const { data: profile } = useUser()
  const updateUser = useUpdateUser()
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'dark' | 'light'>('dark')
  const [accent, setAccent] = useState('#10b981')
  const [shipping, setShipping] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [seeded, setSeeded] = useState(false)

  const user = session?.user
  const login = (user as { githubLogin?: string } | undefined)?.githubLogin || 'you'

  useEffect(() => {
    if (!seeded && (session || profile)) {
      setName(profile?.name || user?.name || '')
      setBio(profile?.bio || '')
      setSeeded(true)
    }
  }, [session, profile, user, seeded])

  useEffect(() => {
    const t = localStorage.getItem('theme')
    if (t === 'light' || t === 'dark') setMode(t)
    const a = localStorage.getItem('accent')
    if (a && /^#[0-9a-fA-F]{6}$/.test(a)) setAccent(a.toLowerCase())
  }, [])

  const applyMode = (m: 'dark' | 'light') => {
    setMode(m)
    localStorage.setItem('theme', m)
    document.documentElement.setAttribute('data-theme', m)
  }
  const applyAccent = (c: string) => {
    setAccent(c)
    localStorage.setItem('accent', c)
    document.documentElement.style.setProperty('--accent', c)
  }

  const saveStep2 = () => {
    const patch = { name: name.trim() || (user?.name || 'Developer'), bio: bio.trim() }
    updateUser.mutate(patch, { onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save') })
    setStep(3)
  }
  const stars = repos.reduce((s: number, r: Repository) => s + (r.stargazersCount || 0), 0)
  const langCount = new Set(repos.map((r: Repository) => r.language).filter(Boolean)).size

  const back = <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))}>← Back</Button>

  const ship = () => {
    setShipping(true)
    fetch('/api/onboarding/complete', { method: 'POST' })
      .then(() => { toast.success('Your GitFolio is live!'); router.push('/dashboard') })
      .catch(() => { setShipping(false); toast.error('Could not finish setup') })
  }

  if (step === 1) return (
    <OnboardingShell step={1} title="Connect your GitHub" subtitle="GitFolio uses read-only OAuth. We never see your private code — only the metadata you authorize."
      footer={<><span /><Button size="lg" iconRight={<Icon.ArrowR size={14} />} onClick={() => setStep(2)}>Continue</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ScopeRow icon="User" title="Read your public profile" body="Name, bio, avatar, follower count" />
        <ScopeRow icon="Repo" title="List your repositories" body="Names, descriptions, topics, languages, stars, forks" />
        <ScopeRow icon="Code" title="Read repository metadata" body="READMEs and dependencies — public repos by default" />
        <ScopeRow icon="Github" title="Signed in" body={`Connected as @${login}`} />
      </div>
      <div style={{ marginTop: 24, padding: 16, borderRadius: 10, background: 'var(--ai-soft)', border: '1px solid color-mix(in oklab, var(--ai) 22%, transparent)', display: 'flex', gap: 12 }}>
        <Icon.Sparkle size={16} style={{ color: 'var(--ai)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>What we&apos;ll do with this</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>Claude reads your repo metadata to draft a bio, suggest pinned repos, and surface insights. You approve every AI output before it ships.</div>
        </div>
      </div>
    </OnboardingShell>
  )

  if (step === 2) return (
    <OnboardingShell step={2} title="Make it yours" subtitle="Claude drafts these from your GitHub. Edit anything."
      footer={<>{back}<Button size="lg" iconRight={<Icon.ArrowR size={14} />} onClick={saveStep2}>Continue</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={labelStyle}>Display name</label><input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} style={inputStyle} /></div>
        <div>
          <label style={labelStyle}>Tagline</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={2} placeholder="What do you build?" style={{ ...inputStyle, height: 'auto', padding: 12, resize: 'none', lineHeight: 1.5 }} />
        </div>
        <div>
          <label style={labelStyle}>Your URL</label>
          <div style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <span className="mono" style={{ fontSize: 13, color: 'var(--text-3)' }}>{SITE_HOST}/</span>
            <span className="mono" style={{ flex: 1, color: 'var(--text)', fontSize: 13 }}>{login}</span>
            <Icon.Check size={14} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Set by your GitHub username.</div>
        </div>
      </div>
    </OnboardingShell>
  )

  if (step === 3) return (
    <OnboardingShell step={3} title="Make it yours" subtitle="Set the look of your GitFolio. Change it anytime in Settings."
      footer={<>{back}<Button size="lg" iconRight={<Icon.ArrowR size={14} />} onClick={() => setStep(4)}>Continue</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <label style={labelStyle}>Theme</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {([['dark', 'Dark', 'linear-gradient(135deg, #0a0a0b 0%, #1c1c1f 100%)'], ['light', 'Light', 'linear-gradient(135deg, #ffffff 0%, #e4e4e7 100%)']] as const).map(([key, label, preview]) => {
              const selected = mode === key
              return (
                <div key={key} onClick={() => applyMode(key)} style={{
                  border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  background: 'var(--surface)', boxShadow: selected ? '0 0 0 4px var(--accent-soft)' : 'none', position: 'relative',
                }}>
                  <div style={{ height: 96, background: preview, position: 'relative', borderBottom: '1px solid var(--border)' }}>
                    {selected && <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Check size={12} /></div>}
                  </div>
                  <div style={{ padding: 12, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Accent color</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {ACCENTS.map(([label, c]) => {
              const selected = accent === c
              return (
                <button key={label} title={label} onClick={() => applyAccent(c)} style={{
                  width: 40, height: 40, borderRadius: 12, background: c, border: '2px solid var(--bg)', cursor: 'pointer',
                  boxShadow: selected ? `0 0 0 3px ${c}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>{selected && <Icon.Check size={16} />}</button>
              )
            })}
          </div>
        </div>
      </div>
    </OnboardingShell>
  )

  return (
    <OnboardingShell step={4} title="Ready to launch" subtitle="Your GitFolio is built. Hit ship and you're live in seconds."
      footer={<>{back}<Button size="lg" icon={<Icon.Bolt size={14} />} onClick={ship}>{shipping ? 'Shipping…' : 'Ship it'}</Button></>}>
      <Card padding={24}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Avatar src={user?.image} name={name || 'Your name'} size={56} ring />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>{name || 'Your name'}</div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{SITE_HOST}/{login}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}><AIBadge>AI generated</AIBadge></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>{repos.length}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>Repos</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>{stars.toLocaleString()}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>Stars</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>{langCount}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>Languages</div></div>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[`${mode === 'dark' ? 'Dark' : 'Light'} theme · custom accent`, 'AI bio drafted (edit anytime)', 'Top repos auto-pinned by stars', 'Contribution heatmap enabled'].map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon.Check size={12} style={{ color: 'var(--success)' }} /><span>{line}</span></div>
          ))}
        </div>
      </Card>
    </OnboardingShell>
  )
}
