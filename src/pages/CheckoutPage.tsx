import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, X, CheckCircle, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrders, generateOrderId, generateTrackingId, createDefaultTrackingSteps } from "@/context/OrderContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import moonlightLogo from "@/assets/moonlight-logo.png";

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", country: "", zip: "",
  });
  const [step, setStep] = useState<"address" | "payment">("address");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "moonlight">("card");
  const [cardForm, setCardForm] = useState({ cardNumber: "", expiry: "", cvv: "", cardName: "" });
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const updateCard = (field: string, value: string) => setCardForm(prev => ({ ...prev, [field]: value }));

  const formatCardNumber = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 16);
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
    setShowProcessingAnimation(true);

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
      paymentMethod: paymentMethod === "card" ? "Credit Card" : "Moonlight Wealth Management",
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
      trackingSteps: createDefaultTrackingSteps(form.city, form.state, form.country),
    };

    setTimeout(() => {
      addOrder(order);
      clearCart();
      setShowProcessingAnimation(false);
      navigate(`/order-confirmation/${orderId}`);
    }, 3500);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const inputClass = "w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm font-rajdhani";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-orbitron text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleAddressSubmit} className="grid md:grid-cols-2 gap-8">
        {/* Shipping */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground font-orbitron text-sm tracking-wider">SHIPPING INFORMATION</h2>
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
              <input type="text" placeholder="ZIP/Postal Code" value={form.zip} onChange={e => update("zip", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-success shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">Secure & Encrypted</p>
              <p className="text-[10px] text-muted-foreground">Your data is protected with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground font-orbitron text-sm tracking-wider">ORDER SUMMARY</h2>
            {items.map(item => (
              <div key={item.product.id} className="flex gap-3">
                <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-contain rounded bg-muted/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{item.product.brand} · Qty: {item.qty}</p>
                </div>
                <p className="text-sm font-bold text-foreground font-orbitron">${(item.product.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success font-semibold">FREE</span></div>
              <div className="flex justify-between text-muted-foreground"><span>VAT (20%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg text-foreground">
                <span>Total</span><span className="font-orbitron gold-text">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full gold-gradient text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" /> Continue to Payment
          </button>

          <p className="text-center text-xs text-muted-foreground">
            📍 Ships from Prague, Czech Republic 🇨🇿 · Estimated 23-29 business days
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
              className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-orbitron text-foreground">Select Payment</h2>
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

                <button
                  type="button"
                  onClick={() => setPaymentMethod("moonlight")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "moonlight" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-background flex items-center justify-center">
                    <img src={moonlightLogo} alt="Moonlight" className="w-10 h-10 object-contain" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">Moonlight Wealth Management</p>
                    <p className="text-xs text-muted-foreground">Premium payment partner</p>
                  </div>
                  {paymentMethod === "moonlight" && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
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
                  <div className="flex gap-4 items-center justify-center py-2">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">VISA</span>
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">MASTERCARD</span>
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">AMEX</span>
                  </div>
                </div>
              )}

              {/* Moonlight info */}
              {paymentMethod === "moonlight" && (
                <div className="bg-muted rounded-xl p-4 flex items-center gap-4">
                  <img src={moonlightLogo} alt="Moonlight" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Moonlight Wealth Management</p>
                    <p className="text-xs text-muted-foreground">Premium payment processing. Your payment will be securely handled by Moonlight WM.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Lock className="w-3 h-3" /> 256-bit SSL Encrypted · Secure Payment
              </div>

              <button onClick={handlePayment}
                className="w-full gold-gradient text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity">
                Pay Now — ${total.toFixed(2)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Animation */}
      <AnimatePresence>
        {showProcessingAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background flex items-center justify-center"
          >
            <div className="text-center space-y-8 max-w-sm px-4">
              {/* Animated rings */}
              <div className="relative w-32 h-32 mx-auto">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-4 border-primary/50"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-4 border-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ borderTopColor: "transparent" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {paymentMethod === "moonlight" ? (
                    <img src={moonlightLogo} alt="Processing" className="w-14 h-14 object-contain" />
                  ) : (
                    <CreditCard className="w-10 h-10 text-primary" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <motion.p
                  className="text-xl font-bold font-orbitron text-foreground"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing Payment
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  {paymentMethod === "moonlight"
                    ? "Connecting to Moonlight Wealth Management..."
                    : "Verifying card details..."}
                </p>
                <motion.div className="w-48 h-1 bg-muted rounded-full mx-auto overflow-hidden">
                  <motion.div
                    className="h-full gold-gradient rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-success" />
                <span>Secure transaction in progress</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
