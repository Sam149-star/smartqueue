---
name: Vital Crimson Care
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5c3f3f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#916f6f'
  outline-variant: '#e6bdbc'
  surface-tint: '#bf0030'
  primary: '#b6002d'
  on-primary: '#ffffff'
  primary-container: '#e01a3f'
  on-primary-container: '#fff7f7'
  inverse-primary: '#ffb3b3'
  secondary: '#6b5a5e'
  on-secondary: '#ffffff'
  secondary-container: '#f4dde1'
  on-secondary-container: '#716064'
  tertiary: '#006749'
  on-tertiary: '#ffffff'
  tertiary-container: '#00835e'
  on-tertiary-container: '#e9fff1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad9'
  primary-fixed-dim: '#ffb3b3'
  on-primary-fixed: '#40000a'
  on-primary-fixed-variant: '#920022'
  secondary-fixed: '#f4dde1'
  secondary-fixed-dim: '#d7c1c5'
  on-secondary-fixed: '#24181b'
  on-secondary-fixed-variant: '#524346'
  tertiary-fixed: '#6ffbc4'
  tertiary-fixed-dim: '#4edea9'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#005139'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '800'
    lineHeight: 4rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a warm, life-affirming, and technically dependable healthcare presence for blood donation platforms. The emotional baseline balances clinical rigor with heartfelt empathy—dispelling donor anxiety through soft, pillowed aesthetics, reassuring micro-interactions, and pristine legibility.

### Design Movement: Modern Clinical Humanism
The aesthetic synthesizes modern minimalism with gentle tactile warmth. Rather than cold, sterile hospital interfaces, this visual framework utilizes:
- Softened, organic geometries inspired by vital cellular forms and blood drops.
- Crisp medical whites paired with calming, supportive slate neutrals.
- Compassionate rose washes and life-saving crimson accents that emphasize human impact and generosity without invoking clinical alarm.
- Fresh, restorative mint accents acting as calming reassurance during donation scheduling, health checks, and recovery tracking.

## Colors

The palette revolves around life-giving crimson, delicate restorative rose tones, medical white surfaces, and balanced slate typography, offset by restorative mint for status and reassurance.

- **Primary (`#E01A3F`)**: A radiant, vital crimson embodying human vitality and decisive actions (urgent calls to donate, primary booking buttons, critical badges).
- **Secondary (`#FFE8EC`)**: Soft rose water base tint providing welcoming, stress-relieving container backgrounds and highlighting donor milestones.
- **Tertiary (`#2CC592`)**: Calming therapeutic mint symbolizing recovery, successful screening status, verified appointments, and stable blood inventories.
- **Neutral (`#64748B`)**: Modern slate tones ranging from deep charcoal slate (`#1E293B`) for high-contrast reading down to soft medical background slate (`#F8FAFC`).
- **Surface & Canvas (`#FFFFFF`)**: Pure clinical white, ensuring crisp contrast, medical clarity, and approachable breathing space.

## Typography

The typography leverages **Plus Jakarta Sans** uniformly across all tiers to merge friendly, rounded terminals with contemporary geometric structure. This provides empathetic warmth for patients and donors while sustaining high clarity on clinical charts, pre-screening health questionnaires, and appointment workflows.

- **Headlines**: Use heavy weights (700-800) with slight negative tracking to assert optimistic authority and drive clear, reassuring hierarchy.
- **Body**: Set in regular weight (400) with generous line heights (`1.5` to `1.6`) on slate neutral tones, avoiding harsh black text to reduce eye fatigue during medical triage.
- **Labels & Numbers**: Employ medium-to-bold weights with slight positive tracking for blood types (e.g., `O-`, `A+`), donor statistics, countdown timers, and triage status tags.

## Layout & Spacing

A 12-column responsive fluid grid governs desktop and tablet screens, folding down to a 4-column layout on mobile devices. Generous outer margins and open padding simulate the calm, orderly environment of modern medical facilities.

