import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  Lock,
  Shield,
  Truck,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Visa, Mastercard, Amex, ApplePay, GPay, PayPalIcon } from "@/components/PaymentIcons";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import {
  useOrders,
  generateOrderId,
  generateTrackingId,
  createDefaultTrackingSteps,
} from "@/context/OrderContext";
import { lookupPincode } from "@/lib/pincode";
import { useLocation } from "@/context/LocationContext";
import PaymentScene, { CardBrand } from "@/components/payment/PaymentScene";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { location } = useLocation();
  const navigate = useNavigate();

  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });

  // Card Form State
  const [cardForm, setCardForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [detectedBrand, setDetectedBrand] = useState<CardBrand>("unknown");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "google_pay" | "paypal">("card");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authData, setAuthData] = useState<{
    authCode: string;
    refCode: string;
    network: string;
    issuer: string;
  } | null>(null);

  // Prefill from saved location if available
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

  const updateShipping = (field: string, val: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: val }));
  };

  const updateCard = (field: string, val: string) => {
    setCardForm((prev) => ({ ...prev, [field]: val }));
  };

  // Card number input formatting and brand detection
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    if (/^4/.test(raw)) setDetectedBrand("visa");
    else if (/^(5[1-5]|2[2-7])/.test(raw)) setDetectedBrand("mc");
    else if (/^3[47]/.test(raw)) setDetectedBrand("amex");
    else setDetectedBrand("unknown");

    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // Expiry date input formatting MM / YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardForm((prev) => ({ ...prev, expiry: `${raw.slice(0, 2)}/${raw.slice(2)}` }));
    } else {
      setCardForm((prev) => ({ ...prev, expiry: raw }));
    }
  };

  // CVV formatting
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxDigits = detectedBrand === "amex" ? 4 : 3;
    const raw = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
    setCardForm((prev) => ({ ...prev, cvv: raw }));
  };

  // Luhn Algorithm Card Check
  const validateLuhn = (num: string): boolean => {
    const digits = num.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  // Expiry date check
  const validateExpiry = (exp: string): boolean => {
    const match = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt(`20${match[2]}`, 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(year, month);
    return expDate > now;
  };

  // Express Method Click handler (Apple Pay / Google Pay / PayPal)
  const handleExpressPayment = (method: "apple_pay" | "google_pay" | "paypal") => {
    setPaymentMethod(method);
    if (!shippingForm.name) {
      setShippingForm((prev) => ({
        ...prev,
        name: "Alex Vance",
        email: prev.email || "alex.vance@example.com",
        phone: prev.phone || "+1 555-0199",
        address: prev.address || "1740 Broadway, 15th Fl",
        city: prev.city || "New York",
        state: prev.state || "NY",
        country: prev.country || "United States",
        zip: prev.zip || "10019",
      }));
    }
    setCardForm({
      cardName: shippingForm.name || "Alex Vance",
      cardNumber: "4532 8920 1029 4242",
      expiry: "12/28",
      cvv: "382",
    });
    setDetectedBrand("visa");
    toast.info(`Authorized with ${method === "apple_pay" ? "Apple Pay" : method === "google_pay" ? "Google Pay" : "PayPal"}`);
  };

  // Main Submit Validation & Trigger Animation
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Shipping Fields
    if (
      !shippingForm.name.trim() ||
      !shippingForm.email.trim() ||
      !shippingForm.address.trim() ||
      !shippingForm.city.trim() ||
      !shippingForm.country.trim()
    ) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    // 2. Validate Cardholder Name
    if (!cardForm.cardName.trim()) {
      toast.error("Please enter the name on your card.");
      return;
    }

    // 3. Validate Card Number with Luhn
    if (!validateLuhn(cardForm.cardNumber)) {
      toast.error("Please enter a valid credit or debit card number.");
      return;
    }

    // 4. Validate Expiry Date
    if (!validateExpiry(cardForm.expiry)) {
      toast.error("Card expiry date is invalid or expired (MM/YY).");
      return;
    }

    // 5. Validate CVV
    const minCvv = detectedBrand === "amex" ? 4 : 3;
    if (cardForm.cvv.length < minCvv) {
      toast.error(`Please enter a valid ${minCvv}-digit security code (CVV).`);
      return;
    }

    // Setup Auth Data
    const networkNames: Record<CardBrand, string> = {
      visa: "VisaNet Global",
      mc: "Mastercard Worldwide",
      amex: "American Express Network",
      unknown: "EMV International",
    };

    const issuingBanks = [
      "JPMorgan Chase & Co.",
      "Barclays Bank Private",
      "HSBC Premier Global",
      "BNP Paribas Wealth",
      "UBS Switzerland AG",
    ];

    setAuthData({
      authCode: `SN${Math.floor(1000 + Math.random() * 9000)}`,
      refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
      network: networkNames[detectedBrand],
      issuer: issuingBanks[Math.floor(Math.random() * issuingBanks.length)],
    });

    // Trigger Physical Card-to-Terminal Animation
    setIsProcessing(true);
  };

  // Final Order Completion (Invoked when terminal animation reaches Stage 6 Approval)
  const handleOrderComplete = () => {
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const deliveryDays = Math.floor(Math.random() * 4) + 4;
    const estimatedDelivery = new Date(
      Date.now() + deliveryDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const order = {
      id: crypto.randomUUID(),
      orderId,
      trackingId,
      customer: {
        name: shippingForm.name,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address: shippingForm.address,
        city: shippingForm.city,
        state: shippingForm.state,
        country: shippingForm.country,
        zip: shippingForm.zip,
      },
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        image: i.product.image,
        price: i.unitPrice !== undefined ? i.unitPrice : i.product.price || 0,
        qty: i.qty,
        selectedColor: i.selectedColor,
        selectedStorage: i.selectedStorage,
      })),
      subtotal,
      tax,
      total,
      status: "Processing",
      estimatedDelivery,
      placedAt: new Date().toISOString(),
      notes: "Priority Insured Air Express Freight · White-Glove Dispatch",
      paymentMethod: `${detectedBrand.toUpperCase()} •••• ${cardForm.cardNumber.slice(-4) || "4242"}`,
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
      trackingSteps: createDefaultTrackingSteps(shippingForm.city, shippingForm.country),
    };

    addOrder(order);
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Your Bag is Empty</h1>
        <p className="text-[14px] text-muted-foreground">Add products to your bag before proceeding to checkout.</p>
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
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Checkout Breadcrumb Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link to="/cart" className="hover:text-foreground transition-colors">
              Bag
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">Express Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Checkout & Insured Dispatch
          </h1>
        </div>

        <form onSubmit={handleSubmitPayment}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (7 cols): Customer & Payment Details */}
            <div className="lg:col-span-7 space-y-8">
              {/* Express Payment Methods */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                  Express One-Click Payment
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleExpressPayment("apple_pay")}
                    className="h-12 rounded-xl bg-black hover:bg-black/90 text-white flex items-center justify-center transition-all shadow-xs active:scale-[0.98]"
                    aria-label="Pay with Apple Pay"
                  >
                    <ApplePay className="h-6 w-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExpressPayment("google_pay")}
                    className="h-12 rounded-xl bg-white hover:bg-gray-50 border border-border flex items-center justify-center transition-all shadow-xs active:scale-[0.98]"
                    aria-label="Pay with Google Pay"
                  >
                    <GPay className="h-6 w-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExpressPayment("paypal")}
                    className="h-12 rounded-xl bg-[#003087] hover:bg-[#002569] text-white flex items-center justify-center transition-all shadow-xs active:scale-[0.98]"
                    aria-label="Pay with PayPal"
                  >
                    <PayPalIcon className="h-6 w-auto" />
                  </button>
                </div>
              </div>

              {/* Or Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-border w-full" />
                <span className="bg-background px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium shrink-0">
                  Or pay with card
                </span>
              </div>

              {/* Shipping Address Section */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-5">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <Truck className="w-4 h-4 text-primary" />
                  <h2 className="text-[15px] font-bold text-foreground">Delivery Information</h2>
                </div>

                <div className="space-y-4">
                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder="alex@example.com"
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingForm.phone}
                        onChange={(e) => updateShipping("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="shippingName"
                      required
                      value={shippingForm.name}
                      onChange={(e) => {
                        updateShipping("name", e.target.value);
                        if (!cardForm.cardName) updateCard("cardName", e.target.value);
                      }}
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
                      placeholder="1740 Broadway, Apt 15B"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Postal Code, City, Country */}
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
                        Country *
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
              </div>

              {/* Payment Card Section */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <h2 className="text-[15px] font-bold text-foreground">Payment Method</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Visa className="h-4 w-auto" />
                    <Mastercard className="h-4 w-auto" />
                    <Amex className="h-4 w-auto" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      required
                      value={cardForm.cardName}
                      onChange={(e) => updateCard("cardName", e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Card Number with Live Brand Detection */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        inputMode="numeric"
                        required
                        value={cardForm.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 •••• •••• ••••"
                        maxLength={19}
                        className="w-full h-12 pl-3.5 pr-14 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {detectedBrand === "visa" && <Visa className="h-4 w-auto" />}
                        {detectedBrand === "mc" && <Mastercard className="h-4 w-auto" />}
                        {detectedBrand === "amex" && <Amex className="h-4 w-auto" />}
                        {detectedBrand === "unknown" && (
                          <CreditCard className="w-5 h-5 text-muted-foreground/60" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        Expires *
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        inputMode="numeric"
                        required
                        value={cardForm.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[12px] font-semibold text-foreground">
                          Security Code *
                        </label>
                        <span className="text-[11px] text-muted-foreground">3 or 4 digits</span>
                      </div>
                      <input
                        type="password"
                        name="cardCvv"
                        inputMode="numeric"
                        required
                        value={cardForm.cvv}
                        onChange={handleCvvChange}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                  </div>

                  {/* Billing address match checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Billing address matches shipping address</span>
                    </label>
                  </div>
                </div>

                {/* Submit Pay Button */}
                <div className="pt-4 border-t border-border/60">
                  <button
                    type="submit"
                    className="w-full h-14 rounded-full bg-foreground text-background font-semibold text-[15px] sm:text-[16px] hover:bg-foreground/85 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ${total.toFixed(2)}</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Encrypted 256-bit SSL transaction · Insured air express dispatch</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
                <h2 className="text-[16px] font-bold text-foreground tracking-tight border-b border-border/60 pb-3">
                  Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
                </h2>

                {/* Items List */}
                <div className="divide-y divide-border/60 max-h-[360px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const itemPrice = item.unitPrice !== undefined ? item.unitPrice : item.product.price || 0;
                    return (
                      <div
                        key={item.lineId || item.product.id}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl border border-border/70 p-1 shrink-0 bg-white flex items-center justify-center">
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

                {/* Price Calculation Breakdown */}
                <div className="border-t border-border/60 pt-4 space-y-2.5 text-[13px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground tabular-nums">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Insured Air Express Freight</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT & Import Duties (20%)</span>
                    <span className="font-semibold text-foreground tabular-nums">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-baseline">
                    <span className="text-[15px] font-bold text-foreground">Total</span>
                    <span className="text-[20px] font-bold text-foreground tabular-nums">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Realistic Card-To-Terminal Processing Scene Animation */}
      <AnimatePresence>
        {isProcessing && authData && (
          <PaymentScene
            total={total}
            cardName={cardForm.cardName}
            cardNumber={cardForm.cardNumber}
            cardLast4={cardForm.cardNumber.replace(/\D/g, "").slice(-4)}
            expiry={cardForm.expiry}
            brand={detectedBrand}
            network={authData.network}
            issuer={authData.issuer}
            authCode={authData.authCode}
            refCode={authData.refCode}
            onDone={handleOrderComplete}
            onCancel={() => setIsProcessing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
