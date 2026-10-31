import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Copy, Package, ShoppingBag, MapPin, CreditCard, Printer, Plane, Bike, Warehouse, ArrowRight, ShieldCheck } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Logo from "@/components/brand/Logo";
import ProductImage from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";
import { getShipmentMeta } from "@/lib/courier";
import RouteMap from "@/components/RouteMap";

const formatDeliveryRange = (estDate: string) => {
  const d = new Date(estDate);
  const from = new Date(d);
  from.setDate(from.getDate() - 2);
  const to = new Date(d);
  to.setDate(to.getDate() + 2);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${from.toLocaleDateString("en-GB", opts)} — ${to.toLocaleDateString("en-GB", opts)}`;
};

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { getOrder } = useOrders();
  const order = getOrder(orderId || "");

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Order Not Found</h1>
        <p className="text-[14px] text-muted-foreground">We couldn't locate this order reference in our records.</p>
        <Link to="/shop" className="inline-block bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-semibold">
          Return to Store
        </Link>
      </div>
    );
  }

  const meta = getShipmentMeta(order.trackingId, order.total);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const paymentMethod = order.paymentMethod || "Credit Card";
  const placedDate = new Date(order.placedAt);

  return (
    <div className="bg-background min-h-screen text-foreground py-8 sm:py-14 print:py-4">
      <div className="max-w-[880px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Receipt Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-[#fafafc]">
            <Logo variant="full" size={28} />
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Official Receipt</span>
              <p className="text-[13px] font-mono font-bold text-foreground">#{order.orderId}</p>
            </div>
          </div>

          <div className="px-6 py-10 text-center space-y-5">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="inline-flex relative"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" strokeWidth={2.2} />
              </div>
            </motion.div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Payment Authorized · Order Confirmed
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-3">
                Thank you, {order.customer.name.split(" ")[0]}.
              </h1>
              <p className="text-muted-foreground text-[14px] mt-2 max-w-lg mx-auto leading-relaxed">
                We've sent a confirmed receipt to <span className="text-foreground font-semibold">{order.customer.email}</span>. Your device is being staged for express air dispatch at our Prague logistics facility.
              </p>
            </div>

            {/* Tracking Reference Hero Strip */}
            <div className="max-w-md mx-auto p-4 bg-secondary/50 border border-border rounded-2xl flex items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Your Tracking ID</span>
                <p className="text-[17px] font-mono font-bold text-foreground tracking-wide">{order.trackingId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(order.trackingId, "Tracking ID")}
                className="bg-background border border-border hover:bg-secondary px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5 justify-center pt-2 print:hidden">
              <Link
                to={`/track/${order.trackingId}`}
                className="bg-foreground text-background px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 hover:bg-foreground/85 transition-colors text-[13px] shadow-xs"
              >
                <Package className="w-4 h-4" /> Live Tracking
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-secondary text-foreground px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-secondary/70 transition-colors text-[13px]"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <Link
                to="/shop"
                className="bg-secondary text-foreground px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-secondary/70 transition-colors text-[13px]"
              >
                <ShoppingBag className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Route Map Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs print:hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider">Flight Routing & Dispatch</h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
              Staging at Prague
            </span>
          </div>

          <RouteMap
            origin={{ label: "Prague, CZ", sub: "ShipNest Hub 01" }}
            destination={{ label: `${order.customer.city || "Destination"}, ${order.customer.country || "Intl"}`, sub: meta.indiaCourier }}
            progress={0.06}
            height={180}
          />

          <div className="grid grid-cols-3 gap-3 mt-4 text-center sm:text-left border-t border-border/60 pt-4">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Origin Hub</span>
              <p className="text-[13px] font-bold text-foreground mt-0.5">Prague, CZ</p>
              <p className="text-[11px] text-muted-foreground">ShipNest Air Freight</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Air Waybill (AWB)</span>
              <p className="text-[13px] font-mono font-bold text-foreground mt-0.5">{meta.awb}</p>
              <p className="text-[11px] text-muted-foreground">{meta.courier}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Destination</span>
              <p className="text-[13px] font-bold text-foreground mt-0.5">{order.customer.city}, {order.customer.country}</p>
              <p className="text-[11px] text-muted-foreground">Insured Delivery</p>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Estimated Delivery Window:</span>
            <span className="text-foreground font-semibold">{formatDeliveryRange(order.estimatedDelivery)}</span>
          </div>
        </motion.div>

        {/* Invoice Items & Details */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs"
        >
          <div className="px-6 py-4 border-b border-border bg-[#fafafc] flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider">Itemized Invoice</h2>
            <span className="text-[11px] text-muted-foreground">
              {placedDate.toLocaleString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} CET
            </span>
          </div>

          <div className="p-6">
            <div className="divide-y divide-border/60">
              {order.items.map((item, i) => (
                <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded-xl bg-secondary/50 p-1 border border-border/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.qty} · {item.brand}</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-foreground tabular-nums">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-2 text-[13px] max-w-xs ml-auto">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground tabular-nums">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT & Duties (20%)</span>
                <span className="font-semibold text-foreground tabular-nums">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-[16px] font-bold text-foreground">
                <span>Total Paid</span>
                <span className="tabular-nums">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 border-t border-border bg-secondary/20 flex items-center gap-2 text-[11px] text-muted-foreground">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            <span>Paid via <span className="font-medium text-foreground">{paymentMethod}</span></span>
            <span>·</span>
            <span className="font-mono">AUTH {order.orderId.slice(-6).toUpperCase()}</span>
          </div>
        </motion.div>

        {/* Security Delivery PIN & Recipient Address */}
        <div className="grid sm:grid-cols-2 gap-4 print:hidden">
          {order.deliveryPin && (
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Doorstep Security PIN
              </span>
              <div className="flex items-baseline justify-between gap-3 pt-1">
                <span className="text-4xl font-mono font-bold tracking-[0.3em] text-primary tabular-nums">
                  {order.deliveryPin}
                </span>
                <button
                  onClick={() => copyToClipboard(order.deliveryPin!, "Delivery PIN")}
                  className="p-2 rounded-xl bg-background hover:bg-secondary transition-colors border border-border shadow-xs"
                  aria-label="Copy PIN"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Provide this PIN exclusively to the delivery courier when your sealed package is physically handed over.
              </p>
            </div>
          )}

          <div className="bg-card border border-border rounded-3xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Delivery Address
              </span>
            </div>
            <p className="text-[14px] font-semibold text-foreground">{order.customer.name}</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {order.customer.address}<br />
              {order.customer.city}{order.customer.state ? `, ${order.customer.state}` : ""} {order.customer.zip}<br />
              {order.customer.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
