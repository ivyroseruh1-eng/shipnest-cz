import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, Copy, Share2, Printer, Lock, Plane, Package, Shield, Weight, Ruler, Building2, MapPin, Leaf, Info, Clock } from "lucide-react";
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

const TrackPage = () => {
  const { id } = useParams();
  const { getOrder, loading } = useOrders();
  const navigate = useNavigate();
  const [input, setInput] = useState(id || "");
  const order = id ? getOrder(id) : null;

  if (loading && id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-foreground/20 border-t-primary rounded-full mx-auto" />
        <p className="text-muted-foreground text-sm">Loading tracking information...</p>
      </div>
    );
  }

  const handleSearch = () => {
    if (!input.trim()) return;
    const found = getOrder(input.trim());
    if (found) navigate(`/track/${found.trackingId}`);
    else toast.error("No order found");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (order) {
    const completedSteps = order.trackingSteps.filter(s => s.completed).length;
    const progress = (completedSteps / order.trackingSteps.length) * 100;
    const meta = getShipmentMeta(order.trackingId, order.total);
    const lastCompleted = [...order.trackingSteps].filter(s => s.completed).pop();
    const lastUpdate = lastCompleted?.timestamp ? new Date(lastCompleted.timestamp) : new Date(order.placedAt);
    const inIndia = lastCompleted && lastCompleted.country === "India";
    const delivered = order.status === "Delivered";
    const cancelled = order.status === "Cancelled";
    const explanation = lastCompleted ? explainStatus(lastCompleted.status) : undefined;
    const minsAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 60000);
    const relTime = minsAgo < 60 ? `${minsAgo}m ago` : minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago` : `${Math.floor(minsAgo / 1440)}d ago`;

    return (
      <div className="max-w-[760px] mx-auto px-4 py-8 space-y-5">
        {/* Live status banner */}
        {!cancelled && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-success/5 border border-primary/20 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 relative">
                  {!delivered && <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping" />}
                  <Plane className="w-5 h-5 relative" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Current status</p>
                  <p className="text-[16px] font-semibold text-foreground leading-tight truncate">{lastCompleted?.status || "Order Placed"}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3 inline -mt-0.5 mr-1" />
                    Last scan {relTime} · {lastCompleted?.city || "Prague"}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Arriving in</p>
                <p className="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
                  <EtaCountdown target={order.estimatedDelivery} delivered={delivered} />
                </p>
                <p className="text-[11px] text-muted-foreground">By {new Date(order.estimatedDelivery).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
            {explanation && (
              <div className="mt-4 pt-4 border-t border-primary/10 flex gap-2 text-[12px] text-foreground/80">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p>{explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Route map */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Route</h3>
            <span className="text-[11px] text-muted-foreground tabular-nums">{progress.toFixed(0)}% complete</span>
          </div>
          <RouteMap
            origin={{ label: "Prague, CZ", sub: meta.courier.split(" ")[0] }}
            destination={{ label: `${order.customer.city || "India"}, IN`, sub: meta.indiaCourier.split(" ")[0] }}
            progress={Math.min(Math.max(completedSteps / order.trackingSteps.length, 0.02), 1)}
            height={180}
            animate={false}
          />
        </div>

        {/* Carrier header card — courier branding */}
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent px-6 py-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2.5">
              <Logo variant="mark" size={28} linkTo={false} />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Tracked by</p>
                <p className="text-[13px] font-semibold text-foreground">ShipNest International · {meta.courier}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${order.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
              {order.status === "Cancelled" ? "Cancelled" : "Active"}
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Tracking ID</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-semibold text-foreground tracking-tight">{order.trackingId}</span>
                  <button onClick={() => copyToClipboard(order.trackingId, "Tracking ID")} className="p-1.5 rounded-md hover:bg-secondary transition-colors"><Copy className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">AWB {meta.awb}</p>
            </div>
              <div className="sm:text-right">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Current Status</p>
                <p className="text-[14px] font-semibold text-foreground mt-1">{order.status}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Last update {lastUpdate.toLocaleString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} CET
                </p>
              </div>
          </div>

            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>{completedSteps} of {order.trackingSteps.length} milestones</span>
              <span className="tabular-nums">{progress.toFixed(0)}% complete</span>
            </div>
          </div>
        </div>

        {/* Carrier handoff */}
        {!cancelled && <CourierHandoff meta={meta} inIndia={!!inIndia} city={order.customer.city} />}

        {/* Shipment specifics — what makes it look real */}
        <div className="bg-secondary/40 border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Shipment Details</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
            <div className="flex items-start gap-2">
              <Plane className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Service Level</p>
                <p className="text-foreground font-medium">{meta.serviceLevel}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Origin Facility</p>
                <p className="text-foreground font-medium">{meta.originFacility}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Weight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Billable Weight</p>
                <p className="text-foreground font-medium">{meta.weightKg}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Ruler className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Dimensions (L×W×H)</p>
                <p className="text-foreground font-medium">{meta.dimensions}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">India Last-Mile Partner</p>
                <p className="text-foreground font-medium">{meta.indiaCourier}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Insurance</p>
                <p className="text-foreground font-medium">{meta.insured}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Signature</p>
                <p className="text-foreground font-medium">Required on delivery</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Leaf className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">CO₂e estimate</p>
                <p className="text-foreground font-medium">{meta.co2eKg} · offset by ShipNest</p>
              </div>
            </div>
            {inIndia && (
              <div className="flex items-start gap-2 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground">Current Facility</p>
                  <p className="text-foreground font-medium">{meta.indiaFacility}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Order ID", value: order.orderId, copyable: true },
            { label: "Placed On", value: new Date(order.placedAt).toLocaleDateString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric" }) },
            { label: "Est. Delivery", value: new Date(order.estimatedDelivery).toLocaleDateString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric" }) },
            { label: "Recipient", value: order.customer.name },
            { label: "Declared Value", value: meta.declaredValue },
            { label: "Total Paid", value: `$${order.total.toFixed(2)}` },
          ].map(m => (
            <div key={m.label} className="bg-secondary rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-[13px] font-semibold text-foreground truncate">{m.value}</p>
                {m.copyable && <button onClick={() => copyToClipboard(m.value, m.label)} className="p-1"><Copy className="w-3 h-3 text-muted-foreground" /></button>}
              </div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="bg-secondary rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Package contents</h3>
            <p className="text-[11px] text-muted-foreground">Declared to customs at full value</p>
          </div>
          {order.items.map(item => (
            <div key={item.productId} className="flex gap-3 items-center">
              <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-lg bg-background p-1"
                onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-foreground font-medium truncate">{item.name}</p>
                <p className="text-[12px] text-muted-foreground">Qty: {item.qty}</p>
              </div>
              <p className="text-[14px] font-semibold text-foreground">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Delivery PIN */}
        {order.deliveryPin && order.status !== "Delivered" && order.status !== "Cancelled" && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-2">
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
              Share this 4-digit PIN <strong>only with the delivery agent at your door</strong> to confirm receipt. Do not share over phone or message.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-secondary rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Shipment Timeline</h3>
          <TrackingTimeline steps={order.trackingSteps} placedAt={order.placedAt} />
        </div>

        {/* Support FAQ */}
        <TrackingSupportFAQ orderId={order.orderId} />

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/track/${order.trackingId}`); toast.success("Tracking link copied!"); }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-[13px] text-foreground hover:bg-secondary/70 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-[13px] text-foreground hover:bg-secondary/70 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="display text-4xl sm:text-5xl text-foreground">Track Your Order</h1>
        <p className="text-muted-foreground text-[15px]">Enter the tracking ID or order ID provided in your confirmation email.</p>
      </div>
      <div className="bg-secondary rounded-2xl p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="e.g. SNX4829371"
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full bg-background border border-border rounded-full pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 text-[14px]" />
          </div>
          <button onClick={handleSearch} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-[14px] hover:bg-primary/90 transition-colors">Track</button>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
