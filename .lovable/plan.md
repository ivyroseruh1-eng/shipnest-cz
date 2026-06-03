## What's actually wrong

- **Payment animation** is a vertical list of fake-sounding log lines with a spinner. It reads like a debug console, not a payment.
- **Receipt page** dumps everything in one column of grey cards. No hierarchy, no "this is your receipt" moment, no downloadable invoice, no next-step guidance, the route SVG is tiny and decorative.
- **Tracking page** has good data but lacks the things people actually look for on DHL/FedEx/Blue Dart: a **map / route visual**, a **countdown / ETA banner**, the **courier handoff** (who has it right now), a **package contents** summary, a **delivery instructions** block, and a **support / "where is my package"** strip. Timeline alone feels flat.

---

## 1. Payment animation — 3-act cinematic scene

Replace the log-list + bottom progress bar with a single staged scene in the modal (same `PaymentProcessing` shell, fully redesigned internals). All framer-motion, deterministic ~4s total, `prefers-reduced-motion` fallback.

**Act 1 — Secure handshake (1.0s)**
- Centered card silhouette (or Moonlight crest) on left, ShipNest mark on right, connected by an animated dotted line with a moving padlock glyph traveling between them.
- Caption: "Establishing secure session with [Visa Direct / Mastercard / Amex SafeKey / Moonlight Treasury]"
- Subtle TLS chip pill: `TLS 1.3 · AES-256`

**Act 2 — Bank authorization (1.8s)**
- The card flips to reveal an "Issuer review" tile showing: detected bank name (e.g., "HDFC Bank"), masked PAN (`•••• •••• •••• 4242`), amount, merchant ("ShipNest Global s.r.o."), and a circular progress ring filling 0→100% around it.
- Three micro-stages tick beneath as small chips that light up green: `3-D Secure ✓` · `Risk score ✓` · `Authorization ✓`
- Caption updates live: "Contacting issuer…" → "Verifying 3-D Secure…" → "Capturing authorization…"

**Act 3 — Confirmation (1.0s)**
- Ring snaps to 100%, the tile transitions to a green check with a soft expanding ring (single pulse, not infinite).
- Approval code appears in mono: `AUTH ABCD12 · REF 4829371`
- Caption: "Approved · Funds reserved"
- 400ms hold, then crossfade to the receipt page.

**Moonlight variant**: Act 1 uses Moonlight crest + "Private treasury session"; Act 2 shows a vault-style tile with the PIN dots filling left-to-right + chips `Mandate ✓ · Beneficiary ✓ · Escrow ✓`; Act 3 stamps "Authorized by Moonlight Wealth Management" in a foil-style chip.

**Frame chrome (always visible during all 3 acts):**
- Top: ShipNest mark · "Secure authorization" · amount (tabular).
- Bottom: PCI-DSS · TLS 1.3 · 256-bit AES · network badges (Visa/MC/Amex or Moonlight).
- Single thin progress hairline at the very top edge.
- `aria-live="polite"` reading each caption.

PIN entry stays as the current 6-digit field but switches to **shadcn `input-otp`** with 6 separated boxes, auto-advance, paste support, and a soft "Verifying PIN" micro-scene before Act 1 begins.

---

## 2. Receipt (Order Confirmation) page — Apple/Amazon-grade

Full rebuild of `OrderConfirmationPage` into a 3-zone layout. Keeps all existing data, adds the things that make it feel real.

**Zone A — Hero receipt header**
- Top-left: ShipNest logo lockup.
- Top-right: `Order #SN-…` · `Placed 03 Jun 2026, 14:22 CET` · small "Paid" green chip.
- Center: large checkmark mark (the existing scene, kept) + "Thank you, {first name}" + one-line: "We've emailed a receipt to **{email}** and your package will leave Prague within 24 hours."
- Below: **two primary CTAs** — `Track your order` (primary) · `Download invoice (PDF)` (secondary, opens print dialog with print-styled receipt).

**Zone B — Big route card (replaces the tiny SVG)**
- Full-width card with a real-looking arc map: Prague pin → mid-arc plane glyph → destination city pin, soft brand-blue glow under the arc. Animated path draw on mount (1.4s).
- Below the arc, three columns: **From** `Prague, CZ · ShipNest Hub 01` · **Carrier** `{meta.courier}` with courier wordmark badge · **To** `{city}, {country}` with India last-mile partner badge.
- ETA strip: "Estimated arrival **{range}** · {meta.serviceLevel} · Insured up to {meta.insured}"

**Zone C — Itemized invoice card**
- Header row: `Item` / `Qty` / `Price` / `Total` with proper table-style alignment.
- Each line: thumbnail, name, brand, variant, qty, unit price, line total.
- Totals block (right-aligned): Subtotal / Shipping (FREE) / VAT (20%) / **Total Paid** with bold $ amount.
- Payment line: brand icon + `Visa •••• 4242` or `Moonlight Wealth Management` + `AUTH ABCD12`.

