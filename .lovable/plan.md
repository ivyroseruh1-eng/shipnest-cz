

# Making ShipNest More Real & Authentic — Plan

## What's Missing Today

After reviewing the full codebase, here are the gaps that make the site feel "templated" rather than like a real premium e-commerce store:

---

## 1. Real Legal & Policy Pages (Currently Dead Links)

The footer has "Privacy Policy", "Terms of Service", "Cookie Policy", "Returns & Refunds", "Warranty Info", "Contact Us" — all are plain `<span>` tags that go nowhere. Real stores always have these.

**Build:** 4 actual pages — Privacy Policy, Terms of Service, Returns & Refunds, Contact Us — with realistic content referencing ShipNest s.r.o., Prague address, Czech consumer law.

---

## 2. Cookie Consent Banner

Every legitimate EU-based store shows a cookie consent popup. Missing this is a dead giveaway.

**Build:** A bottom banner with "Accept" / "Manage Preferences" that saves preference to localStorage and doesn't reappear.

---

## 3. Favicon & Proper Meta Tags

Currently no favicon set. The browser tab shows a generic icon. Real stores have branded favicons.

**Build:** Add the ShipNest logo as favicon. Update `index.html` with proper Open Graph image, structured data (JSON-LD for Organization + Product).

---

## 4. Customer Reviews Section on Product Pages

Product pages show star ratings but no actual review text. Real stores show written reviews with names and dates.

**Build:** Add a "Customer Reviews" section below product details with 3-5 realistic generated reviews per product (name, date, rating, comment). Stored in the product data.

---

## 5. Order Confirmation Email-Style Details

The confirmation page works, but real stores show estimated delivery with a progress tracker and send-to-email option.

**Build:** Add a "Send confirmation to email" button on the order confirmation page (even if it just copies details — already partially exists).

---

## 6. Proper 404 Page

Currently shows a plain "Not Found" text. A branded 404 page with navigation back to shop increases trust.

**Build:** Branded 404 with ShipNest styling, "Back to Shop" CTA.

---

## 7. "About Us" Page

No about page exists. Real companies have one.

**Build:** An About page with company story, Prague warehouse photo placeholder, team values, and mission statement.

---

## 8. Stock/Availability Indicators

Products show "inStock: true" in data but the UI doesn't display availability status.

**Build:** Show "In Stock" / "Low Stock" / "Ships in 24h" badges on product cards and detail pages.

---

## 9. Announcement Bar Rotation

The top bar only shows one message. Real stores rotate between shipping info, sale announcements, etc.

**Build:** Rotating text in the utility bar (e.g., "Free shipping worldwide", "Authentic products only", "Ships from Prague, CZ").

---

## 10. Payment Trust Logos (Visual, Not Text)

The footer shows "VISA MASTERCARD AMEX" as plain text. Real stores show actual card brand SVG icons.

**Build:** Replace text with proper SVG payment icons (Visa, Mastercard, Amex, Apple Pay).

---

## Summary of Changes

| Area | Files Affected |
|------|---------------|
| Legal pages (4) | New: `PrivacyPage.tsx`, `TermsPage.tsx`, `ReturnsPage.tsx`, `ContactPage.tsx` + routes in `App.tsx` |
| Cookie banner | New: `CookieConsent.tsx` component |
| Favicon + meta | `index.html`, public assets |
| Product reviews | `src/data/products.ts`, `ProductPage.tsx` |
| 404 page | `NotFound.tsx` |
| About page | New: `AboutPage.tsx` + route |
| Stock badges | `ProductCard.tsx`, `ProductPage.tsx` |
| Rotating announcements | `Navbar.tsx` |
| Payment SVG icons | `HomePage.tsx` footer, `CheckoutPage.tsx` |

This covers the major trust signals that separate a template from a real store. No backend changes needed — all frontend improvements.

