---
name: JeomHana Design System
colors:
  # Primary
  primary: '#6B38D4'
  on-primary: '#ffffff'
  primary-container: '#EDE5FA'
  on-primary-container: '#4A1FA8'
  inverse-primary: '#d0bcff'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'

  # Secondary (CTA)
  secondary: '#B90538'
  on-secondary: '#ffffff'
  secondary-container: '#FDEAEF'
  on-secondary-container: '#92002a'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'

  # Tertiary
  tertiary: '#855000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a76500'
  on-tertiary-container: '#fffbff'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'

  # Surfaces
  background: '#FEF7FF'
  on-background: '#1A1523'
  surface: '#FEF7FF'
  surface-dim: '#ded7e4'
  surface-bright: '#FEF7FF'
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#f8f1fe'
  surface-container: '#F8F0FC'
  surface-container-high: '#ede5f3'
  surface-container-highest: '#e7e0ed'
  on-surface: '#1A1523'
  on-surface-variant: '#6B6078'
  inverse-surface: '#322f39'
  inverse-on-surface: '#f5eefb'
  surface-tint: '#6B38D4'
  surface-variant: '#e7e0ed'

  # Border / Outline
  outline: '#7b7486'
  outline-variant: '#E8E0F0'

  # Error
  error: '#C53030'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'

  # Semantic
  success: '#2D8A4E'
  warning: '#D4920B'
  info: '#2B6CB0'

  # Character & Illustration
  mascot-body: '#A78BDB'
  mascot-hat: '#4A3570'
  mascot-blush: '#E8A0B4'
  cloud: '#F5F0FF'
  pastel-pink: '#F8C8D8'
  pastel-yellow: '#FFF3D6'
  pastel-mint: '#D6F5ED'
  pastel-blue: '#D6E8F8'
  card-frame: '#C4A050'

  # Ad Area
  ad-background: '#F0F0F0'

typography:
  display-title:
    fontFamily: Pretendard
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  section-header:
    fontFamily: Pretendard
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-main:
    fontFamily: Pretendard
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  sub-text:
    fontFamily: Pretendard
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  caption:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 12px
---

# JeomHana (점하나) Design System

## Brand

- Service: 점하나 (JeomHana) — Korean tarot and fortune web app
- Tagline: "오늘, 점 하나 찍어볼까?"
- Tone: friendly, lightly mystical, approachable — like chatting with a friend, not a fortune teller

This design system is built upon the concept of "Soft Minimalism" — a blend of clean, modern interfaces and whimsical, approachable character design. The core personality is centered around the character 'JeomHana', a simple dot that demystifies the complex world of Tarot into a light, everyday habit.

The visual style avoids the heavy, occult-inspired aesthetics common in traditional divination. Instead, it utilizes a bright, airy atmosphere to evoke a sense of clarity and optimism. The emotional response should be one of comfort and curiosity rather than awe or fear. By utilizing flat illustrations and a pastel-heavy palette, the interface remains approachable and "mysterious but not heavy," ensuring that the AI-powered insights feel like a conversation with a friendly guide.

---

## Colors

The color strategy uses a warm off-white base to create a "paper-like" tactile feel, contrasting with a vibrant Lavender primary color that signals interactivity and magic. The Warm Coral secondary color is reserved for high-priority calls to action and emotional highlights.

The category palette uses desaturated pastels to differentiate tarot reading types without overwhelming the user. These colors should be used as background fills for chips or subtle card header tints. Dark mode is intentionally excluded to maintain the "bright and friendly" brand promise; the interface relies on high-quality white space and soft tonal shifts to define structure.

### Primary Palette

| Token | Value | Usage |
|---|---|---|
| Primary (violet-500) | #6B38D4 | main accent, active states, links |
| Primary Light (violet-100) | #EDE5FA | selected chip/card bg, hover |
| Primary Dark (violet-700) | #4A1FA8 | text emphasis |
| Secondary CTA (coral-500) | #B90538 | main action buttons |
| CTA Light (coral-100) | #FDEAEF | CTA hover bg |

### Surfaces

