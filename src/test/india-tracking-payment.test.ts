import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  isIndiaDestination,
  calculateEstimatedDeliveryDate,
  getShippingMethodMeta,
  formatOrderDeliveryRange,
} from "@/lib/shipping";
import { COUNTRY_CODES, getCountryByCode } from "@/data/countryCodes";
import {
  createDefaultTrackingSteps,
  createCancelledReturnSteps,
  generateTrackingId,
  generateOrderId,
  generateDeliveryPin,
  STEP_DAY_OFFSETS,
} from "@/context/OrderContext";
import { Order } from "@/types";

describe("1. Indian Delivery Estimates (20–30 Days)", () => {
  it("accurately identifies all Indian destinations including Nagaland and Dimapur", () => {
    // Explicit country
    expect(isIndiaDestination({ country: "India" })).toBe(true);
    expect(isIndiaDestination({ country: "IN" })).toBe(true);
    expect(isIndiaDestination({ country: "IND" })).toBe(true);

    // State variants
    expect(isIndiaDestination({ state: "Nagaland", country: "India" })).toBe(true);
    expect(isIndiaDestination({ state: "Nagaland" })).toBe(true);
    expect(isIndiaDestination({ state: "Assam" })).toBe(true);
    expect(isIndiaDestination({ state: "Maharashtra" })).toBe(true);
    expect(isIndiaDestination({ state: "Delhi" })).toBe(true);
    expect(isIndiaDestination({ state: "Karnataka" })).toBe(true);

    // City variants
    expect(isIndiaDestination({ city: "Dimapur" })).toBe(true);
    expect(isIndiaDestination({ city: "Kohima" })).toBe(true);
    expect(isIndiaDestination({ city: "Mokokchung" })).toBe(true);
    expect(isIndiaDestination({ city: "Guwahati" })).toBe(true);
    expect(isIndiaDestination({ city: "Mumbai" })).toBe(true);
    expect(isIndiaDestination({ city: "Bengaluru" })).toBe(true);

    // 6-digit Indian postal code
    expect(isIndiaDestination({ zip: "797112" })).toBe(true);
    expect(isIndiaDestination({ zip: "110001" })).toBe(true);

    // Non-Indian destinations must return false
    expect(isIndiaDestination({ country: "Czech Republic", city: "Prague" })).toBe(false);
    expect(isIndiaDestination({ country: "Switzerland", city: "Zurich" })).toBe(false);
    expect(isIndiaDestination({ country: "United States", city: "New York" })).toBe(false);
    expect(isIndiaDestination({ country: "Germany", city: "Berlin" })).toBe(false);
    expect(isIndiaDestination({ country: "United Kingdom", city: "London" })).toBe(false);
  });

  it("calculates 20–30-day delivery estimation strictly from order placedAt creation date", () => {
    // Fixed creation date in the past
    const placedAt = "2026-03-28T10:14:04.000Z";
    const estDelivery = calculateEstimatedDeliveryDate(placedAt, true, "standard", "SN9284489643");

    const placedDate = new Date(placedAt);
    const estDate = new Date(estDelivery);
    const diffDays = Math.round((estDate.getTime() - placedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Must be strictly within 20–30 days
    expect(diffDays).toBeGreaterThanOrEqual(20);
    expect(diffDays).toBeLessThanOrEqual(30);

    // Priority delivery to India: 20–25 days
    const estPriority = calculateEstimatedDeliveryDate(placedAt, true, "priority", "SN9284489643");
    const diffPriority = Math.round((new Date(estPriority).getTime() - placedDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffPriority).toBeGreaterThanOrEqual(20);
    expect(diffPriority).toBeLessThanOrEqual(25);
  });

  it("calculates 3–5-day delivery estimation for European and global destinations", () => {
    const placedAt = "2026-11-04T12:00:00.000Z";
    const estStandard = calculateEstimatedDeliveryDate(placedAt, false, "standard");
    const placedDate = new Date(placedAt);
    const diffDays = Math.round((new Date(estStandard).getTime() - placedDate.getTime()) / (1000 * 60 * 60 * 24));

    expect(diffDays).toBeGreaterThanOrEqual(3);
    expect(diffDays).toBeLessThanOrEqual(5);

    const estPriority = calculateEstimatedDeliveryDate(placedAt, false, "priority");
    const diffPriority = Math.round((new Date(estPriority).getTime() - placedDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffPriority).toBeGreaterThanOrEqual(2);
    expect(diffPriority).toBeLessThanOrEqual(3);
  });

  it("does not recalculate delivery date from current date after order has been placed", () => {
    const orderCreatedDate = "2026-03-28T10:14:04.000Z";
    const fixedEst = calculateEstimatedDeliveryDate(orderCreatedDate, true, "standard", "seed-1");

    // Calling formatOrderDeliveryRange preserves the original date
    const range = formatOrderDeliveryRange(fixedEst, true);
    expect(range).toContain("2026");
    expect(range).toContain("Apr"); // ~26 days from Mar 28 is Apr 2026, NOT current month
  });

  it("provides correct centralized shipping metadata for checkout and payment", () => {
    const metaIndia = getShippingMethodMeta(true);
    expect(metaIndia.standard.estimate).toBe("20–30 days");
    expect(metaIndia.priority.estimate).toBe("20–25 days");
    expect(metaIndia.standard.description).toContain("20–30 days");

    const metaGlobal = getShippingMethodMeta(false);
    expect(metaGlobal.standard.estimate).toBe("3–5 business days");
    expect(metaGlobal.priority.estimate).toBe("2–3 business days");
  });
});

describe("2. Restored ShipNest Tracking System", () => {
  it("restores the exact 12-step shipment timeline specified in the requirements", () => {
    const steps = createDefaultTrackingSteps("Dimapur", "Nagaland", "India");
    expect(steps.length).toBe(12);

    const expectedStatuses = [
      "Order Received",
      "Payment Confirmed",
      "Processing",
      "Packed",
      "Shipment Created",
      "Departed Origin",
      "In Transit",
      "Customs",
      "Regional Hub",
      "Local Hub",
      "Out for Delivery",
      "Delivered",
    ];

    steps.forEach((step, idx) => {
      expect(step.status).toBe(expectedStatuses[idx]);
    });
  });

  it("marks completed steps and current In Transit step without fabricated future timestamps", () => {
    const steps = createDefaultTrackingSteps("Dimapur", "Nagaland", "India");

    // Completed steps (0 to 5)
    for (let i = 0; i <= 5; i++) {
      expect(steps[i].completed, `${steps[i].status} should be completed`).toBe(true);
      expect(steps[i].timestamp, `${steps[i].status} should have valid timestamp`).toBeTruthy();
    }

    // Current step (6: In Transit)
    expect(steps[6].completed).toBe(true);
    expect(steps[6].status).toBe("In Transit");

    // Upcoming steps (7 to 11) must NOT show fabricated timestamps
    for (let i = 7; i <= 11; i++) {
      expect(steps[i].completed, `${steps[i].status} should not be completed`).toBe(false);
      expect(steps[i].timestamp, `${steps[i].status} must not have fabricated timestamp`).toBe("");
    }
  });

  it("routes Indian shipments through genuine Indian cities and regional hubs", () => {
    // Dimapur / Nagaland shipment
    const stepsDimapur = createDefaultTrackingSteps("Dimapur", "Nagaland", "India");
    const customsStep = stepsDimapur.find((s) => s.status === "Customs");
    expect(customsStep?.city).toBe("New Delhi");
    expect(customsStep?.state).toBe("Delhi");
    expect(customsStep?.country).toBe("India");

    const regionalHub = stepsDimapur.find((s) => s.status === "Regional Hub");
    expect(regionalHub?.city).toBe("Guwahati");
    expect(regionalHub?.state).toBe("Assam");
    expect(regionalHub?.country).toBe("India");

    const localHub = stepsDimapur.find((s) => s.status === "Local Hub");
    expect(localHub?.city).toBe("Dimapur");
    expect(localHub?.state).toBe("Nagaland");
    expect(localHub?.country).toBe("India");

    const outForDelivery = stepsDimapur.find((s) => s.status === "Out for Delivery");
    expect(outForDelivery?.city).toBe("Dimapur");
    expect(outForDelivery?.state).toBe("Nagaland");
    expect(outForDelivery?.country).toBe("India");
  });

  it("creates valid reverse logistics steps upon order cancellation", () => {
    const steps = createDefaultTrackingSteps("Dimapur", "Nagaland", "India");
    const mockOrder: Order = {
      id: "ord-test-1",
      orderId: generateOrderId(),
      trackingId: generateTrackingId(),
      customer: {
        name: "Alex Vance",
        email: "alex@example.com",
        phone: "+91 98765 43210",
        address: "Circular Road",
        city: "Dimapur",
        state: "Nagaland",
        country: "India",
        zip: "797112",
      },
      items: [],
      subtotal: 1200,
      tax: 240,
      total: 1440,
      status: "In Transit",
      estimatedDelivery: new Date().toISOString(),
      placedAt: new Date().toISOString(),
      trackingSteps: steps,
    };

    const returnSteps = createCancelledReturnSteps(mockOrder);
    expect(returnSteps.length).toBeGreaterThan(0);
    const cancelStep = returnSteps.find((s) => s.status.includes("Order Cancelled"));
    expect(cancelStep).toBeDefined();
    expect(cancelStep?.completed).toBe(true);
  });
});

describe("3. Global Phone Selector with India (+91)", () => {
  it("includes India (+91) with correct flag, label, and dialing code", () => {
    const india = COUNTRY_CODES.find((c) => c.code === "+91");
    expect(india).toBeDefined();
    expect(india?.country).toBe("India");
    expect(india?.flag).toBe("🇮🇳");
    expect(india?.iso).toBe("IN");
    expect(india?.label).toBe("India (+91)");
  });

  it("formats Indian mobile phone numbers accurately with 5-5 digit grouping", () => {
    const india = getCountryByCode("+91");
    expect(india.formatPhone("9876543210")).toBe("98765 43210");
    expect(india.formatPhone("98765")).toBe("98765");
    expect(india.formatPhone("9876543210999")).toBe("98765 43210"); // slices to 10
  });

  it("preserves Czech (+420), US (+1), UK (+44), and European country codes", () => {
    const czech = getCountryByCode("+420");
    expect(czech.country).toBe("Czech Republic");
    expect(czech.flag).toBe("🇨🇿");
    expect(czech.formatPhone("777000111")).toBe("777 000 111");

    const us = getCountryByCode("+1");
    expect(us.country).toBe("United States / Canada");
    expect(us.formatPhone("5550192834")).toBe("(555) 019-2834");

    const uk = getCountryByCode("+44");
    expect(uk.country).toBe("United Kingdom");
    expect(uk.flag).toBe("🇬🇧");

    const de = getCountryByCode("+44");
    expect(COUNTRY_CODES.some((c) => c.code === "+49")).toBe(true);
    expect(COUNTRY_CODES.some((c) => c.code === "+33")).toBe(true);
    expect(COUNTRY_CODES.some((c) => c.code === "+41")).toBe(true);
    expect(COUNTRY_CODES.some((c) => c.code === "+31")).toBe(true);
  });
});

describe("4. Official Payment Brand Assets", () => {
  const assetsDir = path.resolve(__dirname, "../../public/assets/payment");

  it("has all official payment SVGs locally in public/assets/payment/", () => {
    const requiredAssets = [
      "visa.svg",
      "mastercard.svg",
      "amex.svg",
      "apple-pay.svg",
      "google-pay.svg",
      "paypal.svg",
      "sepa.svg",
      "ideal.svg",
      "bancontact.svg",
      "blik.svg",
    ];

    requiredAssets.forEach((file) => {
      const filePath = path.join(assetsDir, file);
      expect(fs.existsSync(filePath), `Asset ${file} must exist locally`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size, `Asset ${file} must not be empty`).toBeGreaterThan(100);
    });
  });

  it("verifies all SVGs have valid viewBox attributes for responsive scaling", () => {
    const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".svg"));
    files.forEach((file) => {
      const content = fs.readFileSync(path.join(assetsDir, file), "utf8");
      expect(content, `SVG ${file} must have viewBox attribute`).toContain("viewBox");
    });
  });

  it("has documentation of official asset sources in README.md", () => {
    const readmePath = path.join(assetsDir, "README.md");
    expect(fs.existsSync(readmePath)).toBe(true);
    const content = fs.readFileSync(readmePath, "utf8");
    expect(content).toContain("Visa");
    expect(content).toContain("Mastercard");
    expect(content).toContain("American Express");
    expect(content).toContain("Apple Pay");
    expect(content).toContain("Google Pay");
    expect(content).toContain("PayPal");
    expect(content).toContain("SEPA");
    expect(content).toContain("iDEAL");
    expect(content).toContain("Bancontact");
    expect(content).toContain("BLIK");
  });
});
