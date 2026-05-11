'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-ui)' }}>
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(88, 166, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(63, 185, 80, 0.06) 0%, transparent 50%)',
        }}
      />

      <header
        className="sticky top-0 z-50"
        style={{
          padding: '20px 0',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(13, 17, 23, 0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg no-underline" style={{ color: 'var(--color-text)' }}>
              <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
                <rect width="32" height="32" rx="6" fill="#161b22"/>
                <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" stroke="#58a6ff" strokeWidth="2" fill="none"/>
                <path d="M12 16l3 3 5-6" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              GitFolio
            </Link>
            <ul className="hidden md:flex items-center gap-8 list-none">
              {['Dashboard', 'Repositories', 'Analytics', 'Templates'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Templates' ? '#' : '/dashboard'}
                    className="text-sm font-medium no-underline transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 rounded text-sm font-medium no-underline transition-all"
                style={{ color: 'var(--color-accent)', background: 'transparent' }}
              >
                Sign In
              </Link>
              <Link
                href="/onboarding"
                className="px-5 py-2.5 rounded text-sm font-medium no-underline transition-all"
                style={{ background: '#238636', color: 'white', border: '1px solid rgba(240, 246, 252, 0.1)' }}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-[100px] text-center">
          <div className="max-w-[1200px] mx-auto px-6">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm mb-6"
              style={{
                background: 'rgba(88, 166, 255, 0.1)',
                border: '1px solid rgba(88, 166, 255, 0.2)',
                color: 'var(--color-accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-success)' }} />
              Now in Public Beta
            </span>
            <h1
              className="text-5xl md:text-6xl font-bold leading-tight mb-5"
              style={{
                background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Your Code, Your Story
            </h1>
            <p className="text-lg max-w-[600px] mx-auto mb-10" style={{ color: 'var(--color-text-secondary)' }}>
              Build a stunning developer portfolio that showcases your repos, contributions, and journey. Connect with GitHub and let your work speak.
            </p>
            <div className="flex gap-4 justify-center mb-16">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded text-base font-medium no-underline transition-all"
                style={{ background: '#238636', color: 'white', border: '1px solid rgba(240, 246, 252, 0.1)' }}
              >
                Start Building →
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded text-base font-medium no-underline transition-all"
                style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              >
                View Demo
              </Link>
            </div>

            <div
              className="max-w-[800px] mx-auto rounded-xl overflow-hidden text-left"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}
              >
                <span className="w-3 h-3 rounded-full" style={{ background: '#f85149' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#d29922' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#3fb950' }} />
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div className="flex gap-3 mb-2">
                  <span style={{ color: 'var(--color-success)' }}>$</span>
                  <span style={{ color: 'var(--color-text)' }}>gitfolio init</span>
                </div>
                <div className="pl-6 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Initializing GitFolio...<br />
                  <span style={{ color: 'var(--color-accent)' }}>✓</span> Connected to GitHub<br />
                  <span style={{ color: 'var(--color-accent)' }}>✓</span> Synced 47 repositories<br />
                  <span style={{ color: 'var(--color-accent)' }}>✓</span> Generated portfolio<br />
                  <span style={{ color: 'var(--color-accent)' }}>✓</span> Deployed to gitfolio.dev
                </div>
                <div className="flex gap-3">
                  <span style={{ color: 'var(--color-success)' }}>$</span>
                  <span style={{ color: 'var(--color-text)' }}>open https://gitfolio.dev/yourname</span>
                  <span className="inline-block w-2 h-[18px] animate-pulse" style={{ background: 'var(--color-accent)' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-semibold mb-4">Everything You Need</h2>
              <p className="text-base max-w-[500px] mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                From automatic sync to stunning themes, we&apos;ve got you covered.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Auto-Sync Repos',
                  desc: 'Connect your GitHub account and we automatically import all your repositories with accurate stats.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
                },
                {
                  title: 'Activity Heatmap',
                  desc: 'Showcase your contribution history with the iconic GitHub-style heatmap. Every commit counts.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
                },
                {
                  title: 'Real-time Updates',
                  desc: 'Your portfolio stays fresh with automatic updates whenever you push code or open PRs.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
                },
                {
                  title: 'Custom Themes',
                  desc: 'Choose from dark, light, or create your own. Your portfolio should look exactly how you want it.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>,
                },
                {
                  title: 'Analytics Dashboard',
                  desc: 'Track your coding activity, top languages, and contribution trends with beautiful charts.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
                },
                {
                  title: 'One-Click Export',
                  desc: 'Download your portfolio as a static site. Host anywhere—Vercel, Netlify, GitHub Pages.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-8 rounded-lg transition-all"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded mb-5"
                    style={{ background: 'rgba(88, 166, 255, 0.1)', color: 'var(--color-accent)' }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[60px]" style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '50K+', label: 'Portfolios Created' },
                { value: '2M+', label: 'Repositories Synced' },
                { value: '10M+', label: 'Contributions Tracked' },
                { value: '99.9%', label: 'Uptime' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-4xl font-bold mb-1" style={{ color: 'var(--color-accent)' }}>{s.value}</div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 text-center">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-4xl font-bold mb-5">Ready to Tell Your Story?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>Join thousands of developers showcasing their work.</p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded text-base font-medium no-underline transition-all"
              style={{ background: '#238636', color: 'white', border: '1px solid rgba(240, 246, 252, 0.1)' }}
            >
              Create Your Portfolio →
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-10" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <ul className="flex gap-6 list-none">
              {['About', 'Documentation', 'Privacy', 'Terms', 'Contact'].map((l) => (
                <li key={l}>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)', cursor: 'default' }}>
                    {l}
                  </span>
                </li>
              ))}
            </ul>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              © 2025 GitFolio. Open source and free forever.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}