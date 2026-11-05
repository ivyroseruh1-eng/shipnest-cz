import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Copy,
  Plane,
  Package,
  Shield,
  Weight,
  Ruler,
  Building2,
  MapPin,
  Leaf,
  Info,
  Clock,
  CheckCircle2,
  ChevronRight,
  Lock,
  AlertTriangle,
  ArrowRight,
  Truck,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import TrackingTimeline from "@/components/TrackingTimeline";
import { getShipmentMeta } from "@/lib/courier";
import Logo from "@/components/brand/Logo";
import RouteMap from "@/components/RouteMap";
import CourierHandoff from "@/components/CourierHandoff";
import EtaCountdown from "@/components/EtaCountdown";
import TrackingSupportFAQ from "@/components/TrackingSupportFAQ";
import { explainStatus } from "@/data/statusExplanations";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";
import { isIndiaDestination, formatOrderDeliveryRange } from "@/lib/shipping";
import MacroMilestoneStepper from "@/components/MacroMilestoneStepper";
import { motion } from "framer-motion";

const TrackPage = () => {
  const { id } = useParams();
  const { orders, getOrder, loading } = useOrders();
  const navigate = useNavigate();
  const [input, setInput] = useState(id || "");

  useEffect(() => {
    if (id) setInput(id);
  }, [id]);

  const order = id ? getOrder(id) : null;

  const handleSearch = (customVal?: string) => {
    const query = (customVal || input).trim();
    if (!query) {
      toast.error("Please enter a tracking or order reference");
      return;
    }
    const found = getOrder(query);
    if (found) {
      navigate(`/track/${found.trackingId}`);
    } else {
      // If direct match wasn't found in context yet, navigate anyway to check route parameter
      navigate(`/track/${query}`);
      toast.error(`No active shipment found with reference ${query}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading && id && !order) {
    return (
      <div className="min-h-[70vh] bg-[#fbfbfd] flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-foreground">
            Locating Consignment Manifest
          </h2>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Querying European air freight tracking services and customs clearance logs...
          </p>
        </div>
      </div>
    );
  }

  // Active Order Tracking View (Apple + Samsung Design Style)
  if (order) {
    const completedSteps = order.trackingSteps.filter((s) => s.completed).length;
    const progress = (completedSteps / order.trackingSteps.length) * 100;
    const meta = getShipmentMeta(order.trackingId, order.total);
    const lastCompleted = [...order.trackingSteps].filter((s) => s.completed).pop();
    const lastUpdate = lastCompleted?.timestamp
      ? new Date(lastCompleted.timestamp)
      : new Date(order.placedAt);
    const delivered = order.status === "Delivered";
    const cancelled = order.status === "Cancelled";
    const inIndia = isIndiaDestination(order.customer);
    const explanation = lastCompleted
      ? explainStatus(lastCompleted.status)
      : undefined;

    const minsAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 60000);
    const relTime =
      minsAgo < 60
        ? `${minsAgo}m ago`
        : minsAgo < 1440
        ? `${Math.floor(minsAgo / 60)}h ago`
        : `${Math.floor(minsAgo / 1440)}d ago`;

    const deliveryRange = formatOrderDeliveryRange(order.estimatedDelivery, inIndia);

    return (
      <div className="bg-[#fbfbfd] min-h-screen text-foreground py-8 sm:py-12">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 space-y-6">
          {/* Breadcrumb Navigation Trail */}
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              <Link to="/track" className="hover:text-foreground transition-colors">
                Consignment Tracker
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="font-mono text-foreground font-semibold">
                {order.trackingId}
              </span>
            </div>
            <span className="hidden sm:inline-block font-mono text-[11px] text-muted-foreground/80">
              PRG Gateway Transit
            </span>
          </div>

          {/* Master Consignment Overview Card (Apple Style Hero + Samsung One UI Status) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]"
          >
            {/* Header Strip */}
            <div className="px-6 sm:px-8 py-4 border-b border-border/70 bg-[#fafafc] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo variant="mark" size={26} linkTo={false} />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">
                    Certified Air Carrier
                  </span>
                  <p className="text-[13px] font-bold text-foreground">
                    ShipNest Express · {meta.courier}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  delivered
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : cancelled
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {delivered ? "Delivered" : cancelled ? "Cancelled" : "In Flight Transit"}
              </span>
            </div>

            {/* Tracking ID & Prominent ETA Hero Banner */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Consignment Tracking Identifier
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground tracking-tight">
                      {order.trackingId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(order.trackingId, "Tracking ID")}
                      className="p-1.5 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy Tracking ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[12px] text-muted-foreground font-mono mt-1">
                    Air Waybill: <span className="font-semibold text-foreground">{meta.awb}</span>
                  </p>
                </div>

                {/* Delivery Countdown / Target Date Box */}
                <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 sm:p-5 sm:text-right min-w-[220px]">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">
                    Estimated Delivery Window
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-0.5 tabular-nums">
                    <EtaCountdown target={order.estimatedDelivery} delivered={delivered} />
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">
                    {deliveryRange}
                  </p>
                </div>
              </div>

              {/* Apple-Style Macro 4-Stage Stepper */}
              <div className="pt-2 pb-1 border-t border-border/60">
                <MacroMilestoneStepper
                  status={order.status}
                  steps={order.trackingSteps}
                  isConfirmationPage={false}
                />
              </div>

              {/* Latest Scan Live Notification Banner (Samsung One UI Live Event) */}
              {!cancelled && (
                <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 text-primary font-bold text-[13px]">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                      </span>
                      <Plane className="w-4 h-4" />
                      <span>Latest Milestone: {lastCompleted?.status || "Order Received"}</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Scanned {relTime} · CET
                    </span>
                  </div>
                  <p className="text-[13px] text-foreground/85 leading-relaxed pl-5 sm:pl-5">
                    {explanation ||
                      "Your consignment is progressing on schedule through our certified European air logistics corridor."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Interactive Route Map & Carrier Handoff Module */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div>
                  <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">
                    Air Transit Flight Trajectory
                  </h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Live flight corridor from Prague PRG Gateway to final destination
                  </p>
                </div>
                <span className="text-[12px] font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {progress.toFixed(0)}% Dispatched
                </span>
              </div>

              <div className="rounded-2xl bg-secondary/30 p-2 sm:p-4 border border-border/60">
                <RouteMap
                  origin={{
                    label: "PRG Gateway",
                    sub: meta.courier.split(" ")[0],
                  }}
                  destination={{
                    label: `${order.customer.city || "Destination"}`,
                    sub: meta.indiaCourier.split(" ")[0],
                  }}
                  progress={Math.min(
                    Math.max(completedSteps / order.trackingSteps.length, 0.05),
                    1
                  )}
                  height={190}
                />
              </div>
            </motion.div>

            {/* Carrier Handoff Details */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
            >
              <CourierHandoff
                meta={meta}
                inIndia={inIndia}
                city={order.customer.city}
              />
            </motion.div>
          </div>

          {/* Checkpoint Scan History (12-Step Detailed Event Log) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-6"
          >
            <div className="border-b border-border/70 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-foreground">
                  Checkpoint Log & Scans
                </h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Chronological scan events recorded across international air terminals
                </p>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                CET Timezone
              </span>
            </div>

            <TrackingTimeline
              steps={order.trackingSteps}
              placedAt={order.placedAt}
            />
          </motion.div>

          {/* Doorstep Verification PIN & Delivery Address Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Samsung One UI Security Pass Card */}
            {order.deliveryPin && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                className="bg-card border border-primary/25 rounded-3xl p-6 space-y-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Doorstep Verification PIN</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Handover Token
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-3 pt-2">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.3em] text-primary tabular-nums">
                    {order.deliveryPin}
                  </span>
                  <button
                    onClick={() => copyToClipboard(order.deliveryPin!, "PIN")}
                    className="p-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-foreground transition-colors shadow-2xs"
                    title="Copy PIN"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  Required upon parcel handover. Share this exclusively with the courier once the sealed box is presented.
                </p>
              </motion.div>
            )}

            {/* Consignment Destination Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    Shipment Destination
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Insured
                </span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  {order.customer.name}
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                  {order.customer.address}
                  <br />
                  {order.customer.city}
                  {order.customer.state ? `, ${order.customer.state}` : ""} · {order.customer.country}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Enclosed Consignment Electronics Items Card (Apple Store Itemized Breakdown) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">
                Enclosed Consignment Items ({order.items.length})
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">
                Order #{order.orderId}
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {order.items.map((item, idx) => {
                const bgInfo = getProductImageBackground(item.image);
                return (
                  <div
                    key={idx}
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
                            Brand: {item.brand} · Qty: {item.qty}
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
          </motion.div>

          {/* Tracking Support & FAQ Module */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.35 }}
          >
            <TrackingSupportFAQ orderId={order.orderId} />
          </motion.div>
        </div>
      </div>
    );
  }

  // Search State View (Apple Minimalist Consignment Lookup Portal)
  return (
    <div className="bg-[#fbfbfd] min-h-screen text-foreground py-14 lg:py-24 flex items-center">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 text-center space-y-8 w-full">
        {/* Apple-Style Minimal Icon */}
        <div className="w-16 h-16 rounded-3xl bg-secondary/80 border border-border/80 text-primary flex items-center justify-center mx-auto shadow-xs">
          <Plane className="w-7 h-7" />
        </div>

        {/* Hero Copy */}
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Direct European Air Freight
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Track your consignment.
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Enter your ShipNest tracking identifier (SNX...) or order number to inspect real-time European air cargo scans and flight manifests.
          </p>
        </div>

        {/* Refined Search Capsule */}
        <div className="max-w-lg mx-auto bg-card border border-border/80 rounded-full p-2 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Enter tracking number (e.g. SNX1037910)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none px-2"
          />
          <button
            onClick={() => handleSearch()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors shrink-0 shadow-xs"
          >
            Track Consignment
          </button>
        </div>

        {/* Active Dispatch Quick Select Chips */}
        <div className="space-y-3 pt-2">
          <p className="text-[12px] text-muted-foreground">
            Or inspect an active air consignment in transit:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(orders.length > 0
              ? orders.slice(0, 4).map((o) => o.trackingId)
              : ["SNX1037910", "SNX7829104", "SNX4829104"]
            ).map((t) => (
              <button
                key={t}
                onClick={() => handleSearch(t)}
                className="font-mono text-[12px] bg-card hover:bg-secondary border border-border/80 px-4 py-1.5 rounded-full text-foreground transition-colors shadow-2xs"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Apple/Samsung Assurance Feature Tiles */}
        <div className="grid sm:grid-cols-3 gap-4 pt-10 text-left">
          <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-2.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-[14px] font-bold text-foreground">
              Central PRG Cargo Gateway
            </h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Consignments are inspected, verified against factory serial records, and sealed in tamper-evident containers.
            </p>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-2.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
            <Plane className="w-5 h-5 text-primary" />
            <h3 className="text-[14px] font-bold text-foreground">
              Air Waybill Manifests
            </h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Continuous live flight telemetry and automated customs clearance scans tracked across partner global air carriers.
            </p>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-2.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-[14px] font-bold text-foreground">
              PIN-Protected Handover
            </h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Dynamic 4-digit verification code guarantees parcel delivery strictly to authenticated recipients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
