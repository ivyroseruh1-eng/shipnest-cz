import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Package,
  ShoppingBag,
  MapPin,
  CreditCard,
  Printer,
  Plane,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Lock,
} from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Logo from "@/components/brand/Logo";
import ProductImage from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";
import { getShipmentMeta } from "@/lib/courier";
import RouteMap from "@/components/RouteMap";
import { isIndiaDestination, formatOrderDeliveryRange } from "@/lib/shipping";
import MacroMilestoneStepper from "@/components/MacroMilestoneStepper";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { getOrder } = useOrders();
  const order = getOrder(orderId || "");

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-[#fbfbfd] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Order Not Found
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            We couldn't locate this order reference in our records. Please verify the order identifier or return to the store.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-foreground/90 transition-colors"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const meta = getShipmentMeta(order.trackingId, order.total);
  const inIndia = isIndiaDestination(order.customer);
  const deliveryRange = formatOrderDeliveryRange(order.estimatedDelivery, inIndia);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const paymentMethod = order.paymentMethod || "Credit Card";
  const placedDate = new Date(order.placedAt);

  return (
    <div className="bg-[#fbfbfd] min-h-screen text-foreground py-8 sm:py-12 print:py-0 print:bg-white">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 space-y-6 print:space-y-4">
        {/* Top Minimal Navigation Breadcrumb (Print hidden) */}
        <div className="flex items-center justify-between text-[12px] text-muted-foreground print:hidden">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Order Confirmation</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground/80">
            PRG Logistics Gateway
          </span>
        </div>

        {/* Hero Confirmation Card (Apple Store Reassurance + Samsung One UI Cleanliness) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] print:border-none print:shadow-none"
        >
          {/* Top Brand & Receipt Reference Bar */}
          <div className="px-6 sm:px-8 py-4 flex items-center justify-between border-b border-border/70 bg-[#fafafc]">
            <Logo variant="full" size={26} />
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] text-muted-foreground uppercase tracking-wider font-bold bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                Official Receipt
              </span>
              <div className="flex items-center gap-1.5 bg-background border border-border/80 px-2.5 py-1 rounded-xl">
                <span className="text-[12px] font-mono font-bold text-foreground">
                  #{order.orderId}
                </span>
                <button
                  onClick={() => copyToClipboard(order.orderId, "Order ID")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  title="Copy Order ID"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Hero Body */}
          <div className="px-6 sm:px-10 py-8 sm:py-10 text-center space-y-6">
            {/* Animated Celebration Icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="inline-flex relative"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-xs">
                <CheckCircle2 className="w-8 h-8" strokeWidth={2.2} />
              </div>
            </motion.div>

            {/* Headline & Confirmation Context */}
            <div className="space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Payment Authorized · Order Confirmed
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight pt-1">
                Thank you, {order.customer.name.split(" ")[0]}.
              </h1>
              <p className="text-muted-foreground text-[14px] sm:text-[15px] leading-relaxed">
                Your order is confirmed. A confirmed receipt and flight manifest copy have been delivered to{" "}
                <span className="text-foreground font-semibold">{order.customer.email}</span>.
              </p>
            </div>

            {/* Apple Benchmark #1: Prominent Estimated Delivery Window */}
            <div className="max-w-xl mx-auto bg-secondary/40 border border-border/80 rounded-2xl p-5 sm:p-6 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Estimated Delivery Window
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {deliveryRange}
              </p>
              <p className="text-[12px] text-muted-foreground">
                Air Freight Priority · Central Prague PRG Gateway Dispatch · Fully Insured
              </p>
            </div>

            {/* Macro Milestone Stepper (Apple / Samsung 4-Stage Journey) */}
            <div className="max-w-2xl mx-auto pt-2 pb-2">
              <MacroMilestoneStepper
                status={order.status}
                steps={order.trackingSteps}
                isConfirmationPage={true}
              />
            </div>

            {/* Quick Action Button Group (Print Hidden) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
              <Link
                to={`/track/${order.trackingId}`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Package className="w-4 h-4" /> Live Consignment Tracking
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-background hover:bg-secondary text-foreground border border-border px-5 py-2.5 rounded-full text-[13px] font-medium flex items-center gap-2 shadow-2xs transition-colors"
              >
                <Printer className="w-4 h-4 text-muted-foreground" /> Print Official Invoice
              </button>
              <Link
                to="/shop"
                className="bg-background hover:bg-secondary text-foreground border border-border px-5 py-2.5 rounded-full text-[13px] font-medium flex items-center gap-2 shadow-2xs transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-muted-foreground" /> Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Two-Column Bento Grid: Left Logistics & Security, Right Accounting & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Logistics Routing & Doorstep Security PIN (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tracking Reference & Interactive Route Map Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Air Freight Manifest
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-foreground">
                      {order.trackingId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(order.trackingId, "Tracking ID")}
                      className="p-1 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy Tracking ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Air Waybill (AWB)
                  </span>
                  <p className="text-[13px] font-mono font-bold text-foreground">
                    {meta.awb}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {meta.courier}
                  </p>
                </div>
              </div>

              {/* Animated Flight Arc Map */}
              <div className="rounded-2xl bg-secondary/30 p-3 border border-border/60">
                <RouteMap
                  origin={{ label: "PRG Gateway", sub: "Prague Hub" }}
                  destination={{
                    label: `${order.customer.city || "Destination"}`,
                    sub: meta.indiaCourier,
                  }}
                  progress={0.06}
                  height={170}
                />
              </div>

              {/* Waypoint Metadata Grid */}
              <div className="grid grid-cols-3 gap-3 text-center sm:text-left pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Origin Terminal
                  </span>
                  <p className="text-[13px] font-bold text-foreground">Prague (PRG)</p>
                  <p className="text-[11px] text-muted-foreground">Central Air Gateway</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Transit Service
                  </span>
                  <p className="text-[13px] font-bold text-foreground">Air Express</p>
                  <p className="text-[11px] text-muted-foreground">{meta.serviceLevel.split("·")[0]}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Final Destination
                  </span>
                  <p className="text-[13px] font-bold text-foreground truncate">
                    {order.customer.city}, {order.customer.country}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Insured Handover</p>
                </div>
              </div>
            </motion.div>

            {/* Samsung One UI Security Token: Doorstep Verification PIN */}
            {order.deliveryPin && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="bg-card border border-primary/25 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 pointer-events-none" />

                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-[12px] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Doorstep Verification PIN</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                    Required for Handover
                  </span>
                </div>

                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-muted-foreground">
                      Your 4-Digit Security Code:
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.3em] text-primary tabular-nums">
                        {order.deliveryPin}
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.deliveryPin!, "Delivery PIN")}
                        className="p-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-foreground transition-colors shadow-2xs"
                        title="Copy PIN"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:max-w-[240px] text-left sm:text-right">
                    <span className="text-[11px] text-muted-foreground leading-relaxed block">
                      Provide this PIN strictly to the courier upon physical handover of your sealed parcel.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recipient & Destination Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="bg-card border border-border/80 rounded-3xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    Destination & Recipient
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Value Transit Insurance
                </div>
              </div>

              <div className="text-[13px] space-y-1">
                <p className="font-semibold text-foreground text-[14px]">{order.customer.name}</p>
                <p className="text-muted-foreground leading-relaxed">
                  {order.customer.address}
                  <br />
                  {order.customer.city}
                  {order.customer.state ? `, ${order.customer.state}` : ""}{" "}
                  {order.customer.zip}
                  <br />
                  {order.customer.country}
                </p>
                {order.customer.phone && (
                  <p className="text-[12px] font-mono text-muted-foreground pt-1">
                    Contact: {order.customer.phone}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Itemized Invoice & Accounting (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/70 bg-[#fafafc] flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider">
                    Itemized Invoice
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "enclosed item" : "enclosed items"}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {placedDate.toLocaleString("en-GB", {
                    timeZone: "Europe/Prague",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  CET
                </span>
              </div>

              {/* Items List */}
              <div className="p-6 space-y-4">
                <div className="divide-y divide-border/60">
                  {order.items.map((item, i) => {
                    const bgInfo = getProductImageBackground(item.image);
                    return (
                      <div
                        key={i}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="w-12 h-12 rounded-xl p-1 border flex items-center justify-center overflow-hidden shrink-0"
                            style={{
                              background: bgInfo.background,
                              borderColor: bgInfo.borderColor,
                            }}
                          >
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-foreground truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[11px] text-muted-foreground">
                                Qty: {item.qty} · {item.brand}
                              </span>
                              {(item.selectedColor || item.selectedStorage) && (
                                <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                                  {[item.selectedColor, item.selectedStorage]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-[14px] font-bold text-foreground tabular-nums shrink-0">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotals & Taxes */}
                <div className="pt-4 border-t border-border/80 space-y-2 text-[13px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      ${order.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Air Cargo Freight</span>
                    <span className="text-emerald-600 font-semibold uppercase text-[12px]">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT & Customs Duties (20%)</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      ${order.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border text-[16px] font-bold text-foreground">
                    <span>Total Paid</span>
                    <span className="tabular-nums text-primary">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details Footer */}
              <div className="px-6 py-3.5 border-t border-border/70 bg-secondary/30 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Authorized via <span className="font-medium text-foreground">{paymentMethod}</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-background border border-border/60 px-2 py-0.5 rounded">
                  AUTH {order.orderId.slice(-6).toUpperCase()}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
