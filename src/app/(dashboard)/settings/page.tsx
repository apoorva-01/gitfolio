'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { useUIStore } from '@/store'
import { signOut } from 'next-auth/react'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account')
  const [localRepoUpdates, setLocalRepoUpdates] = useState(false)
  const notifications = useUIStore((s) => s.notifications)
  const setNotification = useUIStore((s) => s.setNotification)
  const [theme, setTheme] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') || 'dark' : 'dark')

  return (
    <div>
      <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Account Settings</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>Manage your account preferences and settings</p>

      <div className="flex mb-4 gap-2">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'account', label: 'Account' },
          { id: 'appearance', label: 'Appearance' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'security', label: 'Security' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="px-4 py-2 text-sm rounded cursor-pointer transition-all"
            style={{
              background: activeSection === s.id ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
              color: activeSection === s.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              border: 'none',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'profile' && (
        <div className="rounded-lg mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Profile Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-[200px_1fr] gap-6">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Avatar</label>
              <div className="flex gap-6 items-start">
                <div className="relative group">
                  <div
                    className="w-24 h-24 rounded-full"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-success))', border: '3px solid var(--color-border)' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2.5 mt-1">
                    <button className="px-4 py-2 text-sm rounded cursor-pointer" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>Upload new</button>
                    <button className="px-4 py-2 text-sm rounded cursor-pointer" style={{ background: '#da3633', color: 'white', border: 'none' }}>Remove</button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </div>
            {[
              { label: 'Full Name', value: 'Alex Developer', hint: '' },
              { label: 'Username', value: 'alexdev', hint: 'Your unique identifier: gitfolio.dev/alexdev' },
              { label: 'Location', value: 'San Francisco, CA', hint: '' },
              { label: 'Website', value: '', hint: '', placeholder: 'https://your-site.com' },
            ].map((f) => (
              <div key={f.label} className="grid grid-cols-[200px_1fr] gap-6">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{f.label}</label>
                <div>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm rounded"
                    defaultValue={f.value}
                    placeholder={f.placeholder}
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                  {f.hint && <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{f.hint}</p>}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[200px_1fr] gap-6">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Bio</label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm rounded resize-y"
                rows={3}
                defaultValue="Full-stack developer passionate about building developer tools and open source."
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', minHeight: '100px' }}
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'account' && (
        <>
          <div className="rounded-lg mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Email Preferences</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { id: 'analysisNotifications', label: 'Weekly digest', desc: 'Receive a weekly summary of your activity' },
                { id: 'criticalIssueAlerts', label: 'New followers', desc: 'Get notified when someone follows you' },
                { id: 'repoUpdates', label: 'Repository updates', desc: 'Notifications about your repositories' },
              ].map((t) => {
                const isStoreToggle = t.id !== 'repoUpdates'
                const checked = isStoreToggle ? notifications[t.id as keyof typeof notifications] : localRepoUpdates
                return (
                  <div key={t.id} className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{t.label}</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.desc}</div>
                    </div>
                    <label className="relative inline-block w-11 h-6">
                      <input
                        type="checkbox"
                        checked={checked}
                        className="opacity-0 w-0 h-0"
                        onChange={(e) => {
                          if (isStoreToggle) {
                            setNotification(t.id as 'analysisNotifications' | 'criticalIssueAlerts', e.target.checked)
                          } else {
                            setLocalRepoUpdates(e.target.checked)
                          }
                        }}
                      />
                      <span
                        className="absolute cursor-pointer inset-0 rounded-full transition-colors"
                        style={{ background: checked ? 'var(--color-success)' : 'var(--color-surface-hover)' }}
                      >
                        <span
                          className="absolute w-[18px] h-[18px] bg-white rounded-full transition-transform"
                          style={{ left: '3px', bottom: '3px', transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </span>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Connected Accounts</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center py-4">
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>GitHub</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Connected as @alexdev</div>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 text-sm rounded cursor-pointer" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>Disconnect</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'appearance' && (
        <div className="rounded-lg mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Appearance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-[200px_1fr] gap-6">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Theme</label>
              <select
                className="w-full max-w-xs px-3.5 py-2.5 text-sm rounded"
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value)
                  localStorage.setItem('theme', e.target.value)
                  document.documentElement.setAttribute('data-theme', e.target.value)
                }}
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="dark">Dark (Default)</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'notifications' && (
        <div className="rounded-lg mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Notification Settings</h2>
          </div>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Configure how you receive notifications about your repositories and activity.</p>
          </div>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="rounded-lg mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Security Settings</h2>
          </div>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage your security preferences and connected sessions.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button onClick={() => toast.success('Settings saved successfully!')} className="px-5 py-2.5 rounded text-sm font-medium cursor-pointer" style={{ background: '#238636', color: 'white', border: 'none' }}>Save Changes</button>
        <button onClick={() => toast.info('Changes discarded')} className="px-5 py-2.5 rounded text-sm font-medium cursor-pointer" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>Cancel</button>
      </div>
    </div>
  )
}