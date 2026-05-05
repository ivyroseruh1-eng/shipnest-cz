---
name: Design System
description: Apple/Samsung-style light theme — white bg, near-black text, electric blue accent, Inter sans-serif
type: design
---

## Visual System (Apple/Samsung-style)

- **Background**: pure white (#ffffff). Surfaces use Apple grey #f5f5f7 (`bg-secondary`).
- **Text**: near-black #1d1d1f (foreground). Muted #6e6e73.
- **Accent**: Apple electric blue #0071e3 (primary). Used only on CTAs, links, active states.
- **NO gold, NO serif fonts, NO dark luxury aesthetic.** Strictly removed.

## Typography

- All text in **Inter** (sans-serif), with -apple-system / SF Pro Display fallback.
- Headings: semibold (600), tight tracking (-0.02em). Display: bold (700), tighter (-0.035em).
- Sizes follow Apple scale: hero 5-7xl, section 3xl, body 14-15px.

## Components

- **Navbar**: must show the real `shipnest-logo.png` image plus ShipNest wordmark clearly; never text-only branding.
- **Buttons**: rounded-full, blue primary `bg-primary text-primary-foreground` for "Buy", grey secondary `bg-secondary` for "Add to Bag".
- **Product cards**: white bordered containers; product images must fill the card visibly and consistently; no color swatches on grid cards.
- **Spec accordion**: Apple-style chevron down, divided rows, bold spec titles.
- **Tracking timeline**: blue active dot (no glow), neutral pending grey.
- **Hero**: full-bleed centered, Apple two-link pattern (Learn more → / Buy →).

## Layout

- Container max-width 980px (matches apple.com).
- Generous vertical breathing room (py-12 to py-16 on sections).
- 4-up trust grid in footer: Free delivery / Free returns / Pay over time / Get help buying.
