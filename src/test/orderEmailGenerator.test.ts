import { describe, it, expect } from "vitest";
import {
  generateOrderEmail,
  ALL_TRACKING_STEPS,
  getCanonicalSiteUrl,
  normalizeEmailImageUrl,
  CANONICAL_PRODUCTION_SITE_URL,
} from "../lib/orderEmailGenerator";
import { Order } from "../types";

const mockOrder: Order = {
  id: "test-order-1",
  orderId: "SN94820194",
  trackingId: "SNX948201",
  customer: {
    name: "Alexander Wright",
    email: "a.wright@techventures.io",
    phone: "+420 777 000 111",
    address: "Na Příkopě 22",
    city: "Prague",
    state: "Bohemia",
    country: "Czech Republic",
    zip: "110 00",
  },
  items: [
    {
      productId: "prod-iphone-16-pro",
      name: "iPhone 16 Pro Max",
      brand: "Apple",
      image: "/assets/products/iphone16pro.jpg",
      price: 1199,
      qty: 1,
      selectedColor: "Natural Titanium",
      selectedStorage: "256GB",
    },
  ],
  subtotal: 1199,
  tax: 239.8,
  total: 1438.8,
  status: "Order Confirmed",
  estimatedDelivery: "12 Nov 2026",
  placedAt: "2026-11-05T10:00:00.000Z",
  notes: "White-glove Prague dispatch",
  paymentMethod: "Visa ending in 7632",
  deliveryPin: "4829",
  trackingSteps: [],
};

