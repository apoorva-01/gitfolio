# GitFolio — Design Brief for Claude Design

## Project Overview

**Product:** GitFolio — AI-powered GitHub portfolio builder that transforms your GitHub profile into a stunning, personalized portfolio website with AI-generated insights and beautiful visualizations.

**Tagline:** "Your GitHub story, beautifully told"

---

## Design Goals

Create a **sleek, developer-focused** aesthetic that feels premium but approachable — think Vercel meets Linear. Dark mode primary with light mode option. The design should make developers feel proud to share their GitFolio.

---

## Color Palette (Base — Adapt Freely)

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0a0a0b` | Primary dark bg |
| Surface | `#141416` | Cards, panels |
| Border | `#27272a` | Dividers, outlines |
| Text Primary | `#fafafa` | Headlines |
| Text Secondary | `#a1a1aa` | Body, captions |
| Accent | `#7c3aed` | Primary actions, highlights |
| Accent Secondary | `#06b6d4` | Charts, links |
| Success | `#10b981` | Positive metrics |
| Warning | `#f59e0b` | Alerts |

---

## Typography

- **Headlines:** Inter or Geist (bold, tight letter-spacing)
- **Body:** Inter or Geist (regular)
- **Code/Mono:** JetBrains Mono or Geist Mono

---

## Pages to Mockup

### 1. Landing Page (`/`)
- Hero: Headline + subhead + CTA buttons
- Features grid (3-4 cards with icons)
- How it works (3-step flow)
- Footer with links

### 2. Dashboard (`/dashboard`)
- Welcome header with user avatar + name
- Stats cards row (repos, stars, contributions, followers)
- Recent activity feed
- Quick actions panel

### 3. Repositories (`/repos`)
- Filter/sort toolbar (language, stars, forks)
- Repo cards grid (name, description, stars, forks, language, topics)
- Pagination or infinite scroll

### 4. Profile (`/profile`)
- GitHub-style header (avatar, name, bio, stats)
- Pinned repos section
- Contribution graph (heatmap)
- Top languages pie/bar chart

### 5. Analytics (`/analytics`)
- Activity timeline
- Language distribution donut/bar chart
- Commit frequency chart
- Collaboration network graph (React Flow visualization)

### 6. Onboarding (`/onboarding`)
- Step wizard (3-4 steps)
  1. Connect GitHub
  2. Customize profile
  3. Choose template
  4. Launch
- Progress indicator

### 7. Settings (`/settings`)
- Profile settings form
- Theme toggle (dark/light)
- Connected accounts
- Privacy controls

### 8. Shared/Embedded Profile (`/u/[username]`)
- Public portfolio view
- Clean, shareable layout
- Call-to-action to create own GitFolio

---

## Component Patterns to Include

- **Buttons:** Primary (accent bg), Secondary (outline), Ghost (text only), Icon buttons
- **Cards:** Repo card, Stat card, Feature card — with hover states
- **Navigation:** Sidebar (collapsible), Top nav with search
- **Charts:** Contribution heatmap, Language bars, Activity timeline
- **Empty states:** Illustrated placeholders for no-data scenarios
- **Loading states:** Skeleton screens matching each page layout

---

## Brand Assets Needed

1. **Logo:** GitFolio wordmark + icon (abstract Git graph / code bracket motif)
2. **Favicon:** Simplified icon version
3. **Social OG image:** 1200x630 preview card
4. **Brand guidelines PDF:** Colors, typography, spacing, icon usage

---

## Technical Stack Context (For Mockups)

- Built with: Next.js 16, Tailwind CSS, React Flow
- Target: Vercel deployment
- Users: Developers, open source contributors, tech recruiters

---

## Deliverables

Please provide:
1. **Logo files** (SVG, PNG — light + dark variants)
2. **Brand guidelines** (PDF or Figma link)
3. **Page mockups** (Figma or PNG for each page above)
4. **Component library** if possible (buttons, cards, inputs)

Make it cohesive across all pages. The aesthetic should feel modern, minimal, and distinctly developer-centric.