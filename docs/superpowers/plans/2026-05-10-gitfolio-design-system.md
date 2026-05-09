# GitFolio — Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved GitFolio Premium Minimal design system — CSS tokens, components, and page redesigns.

**Architecture:** CSS custom properties as the single source of truth for all design tokens. Dark/light switching via `data-theme` attribute on `<html>`. Components built as reusable CSS classes. Satoshi font via Fontshare CDN.

**Tech Stack:** CSS custom properties, Fontshare CDN, existing Tailwind setup (stripped of conflicting utility classes where needed).

---

## File Map

- `src/app/globals.css` — Design tokens, resets, typography scale
- `src/app/layout.tsx` — Theme initialization, font loading
- `src/components/ui/` — Reusable component CSS/TSX
- `src/app/page.tsx` — Landing page (currently redirects to login)
- `src/app/(dashboard)/layout.tsx` — Dashboard shell with top nav
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard page
- `src/app/(dashboard)/repos/page.tsx` — Repositories page
- `src/app/(dashboard)/profile/page.tsx` — Profile page
- `src/app/(dashboard)/analytics/page.tsx` — Analytics page
- `src/app/onboarding/page.tsx` — Onboarding wizard
- `src/app/settings/page.tsx` — Settings page

---

## Phase 1: Foundation — Design Tokens & Typography

### Task 1: Design Token CSS System

**Files:**
- Modify: `src/app/globals.css`
- Reference: `docs/superpowers/specs/2026-05-10-gitfolio-design.md`

- [ ] **Step 1: Add Satoshi font import at top of globals.css**

Add before any other CSS:

```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');
```

- [ ] **Step 2: Define CSS custom properties for dark theme (default)**

Add after font import:

```css
:root,
[data-theme="dark"] {
  /* Colors */
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-hover: #334155;
  --color-border: #334155;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-accent: #6366f1;
  --color-accent-hover: #4f46e5;
  --color-accent-muted: rgba(99, 102, 241, 0.15);
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;

  /* Typography */
  --font-sans: 'Satoshi', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Transitions */
  --transition: 150ms ease;
}

[data-theme="light"] {
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-hover: #f1f5f9;
  --color-border: #e2e8f0;
  --color-text: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-accent-muted: rgba(99, 102, 241, 0.1);
}
```

- [ ] **Step 3: Reset and base styles**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
}

