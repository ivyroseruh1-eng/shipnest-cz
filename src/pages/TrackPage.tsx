import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, Copy, Plane, Package, Shield, Weight, Ruler, Building2, MapPin, Leaf, Info, Clock, CheckCircle2, ChevronRight, Lock, AlertTriangle, ArrowRight, Truck } from "lucide-react";
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

  if (loading && id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-foreground/20 border-t-primary rounded-full mx-auto" />
        <p className="text-muted-foreground text-[14px]">Connecting to European Logistics Data Service...</p>
      </div>
    );
  }

  // Active Order View
  if (order) {
    const completedSteps = order.trackingSteps.filter(s => s.completed).length;
    const progress = (completedSteps / order.trackingSteps.length) * 100;
    const meta = getShipmentMeta(order.trackingId, order.total);
    const lastCompleted = [...order.trackingSteps].filter(s => s.completed).pop();
    const lastUpdate = lastCompleted?.timestamp ? new Date(lastCompleted.timestamp) : new Date(order.placedAt);
    const delivered = order.status === "Delivered";
    const cancelled = order.status === "Cancelled";
    const explanation = lastCompleted ? explainStatus(lastCompleted.status) : undefined;

    const minsAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 60000);
    const relTime = minsAgo < 60 ? `${minsAgo}m ago` : minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago` : `${Math.floor(minsAgo / 1440)}d ago`;

    return (
      <div className="bg-background min-h-screen text-foreground py-8 sm:py-14">
        <div className="max-w-[880px] mx-auto px-4 sm:px-6 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/track" className="hover:text-foreground transition-colors">Shipment Tracker</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-foreground font-semibold">{order.trackingId}</span>
          </div>

          {/* Carrier Header Card */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border bg-[#fafafc] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo variant="mark" size={26} linkTo={false} />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Air Freight Carrier
                  </span>
                  <p className="text-[13px] font-bold text-foreground">
                    ShipNest Express · {meta.courier}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  delivered
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : cancelled
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {delivered ? "Delivered" : cancelled ? "Cancelled" : "In Transit"}
              </span>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Tracking Number
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
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

                <div className="sm:text-right bg-secondary/30 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-border">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Estimated Delivery
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-0.5 tabular-nums">
                    <EtaCountdown target={order.estimatedDelivery} delivered={delivered} />
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Target: {new Date(order.estimatedDelivery).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              {!cancelled && (
                <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-semibold text-[13px]">
                      <Plane className="w-4 h-4" />
                      <span>Latest Milestone: {lastCompleted?.status || "Order Placed"}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Last scan {relTime}
                    </span>
                  </div>
                  <p className="text-[12px] text-foreground/80 leading-relaxed">
                    {explanation || "Your sealed parcel is progressing according to schedule through our certified European logistics network."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Route Map */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">Air Transit Route</h3>
                <p className="text-[12px] text-muted-foreground">Prague International Gateway (PRG) to Final Destination</p>
              </div>
              <span className="text-[12px] font-mono font-bold text-primary">
                {progress.toFixed(0)}% Completed
              </span>
            </div>

            <RouteMap
              origin={{ label: "Prague Hub (PRG)", sub: meta.courier.split(" ")[0] }}
              destination={{ label: `${order.customer.city || "Destination"}, ${order.customer.country || "IN"}`, sub: meta.indiaCourier.split(" ")[0] }}
              progress={Math.min(Math.max(completedSteps / order.trackingSteps.length, 0.05), 1)}
              height={190}
            />
          </div>

          {/* Milestone Stepper Timeline */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-border/70 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-foreground">Checkpoint History</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Chronological scan events recorded at logistics hubs</p>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">CET Timezone</span>
            </div>

            <TrackingTimeline steps={order.trackingSteps} placedAt={order.placedAt} />
          </div>

          {/* Security PIN & Consignment Credentials */}
          <div className="grid sm:grid-cols-2 gap-4">
            {order.deliveryPin && (
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Doorstep Verification PIN
                </span>
                <div className="flex items-baseline justify-between gap-3 pt-1">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.3em] text-primary tabular-nums">
                    {order.deliveryPin}
                  </span>
                  <button
                    onClick={() => copyToClipboard(order.deliveryPin!, "PIN")}
                    className="p-2 rounded-xl bg-background border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shadow-xs"
                    title="Copy PIN"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  Handed over strictly upon matching this PIN with the courier device at delivery.
                </p>
              </div>
            )}

            <div className="bg-card border border-border rounded-3xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Shipment Destination
                </span>
              </div>
              <p className="text-[14px] font-semibold text-foreground">{order.customer.name}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {order.customer.city}{order.customer.state ? `, ${order.customer.state}` : ""} · {order.customer.country}
              </p>
              <div className="pt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Value Transit Insurance Active
              </div>
            </div>
          </div>

          {/* Consignment Items */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">
              Enclosed Electronics ({order.items.length})
            </h3>
            <div className="divide-y divide-border/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl p-1 border flex items-center justify-center overflow-hidden shrink-0" style={{ background: getProductImageBackground(item.image).background, borderColor: getProductImageBackground(item.image).borderColor }}><ProductImage src={item.image} alt={item.name} width={44} height={44} className="w-full h-full object-contain" /></div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">Brand: {item.brand} · Qty: {item.qty}</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-foreground tabular-nums">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support FAQ */}
          <div className="pt-4">
            <TrackingSupportFAQ />
          </div>
        </div>
      </div>
    );
  }

  // Search State (Empty or no ID)
  return (
    <div className="bg-background min-h-screen text-foreground py-12 lg:py-20">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Plane className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Real-Time Logistics Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Track Any Consignment.
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Enter your ShipNest tracking identifier (SNX...) or order number to inspect live European air cargo scans.
          </p>
        </div>

        {/* Search input bar */}
        <div className="max-w-lg mx-auto bg-card border border-border rounded-full p-2 shadow-md flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Enter tracking number (e.g. SNX7829104)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none px-2"
          />
          <button
            onClick={() => handleSearch()}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-primary/90 transition-colors shrink-0"
          >
            Track
          </button>
        </div>

        {/* Quick Active Tracking Numbers */}
        <div className="space-y-3 pt-2">
          <p className="text-[12px] text-muted-foreground">Or select an active dispatch in transit:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {(orders.length > 0 ? orders.slice(0, 4).map(o => o.trackingId) : ["SNX7829104", "SNX4920183", "SNX6104829"]).map(t => (
              <button
                key={t}
                onClick={() => handleSearch(t)}
                className="font-mono text-[12px] bg-secondary hover:bg-secondary/70 border border-border px-3.5 py-1.5 rounded-full text-foreground transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Global Hub Info Card */}
        <div className="grid sm:grid-cols-3 gap-4 pt-10 text-left">
          <div className="p-5 bg-card border border-border rounded-2xl space-y-2">
            <Building2 className="w-5 h-5 text-primary" />
            <p className="text-[13px] font-bold text-foreground">Prague Airport Hub</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Consignments are sorted, sealed and air-dispatched directly from Prague Terminal PRG.
            </p>
          </div>

          <div className="p-5 bg-card border border-border rounded-2xl space-y-2">
            <Plane className="w-5 h-5 text-primary" />
            <p className="text-[13px] font-bold text-foreground">Air Waybill Integration</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Real-time flight departures and hub handovers tracked across partner global air carriers.
            </p>
          </div>

          <div className="p-5 bg-card border border-border rounded-2xl space-y-2">
            <Lock className="w-5 h-5 text-primary" />
            <p className="text-[13px] font-bold text-foreground">PIN Secure Delivery</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              4-digit dynamic verification code ensures only verified recipients accept the parcel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
