import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrders, generateOrderId, generateTrackingId, createDefaultTrackingSteps } from "@/context/OrderContext";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", country: "", zip: "",
    cardNumber: "", expiry: "", cvv: "",
  });
  const [processing, setProcessing] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address) {
      toast.error("Please fill in required fields");
      return;
    }
    setProcessing(true);

    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

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
      trackingSteps: createDefaultTrackingSteps(form.city, form.state, form.country),
    };

    setTimeout(() => {
      addOrder(order);
      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    }, 1500);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const inputClass = "w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-orbitron text-foreground mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground font-orbitron">Shipping Information</h2>
            <input type="text" placeholder="Full Name *" value={form.name} onChange={e => update("name", e.target.value)} className={inputClass} required />
            <input type="email" placeholder="Email *" value={form.email} onChange={e => update("email", e.target.value)} className={inputClass} required />
            <input type="tel" placeholder="Phone (with country code)" value={form.phone} onChange={e => update("phone", e.target.value)} className={inputClass} />
            <input type="text" placeholder="Street Address *" value={form.address} onChange={e => update("address", e.target.value)} className={inputClass} required />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City" value={form.city} onChange={e => update("city", e.target.value)} className={inputClass} />
              <input type="text" placeholder="State/Province" value={form.state} onChange={e => update("state", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Country" value={form.country} onChange={e => update("country", e.target.value)} className={inputClass} />
              <input type="text" placeholder="ZIP/Postal Code" value={form.zip} onChange={e => update("zip", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground font-orbitron flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h2>
            <input type="text" placeholder="Card Number" value={form.cardNumber} onChange={e => update("cardNumber", e.target.value)} className={inputClass} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="MM/YY" value={form.expiry} onChange={e => update("expiry", e.target.value)} className={inputClass} />
              <input type="text" placeholder="CVV" value={form.cvv} onChange={e => update("cvv", e.target.value)} className={inputClass} />
            </div>
            <div className="flex gap-3 text-muted-foreground text-xs items-center">
              <span className="font-bold">Visa</span>
              <span className="font-bold">Mastercard</span>
              <span className="font-bold">Amex</span>
              <span className="font-bold">Apple Pay</span>
              <span className="font-bold">PayPal</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> SSL Secured Payment
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground font-orbitron">Order Summary</h2>
            {items.map(item => (
              <div key={item.product.id} className="flex gap-3">
                <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-contain rounded bg-muted/30"
                  onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                </div>
                <p className="text-sm font-bold text-foreground">${(item.product.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success">FREE</span></div>
              <div className="flex justify-between text-muted-foreground"><span>VAT (20%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg text-foreground">
                <span>Total</span><span className="font-orbitron">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={processing}
            className="w-full gold-gradient text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {processing ? "Processing..." : `Pay Now — $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
