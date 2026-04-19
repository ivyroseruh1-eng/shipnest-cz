import { useParams, Link } from "react-router-dom";
import { CheckCircle, Copy, Package, ShoppingBag, MapPin, CreditCard, Calendar, User, Truck, Lock } from "lucide-react";
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
    <div className="max-w-[680px] mx-auto px-4 py-12 space-y-6">
      {/* Success */}
      <motion.div className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>
        <h1 className="display text-4xl sm:text-5xl text-foreground">Thank you.</h1>
        <p className="text-muted-foreground text-[15px]">Your order is confirmed and being prepared at our Prague warehouse.</p>
      </motion.div>

      {/* IDs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-secondary rounded-2xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-background rounded-xl p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">Tracking ID</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-foreground tracking-tight">{order.trackingId}</span>
              <button onClick={() => copyToClipboard(order.trackingId, "Tracking ID")}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="bg-background rounded-xl p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">Order ID</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">{order.orderId}</span>
              <button onClick={() => copyToClipboard(order.orderId, "Order ID")}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PIN */}
      {order.deliveryPin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-semibold">Delivery Verification PIN</p>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-4xl sm:text-5xl font-semibold tracking-[0.4em] text-primary tabular-nums">{order.deliveryPin}</span>
            <button onClick={() => copyToClipboard(order.deliveryPin!, "PIN")} className="p-2 rounded-lg bg-background hover:bg-secondary transition-colors shrink-0">
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Share this 4-digit PIN <strong>only with the delivery agent at your door</strong> to confirm receipt. Never share over phone, email, or message.
          </p>
        </motion.div>
      )}

      {/* Order Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-secondary rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground text-[15px]">Order Details</h2>
        </div>

        <div className="p-5 space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-background p-1" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-foreground">{item.name}</p>
                <p className="text-[12px] text-muted-foreground">{item.brand} · Qty: {item.qty}</p>
              </div>
              <p className="font-semibold text-foreground">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-5 grid grid-cols-2 gap-4 text-[13px]">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">Recipient</p>
              <p className="text-foreground font-medium">{order.customer.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">Shipping Address</p>
              <p className="text-foreground font-medium text-[12px] leading-relaxed">
                {order.customer.address}, {order.customer.city}{order.customer.state ? `, ${order.customer.state}` : ""}, {order.customer.country} {order.customer.zip}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">Estimated Delivery</p>
              <p className="text-foreground font-medium text-[12px]">{formatDeliveryRange(order.estimatedDelivery)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">Ships From</p>
              <p className="text-foreground font-medium text-[12px]">Prague, Czech Republic 🇨🇿</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            {paymentMethod === "Moonlight Wealth Management" ? (
              <img src={moonlightLogo} alt="Moonlight" className="w-4 h-4 object-contain mt-0.5 shrink-0" />
            ) : (
              <CreditCard className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-muted-foreground text-[11px]">Payment Method</p>
              <p className="text-foreground font-medium text-[12px]">{paymentMethod}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">Order Placed</p>
              <p className="text-foreground font-medium text-[12px]">{getCzechTime()}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-[14px]">Total Paid</span>
            <span className="text-2xl font-semibold text-foreground tracking-tight">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/track/${order.trackingId}`}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-[14px]">
          <Package className="w-4 h-4" /> Track Order
        </Link>
        <Link to="/shop"
          className="bg-secondary text-foreground px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors text-[14px]">
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
