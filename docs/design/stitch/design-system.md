---
name: Mystic Dot Minimalism
colors:
  surface: '#fef7ff'
  surface-dim: '#ded7e4'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1fe'
  surface-container: '#f3ebf8'
  surface-container-high: '#ede5f3'
  surface-container-highest: '#e7e0ed'
  on-surface: '#1d1a23'
  on-surface-variant: '#494454'
  inverse-surface: '#322f39'
  inverse-on-surface: '#f5eefb'
  outline: '#7b7486'
  outline-variant: '#cbc3d7'
  surface-tint: '#6d3bd7'
  primary: '#6b38d4'
  on-primary: '#ffffff'
  primary-container: '#8455ef'
  on-primary-container: '#fffbff'
  inverse-primary: '#d0bcff'
  secondary: '#b90538'
  on-secondary: '#ffffff'
  secondary-container: '#dc2c4f'
  on-secondary-container: '#fffbff'
  tertiary: '#855000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a76500'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#fef7ff'
  on-background: '#1d1a23'
  surface-variant: '#e7e0ed'
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

## Brand & Style

This design system is built upon the concept of "Soft Minimalism" -- a blend of clean, modern interfaces and whimsical, approachable character design. The core personality is centered around the character 'JeomHana', a simple dot that demystifies the complex world of Tarot into a light, everyday habit.

The visual style avoids the heavy, occult-inspired aesthetics common in traditional divination. Instead, it utilizes a bright, airy atmosphere to evoke a sense of clarity and optimism. The emotional response should be one of comfort and curiosity rather than awe or fear. By utilizing flat illustrations and a pastel-heavy palette, the interface remains approachable and "mysterious but not heavy," ensuring that the AI-powered insights feel like a conversation with a friendly guide.

## Colors

The color strategy uses a warm off-white base to create a "paper-like" tactile feel, contrasting with a vibrant Lavender primary color that signals interactivity and magic. The Warm Coral secondary color is reserved for high-priority calls to action and emotional highlights.

The category palette uses desaturated pastels to differentiate tarot reading types without overwhelming the user. These colors should be used as background fills for chips or subtle card header tints. Dark mode is intentionally excluded to maintain the "bright and friendly" brand promise; the interface relies on high-quality white space and soft tonal shifts to define structure.

## Typography

This design system utilizes Pretendard as the primary typeface for its exceptional legibility in Korean and its modern, neutral character. The type scale is intentionally tight, avoiding massive display sizes to maintain the "minimalist" and "cute" aesthetic.

Line heights are generous (1.4 to 1.6) to ensure that longer tarot interpretations remain readable and unthreatening. Hierarchy is established through weight shifts (Bold for titles, Regular for body) rather than dramatic size changes. All Korean text should be rendered with a slight negative letter-spacing for titles to improve visual density.

## Layout & Spacing

The layout follows a flexible, mobile-first approach centered on a 4px base unit. Content is primarily housed within cards that span the width of the screen minus the container padding.

A "Fixed-Width Content" model is preferred for tablet and desktop views to maintain the intimate feeling of a chat-based or card-based app, preventing tarot cards from stretching awkwardly. Vertical rhythm is maintained by using 16px (md) for standard element spacing and 24px (lg) to separate major content sections. Whitespace is used as a primary tool to group related items, reducing the need for heavy dividers.

## Elevation & Depth

Depth is achieved through "Tonal Layering" and "Minimalist Shadows" rather than physical skeuomorphism.

1. **The Ground:** The #FAFAF9 background is the lowest level.
2. **The Surface:** White (#FFFFFF) cards sit directly on the ground.
3. **The Shadow:** Shadows must be extremely subtle, using a soft tint of the primary lavender or a neutral grey (e.g., `rgba(28, 25, 23, 0.04)`). The blur radius should be wide (12px - 20px) with zero spread and very low Y-offsets to create a "floating" effect without looking heavy.

Floating Action Buttons (FABs) or active tarot cards being picked may use a slightly higher elevation, but never with a dark or high-contrast shadow.

## Shapes

The shape language is "Soft-Rounded," avoiding both sharp edges and perfect circles for structural components. All primary UI containers (cards, modals) use a 1rem (16px) radius to echo the roundness of the brand character.

Small interactive elements like buttons and input fields use a 0.5rem (8px) radius. Category chips use a pill-shape (fully rounded) to contrast against the more structured content cards. This mix of radii maintains a professional structure while appearing soft and approachable.

## Components

### Buttons
- **Primary:** Lavender (#8B5CF6) background with White text. Bold weight. No border.
- **CTA:** Warm Coral (#F43F5E) used sparingly for "Get Reading" or "Share" actions.
- **Secondary:** Surface White with a Soft Violet thin border (1px).

### Tarot Cards
- **Backs:** Flat Lavender with the "Dot" character centered. No gold foil or intricate patterns.
- **Fronts:** Clean flat illustrations. Borders should be simple white frames with the 16px corner radius.

### Chips & Tags
- **Category Tags:** Use the specific pastel tones defined in the color palette (e.g., Romance = Pink #FCE7F3). Text should be a slightly darker version of the fill for contrast.
- **Selection Chips:** Pill-shaped, turning Lavender when active.

### Input Fields
- **Chat/Text:** Warm off-white background with a subtle gray border. Focus state is indicated by a 2px Lavender border.

### Chat Bubbles
- **AI (JeomHana):** White background, positioned on the left, accompanied by the Dot character avatar.
- **User:** Soft Violet background with White text, positioned on the right.

### Modals
- Top-rounded "Drawer" style for mobile, sliding from the bottom. This reinforces the friendly, tactile nature of the service.