::selection {
  background: var(--color-accent-muted);
  color: var(--color-text);
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
}
```

- [ ] **Step 4: Typography scale classes**

```css
/* Type scale */
.text-hero {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.text-page-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.text-section-heading {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.text-body {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
}

.text-caption {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.text-micro {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.text-mono {
  font-family: var(--font-mono);
}
```

- [ ] **Step 5: Spacing utility classes**

```css
/* Common spacing */
.mt-2 { margin-top: var(--space-2); }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
```

- [ ] **Step 6: Layout container**

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.container-sm {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add CSS design token system with dark/light themes"
```

---

### Task 2: Theme Initialization Script

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/theme-provider.tsx` (if it doesn't exist)

- [ ] **Step 1: Read current layout.tsx**

```bash
cat src/app/layout.tsx
```

- [ ] **Step 2: Add theme detection and system preference handling**

The layout should:
1. Include Satoshi font via `<link>` in `<head>`
2. Add `data-theme="dark"` to `<html>` by default
3. Add a small inline script (before body renders) that reads `localStorage` and updates `data-theme`

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GitFolio',
  description: 'Your GitHub story, beautifully told',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(design): initialize theme detection and Satoshi font"
```

---

## Phase 2: Core UI Components

### Task 3: Button Component

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/button.css`

- [ ] **Step 1: Create button.css with all button styles**

```css
/* Base button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: 36px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), opacity var(--transition);
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Primary */
.btn-primary {
  background: var(--color-accent);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--color-surface);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--color-surface);
  color: var(--color-text);
}

/* Icon button */
.btn-icon {
  width: 36px;
  padding: 0;
}

/* Sizes */
.btn-sm {
  height: 28px;
  padding: 0 var(--space-3);
  font-size: 12px;
}

.btn-lg {
  height: 44px;
  padding: 0 var(--space-6);
  font-size: 15px;
}
```

- [ ] **Step 2: Create button.tsx component**

```tsx
import './button.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    icon ? 'btn-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx src/components/ui/button.css
git commit -m "feat(ui): add Button component with primary/secondary/ghost variants"
```

---

### Task 4: Card Component

**Files:**
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/card.css`

- [ ] **Step 1: Create card.css**

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: border-color var(--transition);
}

.card-interactive:hover {
  border-color: var(--color-accent);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
```

- [ ] **Step 2: Create card.tsx**

```tsx
import './card.css'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  children: React.ReactNode
}

export function Card({ interactive = false, className = '', children, ...props }: CardProps) {
  const classes = ['card', interactive ? 'card-interactive' : '', className].filter(Boolean).join(' ')
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card-header ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card-title ${className}`}>{children}</div>
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/card.tsx src/components/ui/card.css
git commit -m "feat(ui): add Card component"
```

---

### Task 5: Input & Form Components

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/input.css`

- [ ] **Step 1: Create input.css**

```css
.input {
  width: 100%;
  height: 36px;
  padding: 0 var(--space-3);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text);
  transition: border-color var(--transition);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}
```

- [ ] **Step 2: Create input.tsx**

```tsx
import './input.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name || Math.random().toString(36).slice(2)
  return (
    <div>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input id={inputId} className={`input ${className}`} {...props} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/input.tsx src/components/ui/input.css
git commit -m "feat(ui): add Input component"
```

---

### Task 6: Stat Card Component

**Files:**
- Create: `src/components/ui/stat-card.tsx`
- Create: `src/components/ui/stat-card.css`

- [ ] **Step 1: Create stat-card.css**

```css
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
  margin-top: var(--space-1);
}

.stat-change.up {
  color: var(--color-success);
}

.stat-change.neutral {
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Create stat-card.tsx**

```tsx
import './stat-card.css'

interface StatCardProps {
  value: string | number
  label: string
  change?: string
  trend?: 'up' | 'neutral'
}

export function StatCard({ value, label, change, trend = 'neutral' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${trend}`}>{change}</div>}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/stat-card.tsx src/components/ui/stat-card.css
git commit -m "feat(ui): add StatCard component"
```

---

## Phase 3: Dashboard Shell — Top Navigation

### Task 7: Dashboard Layout with Top Nav

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/layout.css`
- Modify: Existing redirect pages

- [ ] **Step 1: Create (dashboard)/layout.tsx**

The dashboard shell wraps all authenticated pages with top navigation.

