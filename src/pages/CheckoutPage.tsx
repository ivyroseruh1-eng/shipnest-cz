import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, X, CheckCircle, Shield } from "lucide-react";
import PaymentIcons, { Visa, Mastercard, Amex, ApplePay, GPay } from "@/components/PaymentIcons";
import PaymentScene from "@/components/payment/PaymentScene";
import { useCart } from "@/context/CartContext";
import { useOrders, generateOrderId, generateTrackingId, createDefaultTrackingSteps } from "@/context/OrderContext";
import { lookupPincode } from "@/lib/pincode";
import { useLocation } from "@/context/LocationContext";
import { useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { location } = useLocation();
  const navigate = useNavigate();
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", country: "", zip: "",
  });

  // Prefill from saved location
  useEffect(() => {
    if (location && !form.zip) {
      setForm((f) => ({
        ...f,
        zip: location.pincode,
        city: f.city || location.city,
        state: f.state || location.state,
        country: f.country || location.country,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZipBlur = async () => {
    const zip = form.zip.trim();
    if (!zip || (form.city && form.country)) return;
    const result = await lookupPincode(zip);
    if (result) {
      setForm((f) => ({
        ...f,
        city: f.city || result.city,
        state: f.state || result.state,
        country: f.country || result.country,
      }));
      toast.success(`Detected ${result.city}, ${result.country}`);
    }
  };
  const [step, setStep] = useState<"address" | "payment">("address");
  const [cardForm, setCardForm] = useState({ cardNumber: "", expiry: "", cvv: "", cardName: "" });
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [refCode, setRefCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [network, setNetwork] = useState("");
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [detectedBrand, setDetectedBrand] = useState<"visa" | "mc" | "amex" | "unknown">("unknown");

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const updateCard = (field: string, value: string) => setCardForm(prev => ({ ...prev, [field]: value }));

  const formatCardNumber = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 16);
    // detect brand
    if (/^4/.test(nums)) setDetectedBrand("visa");
    else if (/^(5[1-5]|2[2-7])/.test(nums)) setDetectedBrand("mc");
    else if (/^3[47]/.test(nums)) setDetectedBrand("amex");
    else setDetectedBrand("unknown");
    return nums.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 4);
    if (nums.length >= 3) return nums.slice(0, 2) + "/" + nums.slice(2);
    return nums;
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address || !form.city || !form.country) {
      toast.error("Please fill in all required fields");
      return;
    }
    setShowPaymentModal(true);
  };

  const luhnCheck = (num: string) => {
    const digits = num.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (exp: string) => {
    const match = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt("20" + match[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(year, month);
    return expDate > now;
  };

  const handlePayment = () => {
    if (paymentMethod === "card") {
      if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.cvv || !cardForm.cardName) {
        toast.error("Please fill in all card details");
        return;
      }
      if (!luhnCheck(cardForm.cardNumber)) {
        toast.error("Invalid card number. Please check and try again.");
        return;
      }
      if (!validateExpiry(cardForm.expiry)) {
        toast.error("Card expired or invalid expiry date.");
        return;
      }
      if (cardForm.cvv.replace(/\D/g, "").length < 3) {
        toast.error("Invalid CVV.");
        return;
      }
    }
    setProcessing(true);
    setShowPaymentModal(false);

    const issuers = ["HDFC Bank", "ICICI Bank", "Axis Bank", "Chase", "HSBC", "Barclays", "Revolut"];
    const networkLabel = detectedBrand === "visa" ? "VisaNet" : detectedBrand === "mc" ? "Mastercard Network" : detectedBrand === "amex" ? "Amex SafeKey" : "Card Network";
    setIssuer(issuers[Math.floor(Math.random() * issuers.length)]);
    setNetwork(networkLabel);
    setAuthCode(Math.random().toString(36).slice(2, 8).toUpperCase());
    setRefCode(String(Math.floor(1000000 + Math.random() * 9000000)));

    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const minDays = 23;
    const maxDays = 29;
    const deliveryDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();

    const order = {
      id: crypto.randomUUID(),
      orderId,
      trackingId,
      customer: {
        name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city, state: form.state,
        country: form.country, zip: form.zip,
      },
      items: items.map(i => ({
        productId: i.product.id, name: i.product.name, brand: i.product.brand,
        image: i.product.image, price: i.product.price, qty: i.qty,
      })),
      subtotal, tax, total,
      status: "Order Placed",
      estimatedDelivery,
      placedAt: new Date().toISOString(),
      notes: "",
      paymentMethod: "Credit Card",
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
      trackingSteps: createDefaultTrackingSteps(form.city, form.state, form.country),
    };
    setPendingOrder(order);
    setShowProcessingAnimation(true);
  };

  const handlePaymentSceneDone = () => {
    if (!pendingOrder) return;
    addOrder(pendingOrder);
    clearCart();
    setShowProcessingAnimation(false);
    navigate(`/order-confirmation/${pendingOrder.orderId}`);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const inputClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary text-[14px]";

  return (
    <div className="max-w-[980px] mx-auto px-4 py-12">
      <h1 className="display text-4xl sm:text-5xl text-foreground text-center mb-10">Checkout</h1>

      <form onSubmit={handleAddressSubmit} className="grid md:grid-cols-2 gap-8">
        {/* Shipping */}
        <div className="space-y-6">
          <div className="bg-secondary rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-[15px]">Shipping Information</h2>
            <input type="text" placeholder="Full Name *" value={form.name} onChange={e => update("name", e.target.value)} className={inputClass} required />
            <input type="email" placeholder="Email Address *" value={form.email} onChange={e => update("email", e.target.value)} className={inputClass} required />
            <input type="tel" placeholder="Phone (with country code)" value={form.phone} onChange={e => update("phone", e.target.value)} className={inputClass} />
            <input type="text" placeholder="Street Address *" value={form.address} onChange={e => update("address", e.target.value)} className={inputClass} required />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City *" value={form.city} onChange={e => update("city", e.target.value)} className={inputClass} required />
              <input type="text" placeholder="State/Province" value={form.state} onChange={e => update("state", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Country *" value={form.country} onChange={e => update("country", e.target.value)} className={inputClass} required />
              <input type="text" placeholder="ZIP/Postal Code" value={form.zip}
                onChange={e => update("zip", e.target.value)}
                onBlur={handleZipBlur}
                className={inputClass} />
            </div>
            <p className="text-[11px] text-muted-foreground -mt-1">Tip: enter your postal code first — we'll auto-fill the rest.</p>
          </div>

          <div className="bg-secondary rounded-2xl p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-success shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">Secure & Encrypted</p>
              <p className="text-[11px] text-muted-foreground">Your data is protected with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-secondary rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-[15px]">Order Summary</h2>
            {items.map(item => (
              <div key={item.product.id} className="flex gap-3">
                <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-contain rounded bg-background p-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-foreground truncate font-medium">{item.product.name}</p>
                  <p className="text-[12px] text-muted-foreground">{item.product.brand} · Qty: {item.qty}</p>
                </div>
                <p className="text-[14px] font-semibold text-foreground">${(item.product.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-2 text-[14px]">
              <div className="flex justify-between text-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-foreground"><span>Shipping</span><span className="text-success font-medium">FREE</span></div>
              <div className="flex justify-between text-foreground"><span>VAT (20%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-[18px] text-foreground">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-[15px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Continue to Payment
          </button>

          <p className="text-center text-[12px] text-muted-foreground">
            Ships from Prague, Czech Republic · Estimated 23-29 business days
          </p>
        </div>
      </form>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border border-border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-foreground">Select Payment</h2>
                <button onClick={() => setShowPaymentModal(false)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              {/* Payment method selection */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-glow to-accent flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                  {paymentMethod === "card" && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                </button>
              </div>

              {/* Card form - only for credit card */}
              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <input type="text" placeholder="Cardholder Name" value={cardForm.cardName}
                    onChange={e => updateCard("cardName", e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Card Number" value={cardForm.cardNumber}
                    onChange={e => updateCard("cardNumber", formatCardNumber(e.target.value))} className={inputClass} maxLength={19} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" value={cardForm.expiry}
                      onChange={e => updateCard("expiry", formatExpiry(e.target.value))} className={inputClass} maxLength={5} />
                    <input type="text" placeholder="CVV" value={cardForm.cvv}
                      onChange={e => updateCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))} className={inputClass} maxLength={4} />
                  </div>
                  <div className="flex gap-2 items-center justify-center py-2">
                    {[
                      { key: "visa", el: <Visa /> },
                      { key: "mc", el: <Mastercard /> },
                      { key: "amex", el: <Amex /> },
                    ].map(b => (
                      <div key={b.key} className={`h-9 px-3 rounded-md bg-white border flex items-center justify-center transition-all ${detectedBrand === b.key ? "border-primary shadow-md scale-110" : "border-border opacity-50"}`}>
                        {b.el}
                      </div>
                    ))}
                    <ApplePay />
                    <GPay />
                  </div>
                </div>
              )}

              {/* Moonlight info */}
              {paymentMethod === "moonlight" && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-xl p-4 flex items-center gap-4">
                    <img src={moonlightLogo} alt="Moonlight" className="w-14 h-14 object-contain" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Moonlight Wealth Management</p>
                      <p className="text-xs text-muted-foreground">Enter the 6-digit authorization PIN issued by your Moonlight relationship manager.</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit Moonlight PIN"
                    value={moonlightPin}
                    onChange={e => setMoonlightPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={`${inputClass} tracking-[0.5em] text-center font-mono text-lg`}
                    maxLength={6}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Lock className="w-3 h-3" /> 256-bit SSL Encrypted · Secure Payment
              </div>

              <button onClick={handlePayment}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-[15px] hover:bg-primary/90 transition-colors">
                Pay Now — ${total.toFixed(2)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Animation */}
      <AnimatePresence>
        {showProcessingAnimation && (
          <PaymentScene
            total={total}
            method={paymentMethod}
            brand={detectedBrand}
            cardLast4={cardForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242"}
            issuer={issuer}
            network={network}
            authCode={authCode}
            refCode={refCode}
            onDone={handlePaymentSceneDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