describe("Order Email Generator (Apple Style & Mobile-First)", () => {
  describe("Canonical Production Site URL & Security", () => {
    it("defaults to https://shipnest.getvoroa.com", () => {
      expect(CANONICAL_PRODUCTION_SITE_URL).toBe("https://shipnest.getvoroa.com");
      expect(getCanonicalSiteUrl()).toBe("https://shipnest.getvoroa.com");
    });

    it("rejects localhost, 127.0.0.1, preview URLs, and shipnest.com in favor of canonical", () => {
      expect(getCanonicalSiteUrl("http://localhost:5173")).toBe("https://shipnest.getvoroa.com");
      expect(getCanonicalSiteUrl("http://127.0.0.1:3000")).toBe("https://shipnest.getvoroa.com");
      expect(getCanonicalSiteUrl("https://shipnest-preview-123.vercel.app")).toBe("https://shipnest.getvoroa.com");
      expect(getCanonicalSiteUrl("https://shipnest.com")).toBe("https://shipnest.getvoroa.com");
      expect(getCanonicalSiteUrl("https://shipnest.com/")).toBe("https://shipnest.getvoroa.com");
    });

    it("safely trims trailing slashes from valid custom origins", () => {
      expect(getCanonicalSiteUrl("https://shipnest.getvoroa.com/")).toBe("https://shipnest.getvoroa.com");
    });
  });

  describe("Image URL Normalization Helper", () => {
    it("normalizes local paths to absolute production HTTPS URLs", () => {
      expect(normalizeEmailImageUrl("/assets/brand/shipnest-logo.png")).toBe(
        "https://shipnest.getvoroa.com/assets/brand/shipnest-logo.png"
      );
      expect(normalizeEmailImageUrl("assets/brand/shipnest-logo.png")).toBe(
        "https://shipnest.getvoroa.com/assets/brand/shipnest-logo.png"
      );
    });

    it("handles public/ prefix correctly (Vite rule: public/ is served at root /)", () => {
      expect(normalizeEmailImageUrl("public/assets/products/galaxy.jpg")).toBe(
        "https://shipnest.getvoroa.com/assets/products/galaxy.jpg"
      );
      expect(normalizeEmailImageUrl("/public/assets/brand/shipnest-logo.png")).toBe(
        "https://shipnest.getvoroa.com/assets/brand/shipnest-logo.png"
      );
    });

    it("handles relative product and brand paths", () => {
      expect(normalizeEmailImageUrl("products/iphone-16.jpg")).toBe(
        "https://shipnest.getvoroa.com/assets/products/iphone-16.jpg"
      );
    });

    it("preserves valid public HTTPS image URLs", () => {
      const externalUrl = "https://images.unsplash.com/photo-1616469829941-c7200edec809";
      expect(normalizeEmailImageUrl(externalUrl)).toBe(externalUrl);
    });

    it("rejects localhost, blob:, file:, and data: URLs in favor of fallback asset", () => {
      const fallback = "https://shipnest.getvoroa.com/assets/brand/shipnest-mark.png";
      expect(normalizeEmailImageUrl("http://localhost:5173/assets/test.jpg")).toBe(fallback);
      expect(normalizeEmailImageUrl("blob:http://localhost:5173/xyz-123")).toBe(fallback);
      expect(normalizeEmailImageUrl("file:///C:/Users/test/img.png")).toBe(fallback);
      expect(normalizeEmailImageUrl("data:image/png;base64,xxxx")).toBe(fallback);
      expect(normalizeEmailImageUrl("")).toBe(fallback);
      expect(normalizeEmailImageUrl(undefined)).toBe(fallback);
    });

    it("rewrites legacy shipnest.com domain to canonical production origin", () => {
      expect(
        normalizeEmailImageUrl("https://shipnest.com/assets/brand/shipnest-logo.png")
      ).toBe("https://shipnest.getvoroa.com/assets/brand/shipnest-logo.png");
    });
  });

  describe("Tracking URL Integrity", () => {
    it("generates direct /track/:trackingId URL using dynamic order.trackingId", () => {
      const email = generateOrderEmail(mockOrder, "Order Received");
      const expectedTrackUrl = "https://shipnest.getvoroa.com/track/SNX948201";

      expect(email.html).toContain(expectedTrackUrl);
      expect(email.plainText).toContain(expectedTrackUrl);
      // Strictly verify no query string like /track?id=
      expect(email.html).not.toContain("/track?id=");
      expect(email.plainText).not.toContain("/track?id=");
      // Strictly verify no forbidden origins
      expect(email.html).not.toContain("localhost");
      expect(email.html).not.toContain("127.0.0.1");
      expect(email.html).not.toContain("shipnest.com");
      expect(email.plainText).not.toContain("localhost");
      expect(email.plainText).not.toContain("127.0.0.1");
      expect(email.plainText).not.toContain("shipnest.com");
    });
  });

  describe("Apple Minimalist Design & Zero Emojis", () => {
    it("contains zero emojis across subject, preheader, and plain text", () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        expect(emojiRegex.test(email.subject)).toBe(false);
        expect(emojiRegex.test(email.preheader)).toBe(false);
        expect(emojiRegex.test(email.plainText)).toBe(false);
      });
    });

    it("renders Apple minimalist typography and design tokens", () => {
      const email = generateOrderEmail(mockOrder, "Order Received");
      expect(email.html).toContain("-apple-system, BlinkMacSystemFont");
      expect(email.html).toContain("https://shipnest.getvoroa.com/assets/brand/shipnest-logo.png");
      expect(email.html).toContain("Track Shipment");
      expect(email.html).toContain("Prague Hub");
      expect(email.html).toContain("Václav Havel Airport Prague (PRG)");
    });

    it("implements the 4-stage shipment indicator: Placed -> Prepared -> In Transit -> Delivered", () => {
      const email = generateOrderEmail(mockOrder, "In Transit");
      expect(email.html).toContain("PLACED");
      expect(email.html).toContain("PREPARED");
      expect(email.html).toContain("IN TRANSIT");
      expect(email.html).toContain("DELIVERED");
    });
  });

  describe("Preservation of Sensitive Data (Zero Fabricated Fallbacks)", () => {
    it("renders genuine delivery PIN when present", () => {
      const email = generateOrderEmail(mockOrder, "Out for Delivery");
      expect(email.html).toContain("Delivery Verification PIN");
      expect(email.html).toContain("4829");
      expect(email.plainText).toContain("Delivery Verification PIN: 4829");
    });

    it("omits delivery PIN section cleanly when order.deliveryPin is missing without fabricating 4829", () => {
      const orderWithoutPin: Order = {
        ...mockOrder,
        deliveryPin: undefined,
      };
      const email = generateOrderEmail(orderWithoutPin, "Order Received");
      expect(email.html).not.toContain("Delivery Verification PIN");
      expect(email.html).not.toContain("4829");
      expect(email.plainText).not.toContain("Delivery Verification PIN");
    });

    it("renders genuine payment method when present", () => {
      const email = generateOrderEmail(mockOrder, "Payment Confirmed");
      expect(email.html).toContain("Payment: Visa ending in 7632");
      expect(email.plainText).toContain("Payment: Visa ending in 7632");
    });

    it("omits payment method row cleanly when order.paymentMethod is missing without fabricating a card", () => {
      const orderWithoutPayment: Order = {
        ...mockOrder,
        paymentMethod: undefined,
      };
      const email = generateOrderEmail(orderWithoutPayment, "Order Received");
      expect(email.html).not.toContain("Payment: ");
      expect(email.html).not.toContain("Visa ending in 7632");
      expect(email.plainText).not.toContain("Payment:");
    });
  });

  describe("Full Coverage of Tracking Steps", () => {
    it("generates valid lightweight emails for all 13 tracking steps", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        expect(email.stepStatus).toBe(step);
        expect(email.subject).toContain("ShipNest");
        expect(email.subject).toContain(mockOrder.orderId);
        expect(email.html.length).toBeGreaterThan(1500);
        // Ensure email HTML stays comfortably under Gmail's 102KB truncation limit
        expect(Buffer.byteLength(email.html, "utf8")).toBeLessThan(50000);
        expect(email.plainText.length).toBeGreaterThan(200);
      });
    });
  });

  describe("Apple-Quality Transactional Email Communication Standards", () => {
    it("keeps all 13 subject lines strictly under 50 characters", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        expect(email.subject.length).toBeLessThanOrEqual(50);
      });
    });

    it("puts important status information first without leading brand repetition", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        expect(email.subject).not.toMatch(/^ShipNest:/i);
        expect(email.subject).toMatch(/^[A-Z][a-z]+/);
      });
    });

    it("ensures preheaders are distinct across all 13 tracking steps", () => {
      const preheaders = ALL_TRACKING_STEPS.map(
        (step) => generateOrderEmail(mockOrder, step).preheader
      );
      const uniquePreheaders = new Set(preheaders);
      expect(uniquePreheaders.size).toBe(ALL_TRACKING_STEPS.length);
    });

    it("ensures preheaders are complementary rather than repeating the subject line", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        expect(email.preheader.toLowerCase()).not.toContain(email.subject.toLowerCase());
      });
    });

    it("strictly separates delivery verification PIN from subject and preheader", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        expect(email.subject).not.toContain(mockOrder.deliveryPin!);
        expect(email.preheader).not.toContain(mockOrder.deliveryPin!);
      });
    });

    it("does not claim delivery verification occurred when delivering", () => {
      const email = generateOrderEmail(mockOrder, "Delivered");
      expect(email.html).not.toMatch(/verified with your (?:4-digit )?PIN/i);
      expect(email.plainText).not.toMatch(/verified with your (?:4-digit )?PIN/i);
      expect(email.html).not.toMatch(/enjoy your authentic/i);
    });

    it("does not invent refund timelines for cancelled orders", () => {
      const email = generateOrderEmail(mockOrder, "Cancelled");
      expect(email.html).not.toMatch(/5[–-]7 business days/i);
      expect(email.plainText).not.toMatch(/5[–-]7 business days/i);
      expect(email.html).toContain("released by your card issuer");
      expect(email.plainText).toContain("released by your card issuer");
    });

    it("avoids internal logistics jargon across all emails", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        const combined = `${email.subject} ${email.preheader} ${email.html} ${email.plainText}`;
        expect(combined).not.toMatch(/air waybill|AWB|cargo manifest|PRG Gateway|flight barcode|tamper-evident|consignment items/i);
      });
    });

    it("uses customer first name naturally in greeting in both HTML and plain text", () => {
      const email = generateOrderEmail(mockOrder, "Order Received");
      expect(email.html).toContain("Hello Alexander,");
      expect(email.plainText).toContain("Hello Alexander,");
    });

    it("maintains concise mobile reading length (~200 words or fewer in plain text)", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        const wordCount = email.plainText.split(/\s+/).filter(Boolean).length;
        expect(wordCount).toBeLessThan(200);
      });
    });
  });

  describe("Mobile-First Architecture, Dark Mode, and Parity", () => {
    it("includes mobile responsive stacking CSS rules for small viewports", () => {
      const email = generateOrderEmail(mockOrder, "Out for Delivery");
      expect(email.html).toContain(".mobile-stack");
      expect(email.html).toContain(".mobile-stack-bottom");
      expect(email.html).toContain("@media only screen and (max-width: 520px)");
      expect(email.html).toContain("width: 100% !important");
    });

    it("supports automatic dark mode logo switching with shipnest-logo-white.png", () => {
      const email = generateOrderEmail(mockOrder, "In Transit");
      expect(email.html).toContain("shipnest-logo-white.png");
      expect(email.html).toContain("light-logo-wrap");
      expect(email.html).toContain("dark-logo-wrap");
      expect(email.html).toContain("@media (prefers-color-scheme: dark)");
    });

    it("renders DHL/Amazon high-security delivery PIN module with individual digit cells", () => {
      const email = generateOrderEmail(mockOrder, "Out for Delivery");
      expect(email.html).toContain("apple-pin-cell");
      expect(email.html).toContain("Delivery Verification PIN");
      expect(email.html).toContain("Present this 4-digit code in person to your courier upon delivery");
      // Check each digit rendered
      expect(email.html).toContain("4");
      expect(email.html).toContain("8");
      expect(email.html).toContain("2");
      expect(email.html).toContain("9");
    });

    it("renders 4-stage Apple segmented progress bars with active/inactive CSS classes", () => {
      const email = generateOrderEmail(mockOrder, "In Transit");
      expect(email.html).toContain("apple-bar-active");
      expect(email.html).toContain("apple-bar-inactive");
      expect(email.html).toContain("PLACED");
      expect(email.html).toContain("PREPARED");
      expect(email.html).toContain("IN TRANSIT");
      expect(email.html).toContain("DELIVERED");
    });

    it("guarantees 100% data parity between HTML and Plain-Text versions", () => {
      ALL_TRACKING_STEPS.forEach((step) => {
        const email = generateOrderEmail(mockOrder, step);
        // Customer name
        expect(email.html).toContain(mockOrder.customer.name);
        expect(email.plainText).toContain(mockOrder.customer.name);

        // Order ID and tracking ID
        expect(email.html).toContain(mockOrder.orderId);
        expect(email.plainText).toContain(mockOrder.orderId);
        expect(email.html).toContain(mockOrder.trackingId);
        expect(email.plainText).toContain(mockOrder.trackingId);

        // Tracking URL
        const expectedTrackUrl = `https://shipnest.getvoroa.com/track/${mockOrder.trackingId}`;
        expect(email.html).toContain(expectedTrackUrl);
        expect(email.plainText).toContain(expectedTrackUrl);

        // Item names & totals
        mockOrder.items.forEach((item) => {
          expect(email.html).toContain(item.name);
          expect(email.plainText).toContain(item.name);
        });
        expect(email.html).toContain(mockOrder.total.toLocaleString());
        expect(email.plainText).toContain(mockOrder.total.toLocaleString());

        // Delivery PIN
        if (mockOrder.deliveryPin) {
          expect(email.html).toContain(mockOrder.deliveryPin);
          expect(email.plainText).toContain(mockOrder.deliveryPin);
        }
      });
    });
  });
});