| Token | Value | Usage |
|---|---|---|
| Background | #FEF7FF | warm off-white base |
| Surface (cards, panels) | #FFFFFF | lowest container |
| Surface Elevated | #F8F0FC | section bg |

### Text

| Token | Value |
|---|---|
| Primary | #1A1523 |
| Secondary | #6B6078 |
| Tertiary | #9E95A9 |

### Border

| Token | Value |
|---|---|
| Default | #E8E0F0 |
| Active | #6B38D4 |

### Semantic

| Token | Value |
|---|---|
| Success | #2D8A4E |
| Warning | #D4920B |
| Error | #C53030 |
| Info | #2B6CB0 |

### Character & Illustration

| Token | Value | Usage |
|---|---|---|
| Mascot body | #A78BDB | light lavender |
| Mascot hat | #4A3570 | dark purple |
| Blush | #E8A0B4 | soft pink |
| Cloud | #F5F0FF | — |
| Pastel pink | #F8C8D8 | category/illustration |
| Pastel yellow | #FFF3D6 | category/illustration |
| Pastel mint | #D6F5ED | category/illustration |
| Pastel blue | #D6E8F8 | category/illustration |
| Card frame | #C4A050 | antique mustard, NOT gold |

### Ad Area

- Ad background: #F0F0F0 — must be visually distinct from content cards, always labeled "광고"

---

## Mascot Character "JeomHana" (점하나)

Style reference: Korean character emoticon art (like Molang, Kamellia — 카카오 이모티콘 스타일)

### Shape & Body

