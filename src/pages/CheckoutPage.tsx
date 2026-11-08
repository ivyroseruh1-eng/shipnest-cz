import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Truck,
  ChevronRight,
  ShieldCheck,
  Package,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { lookupPincode } from "@/lib/pincode";
import { useLocation } from "@/context/LocationContext";
import { COUNTRY_CODES, getCountryByCode } from "@/data/countryCodes";
import { isIndiaDestination, getShippingMethodMeta } from "@/lib/shipping";
import { toast } from "sonner";

export interface DeliveryInfo {
  email: string;
  name: string;
  countryCode: string;
  phone: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  deliveryMethod: "standard" | "priority";
}

export function applyShippingUpdate<K extends keyof DeliveryInfo>(
  previous: DeliveryInfo,
  field: K,
  value: DeliveryInfo[K]
): DeliveryInfo {
  const next = { ...previous, [field]: value };

  if (isIndiaDestination(next)) {
    next.deliveryMethod = "standard";
  }

  if (field === "country") {
    const country = String(value).toLowerCase();
    if (country.includes("india") || country === "in") next.countryCode = "+91";
    else if (country.includes("czech") || country.includes("cz")) next.countryCode = "+420";
    else if (country.includes("united states") || country === "usa" || country === "us") next.countryCode = "+1";
    else if (country.includes("united kingdom") || country === "uk" || country === "gb") next.countryCode = "+44";
    else if (country.includes("germany") || country === "de") next.countryCode = "+49";
    else {
      const found = COUNTRY_CODES.find(
        (c) =>
          c.country.toLowerCase() === country ||
          c.code.toLowerCase() === country ||
          c.dialCode === country
      );
      if (found) next.countryCode = found.code;
    }
  }

  if (field === "countryCode") {
    const found = getCountryByCode(String(value));
    if (found) next.country = found.country;
  }

  return next;
}

