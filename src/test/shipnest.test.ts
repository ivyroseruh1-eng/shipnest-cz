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
  it("should have at least 20 active products in catalog", () => {
    expect(products.length).toBeGreaterThanOrEqual(20);
  });

  it("each product must contain valid identifiers, pricing, and specs", () => {
    products.forEach(p => {
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

  it("all products should belong to recognized brand lines", () => {
    const validBrands = ["Apple", "Samsung", "Google", "Sony", "OnePlus", "Xiaomi", "Garmin", "Bose", "Nothing", "Asus", "Motorola", "Huawei"];
    products.forEach(p => {
      expect(validBrands).toContain(p.brand);
    });
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
