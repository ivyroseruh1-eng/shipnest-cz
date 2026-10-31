import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Lock, X, CheckCircle, Shield, Truck, Sparkles, ChevronRight, Info } from "lucide-react";
import { Visa, Mastercard, Amex, ApplePay, GPay } from "@/components/PaymentIcons";
import ProductImage from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";
import { useCart } from "@/context/CartContext";
import { useOrders, generateOrderId, generateTrackingId, createDefaultTrackingSteps } from "@/context/OrderContext";
import { lookupPincode } from "@/lib/pincode";
import { useLocation } from "@/context/LocationContext";
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
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
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
      toast.success(`Location detected: ${result.city}, ${result.country}`);
    }
  };

  const [cardForm, setCardForm] = useState({ cardNumber: "", expiry: "", cvv: "", cardName: "" });
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
      toast.error("Please fill in all required shipping fields");
      return;
    }
    // Pre-fill card name with recipient name
    if (!cardForm.cardName && form.name) {
      setCardForm(c => ({ ...c, cardName: form.name }));
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

  const fillTestCard = () => {
    setCardForm({
      cardName: form.name || "Alex Vance",
      cardNumber: "4532 0123 4567 8910",
      expiry: "12/28",
      cvv: "382",
    });
    setDetectedBrand("visa");
    toast.info("Express checkout payment details populated");
  };

  const handlePayment = () => {
    if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.cvv || !cardForm.cardName) {
      toast.error("Please complete all card fields");
      return;
    }
    if (!luhnCheck(cardForm.cardNumber)) {
      toast.error("Invalid card number. Please check card number.");
      return;
    }
    if (!validateExpiry(cardForm.expiry)) {
      toast.error("Card expiry date is invalid or expired.");
      return;
    }
    if (cardForm.cvv.replace(/\D/g, "").length < 3) {
      toast.error("Invalid CVV length.");
      return;
    }

    setShowPaymentModal(false);

    const issuers = ["Česká spořitelna", "Komerční banka", "Chase International", "Barclays Private", "HSBC Premier"];
    const networkLabel = detectedBrand === "visa" ? "VisaNet Europe" : detectedBrand === "mc" ? "Mastercard Worldwide" : detectedBrand === "amex" ? "Amex Global" : "Card Network";
    setIssuer(issuers[Math.floor(Math.random() * issuers.length)]);
    setNetwork(networkLabel);
    setAuthCode(Math.random().toString(36).slice(2, 8).toUpperCase());
    setRefCode(String(Math.floor(1000000 + Math.random() * 9000000)));

    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const deliveryDays = Math.floor(Math.random() * 6) + 5; // 5-11 business days
    const estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();

    const order = {
      id: crypto.randomUUID(),
      orderId,
      trackingId,
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        zip: form.zip,
      },
      items: items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        image: i.product.image,
        price: i.product.price || 0,
        qty: i.qty,
      })),
      subtotal,
      tax,
      total,
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

  const inputClass = "w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-[14px] transition-all";

  return (
    <div className="bg-background min-h-screen text-foreground py-10 lg:py-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-4">
          <Link to="/cart" className="hover:text-foreground transition-colors">Bag</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Checkout</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-8">
          Express Checkout
        </h1>

        {/* Security Notice */}
        <div className="mb-8 p-4 bg-secondary/40 border border-border rounded-2xl flex items-start gap-3">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-[12px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Secure Checkout Protection:</span> All transactions are protected by end-to-end 256-bit encryption. Card details are tokenized securely with zero raw data stored on external servers.
          </div>
        </div>

        <form onSubmit={handleAddressSubmit} className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Shipping Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h2 className="text-[18px] font-bold text-foreground tracking-tight">
                  1. Delivery Address
                </h2>
                <span className="text-[12px] text-primary font-medium flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Air Express Included
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1 block">Full Recipient Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">Email Address *</label>
                    <input
                      type="email"
                      placeholder="receipts@example.com"
                      value={form.email}
                      onChange={e => update("email", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">Contact Phone *</label>
                    <input
                      type="tel"
                      placeholder="+420 739 123 456"
                      value={form.phone}
                      onChange={e => update("phone", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1 block">Street Address *</label>
                  <input
                    type="text"
                    placeholder="e.g. Karlova 256/1, Flat 4B"
                    value={form.address}
                    onChange={e => update("address", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. 11000"
                      value={form.zip}
                      onChange={e => update("zip", e.target.value)}
                      onBlur={handleZipBlur}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">City *</label>
                    <input
                      type="text"
                      placeholder="Prague"
                      value={form.city}
                      onChange={e => update("city", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1 block">Country *</label>
                    <input
                      type="text"
                      placeholder="Czech Republic"
                      value={form.country}
                      onChange={e => update("country", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="bg-[#fafafc] border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-[12px] text-muted-foreground">
                <p className="font-semibold text-foreground">Verified Direct EU Custody</p>
                <p>Every device is insured against loss or damage until final delivery PIN confirmation.</p>
              </div>
            </div>
          </div>

          {/* Right Summary Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <h2 className="text-[18px] font-bold text-foreground tracking-tight">Order Review</h2>

              {/* Items preview list */}
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 divide-y divide-border/60">
                {items.map(item => (
                  <div key={item.product.id} className="pt-3.5 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-contain rounded-xl bg-secondary/50 p-1 border border-border/60 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{item.product.name}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.qty} · Sealed Box</p>
                    </div>
                    <span className="text-[14px] font-semibold text-foreground tabular-nums">
                      {item.product.price !== null ? `$${(item.product.price * item.qty).toFixed(2)}` : "Upon Inquiry"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-border pt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Worldwide Air Express</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT & Customs (20%)</span>
                  <span className="text-foreground font-semibold tabular-nums">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3.5 flex justify-between items-baseline text-foreground">
                  <span className="text-[16px] font-bold">Total</span>
                  <span className="text-2xl font-bold tracking-tight tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Payment Action */}
              <button
                type="submit"
                className="w-full bg-foreground text-background py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/85 transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Proceed to Payment (${total.toFixed(2)})
              </button>

              <div className="pt-2 text-center text-[11px] text-muted-foreground space-y-1">
                <p>Zero risk · 30-day return guarantee from date of delivery</p>
              </div>
            </div>
          </div>
        </form>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-3xl max-w-md w-full p-4 sm:p-7 space-y-6 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-border/70 pb-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-foreground">Payment Authorization</h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">Total due: ${total.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary"
                    aria-label="Close payment modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Express Autofill Bar */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Instant Autofill:</span> Quick fill payment method
                  </div>
                  <button
                    type="button"
                    onClick={fillTestCard}
                    className="bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                  >
                    Fill Test Card
                  </button>
                </div>

                {/* Card input form */}
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardForm.cardName}
                      onChange={e => updateCard("cardName", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-foreground">Card Number</label>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase ${detectedBrand !== "unknown" ? "text-primary" : "text-muted-foreground"}`}>
                          {detectedBrand !== "unknown" ? detectedBrand.toUpperCase() : "Card"}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="16-digit card number"
                        value={cardForm.cardNumber}
                        onChange={e => updateCard("cardNumber", formatCardNumber(e.target.value))}
                        className={`${inputClass} font-mono`}
                        maxLength={19}
                      />
                      <CreditCard className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-foreground mb-1 block">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={e => updateCard("expiry", formatExpiry(e.target.value))}
                        className={`${inputClass} font-mono`}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-foreground mb-1 block">Security CVV</label>
                      <input
                        type="password"
                        placeholder="3 or 4 digits"
                        value={cardForm.cvv}
                        onChange={e => updateCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className={`${inputClass} font-mono`}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {/* Accepted Brands strip */}
                  <div className="flex items-center justify-center gap-2 py-1 opacity-70">
                    <Visa />
                    <Mastercard />
                    <Amex />
                    <ApplePay />
                    <GPay />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePayment}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-semibold text-[14px] hover:bg-primary/90 transition-all shadow-sm active:scale-98"
                  >
                    Authorize & Place Order (${total.toFixed(2)})
                  </button>
                  <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> End-to-end 256-bit encrypted checkout
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Processing Sequence */}
        <AnimatePresence>
          {showProcessingAnimation && (
            <PaymentScene
              total={total}
              method="Credit Card"
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
    </div>
  );
};

export default CheckoutPage;
