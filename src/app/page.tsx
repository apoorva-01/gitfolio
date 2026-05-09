import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import './page.css'

export default function HomePage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <span className="landing-logo">GitFolio</span>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/onboarding">
              <Button size="sm">Get Started</Button>
            </Link>
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
            <Link href="/onboarding">
              <Button>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Connect GitHub
              </Button>
            </Link>
            <Link href="/u/demo">
              <Button variant="secondary">View Demo</Button>
            </Link>
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
                <h3>{f.title}</h3>
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
            <Link href="/onboarding">
              <Button size="lg">Start Building Free</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container footer-inner">
          <p className="text-caption">© 2026 GitFolio. Built with care for developers.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
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