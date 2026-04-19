
The user wants the site to feel as authentic and trustworthy as apple.com and samsung.com. Right now we have a "Dark Luxury / Black + Gold" theme (Cormorant Garamond serif + champagne gold), which reads more like a boutique jewelry/watch site than a real consumer-electronics retailer. Apple and Samsung look credible because they use:

- Clean white/very-light backgrounds (or pure black for hero moments) — never gold
- Sans-serif system-style typography (SF Pro / SamsungOne)
- Huge product photography on white, lots of breathing room
- Restrained color palette — black text, blue or red accents only on CTAs
- Tight, dense product grids with consistent imagery
- Trust elements: sticky compare bar, financing line under price, "Pickup available", spec ladder, real review counts

I'll propose a full visual + structural overhaul to match that language, then list the concrete file changes.

## What I'll change

### 1. Theme overhaul → Apple/Samsung style
- Switch from black+gold to **clean white background, near-black text, electric blue accent** (Apple-style `#0071e3` or Samsung-style `#1428a0` — I'll use Apple's blue since it works on both light and dark heroes).
- Replace **Cormorant Garamond** serif everywhere with **Inter / SF Pro fallback** sans-serif. Headings get tight tracking and heavy weight (600–700), not light serif.
- Remove gold gradients, gold glow shadows, radial gold background, film-noise texture, gold scrollbar, and gold selection color.
- Update `index.css` HSL tokens + `tailwind.config.ts` font families.

### 2. Homepage hero — Apple-style
- Full-bleed product hero: huge product name in heavy sans-serif, one-line tagline, two text links ("Learn more →" / "Buy"), giant centered product image on white.
- Below: a **2-up tile grid** ("Pixel 9 Pro" / "iPhone 17 Pro") like apple.com/shop landing — each tile is a square with product name, tagline, two links, product photo.
- Strip of brand logos (Apple, Samsung, Google, Xiaomi, OnePlus, Sony, Nothing, Garmin) — flat monochrome, no gold.

### 3. Product card redesign
- White card, no border, product image fills top, name in semibold sans, price in regular weight below, tiny "From $X/mo" financing line — exactly like apple.com/shop.
- Hover: subtle lift only, no gold glow.

### 4. Product page polish
- Larger gallery, white background, sticky right rail with: name, star rating + review count link, price + monthly financing line, color picker (already there), "Add to Bag" (Apple-style blue pill) + secondary "Save".
- Spec accordion below ("Display", "Camera", "Chip", "Battery", "In the Box") — Apple-style.

### 5. Navbar
- Slim, translucent-on-scroll, centered category links (Shop / iPhone / Galaxy / Pixel / Audio / Support), search icon + bag icon on right. Remove gold accents.

### 6. Cart / Checkout / Confirmation
- Re-skin to white surfaces, blue CTA, neutral grey hairlines. Keep all logic.

### 7. Tracking page
- Keep all 16-step logic + PIN. Re-skin timeline to neutral with blue active dot, remove gold glow.

### 8. Trust elements added
- Under every price: "or $XX.XX/mo. for 12 mo."
- Footer adds: "Free delivery / Free returns / Pay over time, your way / Get help buying" (Apple-style 4-up).
- Product page: "In Stock — Free delivery + Free Returns" line with truck icon.

## Files I'll touch

- `src/index.css` — replace theme tokens (white bg, near-black fg, blue primary, neutral borders), remove gold gradients/glow/noise.
- `tailwind.config.ts` — `heading` + `serif` fonts → Inter (drop Cormorant).
- `src/components/Navbar.tsx` — Apple-style slim nav.
- `src/pages/HomePage.tsx` — hero + 2-up tile grid + brand strip.
- `src/components/ProductCard.tsx` — white minimal card + financing line.
- `src/pages/ProductPage.tsx` — white gallery, blue "Add to Bag", spec accordion, financing line.
- `src/pages/ShopPage.tsx` — white grid, cleaner filters.
- `src/pages/CartPage.tsx`, `CheckoutPage.tsx`, `OrderConfirmationPage.tsx` — white re-skin, blue CTAs.
- `src/pages/TrackPage.tsx` + `src/components/TrackingTimeline.tsx` — neutral timeline, blue active step.
- `src/components/TrustBadges.tsx`, `PaymentIcons.tsx` — neutralize colors.
- Footer (in `App.tsx` or wherever) — 4-up trust grid.

No DB / logistics / PIN logic changes — pure visual + structural.

## Memory updates
- Update `mem://style/design-system` to "Apple/Samsung-style: white bg, near-black text, blue (#0071e3) accent, Inter sans-serif, no serif, no gold."
- Update Core in `mem://index.md` accordingly (remove "Dark luxury / gold", replace).

## ASCII of new homepage

```text
┌──────────────────────────────────────────┐
│  Shop  iPhone  Galaxy  Pixel  …  ⌕  🛍   │  slim nav
├──────────────────────────────────────────┤
│                                          │
│            iPhone 17 Pro                 │  56px bold
│      Titanium. So strong. So light.      │  20px regular
│       Learn more →    Buy →              │  blue links
│                                          │
│             [ huge photo ]               │
│                                          │
├────────────────────┬─────────────────────┤
│   Pixel 9 Pro      │   Galaxy S24 Ultra  │  2-up tiles
│   AI, reimagined   │   Galaxy AI is here │
│   Learn  Buy       │   Learn  Buy        │
│   [photo]          │   [photo]           │
└────────────────────┴─────────────────────┘
   Apple  Samsung  Google  Xiaomi  …          brand strip
```
