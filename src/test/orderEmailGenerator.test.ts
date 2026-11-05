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
});
