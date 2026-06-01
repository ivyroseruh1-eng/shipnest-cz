## Goal

Make ShipNest feel like a real multi-million-dollar marketplace where tracking is a *premium feature*, not the whole business. Keep every existing tracking capability (tracking IDs, timeline, delivery PIN, route, status updates) — only redesign and re-frame them.

---

## 1. Authentication & Accounts (Lovable Cloud)

- Enable Email/Password + Google sign-in (Lovable Cloud managed, no setup needed).
- Add `profiles` table (id, user_id, full_name, avatar_url, phone) with auto-create trigger on signup.
- Add `addresses` table (saved shipping addresses per user).
- Auth pages: `/auth` (combined sign in / sign up tabs).
- On checkout, capture email → orders are stored with that email (already are via `customer.email`).
- On login, "My Orders" auto-shows every order whose `customer->>email` matches the logged-in user's email — no manual tracking entry needed.
- Guest tracking via tracking ID stays available on `/track`.

## 2. Navigation Overhaul

- **Remove** visible Admin link from navbar/menu.
- Navbar right side (logged out): `Sign In` · `Sign Up` · Cart · Wishlist.
- Navbar right side (logged in): Account dropdown → `My Orders`, `Addresses`, `Wishlist`, `Settings`, `Sign Out`.
- Admin access moved to **About page footer** as a discreet "Staff Access" link → `/admin` (password gate stays: `shipnest2024`).

## 3. Homepage Redesign (Amazon structure + Apple polish)

Sections in order:

1. **Hero Banner** — featured product + promo + trending strip.
2. **Shop by Category** — Electronics, Gaming, Accessories, Audio, Wearables (icon tiles).
3. **Best Sellers** — product grid.
4. **Why Shop With ShipNest** — 5 trust pillars (Secure Payments, Global Shipping, Real-Time Tracking, Customer Support, Protected Deliveries).
5. **Live Delivery Statistics** — animated counters (100k+ orders, 50+ countries, 98% success, 24/7 support).
6. **Recent Successful Deliveries** — cards: `Order #SN5781 → India`, etc. (curated, believable).
7. **Recent Activity Feed** — subtle live-style ticker ("Order delivered in Mumbai", "Shipped to Tokyo"…), paced (1 update every few seconds, max 5 visible).
8. Footer.

## 4. Customer Dashboard (`/account`)

Tabs / sections:

- **My Orders** — cards with product image, name, order #, date, status badge, ETA, `Track Order` button.
- **Active Shipments** — filter view of in-transit orders.
- **Delivered** / **Cancelled** filters.
- **Saved Addresses** — CRUD.
- **Wishlist** — link to existing wishlist.
- **Profile / Settings** — name, phone, avatar.
- **Support** — contact form / link.

Each order row → `Reorder` and `Download Invoice` (simple printable HTML invoice).

## 5. Tracking Page (keep all features, redesign visuals)

Shipment card (top):

- Tracking Number (copy)
- Current Status badge
- Current Location
- Estimated Arrival
- Progress bar with %
- Last update timestamp

Timeline (already exists — keep logic, polish UI):

- Completed steps with check marks
- Current step pulsing 📍
- Upcoming steps muted

Delivery PIN card stays.

## 6. Product Page — Tracking-as-a-Feature Strip

Below price/CTA add a 4-up trust strip:

- ⚡ Fast Shipping Available
- 📦 Tracking Included
- 🔒 Secure Delivery Verification (PIN)
- 🗓 Estimated Delivery: &nbsp;

## 7. Design Direction

Keep current Apple-style light theme (white bg, near-black text, blue accent #0071e3, Inter). No childish gradients/emojis-as-UI. Counters animate once on scroll into view. Activity feed fades in/out subtly. No fake "processing payment" theatrics.

---

## Technical Notes

- **DB migrations**: `profiles`, `addresses` tables + trigger `handle_new_user`, with RLS (user-scoped) and GRANTs.
- **Order linking**: query `orders` where `customer->>'email' = auth.user.email`; add an index on that JSON path for perf.
- **Routes added**: `/auth`, `/account`, `/account/orders`, `/account/addresses`, `/account/settings`.
- **Components added**: `AuthForm`, `AccountLayout`, `OrderCard`, `LiveStats` (animated counters), `ActivityFeed`, `RecentDeliveries`, `CategoryTiles`, `TrustPillars`, `ShippingFeatureStrip`.
- **Navbar**: refactor to show auth state via `supabase.auth.onAuthStateChange`.
- **Admin**: link removed from Navbar; added in `AboutPage` footer as small "Staff Access".
- **Invoice**: client-side printable HTML view at `/account/orders/:id/invoice`.
- Wishlist already exists — wire into account.

## Out of Scope (for this pass)

- Real payment provider integration (custom payment animation stays as-is unless you want a redo separately).
- Real-time websocket feed (activity feed is curated/simulated).
- Returns workflow UI beyond a placeholder Support entry.

---

Reply **approve** to proceed, or tell me what to cut/add.

&nbsp;

Moonlight management payment needs pin now 6 digit it's 841486

&nbsp;

Payment animation on both card n moonlight is very weak

&nbsp;

&nbsp;