const CheckoutPage: React.FC = () => {
  const { items, subtotal } = useCart();
  const { location } = useLocation();
  const navigate = useNavigate();

  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  // Restore saved delivery info from sessionStorage if returning from /payment
  const [shippingForm, setShippingForm] = useState<DeliveryInfo>(() => {
    try {
      const saved = sessionStorage.getItem("shipnest-delivery-info");
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore parse failure
    }
    return {
      email: "",
      name: "",
      countryCode: "+420", // Defaults to Czech Republic (+420)
      phone: "",
      country: "Czech Republic",
      address: "",
      apartment: "",
      city: "",
      state: "",
      zip: "",
      deliveryMethod: "standard",
    };
  });

  // Check if destination is India
  const isIndia = useMemo(() => isIndiaDestination(shippingForm), [shippingForm]);
  const shippingMeta = useMemo(() => getShippingMethodMeta(isIndia), [isIndia]);

  // Selected country details for phone input formatting
  const currentCountry = useMemo(
    () => getCountryByCode(shippingForm.countryCode),
    [shippingForm.countryCode]
  );

  // Prefill from saved location context if empty
  useEffect(() => {
    if (location && !shippingForm.zip) {
      const isLocIndia = isIndiaDestination(location);
      setShippingForm((f) => ({
        ...f,
        zip: location.pincode,
        city: f.city || location.city,
        state: f.state || location.state,
        country: f.country || location.country,
        countryCode: isLocIndia ? "+91" : f.countryCode,
      }));
    }
  }, [location]);

  const handleZipBlur = async () => {
    const zip = shippingForm.zip.trim();
    if (!zip || (shippingForm.city && shippingForm.country)) return;
    const result = await lookupPincode(zip);
    if (result) {
      const isResultIndia = isIndiaDestination(result);
      setShippingForm((f) => ({
        ...f,
        city: f.city || result.city,
        state: f.state || result.state,
        country: f.country || result.country,
        countryCode: isResultIndia ? "+91" : f.countryCode,
      }));
      toast.success(`Location detected: ${result.city}, ${result.country}`);
    }
  };

  const updateShipping = <K extends keyof DeliveryInfo>(field: K, val: DeliveryInfo[K]) => {
    setShippingForm((prev) => applyShippingUpdate(prev, field, val));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = currentCountry.formatPhone(raw);
    updateShipping("phone", formatted);
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required delivery details
    if (
      !shippingForm.email.trim() ||
      !shippingForm.name.trim() ||
      !shippingForm.phone.trim() ||
      !shippingForm.address.trim() ||
      !shippingForm.city.trim() ||
      !shippingForm.zip.trim() ||
      !shippingForm.country.trim()
    ) {
      toast.error("Please fill in all required delivery fields.");
      return;
    }

    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      toast.error("Please enter a valid email address for your order confirmation.");
      return;
    }

    // Save delivery info to sessionStorage
    try {
      sessionStorage.setItem("shipnest-delivery-info", JSON.stringify(shippingForm));
    } catch {
      // Fallback
    }

    // Navigate to separate European Payment Gateway
    navigate("/payment");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
          <Package className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Your Bag is Empty</h1>
        <p className="text-[14px] text-muted-foreground">
          Add authentic flagships or certified luxury items to your bag before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-foreground/85 transition-colors"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-foreground py-6 sm:py-10 lg:py-14 w-full">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Apple-Style Minimalist Breadcrumb & Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link to="/cart" className="hover:text-foreground transition-colors">
              Review Bag
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">1. Delivery</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-muted-foreground/60">2. Payment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Checkout
          </h1>
          <p className="text-muted-foreground text-[13px] sm:text-[14px] mt-1">
            Where should we send your order?
          </p>
        </div>

        <form onSubmit={handleContinueToPayment}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (7 cols): Apple-Style Clean White Delivery Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* SECTION 1: Contact Information */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5">
                <div className="border-b border-border/60 pb-3">
                  <h2 className="text-[16px] font-bold text-foreground tracking-tight">
                    Contact Information
                  </h2>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    We'll email your receipt, flight manifest, and shipment tracking links here.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={shippingForm.email}
                      onChange={(e) => updateShipping("email", e.target.value)}
                      placeholder="alex.vance@example.com"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Phone with Global Country Code Selector including India (+91) */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Phone Number *
                    </label>
                    <div className="flex gap-2">
                      <select
                        aria-label="Country calling code"
                        value={shippingForm.countryCode}
                        onChange={(e) => updateShipping("countryCode", e.target.value)}
                        className="h-12 px-3 rounded-xl border border-border bg-background text-[16px] sm:text-[13px] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all shrink-0 w-36 sm:w-44"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={shippingForm.phone}
                        onChange={handlePhoneChange}
                        placeholder={currentCountry.placeholder}
                        className="flex-1 h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Required for air courier delivery verification and SMS dispatch alert.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Delivery Address */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5">
                <div className="border-b border-border/60 pb-3">
                  <h2 className="text-[16px] font-bold text-foreground tracking-tight">
                    Delivery Address
                  </h2>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Physical street address required. PO Boxes are not accepted for insured priority freight.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      name="shippingName"
                      required
                      value={shippingForm.name}
                      onChange={(e) => updateShipping("name", e.target.value)}
                      placeholder="Alex Vance"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={shippingForm.address}
                      onChange={(e) => updateShipping("address", e.target.value)}
                      placeholder="House number and street name"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Apartment / Suite */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Apartment, suite, unit, building, floor (optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={shippingForm.apartment}
                      onChange={(e) => updateShipping("apartment", e.target.value)}
                      placeholder="Apartment, suite, unit (optional)"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Postal Code, City, State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        Postal Code / PIN *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        required
                        value={shippingForm.zip}
                        onChange={(e) => updateShipping("zip", e.target.value)}
                        onBlur={handleZipBlur}
                        placeholder="ZIP / Postal code"
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={shippingForm.city}
                        onChange={(e) => updateShipping("city", e.target.value)}
                        placeholder="City / Town"
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        State / Province / Region
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingForm.state}
                        onChange={(e) => updateShipping("state", e.target.value)}
                        placeholder="State / Province / Region"
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Country / Territory *
                    </label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={shippingForm.country}
                      onChange={(e) => updateShipping("country", e.target.value)}
                      placeholder="Country / Region"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Centralized Shipping Method Selection */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
                <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                  <h2 className="text-[16px] font-bold text-foreground tracking-tight">
                    Shipping Method
                  </h2>
                  {isIndia && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-md flex items-center gap-1">
                      🇮🇳 India Delivery: 20–30 Days
                    </span>
                  )}
                </div>

                {isIndia ? (
                  <div className="space-y-4">
                    {/* Single Consolidated Shipping Option for India */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-foreground bg-secondary/30 ring-1 ring-foreground/15 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-4 h-4 rounded-full border-2 border-foreground flex items-center justify-center shrink-0">
                          <div className="w-2 h-2 rounded-full bg-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-semibold text-foreground">
                              {shippingMeta.standard.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md">
                              FREE
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-foreground/80 bg-secondary px-2 py-0.5 rounded border border-border/60">
                              20–30 days
                            </span>
                          </div>
                          <p className="text-[12.5px] text-muted-foreground mt-2 leading-relaxed">
                            International deliveries to India require export handling at origin, international air-cargo transportation, import customs clearance, and onward domestic distribution. After arriving in India, shipments pass through regional logistics hubs before reaching the destination city. Estimated delivery: 20–30 days.
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-emerald-600 shrink-0 pl-3">
                        FREE
                      </span>
                    </div>

                    {/* Logistics Stages Explanation */}
                    <div className="bg-secondary/40 border border-border/70 rounded-2xl p-4 sm:p-4.5 space-y-2.5 text-[12px] text-muted-foreground">
                      <p className="font-semibold text-foreground text-[12.5px] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        Why delivery takes 20–30 days to India
                      </p>
                      <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[11.5px] sm:text-[12px] text-muted-foreground/90 pl-1">
                        <li><strong className="text-foreground/90">Export handling & sorting:</strong> Consignment inspection and bonded packing at European logistics origin.</li>
                        <li><strong className="text-foreground/90">International air-cargo transport:</strong> Direct scheduled freight routing to Indian air logistics gateway.</li>
                        <li><strong className="text-foreground/90">Import customs clearance:</strong> Formal documentation, tariff assessment, and Indian customs processing.</li>
                        <li><strong className="text-foreground/90">Regional hub routing:</strong> Transfer from international gateway through regional distribution centers.</li>
                        <li><strong className="text-foreground/90">Final domestic delivery:</strong> White-glove transportation to your local PIN code with doorstep PIN verification.</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label
                      className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition-all ${
                        shippingForm.deliveryMethod === "standard"
                          ? "border-foreground bg-secondary/30 ring-1 ring-foreground/15"
                          : "border-border/80 hover:border-foreground/30 bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="standard"
                          checked={shippingForm.deliveryMethod === "standard"}
                          onChange={() => updateShipping("deliveryMethod", "standard")}
                          className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-foreground">
                              {shippingMeta.standard.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md">
                              {shippingMeta.standard.badge}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-foreground/80 bg-secondary px-1.5 py-0.2 rounded border border-border/60">
                              {shippingMeta.standard.estimate}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                            {shippingMeta.standard.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-emerald-600 shrink-0">
                        {shippingMeta.standard.cost}
                      </span>
                    </label>

                    <label
                      className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition-all ${
                        shippingForm.deliveryMethod === "priority"
                          ? "border-foreground bg-secondary/30 ring-1 ring-foreground/15"
                          : "border-border/80 hover:border-foreground/30 bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="priority"
                          checked={shippingForm.deliveryMethod === "priority"}
                          onChange={() => updateShipping("deliveryMethod", "priority")}
                          className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-foreground">
                              {shippingMeta.priority.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                              {shippingMeta.priority.badge}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-foreground/80 bg-secondary px-1.5 py-0.2 rounded border border-border/60">
                              {shippingMeta.priority.estimate}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                            {shippingMeta.priority.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-emerald-600 shrink-0">
                        {shippingMeta.priority.cost}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Main Continue Action Button */}
              <div>
                <button
                  type="submit"
                  className="w-full h-14 rounded-full bg-foreground text-background font-semibold text-[15px] sm:text-[16px] hover:bg-foreground/85 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Next: Choose your preferred payment method on our secure European gateway</span>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Apple-Style Order Review Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h2 className="text-[16px] font-bold text-foreground tracking-tight">
                    Order Summary
                  </h2>
                  <span className="text-[12px] text-muted-foreground font-medium">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-border/60 max-h-[360px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const itemPrice =
                      item.unitPrice !== undefined ? item.unitPrice : item.product.price || 0;
                    return (
                      <div
                        key={item.lineId || item.product.id}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl border border-border/70 p-1 shrink-0 bg-white flex items-center justify-center shadow-2xs">
                            <ProductImage
                              src={item.product.image}
                              fallbackImages={item.product.fallbackImages}
                              alt={item.product.name}
                              department={item.product.department}
                              category={item.product.category}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-foreground truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Qty: {item.qty} · {item.product.brand}
                            </p>
                            {(item.selectedColor || item.selectedStorage) && (
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                {item.selectedColor && (
                                  <span className="text-[10px] bg-secondary text-foreground px-1.5 py-0.2 rounded border border-border/50">
                                    {item.selectedColor}
                                  </span>
                                )}
                                {item.selectedStorage && (
                                  <span className="text-[10px] bg-primary/10 text-primary font-semibold px-1.5 py-0.2 rounded border border-primary/20">
                                    {item.selectedStorage}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[14px] font-bold text-foreground tabular-nums shrink-0">
                          ${(itemPrice * item.qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-border/60 pt-4 space-y-2.5 text-[13px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {isIndia ? "Insured Air Freight to India" : "Insured Air Express Freight"}
                    </span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT & Import Duties (20%)</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-baseline">
                    <span className="text-[15px] font-bold text-foreground">Total</span>
                    <span className="text-[20px] font-bold text-foreground tabular-nums">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Value assurance note with India-specific delivery timeline */}
                <div className="p-3 bg-secondary/50 rounded-xl border border-border/50 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {isIndia
                        ? "Delivery to India: 20–30 Days Guaranteed"
                        : "Dispatches within 24 Hours"}
                    </span>
                  </p>
                  <p>
                    {isIndia
                      ? "Direct cargo flight from Prague PRG to New Delhi IGI, cleared through Indian customs and dispatched to your local hub."
                      : "All items packaged in sealed, tamper-evident factory boxes."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
