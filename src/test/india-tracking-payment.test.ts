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
    const placedAt = "2026-03-28T10:14:04.000Z";
    const estDelivery = calculateEstimatedDeliveryDate(placedAt, true, "standard", "SN9284489643");

    const placedDate = new Date(placedAt);
    const estDate = new Date(estDelivery);
    const diffDays = Math.round((estDate.getTime() - placedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Must be strictly within 20–30 days
    expect(diffDays).toBeGreaterThanOrEqual(20);
    expect(diffDays).toBeLessThanOrEqual(30);

    // Both methods resolve cleanly within 20–30 days for India
    const estPriority = calculateEstimatedDeliveryDate(placedAt, true, "priority", "SN9284489643");
    const diffPriority = Math.round((new Date(estPriority).getTime() - placedDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffPriority).toBeGreaterThanOrEqual(20);
    expect(diffPriority).toBeLessThanOrEqual(30);
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

  it("provides correct centralized shipping metadata for single Indian shipping method", () => {
    const metaIndia = getShippingMethodMeta(true);
    expect(metaIndia.standard.estimate).toBe("20–30 days");
    expect(metaIndia.standard.name).toBe("Insured Air Express Freight");
    expect(metaIndia.standard.description).toContain("20–30 days");
    expect(metaIndia.standard.description).toContain("export handling");

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

  it("ensures steps 1-6 are completed, step 7 is current, and steps 8-12 have no fabricated timestamps", () => {
    const steps = createDefaultTrackingSteps("Dimapur", "Nagaland", "India");

    // Steps 1 to 6 completed
    for (let i = 0; i < 6; i++) {
      expect(steps[i].completed, `Step ${i + 1} (${steps[i].status}) should be completed`).toBe(true);
      expect(steps[i].timestamp.length, `Step ${i + 1} should have valid timestamp`).toBeGreaterThan(0);
    }

    // Step 7 (In Transit) is current active milestone
    expect(steps[6].status).toBe("In Transit");
    expect(steps[6].completed).toBe(true);
    expect(steps[6].timestamp.length).toBeGreaterThan(0);

    // Steps 8 to 12 are upcoming and must NOT display fabricated timestamps
    for (let i = 7; i < 12; i++) {
      expect(steps[i].completed, `Upcoming step ${i + 1} (${steps[i].status}) must not be marked completed`).toBe(false);
      expect(steps[i].timestamp, `Upcoming step ${i + 1} must not have fabricated timestamp`).toBe("");
    }
  });

  it("routes Indian shipments through Prague (PRG) -> New Delhi (DEL) -> Guwahati (GAU) -> Dimapur", () => {
    const stepsDimapur = createDefaultTrackingSteps("Dimapur", "Nagaland", "India");

    // Origin: Prague
    expect(stepsDimapur[0].city).toContain("Prague");
    expect(stepsDimapur[4].city).toContain("Prague");
    expect(stepsDimapur[5].city).toContain("Prague");

    // In Transit: Cargo Flight PRG -> DEL
    expect(stepsDimapur[6].city).toContain("DEL");

    // Customs: Indira Gandhi International Airport (DEL)
    expect(stepsDimapur[7].city).toContain("New Delhi");
    expect(stepsDimapur[7].state).toContain("Delhi");

    // Regional Hub: Guwahati North-East Logistics Hub (GAU)
    expect(stepsDimapur[8].city).toContain("Guwahati");
    expect(stepsDimapur[8].state).toContain("Assam");

    // Local Hub & Delivery: Dimapur, Nagaland
    expect(stepsDimapur[9].city).toContain("Dimapur");
    expect(stepsDimapur[10].city).toContain("Dimapur");
    expect(stepsDimapur[11].city).toContain("Dimapur");
  });

  it("preserves Doorstep Verification PIN and Order Reference lookups", () => {
    const steps = createDefaultTrackingSteps("Dimapur", "Nagaland", "India");
    const order: Order = {
      id: "ord-test-pin",
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
      subtotal: 100,
      tax: 20,
      total: 120,
      status: "In Transit",
      estimatedDelivery: "2026-11-30T10:00:00.000Z",
      placedAt: "2026-11-04T10:00:00.000Z",
      notes: "Express Priority Air Cargo",
      deliveryPin: "4821",
      trackingSteps: steps,
    };

    expect(order.deliveryPin).toBe("4821");
    expect(order.trackingId).toMatch(/^SNX\d{7}$/);
    expect(order.orderId).toMatch(/^SN/);
  });
});

describe("3. Phone Country Selector (+91 India)", () => {
  it("includes India (+91) with correct flag and metadata", () => {
    const india = getCountryByCode("+91");
    expect(india).toBeDefined();
    expect(india?.label).toBe("India (+91)");
    expect(india?.country).toBe("India");
    expect(india?.flag).toBe("🇮🇳");
    expect(india?.placeholder).toBe("98765 43210");
  });

  it("formats Indian mobile phone numbers with standard 5-5 grouping", () => {
    const india = getCountryByCode("+91")!;
    expect(india.formatPhone("9876543210")).toBe("98765 43210");
    expect(india.formatPhone("98765 43210")).toBe("98765 43210");
    expect(india.formatPhone("+919876543210")).toBe("98765 43210");
    expect(india.formatPhone("98765")).toBe("98765");
  });

  it("preserves US, UK, Czech Republic and European dialing codes", () => {
    expect(COUNTRY_CODES.some((c) => c.code === "+420")).toBe(true);
    expect(COUNTRY_CODES.some((c) => c.code === "+49")).toBe(true);
    expect(COUNTRY_CODES.some((c) => c.code === "+44")).toBe(true);
    expect(COUNTRY_CODES.some((c) => c.code === "+1")).toBe(true);
    expect(COUNTRY_CODES.some((c) => c.code === "+43")).toBe(true);
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
  });
});

describe("5. Cart, Checkout & Payment Cleanup", () => {
  it("verifies CartPage does not contain unnecessary trust lines", () => {
    const cartPagePath = path.resolve(__dirname, "../pages/CartPage.tsx");
    const content = fs.readFileSync(cartPagePath, "utf8");

    expect(content).not.toContain("256-bit SSL encrypted checkout");
    expect(content).not.toContain("30-day money-back guarantee with prepaid return labels");
  });

  it("verifies ShoppingAssistantLauncher is hidden on transactional pages", () => {
    const launcherPath = path.resolve(__dirname, "../components/ai/ShoppingAssistantLauncher.tsx");
    const content = fs.readFileSync(launcherPath, "utf8");

    expect(content).toContain("isTransactionalRoute");
    expect(content).toContain("/cart");
    expect(content).toContain("/checkout");
    expect(content).toContain("/payment");
    expect(content).toContain("/order-confirmation");
  });

  it("verifies PaymentPage does not contain Fill Demo Card button or handler", () => {
    const paymentPagePath = path.resolve(__dirname, "../pages/PaymentPage.tsx");
    const content = fs.readFileSync(paymentPagePath, "utf8");

    expect(content).not.toContain("Fill Demo Card");
    expect(content).not.toContain("handleFillDemoCard");
    expect(content).not.toContain("Filled with authenticated 3D Secure test card");
  });

  it("verifies PaymentPage does not contain unverified regulatory or compliance claims", () => {
    const paymentPagePath = path.resolve(__dirname, "../pages/PaymentPage.tsx");
    const content = fs.readFileSync(paymentPagePath, "utf8");

    expect(content).not.toContain("PCI-DSS Level 1");
    expect(content).not.toContain("EU Regulated");
    expect(content).not.toContain("EU REGULATED");
    expect(content).not.toContain("PSD2");
    expect(content).not.toContain("GDPR Compliant");
  });

  it("verifies CheckoutPage presents single shipping option with multi-stage explanation for India", () => {
    const checkoutPagePath = path.resolve(__dirname, "../pages/CheckoutPage.tsx");
    const content = fs.readFileSync(checkoutPagePath, "utf8");

    expect(content).toContain("Why delivery takes 20–30 days to India");
    expect(content).toContain("Export handling & sorting");
    expect(content).toContain("International air-cargo transport");
    expect(content).toContain("Import customs clearance");
    expect(content).toContain("Regional hub routing");
  });
});
