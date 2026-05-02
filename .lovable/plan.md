## Restore the logo, card surfaces, and image background

Three regressions from the Apple-style redesign, all visible in the screenshots:

### 1. Restore the ShipNest logo image
The navbar previously rendered the `shipnest-logo.png` image. The redesign replaced it with plain text "ShipNest". 

Fix: in `src/components/Navbar.tsx`, import `shipnest-logo.png` from `@/assets/` and render it as an `<img>` (height ~28px on desktop, ~24px on mobile) inside the existing `<Link to="/">`. Keep the slim 48px nav height — the logo just replaces the text node.

### 2. Restore the product card container
Currently `ProductCard.tsx` renders a borderless, transparent card — the image tile is grey but everything below (name, price, swatches, Buy button) floats on the page with no boundary, and on the homepage sections this makes products look "uncarded".

Fix: wrap the entire card in a white surface — `bg-card border border-border rounded-2xl p-4` (or `p-5`) — with a subtle hover lift (`card-hover` already exists). Keep the inner image tile as-is, but the outer card brings back the visual containment the user wants. This matches the look they had before the Apple redesign while keeping the new typography and Buy button.

### 3. Fix the "white square inside grey card" image issue
The product JPGs have a white background baked in. The card image tile uses `bg-secondary` (#f5f5f7), so each photo shows as a hard white square inside a grey square — extremely obvious on the iPhone 16 Pro Max / Pro tiles in screenshot 3, and on AirPods.

Fix: change the inner image tile in `ProductCard.tsx` from `bg-secondary` to `bg-white`. Since the outer card will be white too (fix #2), the white image background blends seamlessly. For the homepage `HeroTile` (which intentionally uses a grey rounded surface), leave `bg-secondary` but make the product photo larger so the bake-in white edges fall outside the visible crop, OR add a CSS `mix-blend-multiply` / replace those couple of hero photos. Simplest: keep HeroTile grey but bump image to fill more space — the "white square" only really stands out in the small grid cards.

### Files to edit
- `src/components/Navbar.tsx` — swap text for `<img src={shipnestLogo}>` (import from `@/assets/shipnest-logo.png`).
- `src/components/ProductCard.tsx` — wrap content in white bordered card; change inner image tile to `bg-white`; keep existing typography, swatches, Buy button.

### Not changing
- Apple/Samsung-style typography (Inter, near-black, blue accents) stays.
- Homepage hero, 2-up tiles, brand strip, trust grid, footer — all stay.
- Tracking timeline, checkout, admin — unchanged.
- No DB / logistics / PIN logic touched.

### Memory
Update `mem://style/design-system` to note: cards must be white-bordered containers (not borderless), navbar uses `shipnest-logo.png` (not text wordmark), product image tile background must match card background to hide baked-in white photo edges.