- **Breakpoints**: Mobile (< 640px), Tablet (640px - 1024px), Desktop (> 1024px).
- **Rhythm**: An explicit 8px base rhythm guarantees alignment across input groups, stats widgets, and donor journey timelines.
- **Composition**: Medical dashboards utilize stacked card clusters with `space-lg` separation to isolate critical patient metrics without visual noise.

## Elevation & Depth

Visual hierarchy uses warm, diffuse ambient illumination rather than harsh drop shadows, conveying cleanliness and approachable care.

- **Level 0 (Flat Canvas)**: Pure background `#F8FAFC` or secondary rose tint `#FFE8EC` for inactive regions and sub-surfaces.
- **Level 1 (Card & Content Blocks)**: Surface `#FFFFFF` layered with subtle crimson-tinted ambient shadow (`box-shadow: 0 4px 20px -2px rgba(224, 26, 63, 0.05), 0 2px 6px -1px rgba(100, 116, 139, 0.04)`). Bordered by a hairline tint of slate (`rgba(226, 232, 240, 0.8)`).
- **Level 2 (Interactive Overlays & Floating CTAs)**: Lifted elevated panels (`box-shadow: 0 12px 32px -4px rgba(224, 26, 63, 0.12), 0 4px 12px -2px rgba(100, 116, 139, 0.06)`).
- **Level 3 (Modals & Emergency Alerts)**: High-priority clinical overlays (`box-shadow: 0 24px 48px -12px rgba(224, 26, 63, 0.2)`), backed by a blurred frosted veil (`backdrop-filter: blur(8px); background: rgba(15, 23, 42, 0.4)`).

## Shapes

The interface embraces organic, comforting curvatures directly reflecting cellular droplets and restorative wellness.

- **Base Radius (`rounded`, 0.5rem / 8px)**: Standard buttons, text inputs, dropdown menus, and small interactive tags.
- **Container Radius (`rounded-lg`, 1rem / 16px)**: Blood unit cards, appointment slots, progress meters, and statistics modules.
- **Hero & Modal Radius (`rounded-xl`, 1.5rem / 24px)**: Major interactive banners, primary intake cards, and alert sheets.
- **Pill Geometry (`rounded-full`)**: Donor badges, blood type identifiers, live status beacons, and floating action chips.

## Components

### Buttons
- **Primary**: Vivid crimson background (`#E01A3F`), white text, `rounded-md` (8px) to full pill depending on context. Micro-glow shadow on hover (`rgba(224, 26, 63, 0.25)`), smooth scale transition (`transform: translateY(-1px)`).
- **Secondary**: Medical slate stroke or soft rose fill (`#FFE8EC`) with crimson text (`#E01A3F`).
- **Tertiary / Success**: Calming mint fill (`#2CC592`) for confirming completed donations, health clearances, and scheduled slots.

### Chips & Badges
- **Blood Type Pill**: Bold typographic pill (`A+`, `O-`, `B+`) using soft rose backgrounds with vivid crimson lettering and semi-bold numeric styling.
- **Status Chips**: Mint tint (`rgba(44, 197, 146, 0.12)`) with deep emerald text for "Eligible to Donate" or "Inventory Healthy"; amber tint for "Urgent Need".

### Cards & Dashboards
- **Donor Metric Card**: Pure medical white surface with `rounded-lg` corners, faint 1px slate-100 border, featuring circular fluid progress rings indicating pints donated and lives impacted.
- **Urgent Callout Card**: Soft crimson-to-rose gradient background, featuring calming illustration accents, clear impact metrics, and prominent appointment scheduling triggers.

### Form Inputs & Controls
- **Text Inputs**: Crisp white background, 1px soft slate border (`#CBD5E1`), transitioning to a crimson ring (`#E01A3F` at 20% opacity) on active focus. Rounded at 8px.
- **Checkboxes & Radios**: Smooth rounded-full controls with vivid crimson check fill, designed for effortless one-tap donor pre-screening surveys.

### Specialized Blood Management Modules
- **Fluid Inventory Tank**: Interactive visual beaker or drop showing live regional blood supply levels with smooth wave animations.
- **Donor Journey Timeline**: Connected vertical node system with mint checkmarks for screening, donation, testing, and transfusion delivery updates.