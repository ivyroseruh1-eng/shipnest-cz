import { useParams, Link } from "react-router-dom";
import { CheckCircle, Copy, Package, ShoppingCart, MapPin, CreditCard, Calendar, User, Truck, Lock } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import moonlightLogo from "@/assets/moonlight-logo.png";

const getCzechTime = () => {
  return new Date().toLocaleString("en-GB", { timeZone: "Europe/Prague" });
};

const formatDeliveryRange = (estDate: string) => {
  const d = new Date(estDate);
  const from = new Date(d);
  from.setDate(from.getDate() - 3);
  const to = new Date(d);
  to.setDate(to.getDate() + 3);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${from.toLocaleDateString("en-GB", opts)} — ${to.toLocaleDateString("en-GB", opts)}`;
};

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { getOrder } = useOrders();
  const order = getOrder(orderId || "");

  if (!order) return <div className="text-center py-20 text-foreground">Order not found</div>;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const paymentMethod = (order as any).paymentMethod || "Credit Card";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success animation */}
      <motion.div className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <div className="w-24 h-24 rounded-full gold-gradient mx-auto flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-primary-foreground" />
          </div>
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-foreground">Order Confirmed!</h1>
        <p className="text-muted-foreground text-sm">Thank you for your purchase. Your order is being prepared at our Prague warehouse.</p>
      </motion.div>

      {/* Tracking & Order IDs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-muted rounded-xl p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground font-orbitron tracking-widest">TRACKING ID</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-orbitron gold-text">{order.trackingId}</span>
              <button onClick={() => copyToClipboard(order.trackingId, "Tracking ID")}
                className="p-1.5 rounded-lg bg-background hover:bg-primary/20 transition-colors">
                <Copy className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground font-orbitron tracking-widest">ORDER ID</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-orbitron text-foreground">{order.orderId}</span>
              <button onClick={() => copyToClipboard(order.orderId, "Order ID")}
                className="p-1.5 rounded-lg bg-background hover:bg-primary/20 transition-colors">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delivery PIN */}
      {order.deliveryPin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-2xl p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-semibold">Delivery Verification PIN</p>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-4xl sm:text-5xl font-black tracking-[0.4em] text-primary tabular-nums">{order.deliveryPin}</span>
            <button onClick={() => copyToClipboard(order.deliveryPin!, "PIN")} className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors shrink-0">
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share this 4-digit PIN <strong>only with the delivery agent at your door</strong> to confirm receipt. Never share over phone, email, or message.
          </p>
        </motion.div>
      )}

      {/* Order Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold font-orbitron text-foreground text-sm tracking-wider">ORDER DETAILS</h2>
        </div>

        {/* Items */}
        <div className="p-5 space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-muted/30" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.brand} · Qty: {item.qty}</p>
              </div>
              <p className="font-bold font-orbitron text-foreground">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Info grid */}
        <div className="border-t border-border p-5 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Recipient</p>
              <p className="text-foreground font-semibold">{order.customer.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Shipping Address</p>
              <p className="text-foreground font-semibold text-xs leading-relaxed">
                {order.customer.address}, {order.customer.city}{order.customer.state ? `, ${order.customer.state}` : ""}, {order.customer.country} {order.customer.zip}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Estimated Delivery</p>
              <p className="text-foreground font-semibold text-xs">{formatDeliveryRange(order.estimatedDelivery)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Ships From</p>
              <p className="text-foreground font-semibold text-xs">Prague, Czech Republic 🇨🇿</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            {paymentMethod === "Moonlight Wealth Management" ? (
              <img src={moonlightLogo} alt="Moonlight" className="w-4 h-4 object-contain mt-0.5 shrink-0" />
            ) : (
              <CreditCard className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-muted-foreground text-xs">Payment Method</p>
              <p className="text-foreground font-semibold text-xs">{paymentMethod}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Order Placed</p>
              <p className="text-foreground font-semibold text-xs">{getCzechTime()}</p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-border p-5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Total Paid</span>
            <span className="text-2xl font-black font-orbitron gold-text">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/track/${order.trackingId}`}
          className="gold-gradient text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90">
          <Package className="w-5 h-5" /> Track Order
        </Link>
        <Link to="/shop"
          className="border border-border text-foreground px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muted transition-colors">
          <ShoppingCart className="w-5 h-5" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
