// Centralized Country Dialing Codes and Phone Number Formatting
// Supports India (+91), Czech Republic (+420), US, UK, and European destinations globally.

export interface CountryCodeOption {
  code: string;
  country: string;
  iso: string;
  flag: string;
  label: string;
  placeholder: string;
  formatPhone: (raw: string) => string;
}

// Indian mobile numbers: 10 digits, typically starting with 6, 7, 8, or 9
const formatIndianPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
};

// US/Canada: (XXX) XXX-XXXX
const formatNorthAmericanPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// Czech: XXX XXX XXX
const formatCzechPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    parts.push(digits.slice(i, i + 3));
  }
  return parts.join(" ");
};

// European generic: XXX XXX XXXX
const formatEuropeanPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    parts.push(digits.slice(i, Math.min(i + 3, digits.length)));
  }
  return parts.join(" ");
};

export const COUNTRY_CODES: CountryCodeOption[] = [
  {
    code: "+91",
    country: "India",
    iso: "IN",
    flag: "🇮🇳",
    label: "India (+91)",
    placeholder: "98765 43210",
    formatPhone: formatIndianPhone,
  },
  {
    code: "+420",
    country: "Czech Republic",
    iso: "CZ",
    flag: "🇨🇿",
    label: "Czech Republic (+420)",
    placeholder: "777 000 111",
    formatPhone: formatCzechPhone,
  },
  {
    code: "+1",
    country: "United States / Canada",
    iso: "US",
    flag: "🇺🇸",
    label: "US / CA (+1)",
    placeholder: "(555) 019-2834",
    formatPhone: formatNorthAmericanPhone,
  },
  {
    code: "+44",
    country: "United Kingdom",
    iso: "GB",
    flag: "🇬🇧",
    label: "UK (+44)",
    placeholder: "7911 123456",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+49",
    country: "Germany",
    iso: "DE",
    flag: "🇩🇪",
    label: "Germany (+49)",
    placeholder: "151 23456789",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+33",
    country: "France",
    iso: "FR",
    flag: "🇫🇷",
    label: "France (+33)",
    placeholder: "6 12 34 56 78",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+41",
    country: "Switzerland",
    iso: "CH",
    flag: "🇨🇭",
    label: "Switzerland (+41)",
    placeholder: "79 123 45 67",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+31",
    country: "Netherlands",
    iso: "NL",
    flag: "🇳🇱",
    label: "Netherlands (+31)",
    placeholder: "6 12345678",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+32",
    country: "Belgium",
    iso: "BE",
    flag: "🇧🇪",
    label: "Belgium (+32)",
    placeholder: "470 12 34 56",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+48",
    country: "Poland",
    iso: "PL",
    flag: "🇵🇱",
    label: "Poland (+48)",
    placeholder: "512 345 678",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+43",
    country: "Austria",
    iso: "AT",
    flag: "🇦🇹",
    label: "Austria (+43)",
    placeholder: "664 1234567",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+39",
    country: "Italy",
    iso: "IT",
    flag: "🇮🇹",
    label: "Italy (+39)",
    placeholder: "320 123 4567",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+34",
    country: "Spain",
    iso: "ES",
    flag: "🇪🇸",
    label: "Spain (+34)",
    placeholder: "612 34 56 78",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+81",
    country: "Japan",
    iso: "JP",
    flag: "🇯🇵",
    label: "Japan (+81)",
    placeholder: "90 1234 5678",
    formatPhone: formatEuropeanPhone,
  },
  {
    code: "+86",
    country: "China",
    iso: "CN",
    flag: "🇨🇳",
    label: "China (+86)",
    placeholder: "138 1234 5678",
    formatPhone: formatEuropeanPhone,
  },
];

export const getCountryByCode = (code: string): CountryCodeOption => {
  return COUNTRY_CODES.find((c) => c.code === code) || COUNTRY_CODES[0];
};

export const getCountryByIso = (iso: string): CountryCodeOption | undefined => {
  return COUNTRY_CODES.find((c) => c.iso.toLowerCase() === iso.toLowerCase());
};