**Zone D — Side cards row (2-col on desktop, stacked mobile)**
- **Delivery PIN** card (kept, polished — bigger PIN, warning copy).
- **Shipping address** card with `Edit address` link (gated: only first 30 min after order, then locked).

**Zone E — What's next strip**
- 3-step inline mini-timeline: `📦 Preparing` (active, pulsing dot) → `✈️ International transit` → `🏠 Out for delivery`. Replaced emojis with lucide icons.
- "We'll email you at every stage. You can also track in real-time."

**Zone F — Support footer card**
- "Questions about this order? Email **orders@shipnest.cz** or message us in **My Orders**."
- Small print: order eligible for return within 14 days of delivery · ShipNest Global s.r.o., Prague · VAT CZ12345678.

**Print stylesheet** added so `window.print()` produces a clean A4 invoice (logo, order #, line items, totals, address, VAT note).

---

## 3. Tracking page — what's missing

Keep all current sections, **add four new ones** and reorder for scannability.

**New top: Live status banner**
- Full-width gradient strip with current step icon (large), big status text ("In transit — Frankfurt → New Delhi"), and a **live ETA countdown**: "Arriving in **6 days, 14 hrs**" (computed from estimatedDelivery, ticks every minute).
- Right side: "Last scan **2h ago** at Frankfurt FRA Hub" with relative-time formatter.

**New: Animated route map card** (right under banner)
- Same arc-map component as receipt, but with a **pulsing dot** at the current position along the arc (position = `completedSteps / totalSteps`).
- Three labeled waypoints under the arc: Origin · Current hub · Destination — each with the facility name and timestamp.

**New: Courier handoff card**
- "Currently with: **{meta.courier}**" + their courier wordmark, + "Next handoff: **{meta.indiaCourier}** for last-mile delivery in {city}."
- Two reference numbers in mono: `ShipNest AWB {awb}` (copyable) and `Carrier ref pending until handoff`.
- This is the single biggest credibility win — it's what every real tracking page shows.

**Polish to existing sections:**
- Shipment details grid: already good, add a `Signature required` row and `CO₂e estimate · 4.2 kg` (tiny detail that screams "real logistics company").
- Timeline: add a **"What this means"** expandable note on the current step (e.g., "Your package cleared customs in Delhi. Next, it moves to the regional sorting facility."). One-line per status, pulled from a small `statusExplanations.ts` map.
- Items card: add a **"Package contents declared to customs"** subheading.

**New: Delivery instructions card** (only shown while in transit)
- "Add a note for the courier" textarea (saves to order in OrderContext local state).
- Toggles: `Leave with neighbor` · `Leave at door` · `Signature required` (visual only, no backend).

**New: Support strip at the bottom**
- "Where is my package?" mini-FAQ accordion with 4 items (delay, customs, PIN lost, wrong address).
- "Still need help? **Contact support**" link to /contact prefilled with order ID.

**Reduced-motion**: all arc draws and pulsing dots disabled, replaced with static states.

---

## Technical notes

**New components**
- `src/components/payment/PaymentScene.tsx` (the 3-act cinematic component, replaces inline animation in CheckoutPage)
- `src/components/payment/PinEntry.tsx` (input-otp wrapper)
- `src/components/RouteMap.tsx` (shared arc-map with `progress` prop 0-1, used by both receipt and tracking)
- `src/components/EtaCountdown.tsx` (ticks every 60s, returns "6d 14h" formatted)
- `src/components/CourierHandoff.tsx`
- `src/components/DeliveryInstructions.tsx`
- `src/components/TrackingSupportFAQ.tsx`
- `src/components/receipt/InvoiceTable.tsx`
- `src/data/statusExplanations.ts` (map of status → one-line plain-English explainer)

**Edited**
- `src/pages/CheckoutPage.tsx` — extract processing UI into `<PaymentScene />`.
- `src/pages/OrderConfirmationPage.tsx` — full layout rebuild + print stylesheet.
- `src/pages/TrackPage.tsx` — add banner, map, courier-handoff, instructions, support FAQ.
- `src/lib/courier.ts` — add `signatureRequired: bool`, `co2eKg: number`, `nextHandoffAt` fields (deterministic from hash).
- `src/index.css` — print stylesheet, brand-pulse fine-tune.

**No new deps** — framer-motion, lucide-react, input-otp already installed. No backend changes, no DB migration.

**Out of scope**
- Real PDF generation (print-to-PDF only).
- Real-time backend updates (current simulated timeline stays).
- Editable shipping address persistence (UI only).
- Animated world map with real geo coords (stylized arc is the right level — anything fancier reads as gimmicky).

Reply **approve** to build, or tell me to cut/swap any section.