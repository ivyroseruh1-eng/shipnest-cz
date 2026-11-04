// Centralized shipping estimation system for ShipNest
// Guarantees consistent 20–30 day delivery estimation for India and 3–5 days for Europe/Global.

export interface DestinationAddress {
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
}

const INDIAN_STATES_AND_TERRITORIES = [
  "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
  "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
  "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
  "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
  "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
  "delhi", "jammu and kashmir", "ladakh", "puducherry", "chandigarh",
  "andaman and nicobar", "dadra and nagar haveli", "daman and diu", "lakshadweep"
];

const KNOWN_INDIAN_CITIES = [
  "dimapur", "kohima", "mokokchung", "guwahati", "silchar", "dibrugarh",
  "mumbai", "delhi", "new delhi", "bengaluru", "bangalore", "hyderabad",
  "chennai", "kolkata", "pune", "ahmedabad", "jaipur", "surat", "lucknow",
  "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "patna",
  "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "ranchi", "faridabad",
  "meerut", "rajkot", "varanasi", "srinagar", "aurangabad", "dhanbad", "amritsar"
];

/**
 * Accurately determines if a destination address is within the Republic of India.
 * Handles Nagaland, Dimapur, Indian postal PIN codes (6 digits), and all state/city variants.
 */
export const isIndiaDestination = (dest?: DestinationAddress | null): boolean => {
  if (!dest) return false;

  const country = (dest.country || "").trim().toLowerCase();
  if (country === "india" || country === "in" || country === "ind") return true;

  const state = (dest.state || "").trim().toLowerCase();
  if (state && INDIAN_STATES_AND_TERRITORIES.some((s) => state.includes(s))) return true;

  const city = (dest.city || "").trim().toLowerCase();
  if (city && KNOWN_INDIAN_CITIES.some((c) => city.includes(c))) return true;

  // 6-digit Indian PIN code check (unless an explicit non-India country is given)
  const zip = (dest.zip || "").trim();
  if (/^\d{6}$/.test(zip)) {
    if (!country || country === "india" || country === "in") {
      return true;
    }
  }

  return false;
};

/**
 * Calculates a consistent estimated delivery date strictly based on the order's placedAt creation date.
 * For India: 20–30 days from creation date (deterministic average of 26 days matching the 16-step flight manifest).
 * For Europe/Global: 3–5 days from creation date.
 */
export const calculateEstimatedDeliveryDate = (
  placedAt: string | Date,
  isIndia: boolean,
  deliveryMethod: "standard" | "priority" = "standard",
  seed?: string
): string => {
  const baseDate = new Date(placedAt);
  if (isNaN(baseDate.getTime())) {
    return new Date(Date.now() + (isIndia ? 26 : 4) * 86400000).toISOString();
  }

  let offsetDays: number;
  if (isIndia) {
    // Single consolidated 20–30 days delivery window for India
    const variance = seed ? Math.abs(hashString(seed)) % 7 : 3;
    offsetDays = 23 + variance; // strictly within 20–30 days (average 26 days)
  } else {
    // European / Global transit
    if (deliveryMethod === "priority") {
      offsetDays = 2; // 2–3 days
    } else {
      offsetDays = 4; // 3–5 days
    }
  }

  const est = new Date(baseDate.getTime() + offsetDays * 86400000);
  return est.toISOString();
};

/**
 * Returns user-facing shipping method titles and delivery estimates.
 */
export const getShippingMethodMeta = (isIndia: boolean) => {
  if (isIndia) {
    return {
      standard: {
        id: "standard" as const,
        name: "Insured Air Express Freight",
        badge: "Recommended",
        estimate: "20–30 days",
        description:
          "International deliveries to India require export handling, international air-cargo transportation, import customs clearance, and onward domestic distribution. After arriving in India, shipments pass through regional logistics hubs before reaching the destination city. Estimated delivery: 20–30 days.",
        cost: "FREE",
      },
      // Backward-compatible fallback for historical data
      priority: {
        id: "priority" as const,
        name: "Insured Air Express Freight",
        badge: "Recommended",
        estimate: "20–30 days",
        description:
          "International deliveries to India require export handling, international air-cargo transportation, import customs clearance, and onward domestic distribution. After arriving in India, shipments pass through regional logistics hubs before reaching the destination city. Estimated delivery: 20–30 days.",
        cost: "FREE",
      },
    };
  }

  return {
    standard: {
      id: "standard" as const,
      name: "Insured Air Express",
      badge: "Recommended",
      estimate: "3–5 business days",
      description:
        "Delivered in 3–5 business days via direct cargo manifest with continuous custody tracking.",
      cost: "FREE",
    },
    priority: {
      id: "priority" as const,
      name: "Priority White-Glove Courier",
      badge: "Express",
      estimate: "2–3 business days",
      description:
        "Delivered in 2–3 business days with scheduled doorstep PIN verification.",
      cost: "FREE",
    },
  };
};

/**
 * Formats an order's estimated delivery date as an accurate date range.
 * Preserves the original order creation date and avoids calculating from current date.
 */
export const formatOrderDeliveryRange = (
  estDateIso: string,
  isIndia: boolean
): string => {
  const d = new Date(estDateIso);
  if (isNaN(d.getTime())) return "Estimated soon";

  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  const delta = isIndia ? 3 : 1;
  const from = new Date(d.getTime() - delta * 86400000);
  const to = new Date(d.getTime() + delta * 86400000);

  return `${from.toLocaleDateString("en-GB", opts)} — ${to.toLocaleDateString("en-GB", opts)}`;
};

const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
};
