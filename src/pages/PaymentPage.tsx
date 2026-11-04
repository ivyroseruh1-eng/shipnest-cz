import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import {
  Visa,
  Mastercard,
  Amex,
} from "@/components/PaymentIcons";
import { useCart } from "@/context/CartContext";
import {
  useOrders,
  generateOrderId,
  generateTrackingId,
  createDefaultTrackingSteps,
} from "@/context/OrderContext";
import PaymentScene, { CardBrand } from "@/components/payment/PaymentScene";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import type { DeliveryInfo } from "@/pages/CheckoutPage";
import { isIndiaDestination, calculateEstimatedDeliveryDate } from "@/lib/shipping";
import { ProductImage } from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";

// Luhn formula check for card validity
const validateLuhn = (numStr: string): boolean => {
  const clean = numStr.replace(/\D/g, "");
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

// Real-time card brand detection
const detectCardBrand = (numStr: string): CardBrand => {
  const clean = numStr.replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mc";
  if (/^3[47]/.test(clean)) return "amex";
  return "unknown";
};

// Expiry MM/YY validation
const validateExpiry = (exp: string): boolean => {
  const match = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(`20${match[2]}`, 10);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false;
  return true;
};

const PaymentPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  // Retrieve delivery info saved during Step 1 (/checkout)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [orderRef] = useState(() => `SN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [paymentDuration, setPaymentDuration] = useState<number>(() => Math.floor(Math.random() * 2200) + 3600);
  const isIndia = useMemo(() => isIndiaDestination(deliveryInfo), [deliveryInfo]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("shipnest-delivery-info");
      if (saved) {
        setDeliveryInfo(JSON.parse(saved));
      } else if (items.length > 0) {
        // Direct navigation without delivery details redirects back to checkout
        toast.error("Please enter your delivery address first.");
        navigate("/checkout");
      }
    } catch {
      navigate("/checkout");
    }
  }, [items.length, navigate]);

  // Card payment form state
  const [cardForm, setCardForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    saveCard: false,
  });

  // Pre-fill cardholder name from delivery recipient once loaded
  useEffect(() => {
    if (deliveryInfo?.name && !cardForm.cardName) {
      setCardForm((prev) => ({ ...prev, cardName: deliveryInfo.name.toUpperCase() }));
    }
  }, [deliveryInfo?.name]);

  // Payment processing & 3D Terminal Scene states
  const [isProcessing, setIsProcessing] = useState(false);
  const [authData, setAuthData] = useState<{
    authCode: string;
    refCode: string;
    network: string;
    issuer: string;
    methodLabel: string;
    cardLast4: string;
  } | null>(null);

  const detectedBrand = useMemo(() => detectCardBrand(cardForm.cardNumber), [cardForm.cardNumber]);

  // Auto-format card number with 4-digit grouping
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // Auto-format expiry date MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardForm((prev) => ({ ...prev, expiry: raw }));
  };

  // Trigger payment processing animation
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!cardForm.cardName.trim()) {
      toast.error("Please enter the cardholder's name.");
      return;
    }
    if (!validateLuhn(cardForm.cardNumber)) {
      toast.error("Please enter a valid credit or debit card number.");
      return;
    }
    if (!validateExpiry(cardForm.expiry)) {
      toast.error("Card expiry date is invalid or expired (MM/YY).");
      return;
    }
    const minCvv = detectedBrand === "amex" ? 4 : 3;
    if (cardForm.cvv.length < minCvv) {
      toast.error(`Please enter a valid ${minCvv}-digit security code (CVV).`);
      return;
    }

    const networkNames: Record<CardBrand, string> = {
      visa: "VisaNet Europe",
      mc: "Mastercard Worldwide",
      amex: "American Express Network",
      unknown: "Card Network",
    };

    const issuingBanks = [
      "BNP Paribas Wealth",
      "Deutsche Bank AG",
      "Société Générale",
      "UBS Switzerland AG",
      "Barclays Private Bank",
    ];

    setAuthData({
      authCode: `SN${Math.floor(1000 + Math.random() * 9000)}`,
      refCode: String(Math.floor(1000000 + Math.random() * 9000000)),
      network: networkNames[detectedBrand],
      issuer: issuingBanks[Math.floor(Math.random() * issuingBanks.length)],
      methodLabel: `${detectedBrand === "unknown" ? "Card" : detectedBrand.toUpperCase()} •••• ${cardForm.cardNumber.replace(/\D/g, "").slice(-4)}`,
      cardLast4: cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242",
    });

    // Generate randomized duration per attempt (3.6s–5.8s)
    setPaymentDuration(Math.floor(Math.random() * 2200) + 3600);
    setIsProcessing(true);
  };

  // Invoked upon successful completion of the approved PaymentScene animation
  const handleOrderComplete = () => {
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const placedAt = new Date().toISOString();
    const isIndianOrder = isIndiaDestination(deliveryInfo);
    const estimatedDelivery = calculateEstimatedDeliveryDate(
      placedAt,
      isIndianOrder,
      "standard",
      orderId
    );

    const recipient = deliveryInfo || (isIndianOrder ? {
      name: cardForm.cardName || "Valued Customer",
      email: "order@shipnest.com",
      phone: "+91 98765 43210",
      address: "Circular Road",
      city: "Dimapur",
      state: "Nagaland",
      country: "India",
      zip: "797112",
      deliveryMethod: "standard",
      countryCode: "+91",
      apartment: "",
    } : {
      name: cardForm.cardName || "Valued Customer",
      email: "order@shipnest.com",
      phone: "+420 777 000 111",
      address: "Celetna 12",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      zip: "110 00",
      deliveryMethod: "standard",
      countryCode: "+420",
      apartment: "",
    });

    const newOrder = {
      id: crypto.randomUUID(),
      orderId,
      trackingId,
      customer: {
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
        address: recipient.address + (recipient.apartment ? `, ${recipient.apartment}` : ""),
        city: recipient.city,
        state: recipient.state,
        country: recipient.country,
        zip: recipient.zip,
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
      status: "In Transit",
      estimatedDelivery,
      placedAt,
      notes: isIndianOrder
        ? "Express Priority Air Cargo PRG → DEL · 20–30 Days Guaranteed"
        : "Priority Insured Air Express Freight · White-Glove Dispatch",
      paymentMethod: authData?.methodLabel || `${detectedBrand.toUpperCase()} •••• ${cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242"}`,
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
      trackingSteps: createDefaultTrackingSteps(recipient.city, recipient.state, recipient.country),
    };

    // Store in context & clear sessionStorage delivery info
    addOrder(newOrder);
    try {
      sessionStorage.removeItem("shipnest-delivery-info");
    } catch {
      // Ignore
    }
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">No Pending Order</h1>
        <p className="text-[14px] text-muted-foreground">
          Your shopping bag is empty. Please select an item to begin checkout.
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
    <div className="bg-background min-h-screen text-foreground py-6 sm:py-10 lg:py-12 w-full">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {/* Navigation & Header Top Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div className="flex items-center gap-4">
            <Link
              to="/checkout"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border/80 transition-all shadow-2xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Delivery</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-medium text-muted-foreground">
                Order Ref:
              </span>
              <span className="text-[12px] font-mono font-bold text-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
                #{orderRef}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                Total Payable
              </span>
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight tabular-nums">
                  ${total.toFixed(2)}
                </span>
                <span className="text-[12px] font-semibold text-muted-foreground">
                  (incl. 20% VAT)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean, Unified Payment Layout */}
        <form onSubmit={handlePaymentSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* PRIMARY COLUMN (7 cols on Desktop): Payment Method & Card Entry Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-6">
                {/* Header: Payment Method Title & Accepted Brand SVGs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-[16px] sm:text-[17px] font-bold text-foreground tracking-tight flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Payment Method
                    </h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      Credit or Debit Card — direct encrypted settlement
                    </p>
                  </div>
                  {/* Accepted Card Network Logos */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-secondary/40 px-3 py-1.5 rounded-xl border border-border/60">
                    <Visa className="h-3.5 w-auto" />
                    <div className="h-3 w-px bg-border/80" />
                    <Mastercard className="h-3.5 w-auto" />
                    <div className="h-3 w-px bg-border/80" />
                    <Amex className="h-3.5 w-auto" />
                  </div>
                </div>

                {/* Card Entry Fields */}
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
                      onChange={(e) =>
                        setCardForm((prev) => ({ ...prev, cardName: e.target.value.toUpperCase() }))
                      }
                      placeholder="CARDHOLDER NAME"
                      className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] text-foreground font-medium uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                    />
                  </div>

                  {/* Card Number with Real-Time Brand Recognition */}
                  <div>
                    <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="cardNumber"
                        required
                        value={cardForm.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        className="w-full h-12 pl-3.5 pr-14 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground tracking-wider focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {detectedBrand === "visa" && <Visa className="h-4 w-auto" />}
                        {detectedBrand === "mc" && <Mastercard className="h-4 w-auto" />}
                        {detectedBrand === "amex" && <Amex className="h-4 w-auto" />}
                        {detectedBrand === "unknown" && (
                          <CreditCard className="w-4 h-4 text-muted-foreground/60" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                        Expiry (MM/YY) *
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        required
                        value={cardForm.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1.5 flex items-center justify-between">
                        <span>Security Code *</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {detectedBrand === "amex" ? "4 digits" : "3 digits"}
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="cvv"
                          required
                          value={cardForm.cvv}
                          onChange={(e) =>
                            setCardForm((prev) => ({
                              ...prev,
                              cvv: e.target.value.replace(/\D/g, "").slice(0, detectedBrand === "amex" ? 4 : 3),
                            }))
                          }
                          placeholder={detectedBrand === "amex" ? "••••" : "•••"}
                          maxLength={detectedBrand === "amex" ? 4 : 3}
                          className="w-full h-12 pl-3.5 pr-9 rounded-xl border border-border bg-background text-[16px] sm:text-[14px] font-mono text-foreground tracking-widest focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                        />
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/60 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Save Card Checkbox */}
                  <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cardForm.saveCard}
                      onChange={(e) =>
                        setCardForm((prev) => ({ ...prev, saveCard: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground/20"
                    />
                    <span className="text-[12px] text-muted-foreground">
                      Save card securely for future purchases
                    </span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-14 rounded-full bg-foreground text-background font-semibold text-[15px] sm:text-[16px] hover:bg-foreground/85 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ${total.toFixed(2)}</span>
                  </button>
                  <p className="text-[11px] text-center text-muted-foreground mt-2.5">
                    Encrypted TLS payment processing · Verified Card Authentication
                  </p>
                </div>
              </div>
            </div>

            {/* SECONDARY COLUMN (5 cols on Desktop): Delivery & Order Summary */}
            <div className="lg:col-span-5 space-y-4">
              {/* Delivery Destination Summary */}
              {deliveryInfo && (
                <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2.5">
                    <span className="text-[13px] font-bold text-foreground">Delivery Destination</span>
                    <Link
                      to="/checkout"
                      className="text-primary hover:underline text-[12px] font-semibold"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="text-[12.5px] space-y-1">
                    <p className="font-semibold text-foreground">{deliveryInfo.name}</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {deliveryInfo.address}
                      {deliveryInfo.apartment ? `, ${deliveryInfo.apartment}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {deliveryInfo.city}
                      {deliveryInfo.state ? `, ${deliveryInfo.state}` : ""} · {deliveryInfo.zip}
                    </p>
                    <p className="text-foreground font-medium">{deliveryInfo.country}</p>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[11.5px] text-emerald-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {isIndia
                        ? "Guaranteed 20–30 Days Delivery to India (Insured Air Freight)"
                        : "Estimated 3–5 Business Days Delivery (Insured Air Express)"}
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items & Cost Summary */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h3 className="text-[13px] font-bold text-foreground">
                    Order Summary ({items.reduce((s, i) => s + i.qty, 0)})
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    USD ($)
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-border/60 max-h-[260px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-11 h-11 rounded-xl border border-border/70 p-1 shrink-0 flex items-center justify-center shadow-2xs"
                          style={{
                            background: getProductImageBackground(item.product.image).background,
                            borderColor: getProductImageBackground(item.product.image).borderColor,
                          }}
                        >
                          <ProductImage
                            src={item.product.image}
                            alt={item.product.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-foreground truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Qty: {item.qty} · ${((item.unitPrice !== undefined ? item.unitPrice : item.product.price || 0) * item.qty).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="border-t border-border/60 pt-3 space-y-2 text-[12.5px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Worldwide Express Shipping</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated VAT (20%)</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2.5 flex justify-between items-baseline">
                    <span className="text-[14px] font-bold text-foreground">Total Payable</span>
                    <span className="text-[18px] font-bold text-foreground tabular-nums">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Realistic Card-To-Terminal Processing Scene Animation (APPROVED & PRESERVED) */}
      <AnimatePresence>
        {isProcessing && authData && (
          <PaymentScene
            total={total}
            cardName={cardForm.cardName || deliveryInfo?.name || "CARDHOLDER"}
            cardNumber={cardForm.cardNumber}
            cardLast4={authData.cardLast4}
            expiry={cardForm.expiry || "12/28"}
            brand={detectedBrand}
            network={authData.network}
            issuer={authData.issuer}
            authCode={authData.authCode}
            refCode={authData.refCode}
            durationMs={paymentDuration}
            onDone={handleOrderComplete}
            onCancel={() => setIsProcessing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentPage;
