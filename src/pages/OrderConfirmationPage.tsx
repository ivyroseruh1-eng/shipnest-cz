import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Copy, Package, ShoppingBag, MapPin, CreditCard, Calendar, User, Truck, Lock, Printer, Mail, Plane, Bike, Warehouse } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
const moonlightLogo = "/assets/brand/moonlight-logo.png";
import Logo from "@/components/brand/Logo";
import { getShipmentMeta } from "@/lib/courier";
import RouteMap from "@/components/RouteMap";

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

  const meta = getShipmentMeta(order.trackingId, order.total);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const paymentMethod = (order as any).paymentMethod || "Credit Card";
  const placedDate = new Date(order.placedAt);

  return (
    <div className="max-w-[860px] mx-auto px-4 py-8 sm:py-12 space-y-5 print:py-4">
      {/* Zone A — Receipt header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <Logo variant="full" size={28} />
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Order</p>
            <p className="text-[13px] font-mono font-semibold text-foreground">#{order.orderId}</p>
          </div>
        </div>
        <div className="px-6 py-8 text-center space-y-4">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="inline-flex relative">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-success" strokeWidth={2.2} />
            </div>
            <motion.span className="absolute inset-0 rounded-full border-2 border-success"
              initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} />
          </motion.div>
          <div>
            <p className="text-[11px] text-success font-semibold uppercase tracking-wider">Paid · Order confirmed</p>
            <h1 className="display text-3xl sm:text-4xl text-foreground mt-2">Thank you, {order.customer.name.split(" ")[0]}.</h1>
            <p className="text-muted-foreground text-[14px] mt-3 max-w-md mx-auto">
              We've emailed a receipt to <span className="text-foreground font-medium">{order.customer.email}</span>. Your package leaves Prague with {meta.courier} within 24 hours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2 print:hidden">
            <Link to={`/track/${order.trackingId}`}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-[13px]">
              <Package className="w-4 h-4" /> Track your order
            </Link>
            <button onClick={() => window.print()}
              className="bg-secondary text-foreground px-5 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors text-[13px]">
              <Printer className="w-4 h-4" /> Download invoice
            </button>
            <Link to="/shop"
              className="bg-secondary text-foreground px-5 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors text-[13px]">
              <ShoppingBag className="w-4 h-4" /> Keep shopping
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Zone B — Big route card */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-5 sm:p-6 print:hidden">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Shipment Route</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">In preparation</span>
        </div>
        <RouteMap
          origin={{ label: "Prague, CZ", sub: "ShipNest Hub 01" }}
          destination={{ label: `${order.customer.city || "India"}, IN`, sub: meta.indiaCourier }}
          progress={0.05}
          height={180}
        />
        <div className="grid grid-cols-3 gap-3 mt-4 text-center sm:text-left">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">From</p>
            <p className="text-[12px] font-semibold text-foreground mt-0.5">Prague, CZ</p>
            <p className="text-[10px] text-muted-foreground">ShipNest Hub 01</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Carrier</p>
            <p className="text-[12px] font-semibold text-foreground mt-0.5">{meta.courier}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{meta.awb}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">To</p>
            <p className="text-[12px] font-semibold text-foreground mt-0.5">{order.customer.city}, {order.customer.country}</p>
            <p className="text-[10px] text-muted-foreground">via {meta.indiaCourier}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">Estimated arrival</span>
          <span className="text-foreground font-medium">{formatDeliveryRange(order.estimatedDelivery)} · Insured</span>
        </div>
      </motion.div>

      {/* Zone C — Invoice */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Invoice</h2>
          <p className="text-[11px] text-muted-foreground">{placedDate.toLocaleString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} CET</p>
        </div>
        <div className="px-6 py-4">
          <div className="hidden sm:grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium border-b border-border pb-2 mb-2">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {order.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-center py-2.5 border-b border-border/50 last:border-0">
              <div className="col-span-12 sm:col-span-6 flex gap-3 items-center">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-secondary p-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.brand}</p>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-2 text-[12px] text-muted-foreground sm:text-center">Qty {item.qty}</div>
              <div className="col-span-4 sm:col-span-2 text-[12px] text-muted-foreground text-right tabular-nums">${item.price.toFixed(2)}</div>
              <div className="col-span-4 sm:col-span-2 text-[13px] font-semibold text-foreground text-right tabular-nums">${(item.price * item.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border bg-secondary/30">
          <div className="ml-auto max-w-[280px] space-y-1.5 text-[13px]">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success font-medium">FREE</span></div>
            <div className="flex justify-between text-muted-foreground"><span>VAT (20%)</span><span className="tabular-nums">${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t border-border text-[15px] font-semibold text-foreground"><span>Total paid</span><span className="tabular-nums">${order.total.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="px-6 py-3 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground">
          {paymentMethod === "Moonlight Wealth Management"
            ? <img src={moonlightLogo} alt="" className="w-3.5 h-3.5" />
            : <CreditCard className="w-3.5 h-3.5 text-primary" />}
          <span>Paid with <span className="text-foreground font-medium">{paymentMethod}</span></span>
          <span className="text-muted-foreground/60">·</span>
          <span className="font-mono">AUTH {order.orderId.slice(-6).toUpperCase()}</span>
        </div>
      </motion.div>

      {/* Zone D — Side cards */}
      <div className="grid sm:grid-cols-2 gap-4 print:hidden">
        {order.deliveryPin && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-semibold">Delivery PIN</p>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-4xl font-semibold tracking-[0.35em] text-primary tabular-nums">{order.deliveryPin}</span>
              <button onClick={() => copyToClipboard(order.deliveryPin!, "PIN")} className="p-2 rounded-lg bg-background hover:bg-secondary transition-colors shrink-0">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Share only with the courier at your door. Never over phone or message.</p>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-semibold">Shipping to</p>
          </div>
          <p className="text-[14px] font-medium text-foreground">{order.customer.name}</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {order.customer.address}<br />
            {order.customer.city}{order.customer.state ? `, ${order.customer.state}` : ""} {order.customer.zip}<br />
            {order.customer.country}
          </p>
        </motion.div>
      </div>

      {/* Zone E — What's next */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-2xl p-5 print:hidden">
        <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider mb-4">What happens next</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {[
            { icon: Warehouse, label: "Preparing", sub: "Prague warehouse", active: true },
            { icon: Plane, label: "International transit", sub: "23–29 days", active: false },
            { icon: Bike, label: "Out for delivery", sub: `${order.customer.city}`, active: false },
          ].map((s, i, arr) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center relative">
                {i < arr.length - 1 && <div className="absolute top-5 left-[60%] w-[80%] h-0.5 bg-border" />}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${s.active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`}>
                  {s.active && <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping" />}
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`text-[12px] font-medium mt-2 ${s.active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-4">We'll email you at every milestone. Real-time updates in your tracking page.</p>
      </motion.div>

      {/* Zone F — Support */}
      <div className="text-center text-[11px] text-muted-foreground space-y-1 print:text-[10px]">
        <p>Questions? Email <a href="mailto:orders@shipnest.cz" className="text-primary hover:underline">orders@shipnest.cz</a> with your order ID.</p>
        <p>ShipNest Global s.r.o. · Prague, Czech Republic · VAT CZ12345678 · Returns within 14 days of delivery.</p>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