- A soft mochi/teardrop blob — narrower at top, wider and flat at bottom, like a sitting rice cake or water droplet
- NOT a perfect circle or sphere. Sits stably with a flat bottom edge
- Body color: muted lavender-purple (#A78BDB), lighter gradient on lower belly
- Clean smooth outline in dark purple (#4A3570)

### Face (all features in upper 1/3 of body)

- Two round white eyes with large black circular pupils, placed close together
- Very tiny pink cat-like mouth (:3 shape), slightly pouting
- Soft pink circular blush marks (#E8A0B4) on both cheeks below eyes
- NO nose, NO eyebrows in default state

### Hat

- Classic pointed witch hat in dark purple (#4A3570), tilted slightly, tip curls/bends
- Simple brim, sits on top of head

### Limbs

- Default: NO arms or legs visible
- When holding items: very short rounded stubs from body sides, NO fingers

### Expressions

| State | Eyes | Mouth | Notes |
|---|---|---|---|
| Curious (default) | wide pupils | :3 | — |
| Excited | sparkle in eyes | o | — |
| Focused | narrowed | — | — |
| Happy | ^^ eye smile | wide grin | — |
| Sorry | curved eyebrows | frown | — |
| Waving | default | open smile | stub arm raised |
| Sleepy | half-closed | — | z near head |

### Supporting Characters

- Same mochi/teardrop shape but smaller (40-60% size)
- Simpler faces, no hat
- Colors: pastel pink (#F8C8D8), lavender (#C4B0E8), yellow (#FFF3D6)

---

## Typography

This design system utilizes Pretendard as the primary typeface for its exceptional legibility in Korean and its modern, neutral character. The type scale is intentionally tight, avoiding massive display sizes to maintain the "minimalist" and "cute" aesthetic.

Line heights are generous (1.4 to 1.6) to ensure that longer tarot interpretations remain readable and unthreatening. Hierarchy is established through weight shifts (Bold for titles, Regular for body) rather than dramatic size changes. All Korean text should be rendered with a slight negative letter-spacing for titles to improve visual density.

| Role | Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Display Title | Pretendard | 20px | 700 (Bold) | 1.4 | -0.02em |
| Section Header | Pretendard | 18px | 600 (SemiBold) | 1.4 | -0.01em |
| Body Main | Pretendard | 16px | 400 (Regular) | 1.6 | 0 |
| Sub Text | Pretendard | 14px | 400 (Regular) | 1.5 | 0 |
| Caption | Pretendard | 12px | 400 (Regular) | 1.4 | +0.01em |

---

## Layout Rules (KRDS Grid)

The layout follows a flexible, mobile-first approach centered on a 4px base unit. Content is primarily housed within cards that span the width of the screen minus the container padding.

A "Fixed-Width Content" model is preferred for tablet and desktop views to maintain the intimate feeling of a chat-based or card-based app, preventing tarot cards from stretching awkwardly. Vertical rhythm is maintained by using 16px (md) for standard element spacing and 24px (lg) to separate major content sections. Whitespace is used as a primary tool to group related items, reducing the need for heavy dividers.

| Breakpoint | Columns | Gutters | Margins | Notes |
|---|---|---|---|---|
| 360px+ | 4 | 16px | 16px | mobile base |
| 768px+ | 8 | 16px | 24px | tablet |
| 1024px+ | 12 | 24px | 24px | side panels allowed |
| 1280px+ | 12 | 24px | centered max-width | desktop |

- Never stretch mobile layout on desktop
- No bottom tab bar — linear flow with header back navigation

### Spacing Scale

| Token | Value |
|---|---|
| base | 4px |
| xs | 8px |
| sm | 12px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| container-padding | 20px |
| gutter | 12px |

---

## Elevation & Depth

Depth is achieved through "Tonal Layering" and "Minimalist Shadows" rather than physical skeuomorphism.

1. **The Ground:** The #FEF7FF background is the lowest level.
2. **The Surface:** White (#FFFFFF) cards sit directly on the ground.
3. **The Shadow:** Shadows must be extremely subtle, using a soft tint of the primary lavender or a neutral grey (e.g., `rgba(28, 25, 23, 0.04)`). The blur radius should be wide (12px - 20px) with zero spread and very low Y-offsets to create a "floating" effect without looking heavy.

Floating Action Buttons (FABs) or active tarot cards being picked may use a slightly higher elevation, but never with a dark or high-contrast shadow.

---

## Shapes

The shape language is "Soft-Rounded," avoiding both sharp edges and perfect circles for structural components.

| Token | Value | Usage |
|---|---|---|
| sm | 0.25rem (4px) | small badges, tags |
| DEFAULT | 0.5rem (8px) | buttons, input fields |
| md | 0.75rem (12px) | — |
| lg | 1rem (16px) | cards, modals, primary containers |
| xl | 1.5rem (24px) | — |
| full | 9999px | chips (pill shape) |

All primary UI containers (cards, modals) use a 1rem (16px) radius to echo the roundness of the brand character. Small interactive elements like buttons and input fields use a 0.5rem (8px) radius. Category chips use a pill-shape (fully rounded) to contrast against the more structured content cards. This mix of radii maintains a professional structure while appearing soft and approachable.

---

## Components

### Buttons

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | #6B38D4 | #FFFFFF | none | default actions |
| CTA | #B90538 | #FFFFFF | none | "Get Reading", "Share" — use sparingly |
| Secondary | #FFFFFF | #6B38D4 | 1px #E8E0F0 | secondary actions |

### Tarot Cards

- **Backs:** Flat Lavender with the "Dot" character centered. No gold foil or intricate patterns.
- **Fronts:** Clean flat illustrations. Borders should be simple white frames with the 16px corner radius.

### Chips & Tags

- **Category Tags:** Use the specific pastel tones defined in the color palette (e.g., Romance = Pink #F8C8D8). Text should be a slightly darker version of the fill for contrast.
- **Selection Chips:** Pill-shaped, turning Lavender when active.

### Input Fields

- **Chat/Text:** Warm off-white background with a subtle gray border. Focus state is indicated by a 2px Lavender (#6B38D4) border.

### Chat Bubbles

- **AI (JeomHana):** White background, positioned on the left, accompanied by the Dot character avatar.
- **User:** Soft Violet background with White text, positioned on the right.

### Modals

- Top-rounded "Drawer" style for mobile, sliding from the bottom. This reinforces the friendly, tactile nature of the service.

---

## Visual Direction

- Modern Korean editorial UI
- Light base, subtle mystical accents — NOT dark fantasy, NOT neon AI
- Clean surfaces, restrained illustration
- Text contrast 4.5:1+, controls contrast 3:1+
- Touch targets 44x44px minimum
- Active/focus/selected states always obvious — never color alone
- No gold borders, no Chinese characters, no talisman imagery
- All visible text in Korean
