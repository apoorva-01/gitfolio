# GitFolio — Design Spec

**Date:** 2026-05-10
**Status:** Approved

---

## Concept

GitFolio transforms a GitHub profile into a polished, shareable portfolio. The design must work for two distinct audiences simultaneously: non-technical recruiters who skim fast, and developers who want to see the code. Premium Minimal is the vehicle — restraint as a signal of craft.

**Tagline:** "Your GitHub story, beautifully told"

---

## Design DNA

| Attribute | Choice |
|-----------|--------|
| Aesthetic | Premium Minimal (Linear, Vercel, Raycast) |
| Audience | Both: Tech recruiters/hiring managers AND other developers |
| Color — base | Slate / Near-black (`#0f172a` dark, `#f8fafc` light) |
| Color — accent | Indigo (`#6366f1`) |
| Color — surface dark | `#1e293b` |
| Color — surface light | `#ffffff` |
| Color — border dark | `#334155` |
| Color — border light | `#e2e8f0` |
| Color — text primary dark | `#f1f5f9` |
| Color — text secondary dark | `#94a3b8` |
| Color — text muted dark | `#64748b` |
| Typography — headlines | Satoshi (via Fontshare CDN) |
| Typography — body | Satoshi, fallback system-ui |
| Typography — mono | JetBrains Mono |
| Motion | Minimal — micro-transitions only (150-200ms ease) |
| Theme | Dual-mode (dark + light), default dark, OS-aware |

---

## Logo

**Wordmark only.** "GitFolio" in Satoshi Bold, tight tracking (`letter-spacing: -0.02em`). No icon mark. The absence of an icon is the statement.

- Dark: white text on dark bg
- Light: `#0f172a` text on light bg

---

## Pages

### 1. Landing Page (`/`)

**Layout:** Dense + Feature-Rich, dark background.

- **Header:** Sticky nav with logo (left), nav links (center), CTA button (right). No hamburger menus.
- **Hero:** Bold headline, single-line subhead, GitHub OAuth CTA + demo link. No carousel.
- **Feature grid:** 3-4 cards, icon + title + 1-line description. No decorative illustrations.
- **How it works:** 3-step numbered flow, minimal. Steps side by side, not stacked.
- **CTA block:** Single focused call-to-action.
- **Footer:** Minimal — copyright + essential links only.

**Anti-patterns:** No particle backgrounds, no animated gradients, no "trusted by" logos unless real.

### 2. Dashboard (`/dashboard`)

**Layout:** Top Nav + Tabbed.

- **Nav:** Logo (left), horizontal tabs (Dashboard, Repos, Profile, Analytics), user avatar + dropdown (right).
- **Stats row:** 4 metric cards — Repos, Stars, Forks, Contributions. Numbers prominent, labels muted.
- **Main grid:** 2/3 + 1/3 split. Left: activity feed. Right: top repo + quick actions.
- **Activity feed:** Chronological list with icons, repo name, action description, relative timestamp.
- **Top repo card:** Name, description, star/fork counts, primary language.
- **Quick actions:** Icon + label buttons — Sync, Edit Bio, Change Theme.

### 3. Repositories (`/repos`)

- **Filter bar:** Pill-style filters for language, sort by stars/forks/updated. Inline, no dropdown cascade.
- **Repo cards:** Grid layout. Name (linked), description (1 line truncated), stars, forks, language dot + name, last updated.
- **Pagination:** Simple "Load more" or numbered. No infinite scroll.

### 4. Profile (`/profile`)

- **Header:** Avatar, name, GitHub handle, bio, follower/following/repo counts.
- **Pinned repos:** 2x2 grid. Name, description, language, stars, forks.
- **Contribution heatmap:** GitHub-style grid, indigo-colored cells.
- **Top languages:** Horizontal bar chart, 4 languages max.

### 5. Analytics (`/analytics`)

- **Charts:** Contribution timeline, language pie, commit frequency.
- **Network graph:** React Flow visualization of collaboration patterns.
- **Period selector:** Tabs — 7d / 30d / 90d / 1y / All.

### 6. Onboarding (`/onboarding`)

- **Wizard:** Top-progress-bar indicator (not sidebar steps).
- **Steps:** 3 steps — Connect GitHub → Customize Profile → Launch.
- **Step 1:** GitHub OAuth button, permission explanation.
- **Step 2:** Bio editor, theme picker (previews live), repo selection.
- **Step 3:** Preview thumbnail + deployment options.

### 7. Settings (`/settings`)

- **Sections:** Profile, Appearance, Connected Accounts, Privacy.
- **Theme toggle:** Dark / Light / System. Single pill selector, no dropdown.
- **Form inputs:** Minimal borders, focus ring in indigo.

### 8. Public Profile (`/u/[username]`)

- Shared portfolio view, no auth required.
- Clean, shareable layout optimized for link-in-bio contexts.
- CTA to create own GitFolio for non-users.

---

## Component Standards

### Buttons

- **Primary:** Indigo bg (`#6366f1`), white text, 6px border-radius, 150ms hover darken.
- **Secondary:** Transparent bg, `#334155` border, white text. Hover: `#1e293b` fill.
- **Ghost:** Text only, no border. Hover: subtle bg.
- **Sizing:** Height 36px, padding 0 16px, font-size 14px, font-weight 600.

### Cards

- Background: `#1e293b`. Border: 1px `#334155`. Border-radius: 8px.
- Hover: border-color `#6366f1`, no shadow.
- Padding: 16px internal.

### Input Fields

- Background: `#0f172a`. Border: 1px `#334155`. Border-radius: 6px.
- Focus: border-color `#6366f1`, no outline.
- Placeholder: `#64748b`.

### Navigation

- Active tab: Indigo bottom border, white text.
- Inactive tab: No border, `#94a3b8` text.
- Hover: `#f1f5f9` text.

### Stats Cards

- Number: 28px Satoshi Bold, `#f1f5f9`.
- Label: 12px, `#64748b`, uppercase.
- Subtle change indicator (arrow + count, green for up).

### Typography Scale

- Hero headline: 48px, Satoshi Bold, tracking -0.03em
- Page title: 28px, Satoshi Bold, tracking -0.02em
- Section heading: 18px, Satoshi Semibold
- Body: 15px, Satoshi Regular
- Caption/metadata: 13px, Satoshi Regular, `#64748b`
- Micro/label: 11px, Satoshi Medium, uppercase, tracking 0.05em

---

## Implementation Notes

- Font: Satoshi via Fontshare CDN — `@fontsource/satoshi` or direct CSS import.
- No Tailwind utility bloat — use CSS custom properties for the design system.
- CSS variables for all tokens — color, spacing, typography — so dark/light switching is a single attribute change on `<body>`.
- Motion: `transition: all 150ms ease` on interactive elements. No `@keyframes` unless specifically for loading states.
- The React Flow graph in Analytics should use the same color tokens as the rest of the system.

---

## What This Is NOT

- Not a GitHub clone — don't replicate GitHub's UI patterns
- Not a blog platform — content focus is repos and contributions, not posts
- Not a social network — no feeds, follows, or likes beyond GitHub data
- Not a resume builder — portfolio lives on repos and contribution history, not form fields