import React, { useState, useEffect } from "react";
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

const COUNTRY_CODES = [
  { code: "+1", label: "US / CA (+1)" },
  { code: "+420", label: "CZ (+420)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+49", label: "DE (+49)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+41", label: "CH (+41)" },
  { code: "+31", label: "NL (+31)" },
  { code: "+32", label: "BE (+32)" },
  { code: "+48", label: "PL (+48)" },
  { code: "+43", label: "AT (+43)" },
  { code: "+39", label: "IT (+39)" },
  { code: "+34", label: "ES (+34)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+86", label: "CN (+86)" },
];

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
      countryCode: "+1",
      phone: "",
      country: "United States",
      address: "",
      apartment: "",
      city: "",
      state: "",
      zip: "",
      deliveryMethod: "standard",
    };
  });

  // Prefill from saved location context if empty
  useEffect(() => {
    if (location && !shippingForm.zip) {
      setShippingForm((f) => ({
        ...f,
        zip: location.pincode,
        city: f.city || location.city,
        state: f.state || location.state,
        country: f.country || location.country,
      }));
    }
  }, [location]);

  const handleZipBlur = async () => {
    const zip = shippingForm.zip.trim();
    if (!zip || (shippingForm.city && shippingForm.country)) return;
    const result = await lookupPincode(zip);
    if (result) {
      setShippingForm((f) => ({
        ...f,
        city: f.city || result.city,
        state: f.state || result.state,
        country: f.country || result.country,
      }));
      toast.success(`Location detected: ${result.city}, ${result.country}`);
    }
  };

  const updateShipping = <K extends keyof DeliveryInfo>(field: K, val: DeliveryInfo[K]) => {
    setShippingForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required delivery details
    if (
      !shippingForm.email.trim() ||
      !shippingForm.name.trim() ||
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

                  {/* Phone with Country Code Selector */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Phone Number *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={shippingForm.countryCode}
                        onChange={(e) => updateShipping("countryCode", e.target.value)}
                        className="h-12 px-3 rounded-xl border border-border bg-background text-[16px] sm:text-[13px] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all shrink-0 w-32"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={shippingForm.phone}
                        onChange={(e) => updateShipping("phone", e.target.value)}
                        placeholder="(555) 019-2834"
                        className="flex-1 h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
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
                      placeholder="1740 Broadway"
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
                      placeholder="Floor 15, Suite 400"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Postal Code, City, State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        required
                        value={shippingForm.zip}
                        onChange={(e) => updateShipping("zip", e.target.value)}
                        onBlur={handleZipBlur}
                        placeholder="10019"
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
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
                        placeholder="New York"
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        State / Region
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingForm.state}
                        onChange={(e) => updateShipping("state", e.target.value)}
                        placeholder="NY"
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
                      placeholder="United States"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Delivery Options */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
                <div className="border-b border-border/60 pb-3">
                  <h2 className="text-[16px] font-bold text-foreground tracking-tight">
                    Shipping Method
                  </h2>
                </div>

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
                            Insured Air Express
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          Delivered in 3–5 business days via direct cargo manifest with continuous custody tracking.
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-emerald-600 shrink-0">
                      FREE
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
                        <span className="text-[14px] font-semibold text-foreground">
                          Priority White-Glove Courier
                        </span>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          Delivered in 2–3 business days with scheduled doorstep PIN verification.
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-emerald-600 shrink-0">
                      FREE
                    </span>
                  </label>
                </div>
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
                    <span>Insured Air Express Freight</span>
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

                {/* Value assurance note */}
                <div className="p-3 bg-secondary/50 rounded-xl border border-border/50 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Dispatches within 24 Hours
                  </p>
                  <p>All items packaged in sealed, tamper-evident factory boxes.</p>
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