```tsx
import Link from 'next/link'
import './layout.css'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/repos', label: 'Repositories' },
  { href: '/profile', label: 'Profile' },
  { href: '/analytics', label: 'Analytics' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <header className="top-nav">
        <div className="top-nav-inner">
          <Link href="/dashboard" className="nav-logo">
            GitFolio
          </Link>
          <nav className="nav-tabs">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-tab">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link href="/settings" className="nav-tab">
              Settings
            </Link>
            <div className="nav-avatar">AV</div>
          </div>
        </div>
      </header>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create layout.css for dashboard shell**

```css
.dashboard-shell {
  min-height: 100vh;
  background: var(--color-bg);
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.top-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 56px;
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.nav-logo {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.nav-tabs {
  display: flex;
  gap: var(--space-1);
  flex: 1;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: color var(--transition), background var(--transition);
}

.nav-tab:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.nav-tab.active {
  color: var(--color-text);
  background: var(--color-accent-muted);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}

.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}
```

- [ ] **Step 3: Check existing route structure and fix**

```bash
ls src/app/
ls src/app/dashboard/ 2>/dev/null || echo "no dashboard dir"
ls src/app/repos/ 2>/dev/null || echo "no repos dir"
```

Move existing pages under `(dashboard)` route group if they exist at top level. The route group `(dashboard)` hides the group name from the URL — pages under it appear at `/dashboard`, `/repos`, etc.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/
git commit -m "feat(layout): add dashboard shell with top nav"
```

---

## Phase 4: Page Implementations

### Task 8: Landing Page

**Files:**
- Modify: `src/app/page.tsx` (change from redirect to landing)

- [ ] **Step 1: Rewrite src/app/page.tsx as the landing page**

Full implementation per spec: dense layout, dark background, hero + features + how it works + CTA.

```tsx
import Link from 'next/link'
import './page.css'

export default function HomePage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <span className="landing-logo">GitFolio</span>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/onboarding" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-inner">
          <h1 className="text-hero">
            Your GitHub story,<br />
            <span className="text-accent">beautifully told</span>
          </h1>
          <p className="hero-sub">
            Transform your GitHub repos into a stunning portfolio with AI-powered insights,
            beautiful visualizations, and one-click deployment.
          </p>
          <div className="hero-actions">
            <Link href="/onboarding" className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Connect GitHub
            </Link>
            <Link href="/u/demo" className="btn btn-secondary">View Demo</Link>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <p className="text-micro" style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>Features</p>
          <h2 className="text-page-title" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            Everything you need to shine
          </h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="text-section-heading">{f.title}</h3>
                <p className="text-caption">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-section">
        <div className="container">
          <p className="text-micro" style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>How it works</p>
          <h2 className="text-page-title" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            Three steps to your portfolio
          </h2>
          <div className="steps-row">
            {STEPS.map((s, i) => (
              <div key={s.title} className="step-item">
                <div className="step-num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p className="text-caption">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="text-page-title">Ready to stand out?</h2>
            <p className="text-caption" style={{ marginBottom: 'var(--space-6)' }}>
              Join thousands of developers showcasing their work with GitFolio.
            </p>
            <Link href="/onboarding" className="btn btn-primary btn-lg">
              Start Building Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container footer-inner">
          <p className="text-caption">© 2026 GitFolio. Built with care for developers.</p>
          <div className="footer-links">
            <a href="#" className="text-caption">Privacy</a>
            <a href="#" className="text-caption">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  { icon: '✨', title: 'AI-Powered Insights', desc: 'Get intelligent analysis of your repositories, coding patterns, and project highlights.' },
  { icon: '📊', title: 'Beautiful Charts', desc: 'Contribution graphs, language distributions, and activity timelines rendered beautifully.' },
  { icon: '🎨', title: 'Custom Themes', desc: 'Choose from curated themes or customize every detail to match your personal brand.' },
  { icon: '🔗', title: 'One-Click Deploy', desc: 'Deploy your portfolio to a custom domain with a single click. No configuration needed.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Looks perfect on desktop, tablet, and mobile. Your portfolio, anywhere.' },
  { icon: '🔒', title: 'Privacy First', desc: 'You control what to showcase. Select repos, hide activity, and manage your public profile.' },
]

const STEPS = [
  { title: 'Connect GitHub', desc: 'Sign in with your GitHub account and authorize GitFolio to read your public data.' },
  { title: 'Customize', desc: 'Select repos, write your bio, pick a theme, and add your personal touches.' },
  { title: 'Share', desc: 'Get a shareable link or deploy to your custom domain. Done.' },
]
```

- [ ] **Step 2: Create page.css for landing page styles**

```css
.landing {
  min-height: 100vh;
}

/* Nav */
.landing-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}
.landing-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.landing-logo {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}
.landing-nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.landing-nav-links a {
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: color var(--transition);
}
.landing-nav-links a:hover {
  color: var(--color-text);
}

/* Hero */
.hero {
  padding: 120px 0 80px;
  text-align: center;
}
.hero-inner {
  max-width: 800px;
}
.hero-sub {
  font-size: 18px;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: var(--space-6) auto var(--space-8);
  line-height: 1.7;
}
.hero-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

/* Sections */
.features-section {
  padding: var(--space-16) 0;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.feature-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color var(--transition);
}
.feature-card:hover {
  border-color: var(--color-accent);
}
.feature-icon {
  font-size: 24px;
  margin-bottom: var(--space-4);
}
.feature-card h3 {
  margin-bottom: var(--space-2);
}

.how-section {
  padding: var(--space-16) 0;
  background: var(--color-surface);
}
.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  text-align: center;
}
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-num {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
}
.step-item h3 {
  margin-bottom: var(--space-2);
}

.cta-section {
  padding: var(--space-16) 0;
}
.cta-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-12);
  text-align: center;
}

/* Footer */
.landing-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--space-6) 0;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-links {
  display: flex;
  gap: var(--space-6);
}
.footer-links a:hover {
  color: var(--color-text);
}

/* Utilities */
.text-accent {
  color: var(--color-accent);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/page.css
git commit -m "feat(landing): implement landing page per design spec"
```

---

### Task 9: Dashboard Page

**Files:**
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/app/(dashboard)/dashboard/page.css`

- [ ] **Step 1: Implement dashboard page**

Per spec: Stats row (4 cards), 2/3 + 1/3 content grid, activity feed + top repo + quick actions.

- [ ] **Step 2: Commit**

---

### Task 10: Repositories Page

**Files:**
- Create: `src/app/(dashboard)/repos/page.tsx`

- [ ] **Step 1: Implement repos page with filter bar and repo cards grid**

- [ ] **Step 2: Commit**

---

### Task 11: Profile Page

**Files:**
- Create: `src/app/(dashboard)/profile/page.tsx`
- Create: `src/app/(dashboard)/profile/page.css`

- [ ] **Step 1: Implement profile page with header, contribution heatmap, language bars, pinned repos**

- [ ] **Step 2: Commit**

---

### Task 12: Analytics Page

**Files:**
- Create: `src/app/(dashboard)/analytics/page.tsx`
- Create: `src/app/(dashboard)/analytics/page.css`

- [ ] **Step 1: Implement analytics with charts and React Flow network graph**

- [ ] **Step 2: Commit**

---

### Task 13: Onboarding Page

**Files:**
- Create: `src/app/onboarding/page.tsx`
- Create: `src/app/onboarding/page.css`

- [ ] **Step 1: Implement 3-step wizard with progress bar, GitHub OAuth, customization, preview**

- [ ] **Step 2: Commit**

---

### Task 14: Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/app/settings/page.css`

- [ ] **Step 1: Implement settings with profile form, theme toggle (dark/light/system pill), connected accounts**

- [ ] **Step 2: Commit**

---

## Phase 5: Polish & Verification

### Task 15: Theme Toggle Component

**Files:**
- Create: `src/components/ui/theme-toggle.tsx`
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Implement theme toggle with localStorage persistence and data-theme attribute update**

- [ ] **Step 2: Commit**

---

### Task 16: Self-Review

- [ ] **Step 1: Verify all pages match the design spec**

Run through each page and verify:
- Typography: Satoshi loaded and rendering
- Colors: All from CSS variables
- Spacing: Consistent use of space-* tokens
- Components: Button, Card, Input, StatCard all applied
- Theme: Dark/light switching works via toggle

- [ ] **Step 2: Check for placeholder content**

Search for "TODO", "FIXME", "lorem", "placeholder" — these should not exist in production UI.

- [ ] **Step 3: Run build**

```bash
npm run build 2>&1 | head -50
```

- [ ] **Step 4: Final commit**

---

## Design Spec Coverage Checklist

| Spec Section | Implementation |
|---|---|
| Premium Minimal aesthetic | globals.css tokens, Satoshi font |
| Slate + Indigo palette | CSS custom properties |
| Satoshi typography | Fontshare CDN, text-* classes |
| Dual-mode theme | data-theme attribute, layout script |
| Minimal motion | Transition variables |
| Wordmark logo | nav-logo class |
| Landing: Dense + Feature-Rich | page.tsx + page.css |
| Dashboard: Top Nav + Tabs | (dashboard)/layout.tsx |
| Button variants | button.tsx + button.css |
| Card styles | card.tsx + card.css |
| Input styles | input.tsx + input.css |
| Stat cards | stat-card.tsx + stat-card.css |
| Landing footer | page.css footer styles |
| Dashboard stats row | dashboard/page.tsx |
| Activity feed | dashboard/page.tsx |
| Repo cards grid | repos/page.tsx |
| Profile heatmap | profile/page.tsx |
| Analytics charts | analytics/page.tsx |
| Onboarding wizard | onboarding/page.tsx |
| Settings theme toggle | settings/page.tsx + theme-toggle.tsx |