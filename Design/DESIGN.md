# GitFolio - Design Specification

## Project Overview
- **Name**: GitFolio
- **Type**: Web application (multi-page portfolio/GitHub-inspired dashboard)
- **Core Functionality**: A personal portfolio platform inspired by GitHub's design language, showcasing repositories, contributions, and developer profiles
- **Target Users**: Developers who want to showcase their work, open-source contributions, and technical identity

## Design System

### Color Palette
- **Primary**: `#0d1117` (dark background - GitHub dark)
- **Secondary**: `#161b22` (card/panel background)
- **Tertiary**: `#21262d` (border/divider)
- **Accent**: `#58a6ff` (links, primary actions)
- **Success**: `#3fb950` (success states, contributions)
- **Warning**: `#d29922` (warnings)
- **Error**: `#f85149` (errors)
- **Text Primary**: `#c9d1d9`
- **Text Secondary**: `#8b949e`
- **Text Muted**: `#6e7681`

### Typography
- **Font Family**: `"JetBrains Mono", "Fira Code", monospace` for code; `"IBM Plex Sans", -apple-system, sans-serif` for UI
- **Headings**:
  - H1: 32px, weight 600
  - H2: 24px, weight 600
  - H3: 20px, weight 500
- **Body**: 14px, weight 400, line-height 1.5
- **Small**: 12px, weight 400

### Spacing
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px

### Border Radius
- Small: 6px (buttons, inputs)
- Medium: 8px (cards)
- Large: 12px (modals, panels)

## Page Specifications

### 1. Landing Page (index.html)
- Hero section with animated terminal-style intro
- Feature showcase (3-column grid)
- Call-to-action buttons: "Start Building" and "View Demo"
- Footer with links

### 2. Dashboard (dashboard.html)
- Sidebar navigation (collapsible)
- Header with search bar and user menu
- Stats cards: Total Repos, Followers, Contributions
- Activity feed (recent commits, PRs, issues)
- Quick actions panel

### 3. Repositories Page
- Grid/List view toggle
- Filter by: Language, Stars, Recent
- Repository cards with:
  - Name, description, language badge
  - Star count, fork count
  - Last updated timestamp

### 4. Profile Page
- Avatar, name, bio, location
- Social links
- Stats: Contributions, Repos, Followers
- Activity calendar (GitHub-style)
- Pinned repositories section

### 5. Analytics Page
- Language distribution pie chart
- Commit activity graph (line chart)
- Contribution heatmap
- Top repositories by activity

### 6. Onboarding Page
- Step-by-step wizard
- Step 1: Connect GitHub account
- Step 2: Import repositories
- Step 3: Customize profile
- Step 4: Choose theme

### 7. Settings Page
- Sidebar navigation
- Sections: Profile, Account, Appearance, Notifications, Security
- Form inputs with validation
- Save/Cancel actions

### 8. Public Profile Page
- Read-only profile view
- Showcase repositories
- Contribution graph
- Contact/social links

### 9. Logo (logo.svg)
- Geometric GitHub-mark inspired design
- Monochrome primary, accent color highlight
- Scalable SVG format

## Components

### Buttons
- Primary: `#238636` bg, white text
- Secondary: `#21262d` bg, `#c9d1d9` text
- Ghost: transparent, `#58a6ff` text
- Danger: `#da3633` bg

### Input Fields
- Background: `#0d1117`
- Border: `#30363d`
- Focus: `#58a6ff` border
- Placeholder: `#6e7681`

### Cards
- Background: `#161b22`
- Border: `#30363d`
- Hover: slightly lighter bg `#1c2128`

### Badges/Labels
- Language colors following GitHub convention
- Rounded pill shape

## Animations
- Page transitions: 200ms ease
- Hover states: 150ms ease
- Loading states: skeleton pulse animation
- Stagger delay for lists: 50ms increment

## Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px