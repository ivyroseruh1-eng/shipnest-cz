import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, Copy, Share2, Printer, Lock } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import TrackingTimeline from "@/components/TrackingTimeline";
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

    return (
      <div className="max-w-[680px] mx-auto px-4 py-10 space-y-6">
        {/* Header card */}
        <div className="bg-secondary rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Tracking ID</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-semibold text-foreground tracking-tight">{order.trackingId}</span>
                <button onClick={() => copyToClipboard(order.trackingId, "Tracking ID")} className="p-1.5 rounded-md hover:bg-background transition-colors"><Copy className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-[12px] font-semibold ${order.status === "Cancelled" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>{order.status}</span>
          </div>

          <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground text-right">{progress.toFixed(0)}% complete</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Order ID", value: order.orderId, copyable: true },
            { label: "Placed On", value: new Date(order.placedAt).toLocaleDateString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric" }) },
            { label: "Est. Delivery", value: new Date(order.estimatedDelivery).toLocaleDateString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric" }) },
            { label: "Recipient", value: order.customer.name },
            { label: "Total", value: `$${order.total.toFixed(2)}` },
          ].map(m => (
            <div key={m.label} className="bg-secondary rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-[13px] font-semibold text-foreground">{m.value}</p>
                {m.copyable && <button onClick={() => copyToClipboard(m.value, m.label)} className="p-1"><Copy className="w-3 h-3 text-muted-foreground" /></button>}
              </div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="bg-secondary rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Items in this Order</h3>
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
