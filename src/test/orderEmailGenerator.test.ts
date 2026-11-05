import { describe, it, expect } from "vitest";
import { generateOrderEmail, ALL_TRACKING_STEPS } from "../lib/orderEmailGenerator";
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
  it("generates minimal Apple-style mobile-first email with website assets", () => {
    const email = generateOrderEmail(mockOrder, "Order Received");
    expect(email.subject).toContain("ShipNest");
    expect(email.subject).toContain("SN94820194");
    expect(email.html).toContain("ShipNest");
    expect(email.html).toContain("/assets/brand/shipnest-logo.png");
    expect(email.html).toContain("Alexander Wright");
    expect(email.html).toContain("4829");
    expect(email.html).toContain("iPhone 16 Pro Max");
    expect(email.html).toContain("Natural Titanium");
    expect(email.html).toContain("256GB");
    expect(email.html).toContain("Václav Havel Airport Prague (PRG)");
    expect(email.html).toContain("Track Shipment");
  });

  it("supports all 13 tracking steps without error", () => {
    ALL_TRACKING_STEPS.forEach((step) => {
      const email = generateOrderEmail(mockOrder, step);
      expect(email.stepStatus).toBe(step);
      expect(email.subject).toContain("ShipNest");
      expect(email.html.length).toBeGreaterThan(1000);
      expect(email.plainText.length).toBeGreaterThan(200);
    });
  });

  it("includes the 4-digit security PIN in both HTML and plain text", () => {
    const email = generateOrderEmail(mockOrder, "Out for Delivery");
    expect(email.html).toContain("4829");
    expect(email.plainText).toContain("4829");
    expect(email.subject.toLowerCase()).toContain("delivery");
  });

  it("formats financial summary and payment method correctly", () => {
    const email = generateOrderEmail(mockOrder, "Payment Confirmed");
    expect(email.html).toContain("Visa ending in 7632");
    expect(email.html).toContain("$1,199");
    expect(email.html).toContain("$1,438.8");
  });
});
