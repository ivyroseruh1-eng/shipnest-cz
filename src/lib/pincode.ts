// Global postal-code lookup with multiple free APIs (no key required).
// Primary: zippopotam.us (global, ~60 countries)
// India fallback: api.postalpincode.in (richer data for IN)

export type PincodeResult = {
  pincode: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
};

const cache = new Map<string, PincodeResult | null>();

function cacheKey(pincode: string, country?: string) {
  return `${(country || "").toLowerCase()}:${pincode.trim().toLowerCase()}`;
}

async function lookupIndia(pincode: string): Promise<PincodeResult | null> {
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!r.ok) return null;
    const data = await r.json();
    const first = Array.isArray(data) ? data[0] : null;
    const office = first?.PostOffice?.[0];
    if (!office) return null;
    return {
      pincode,
      city: office.District || office.Name || "",
      state: office.State || "",
      country: "India",
      countryCode: "IN",
    };
  } catch {
    return null;
  }
}

async function lookupZippo(pincode: string, country = "us"): Promise<PincodeResult | null> {
  try {
    const r = await fetch(`https://api.zippopotam.us/${country}/${pincode}`);
    if (!r.ok) return null;
    const data = await r.json();
    const place = data?.places?.[0];
    if (!place) return null;
    return {
      pincode,
      city: place["place name"] || "",
      state: place["state"] || place["state abbreviation"] || "",
      country: data["country"] || country.toUpperCase(),
      countryCode: (data["country abbreviation"] || country).toUpperCase(),
    };
  } catch {
    return null;
  }
}

/**
 * Look up a postal/pin code. Detects India 6-digit codes automatically.
 * For other countries, optionally pass a 2-letter country code (default: us).
 */
export async function lookupPincode(
  pincode: string,
  country?: string,
): Promise<PincodeResult | null> {
  const cleaned = pincode.trim();
  if (!cleaned) return null;
  const key = cacheKey(cleaned, country);
  if (cache.has(key)) return cache.get(key) ?? null;

  let result: PincodeResult | null = null;

  // India: 6 digits
  if (/^\d{6}$/.test(cleaned) && (!country || country.toLowerCase() === "in")) {
    result = await lookupIndia(cleaned);
  }

  // Generic: try zippopotam.us
  if (!result) {
    const countriesToTry = country ? [country] : ["us", "de", "gb", "fr", "ca", "au", "nl", "es", "it", "br"];
    for (const cc of countriesToTry) {
      result = await lookupZippo(cleaned, cc);
      if (result) break;
    }
  }

  cache.set(key, result);
  return result;
}