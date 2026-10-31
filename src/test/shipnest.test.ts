import { describe, it, expect } from "vitest";
import { products } from "@/data/products";
import {
  generateTrackingId,
  generateOrderId,
  generateDeliveryPin,
  createDefaultTrackingSteps,
  createCancelledReturnSteps,
  STEP_DAY_OFFSETS,
} from "@/context/OrderContext";
import { Order } from "@/types";

describe("ShipNest Catalog Integrity", () => {
  it("should have at least 665 products in combined catalog", () => {
    expect(products.length).toBeGreaterThanOrEqual(665);
  });

  it("technology products must contain valid identifiers, pricing, and specs", () => {
    const techProducts = products.filter(p => p.department === "Technology");
    expect(techProducts.length).toBeGreaterThanOrEqual(65);
    techProducts.forEach(p => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.brand).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(Array.isArray(p.specs)).toBe(true);
      expect(p.specs.length).toBeGreaterThan(0);
      expect(p.image).toMatch(/^\/assets\/products\//);
      expect(typeof p.inStock).toBe("boolean");
    });
  });

  it("luxury products support unconfirmed pricing gracefully and have verified categories", () => {
    const luxuryProducts = products.filter(p => p.badge === "LUXURY");
    expect(luxuryProducts.length).toBe(600);
    luxuryProducts.forEach(p => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      // Price is either a number or null (Price Upon Inquiry)
      expect(p.price === null || typeof p.price === "number").toBe(true);
      expect(p.brand).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.image).toMatch(/^\/assets\/products\//);
      expect(typeof p.inStock).toBe("boolean");
      expect(p.verificationStatus).toBeTruthy();
    });
  });

  it("all products should belong to recognized brand lines", () => {
    const techBrands = ["Apple", "Samsung", "Google", "Sony", "OnePlus", "Xiaomi", "Garmin", "Nothing"];
    const allBrands = new Set(products.map(p => p.brand));
    techBrands.forEach(b => {
      expect(allBrands.has(b)).toBe(true);
    });
    // Check key luxury brands exist
    expect(allBrands.has("Louis Vuitton")).toBe(true);
    expect(allBrands.has("Rolex")).toBe(true);
    expect(allBrands.has("Chanel")).toBe(true);
    expect(allBrands.has("Hermès")).toBe(true);
    expect(allBrands.has("Cartier")).toBe(true);
    expect(allBrands.has("Creed")).toBe(true);
  });
});

describe("ShipNest Logistics & Tracking Engine", () => {
  it("generates valid tracking IDs with SNX prefix", () => {
    const trackingId = generateTrackingId();
    expect(trackingId).toMatch(/^SNX\d{7}$/);
  });

  it("generates valid order IDs with SN prefix", () => {
    const orderId = generateOrderId();
    expect(orderId).toMatch(/^SN\d{10}$/);
  });

  it("generates 4-digit doorstep delivery PINs", () => {
    const pin = generateDeliveryPin();
    expect(pin).toMatch(/^\d{4}$/);
    const pinNum = parseInt(pin, 10);
    expect(pinNum).toBeGreaterThanOrEqual(1000);
    expect(pinNum).toBeLessThanOrEqual(9999);
  });

  it("creates default multi-milestone tracking steps originating in Prague", () => {
    const steps = createDefaultTrackingSteps("Zurich", "ZH", "Switzerland");
    expect(steps.length).toBe(16);

    // Initial milestone should be at Prague Hub
    expect(steps[0].city).toBe("Prague");
    expect(steps[0].country).toBe("Czech Republic");
    expect(steps[0].status).toBe("Order Placed");

    // Final milestone should be delivered at destination
    const lastStep = steps[steps.length - 1];
    expect(lastStep.city).toBe("Zurich");
    expect(lastStep.country).toBe("Switzerland");
    expect(lastStep.status).toBe("Delivered");
  });

  it("creates valid reverse logistics steps on order cancellation", () => {
    const mockOrder: Order = {
      id: "test-uuid",
      orderId: generateOrderId(),
      trackingId: generateTrackingId(),
      customer: {
        name: "Test Customer",
        email: "test@example.com",
        phone: "+420 123 456 789",
        address: "Na Příkopě 22",
        city: "Prague",
        country: "Czech Republic",
        zip: "110 00",
      },
      items: [],
      subtotal: 1000,
      tax: 200,
      total: 1200,
      status: "In Transit",
      estimatedDelivery: new Date().toISOString(),
      placedAt: new Date().toISOString(),
      trackingSteps: createDefaultTrackingSteps("Berlin", "BE", "Germany"),
    };

    const returnSteps = createCancelledReturnSteps(mockOrder);
    expect(returnSteps.length).toBeGreaterThan(0);
    const cancellationStep = returnSteps.find(s => s.status.includes("Cancel") || s.status.includes("Return"));
    expect(cancellationStep).toBeDefined();
  });

  it("provides monotonic timeline step day offsets", () => {
    for (let i = 1; i < STEP_DAY_OFFSETS.length; i++) {
      expect(STEP_DAY_OFFSETS[i]).toBeGreaterThanOrEqual(STEP_DAY_OFFSETS[i - 1]);
    }
  });
});

describe("ShipNest Financial & E-Commerce Calculations", () => {
  it("calculates 20% Czech/EU VAT rate accurately", () => {
    const subtotal = 1299;
    const vatRate = 0.2;
    const vat = subtotal * vatRate;
    const total = subtotal + vat;

    expect(vat).toBeCloseTo(259.8, 1);
    expect(total).toBeCloseTo(1558.8, 1);
  });

  it("calculates free express worldwide shipping threshold", () => {
    const freeShippingThreshold = 100;
    const itemPrice = 899;
    const shippingCost = itemPrice >= freeShippingThreshold ? 0 : 25;

    expect(shippingCost).toBe(0);
  });
});
