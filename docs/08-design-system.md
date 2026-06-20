# AgriNexus Platform Design System

Theme: light, enterprise register. The user is a B2B partner (an MFI officer or a district program manager), not a consumer.

## Color

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#157347` | Primary actions, links, active states |
| Primary Hover | `#0F5132` | Primary button hover |
| Primary Tint | `#E6F4EC` | Active backgrounds, highlights |
| Page BG | `#F7F8FA` | Page background |
| Surface | `#FFFFFF` | Cards, modals, sidebar |
| Border | `#E4E7EC` | Borders, dividers |
| Text Primary | `#101828` | Main text |
| Text Secondary | `#475467` | Supporting text, labels |
| Text Muted | `#98A2B3` | Placeholder, disabled, timestamps |

### Status Colors

| Status | Text | Background |
|--------|------|------------|
| Active | `#157347` | `#E6F4EC` |
| Draft | `#475467` | `#F2F4F7` |
| Attention | `#B54708` | `#FEF0C7` |

### Chart Colors (restrained)

- `#157347` (primary green)
- `#0E7490` (teal)
- `#B54708` (amber)
- `#667085` (gray)

## Typography (Inter via next/font)

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Page Title | 28px | 600 | Main page headings |
| Section | 20px | 600 | Section headings |
| Card Title | 16px | 600 | Card headers |
| Body | 14px | 400 | Default text, line-height 1.5 |
| Body Strong | 14px | 500 | Emphasized body text |
| Label | 12px | 500 | Uppercase, letter-spaced 0.04em, text-secondary |
| KPI Metric | 28-32px | 600 | Tabular figures for numbers |

## Spacing (4px base)

Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48

| Element | Spacing |
|---------|---------|
| Card padding | 24px |
| Card radius | 8px |
| Card border | 1px `#E4E7EC` |
| Card shadow | `0 1px 2px rgba(16,24,40,0.06)` |
| Table row padding | 12-16px vertical |
| Page gutters | 32px |
| Section gaps | 24-32px |
| Content max-width | For readability |

## Sidebar

- Light surface background
- Active item: green tint background + green text

## Components

### Buttons

- Primary: green fill, white text, radius 8px, 14px/500, padding 8×16
- Secondary: white fill, gray border, dark text, radius 8px, 14px/500, padding 8×16

### Status Badges

- Pills with 12px text
- Tinted background + colored text
- Statuses: active (green), draft (gray), paused (amber), expired (gray/muted)

### Data Table

- Uppercase caption header row (12px/500, letter-spaced)
- Dividers between rows
- Hover state (page bg tint)
- Clear padding

### Empty States

- Centered
- Muted text
- Intentional copy (e.g., "No outcomes yet. Activate this cohort to start sending advisories.")
- Never blank or broken-looking

## Brand

Replace the "AN" placeholder with an "AgriNexus" wordmark:

- Inter 600/700
- Node/dot accent in primary green
- Optional: simple monoline mark (connected nodes or leaf)
- Minimal, not elaborate

## Cohort Detail View (future)

- Header: cohort name + status badge + partner name
- Row of KPI cards: farmers reached, nudges sent, response rate
- Outcomes chart: response over time, Done vs Not-Yet
- Audit list: advisory sent, timestamp, acted-on
