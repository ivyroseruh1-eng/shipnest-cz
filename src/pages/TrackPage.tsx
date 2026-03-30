import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, Copy, Share2, Printer } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import TrackingTimeline from "@/components/TrackingTimeline";
import { toast } from "sonner";

const TrackPage = () => {
  const { id } = useParams();
  const { getOrder, orders, loading } = useOrders();
  const navigate = useNavigate();
  const [input, setInput] = useState(id || "");
  const order = id ? getOrder(id) : null;

  // Don't show recent orders to public visitors - only show search

  // Show loading state while orders are being fetched from backend
  if (loading && id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full mx-auto" />
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
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">TRACKING ID</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-orbitron gold-text">{order.trackingId}</span>
                <button onClick={() => copyToClipboard(order.trackingId, "Tracking ID")} className="p-1.5 rounded bg-muted hover:bg-primary/20"><Copy className="w-4 h-4 text-primary" /></button>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full gold-gradient text-primary-foreground text-sm font-bold font-orbitron">{order.status}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full gold-gradient rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground text-right">{progress.toFixed(0)}% complete</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Order ID", value: order.orderId, copyable: true },
            { label: "Placed On", value: new Date(order.placedAt).toLocaleDateString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric" }) },
            { label: "Est. Delivery", value: new Date(order.estimatedDelivery).toLocaleDateString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", year: "numeric" }) },
            { label: "Recipient", value: order.customer.name },
            { label: "Total", value: `$${order.total.toFixed(2)}` },
          ].map(m => (
            <div key={m.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-foreground font-orbitron">{m.value}</p>
                {m.copyable && <button onClick={() => copyToClipboard(m.value, m.label)} className="p-1"><Copy className="w-3 h-3 text-muted-foreground" /></button>}
              </div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-foreground font-orbitron">Items in this Order</h3>
          {order.items.map(item => (
            <div key={item.productId} className="flex gap-3 items-center">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded bg-muted/30"
                onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
              </div>
              <p className="text-sm font-bold text-foreground">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-foreground font-orbitron">Shipment Timeline</h3>
          <TrackingTimeline steps={order.trackingSteps} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/track/${order.trackingId}`); toast.success("Tracking link copied!"); }}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-primary transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-primary transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold font-orbitron text-foreground text-center">Track Your Order</h1>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" placeholder="Enter Tracking ID or Order ID"
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full bg-muted border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-orbitron text-sm" />
          </div>
          <button onClick={handleSearch} className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90">Track</button>
        </div>
      </div>

      <p className="text-center text-muted-foreground text-sm">Enter the tracking ID or order ID provided in your confirmation email.</p>
    </div>
  );
};

export default TrackPage;
