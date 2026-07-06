'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, Chip } from '@/components/gf/primitives'
import { useUser, useUpdateUser } from '@/hooks/useUser'
import { toast } from '@/components/ui/Toast'

type Theme = 'light' | 'dark' | 'system'

function SettingsRow({ title, body, control, danger }: { title: string; body?: string; control: ReactNode; danger?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: danger ? 'var(--danger)' : 'var(--text)' }}>{title}</div>
        {body && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>{body}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  )
}

function SettingsSection({ title, subtitle, id, children }: { title: string; subtitle?: string; id: string; children: ReactNode }) {
  return (
    <Card padding={24} style={{ marginBottom: 16 }}>
      <div id={id} style={{ marginBottom: 8, scrollMarginTop: 72 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: -0.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {children}
    </Card>
  )
}

function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-2)', borderRadius: 8 }}>
      {options.map((o) => {
        const active = o.key === value
        return (
          <button key={o.key} onClick={() => onChange(o.key)} style={{
            padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
            background: active ? 'var(--surface)' : 'transparent', color: active ? 'var(--text)' : 'var(--text-3)', boxShadow: active ? 'var(--shadow-sm)' : 'none',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

const SECTIONS = [['profile', 'Profile'], ['appearance', 'Appearance'], ['connections', 'Connections'], ['danger', 'Danger']] as const

const ACCENTS: [string, string][] = [['emerald', '#10b981'], ['violet', '#7c3aed'], ['cyan', '#06b6d4'], ['amber', '#f59e0b']]

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const user = session?.user
  const login = (user as { githubLogin?: string } | undefined)?.githubLogin
  const { data: profile } = useUser()
  const updateUser = useUpdateUser()

  const [theme, setTheme] = useState<Theme>('dark')
  const [accent, setAccent] = useState('#10b981')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark' || stored === 'system') setTheme(stored)
    const a = localStorage.getItem('accent')
    if (a && /^#[0-9a-fA-F]{6}$/.test(a)) setAccent(a.toLowerCase())
  }, [])

  const applyAccent = (c: string) => {
    setAccent(c)
    localStorage.setItem('accent', c)
    document.documentElement.style.setProperty('--accent', c)
  }

  useEffect(() => {
    if (profile && !seeded) {
      setName(profile.name || '')
      setBio(profile.bio || '')
      setSeeded(true)
    }
  }, [profile, seeded])

  const saveProfile = () => {
    if (updateUser.isPending) return
    updateUser.mutate({ name, bio }, {
      onSuccess: () => { toast.success('Profile saved'); updateSession() },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
    })
  }

  const applyTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    const resolved = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t
    document.documentElement.setAttribute('data-theme', resolved)
  }

  const clearData = () => {
    if (!confirm('Delete all synced repositories and analyses? This cannot be undone.')) return
    fetch('/api/settings/clear-data', { method: 'POST' })
      .then((r) => { if (!r.ok) throw new Error(); toast.success('All data cleared') })
      .catch(() => toast.error('Could not clear data'))
  }

  const inputStyle: React.CSSProperties = { width: '100%', height: 36, padding: '0 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }

  return (
    <PageShell topNav={<TopNav title="Settings" search={false} />}>
      <div className="gf-settings-grid" style={{ padding: 24, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 80, alignSelf: 'start' }}>
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} style={{ padding: '8px 12px 8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-2)', borderLeft: '2px solid transparent', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>

        <div>
          <SettingsSection id="profile" title="Profile" subtitle="The basics shown on your public GitFolio.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 16 }}>
              <div>
                <label style={labelStyle}>Display name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <input defaultValue={login || ''} className="mono" readOnly style={{ ...inputStyle, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={2} placeholder="Tell visitors what you build…" style={{ ...inputStyle, height: 'auto', padding: 10, resize: 'none', lineHeight: 1.5 }} />
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, textAlign: 'right' }}>{bio.length}/280</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="primary" size="md" disabled={updateUser.isPending} onClick={saveProfile}>{updateUser.isPending ? 'Saving…' : 'Save changes'}</Button>
            </div>
          </SettingsSection>

          <SettingsSection id="appearance" title="Appearance" subtitle="How GitFolio looks for you.">
            <SettingsRow title="Theme" body="Auto follows your OS · dark is the default"
              control={<Segmented<Theme> value={theme} onChange={applyTheme} options={[
                { key: 'light', label: <><Icon.Sun size={12} />Light</> },
                { key: 'dark', label: <><Icon.Moon size={12} />Dark</> },
                { key: 'system', label: 'System' },
              ]} />} />
            <SettingsRow title="Accent color" body="Used across charts, buttons, and highlights."
              control={<div style={{ display: 'flex', gap: 8 }}>
                {ACCENTS.map(([n, c]) => (
                  <button key={n} title={n} onClick={() => applyAccent(c)} style={{ width: 24, height: 24, borderRadius: 12, background: c, border: '2px solid var(--bg)', boxShadow: accent === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }} />
                ))}
              </div>} />
          </SettingsSection>

          <SettingsSection id="connections" title="Connections" subtitle="Linked accounts.">
            <SettingsRow title="GitHub" body={login ? `Connected as @${login}` : 'Not connected'}
              control={<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Chip color="var(--success)" dot>Active</Chip>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>Disconnect</Button>
              </div>} />
          </SettingsSection>

          <SettingsSection id="danger" title="Danger zone" subtitle="Irreversible actions.">
            <SettingsRow danger title="Clear all data" body="Delete every synced repository and AI analysis from GitFolio." control={<Button variant="danger" size="sm" onClick={clearData}>Clear data</Button>} />
            <SettingsRow danger title="Sign out" body="End your session on this device." control={<Button variant="danger" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>Sign out</Button>} />
          </SettingsSection>
        </div>
      </div>
    </PageShell>
  )
}
