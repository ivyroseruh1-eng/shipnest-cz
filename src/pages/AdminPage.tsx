import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useOrders,
  generateTrackingId,
  generateOrderId,
  generateDeliveryPin,
  createDefaultTrackingSteps,
  STEP_DAY_OFFSETS,
} from "@/context/OrderContext";
import { products } from "@/data/products";
import { Order, TrackingStep } from "@/types";
import { ProductImage } from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";
import { toast } from "sonner";
import {
  LogOut,
  Edit,
  Package,
  DollarSign,
  Truck,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  Search,
  Eye,
  RefreshCw,
  BarChart3,
  Clock,
  Settings,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Shuffle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  ArrowUpRight,
  Filter,
} from "lucide-react";

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || "shipnest2024";
const ICONS = ["📦", "🏭", "🚚", "✈️", "🛬", "🔍", "🛵", "✅", "🔄", "🌍", "📍", "🚢", "🏪", "📋", "⏳"];

const INTERNATIONAL_DESTINATIONS = [
  { city: "Prague", state: "Bohemia", country: "Czech Republic", zip: "110 00" },
  { city: "Zurich", state: "ZH", country: "Switzerland", zip: "8001" },
  { city: "Berlin", state: "Berlin", country: "Germany", zip: "10115" },
  { city: "London", state: "Greater London", country: "United Kingdom", zip: "EC1A 1BB" },
  { city: "Tokyo", state: "Tokyo", country: "Japan", zip: "100-0001" },
  { city: "Singapore", state: "Central", country: "Singapore", zip: "018989" },
  { city: "New York", state: "NY", country: "United States", zip: "10001" },
  { city: "Toronto", state: "ON", country: "Canada", zip: "M5V 2T6" },
  { city: "Sydney", state: "NSW", country: "Australia", zip: "2000" },
  { city: "Stockholm", state: "Stockholm", country: "Sweden", zip: "111 20" },
  { city: "Vienna", state: "Vienna", country: "Austria", zip: "1010" },
  { city: "Amsterdam", state: "North Holland", country: "Netherlands", zip: "1012 JS" },
];

const PREVIEW_CLIENT_ACCOUNTS = [
  { name: "Alexander Wright", email: "a.wright@techventures.io" },
  { name: "Elena Rostova", email: "elena.r@nordicdesign.co" },
  { name: "Kenji Sato", email: "kenji.sato@kyoto-craft.jp" },
  { name: "Sophie Van Der Bilt", email: "sophie.vdb@amsterdam.nl" },
  { name: "Marcus Sterling", email: "marcus.sterling@meridian.ch" },
  { name: "Claire Laurent", email: "claire.laurent@parisien.fr" },
  { name: "David O'Connor", email: "doconnor@dublinlabs.ie" },
  { name: "Ingrid Lindqvist", email: "ingrid.l@scanditech.se" },
];

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"dashboard" | "orders" | "products" | "settings">("dashboard");
  const { orders, updateOrder, addOrder, deleteOrder, cancelOrder } = useOrders();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true,
    order: true,
    timeline: true,
  });

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const filteredOrders = orders.filter(o => {
    const matchesQuery =
      searchQuery === "" ||
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.trackingId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && o.status !== "Delivered" && o.status !== "Cancelled") ||
      (statusFilter === "delivered" && o.status === "Delivered") ||
      (statusFilter === "cancelled" && o.status === "Cancelled");

    return matchesQuery && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.orderId)));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    await deleteOrder(orderId);
    setEditingOrder(null);
    toast.success("Order deleted");
  };

  const handleBulkDelete = async () => {
    const count = selectedOrders.size;
    for (const orderId of selectedOrders) {
      await deleteOrder(orderId);
    }
    setSelectedOrders(new Set());
    toast.success(`${count} order(s) deleted`);
  };

  const generateDispatchOrder = () => {
    const cust = PREVIEW_CLIENT_ACCOUNTS[Math.floor(Math.random() * PREVIEW_CLIENT_ACCOUNTS.length)];
    const loc = INTERNATIONAL_DESTINATIONS[Math.floor(Math.random() * INTERNATIONAL_DESTINATIONS.length)];
    const numItems = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, numItems);

    const items = selectedProducts.map(p => ({
      productId: p.id,
      name: p.name,
      brand: p.brand,
      image: p.image,
      price: p.price,
      qty: 1,
    }));

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(subtotal * 0.2);
    const total = subtotal + tax;

    const daysAgo = Math.floor(Math.random() * 12) + 1;
    const placedDate = new Date();
    placedDate.setDate(placedDate.getDate() - daysAgo);

    const deliveryDate = new Date(placedDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    const steps = createDefaultTrackingSteps(loc.city, loc.state, loc.country);
    steps.forEach((step, i) => {
      const stepDay = STEP_DAY_OFFSETS[i] ?? i * 2;
      if (daysAgo >= stepDay) {
        step.completed = true;
        const stepDate = new Date(placedDate);
        stepDate.setDate(stepDate.getDate() + stepDay);
        step.timestamp = stepDate.toISOString();
      }
    });

    const latestCompleted = [...steps].reverse().find(s => s.completed);

    const order: Order = {
      id: crypto.randomUUID(),
      orderId: generateOrderId(),
      trackingId: generateTrackingId(),
      customer: {
        name: cust.name,
        email: cust.email,
        phone: `+${Math.floor(100 + Math.random() * 899)} ${Math.floor(100000000 + Math.random() * 899999999)}`,
        address: `${Math.floor(1 + Math.random() * 150)} Central Boulevard`,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        zip: loc.zip,
      },
      items,
      subtotal,
      tax,
      total,
      status: latestCompleted?.status || "Order Placed",
      estimatedDelivery: deliveryDate.toISOString(),
      placedAt: placedDate.toISOString(),
      notes: "Express Priority Air Cargo via Prague Hub",
      paymentMethod: ["Apple Pay", "Credit Card", "Bank Transfer (SEPA)", "Google Pay"][Math.floor(Math.random() * 4)],
      deliveryPin: generateDeliveryPin(),
      trackingSteps: steps,
    };

    addOrder(order);
    toast.success(`Generated international dispatch ${order.orderId} → ${loc.city}, ${loc.country}`);
  };

  const saveOrder = () => {
    if (!editingOrder) return;
    const latestCompleted = [...editingOrder.trackingSteps].reverse().find(s => s.completed);
    const updatedOrder = { ...editingOrder, status: latestCompleted?.status || editingOrder.status };
    updateOrder(updatedOrder.orderId, updatedOrder);
    setEditingOrder(null);
    toast.success("Order and tracking timeline updated");
  };

  const copyOrderDetails = (order: Order) => {
    const latestCompleted = [...order.trackingSteps].reverse().find(s => s.completed);
    const currentStatus = latestCompleted?.status || order.status;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://shipnest.com";
    const items = order.items
      .map(i => `  • ${i.name} (${i.brand}) × ${i.qty} — $${(i.price * i.qty).toLocaleString()}`)
      .join("\n");
    const czechTime = new Date(order.placedAt).toLocaleString("en-GB", { timeZone: "Europe/Prague" });

    const text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPNEST LOGISTICS DISPATCH MANIFEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number:     ${order.orderId}
Tracking Number:  ${order.trackingId}
Current Status:   ${currentStatus}
Date (Prague):    ${czechTime} CET
Doorstep PIN:     ${order.deliveryPin || "N/A"}

DESTINATION
Recipient:        ${order.customer.name}
Address:          ${order.customer.address}
City/Country:     ${order.customer.city}, ${order.customer.country} ${order.customer.zip}
Contact:          ${order.customer.email} | ${order.customer.phone}

ITEMS IN SHIPMENT
${items}

FINANCIAL BREAKDOWN
Subtotal:         $${order.subtotal.toLocaleString()}
Air Freight:      COMPLIMENTARY EXPRESS
EU VAT (20%):     $${order.tax.toLocaleString()}
Total Invoiced:   $${order.total.toLocaleString()} (${order.paymentMethod || "Verified"})

LIVE TRACKING PORTAL:
${origin}/track/${order.trackingId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ShipNest s.r.o. · Prague Central Air Hub · Czech Republic`;

    navigator.clipboard.writeText(text);
    toast.success(`Order ${order.orderId} manifest copied to clipboard`);
  };

  const updateStep = (stepId: string, updates: Partial<TrackingStep>) => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      trackingSteps: editingOrder.trackingSteps.map(s =>
        s.id === stepId
          ? {
              ...s,
              ...updates,
              timestamp:
                updates.completed && !s.timestamp
                  ? new Date().toISOString()
                  : updates.timestamp ?? s.timestamp,
            }
          : s
      ),
    });
  };

  const addStep = () => {
    if (!editingOrder) return;
    const newStep: TrackingStep = {
      id: crypto.randomUUID(),
      status: "Checkpoint Inspection",
      icon: "📍",
      city: editingOrder.customer.city || "Transit Hub",
      state: editingOrder.customer.state || "",
      country: editingOrder.customer.country || "Transit",
      timestamp: new Date().toISOString(),
      completed: false,
    };
    setEditingOrder({ ...editingOrder, trackingSteps: [...editingOrder.trackingSteps, newStep] });
  };

  const removeStep = (stepId: string) => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      trackingSteps: editingOrder.trackingSteps.filter(s => s.id !== stepId),
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-foreground text-background mx-auto flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Executive Control Panel</h1>
            <p className="text-[13px] text-muted-foreground">
              ShipNest Global Logistics Hub · Prague Central Operations
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                Access Passcode
              </label>
              <input
                type="password"
                placeholder="Enter admin passcode"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (password === ADMIN_PASSWORD) setAuthenticated(true);
                    else toast.error("Invalid administrator credentials");
                  }
                }}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground text-sm font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Default administrator access key: <code className="font-mono text-foreground font-semibold">shipnest2024</code>
              </p>
            </div>

            <button
              onClick={() => {
                if (password === ADMIN_PASSWORD) setAuthenticated(true);
                else toast.error("Invalid administrator credentials");
              }}
              className="w-full bg-foreground text-background py-3 rounded-xl font-semibold hover:bg-foreground/90 text-sm transition-colors"
            >
              Authenticate Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const processing = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;
  const cancelled = orders.filter(o => o.status === "Cancelled").length;

  const tabs = [
    { id: "dashboard" as const, icon: BarChart3, label: "Logistics Overview" },
    { id: "orders" as const, icon: Package, label: `Orders (${orders.length})` },
    { id: "products" as const, icon: Eye, label: `Catalog (${products.length})` },
    { id: "settings" as const, icon: Settings, label: "Hub Operations" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      case "Out for Delivery":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20"><Truck className="w-3 h-3" /> Courier Out</span>;
      case "In Transit":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20"><Truck className="w-3 h-3" /> Air Transit</span>;
      case "Cancelled":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary text-foreground border border-border"><Clock className="w-3 h-3" /> {status}</span>;
    }
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-2.5 text-foreground text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground";
  const labelClass = "text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-1.5 block";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ShipNest Control Hub</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Prague Hub Live
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Central European Logistics Gateway · All figures in USD · {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateDispatchOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-foreground transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-primary" />
            <span>Create Dispatch Order</span>
          </button>
          <button
            onClick={() => setAuthenticated(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-secondary/50 border border-border rounded-xl p-1.5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              tab === t.id
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: DollarSign,
                label: "Gross Sales",
                value: `$${totalRevenue.toLocaleString()}`,
                sub: "All verified orders",
              },
              {
                icon: Package,
                label: "Total Dispatches",
                value: orders.length.toString(),
                sub: "International shipments",
              },
              {
                icon: Truck,
                label: "In Active Route",
                value: processing.toString(),
                sub: "Air & road freight transit",
              },
              {
                icon: CheckCircle,
                label: "Delivered",
                value: delivered.toString(),
                sub: "Doorstep verified",
              },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">{s.label}</span>
                  <s.icon className="w-4 h-4 text-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-[12px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Recent Activity */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground text-base">Recent Shipments</h2>
                <p className="text-[12px] text-muted-foreground">Latest dispatches logged at Prague Central</p>
              </div>
              <button
                onClick={() => setTab("orders")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all orders →
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Package className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">No orders recorded in this session</p>
                <button onClick={generateDispatchOrder} className="text-xs text-primary underline">
                  Generate dispatch order
                </button>
              </div>
            ) : (
              <div>
                {/* Mobile View: Stacked Order Cards (Zero horizontal scroll) */}
                <div className="block sm:hidden divide-y divide-border/60">
                  {orders.slice(0, 6).map((o) => (
                    <div key={o.orderId} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-xs text-foreground">{o.orderId}</span>
                        {getStatusBadge(o.status)}
                      </div>
                      <p className="text-xs text-foreground font-medium">
                        {o.customer.name} · {o.customer.city}, {o.customer.country}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-foreground">${o.total.toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingOrder({ ...o })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-secondary border border-border rounded-lg text-foreground"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <Link
                            to={`/track/${o.trackingId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-secondary border border-border rounded-lg text-foreground"
                          >
                            <ExternalLink className="w-3 h-3" /> Track
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground bg-secondary/30 uppercase text-[10px] tracking-wider">
                        <th className="p-4 font-semibold">Order ID</th>
                        <th className="p-4 font-semibold">Customer</th>
                        <th className="p-4 font-semibold">Destination</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Total</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {orders.slice(0, 6).map((o) => (
                        <tr key={o.orderId} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-4 font-mono font-medium text-foreground">{o.orderId}</td>
                          <td className="p-4 font-medium text-foreground">{o.customer.name}</td>
                          <td className="p-4 text-muted-foreground">
                            {o.customer.city}, {o.customer.country}
                          </td>
                          <td className="p-4">{getStatusBadge(o.status)}</td>
                          <td className="p-4 font-semibold text-foreground">${o.total.toLocaleString()}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingOrder({ ...o })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground transition-colors"
                              >
                                <Edit className="w-3 h-3" /> Edit
                              </button>
                              <Link
                                to={`/track/${o.trackingId}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" /> Track
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {tab === "orders" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Tracking, or Destination..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-secondary/50 border border-border rounded-xl p-1 text-xs">
                {["all", "active", "delivered", "cancelled"].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                      statusFilter === f
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {selectedOrders.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete ({selectedOrders.size})
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground space-y-3">
                <Package className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-sm font-medium">No matching orders found</p>
                <button onClick={generateDispatchOrder} className="text-xs text-primary underline">
                  Generate an international dispatch order
                </button>
              </div>
            ) : (
              <div>
                {/* Mobile View: Order Cards (Zero horizontal scroll) */}
                <div className="block sm:hidden divide-y divide-border/60">
                  {filteredOrders.map((o) => (
                    <div key={o.orderId} className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-xs text-foreground">{o.orderId}</span>
                        {getStatusBadge(o.status)}
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Tracking: {o.trackingId}</span>
                        <span>{new Date(o.placedAt).toLocaleDateString("en-GB")}</span>
                      </div>
                      <p className="text-xs text-foreground font-medium">
                        {o.customer.name} · {o.customer.city}, {o.customer.country}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {o.items.length} item(s) · {o.items[0]?.name}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="text-xs font-bold text-foreground">${o.total.toLocaleString()}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingOrder({ ...o })}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                            title="Edit order"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/track/${o.trackingId}`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                            title="Track shipment"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteOrder(o.orderId)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            title="Delete order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground bg-secondary/30 uppercase text-[10px] tracking-wider">
                        <th className="p-3.5 w-10">
                          <input
                            type="checkbox"
                            checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-border w-3.5 h-3.5"
                          />
                        </th>
                        <th className="p-3.5 font-semibold">Order</th>
                        <th className="p-3.5 font-semibold">Tracking Number</th>
                        <th className="p-3.5 font-semibold">Recipient</th>
                        <th className="p-3.5 font-semibold">Items</th>
                        <th className="p-3.5 font-semibold">Status</th>
                        <th className="p-3.5 font-semibold">Total</th>
                        <th className="p-3.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredOrders.map(o => (
                        <tr key={o.orderId} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-3.5">
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(o.orderId)}
                              onChange={() => toggleSelectOrder(o.orderId)}
                              className="rounded border-border w-3.5 h-3.5"
                            />
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-semibold text-foreground">{o.orderId}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {new Date(o.placedAt).toLocaleDateString("en-GB")}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-muted-foreground">
                            <Link
                              to={`/track/${o.trackingId}`}
                              className="hover:text-primary transition-colors hover:underline"
                            >
                              {o.trackingId}
                            </Link>
                          </td>
                          <td className="p-3.5">
                            <p className="font-medium text-foreground">{o.customer.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {o.customer.city}, {o.customer.country}
                            </p>
                          </td>
                          <td className="p-3.5">
                            <span className="text-foreground">{o.items.length} item(s)</span>
                            <span className="block text-[10px] text-muted-foreground truncate max-w-[140px]">
                              {o.items[0]?.name}
                            </span>
                          </td>
                          <td className="p-3.5">{getStatusBadge(o.status)}</td>
                          <td className="p-3.5 font-semibold text-foreground">${o.total.toLocaleString()}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingOrder({ ...o })}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                title="Edit order & checkpoints"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => copyOrderDetails(o)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                title="Copy dispatch manifest"
                              >
                                <ClipboardCopy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o.orderId)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Products Catalog */}
      {tab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Catalog Inventory ({products.length})</h2>
              <p className="text-[12px] text-muted-foreground">Live SKUs synced from Prague central inventory</p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              Browse live store <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div
                  className="aspect-square rounded-xl overflow-hidden flex items-center justify-center p-3 border border-border/50"
                  style={{ backgroundColor: getProductImageBackground(p.image) }}
                >
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    centerSubject={true}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="uppercase tracking-wider font-semibold">{p.brand}</span>
                    <span className="capitalize">{p.category}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">{p.name}</h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-foreground text-base">${p.price.toLocaleString()}</span>
                    <span className="text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      In Stock
                    </span>
                  </div>
                </div>
                <Link
                  to={`/product/${p.id}`}
                  className="w-full text-center py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-semibold transition-colors block"
                >
                  View Product Page
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {tab === "settings" && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-foreground text-base">Fulfillment Hub Infrastructure</h3>
                <p className="text-[12px] text-muted-foreground">Central logistics facility credentials</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Headquarters</span>
                <p className="font-semibold text-foreground">ShipNest s.r.o. (Czech Republic)</p>
                <p className="text-muted-foreground">Na Příkopě 859/22, 110 00 Nové Město, Prague</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Air Cargo Base</span>
                <p className="font-semibold text-foreground">Václav Havel Airport Prague (PRG)</p>
                <p className="text-muted-foreground">Logistics Freight Terminal 3</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Cloudflare Deployment</span>
                <p className="font-semibold text-foreground">Static Edge Pages (React + Vite 6)</p>
                <p className="text-muted-foreground">Zero cold starts · Global CDN distribution</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Security & Verification</span>
                <p className="font-semibold text-foreground">Doorstep 4-Digit Delivery PIN active</p>
                <p className="text-muted-foreground">AIG Insurance Underwriting Coverage</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-foreground text-base">Session Controls</h3>
            <p className="text-xs text-muted-foreground">
              To inspect order lifecycles under various states, you can generate fresh dispatch orders or reset local storage caches safely.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateDispatchOrder}
                className="px-4 py-2.5 bg-foreground text-background text-xs font-semibold rounded-xl hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
              >
                <Shuffle className="w-3.5 h-3.5" /> Create Dispatch Order
              </button>
              <button
                onClick={() => {
                  if (confirm("Reset order cache? Standard orders will be reloaded on next refresh.")) {
                    localStorage.removeItem("shipnest_orders_cache");
                    toast.success("Order cache cleared");
                  }
                }}
                className="px-4 py-2.5 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 border border-border transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Local Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal / Drawer */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">Edit Dispatch Record</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-secondary text-foreground">
                    {editingOrder.orderId}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Tracking: {editingOrder.trackingId} · Placed {new Date(editingOrder.placedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Section */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("customer")}
                className="w-full flex items-center justify-between p-3.5 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
              >
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Customer & Destination Details
                </span>
                {expandedSections.customer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.customer && (
                <div className="p-4 grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Customer Name</label>
                    <input
                      value={editingOrder.customer.name}
                      onChange={e =>
                        setEditingOrder({
                          ...editingOrder,
                          customer: { ...editingOrder.customer, name: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      value={editingOrder.customer.email}
                      onChange={e =>
                        setEditingOrder({
                          ...editingOrder,
                          customer: { ...editingOrder.customer, email: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      value={editingOrder.customer.phone}
                      onChange={e =>
                        setEditingOrder({
                          ...editingOrder,
                          customer: { ...editingOrder.customer, phone: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Street Address</label>
                    <input
                      value={editingOrder.customer.address}
                      onChange={e =>
                        setEditingOrder({
                          ...editingOrder,
                          customer: { ...editingOrder.customer, address: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      value={editingOrder.customer.city}
                      onChange={e =>
                        setEditingOrder({
                          ...editingOrder,
                          customer: { ...editingOrder.customer, city: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country & Postal</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={editingOrder.customer.country}
                        onChange={e =>
                          setEditingOrder({
                            ...editingOrder,
                            customer: { ...editingOrder.customer, country: e.target.value },
                          })
                        }
                        className={inputClass}
                        placeholder="Country"
                      />
                      <input
                        value={editingOrder.customer.zip}
                        onChange={e =>
                          setEditingOrder({
                            ...editingOrder,
                            customer: { ...editingOrder.customer, zip: e.target.value },
                          })
                        }
                        className={inputClass}
                        placeholder="Zip"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status & PIN Section */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Global Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="In Processing">In Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Doorstep Delivery PIN</label>
                  <div className="flex gap-2">
                    <input
                      value={editingOrder.deliveryPin || ""}
                      onChange={e => setEditingOrder({ ...editingOrder, deliveryPin: e.target.value })}
                      className={`${inputClass} font-mono font-bold tracking-widest text-center`}
                      maxLength={4}
                    />
                    <button
                      onClick={() =>
                        setEditingOrder({ ...editingOrder, deliveryPin: generateDeliveryPin() })
                      }
                      className="p-2.5 bg-secondary border border-border rounded-xl hover:bg-secondary/80 text-foreground transition-colors"
                      title="Generate new PIN"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Internal Operations Notes</label>
                <textarea
                  value={editingOrder.notes || ""}
                  onChange={e => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  rows={2}
                  className={inputClass}
                  placeholder="Notes visible to logistics staff only..."
                />
              </div>
            </div>

            {/* Tracking Milestones */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("timeline")}
                className="w-full flex items-center justify-between p-3.5 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
              >
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Tracking Milestones ({editingOrder.trackingSteps.length} steps)
                </span>
                {expandedSections.timeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.timeline && (
                <div className="p-4 space-y-3">
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {editingOrder.trackingSteps.map((step, idx) => (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border space-y-2 transition-all ${
                          step.completed
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{step.icon}</span>
                            <span className="text-[11px] font-bold text-foreground">
                              Checkpoint {idx + 1}: {step.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-foreground font-medium cursor-pointer bg-secondary px-2.5 py-1 rounded-md">
                              <input
                                type="checkbox"
                                checked={step.completed}
                                onChange={e => updateStep(step.id, { completed: e.target.checked })}
                                className="rounded border-border w-3.5 h-3.5"
                              />
                              Completed
                            </label>
                            <button
                              onClick={() => removeStep(step.id)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className={labelClass}>Status Title</label>
                            <input
                              value={step.status}
                              onChange={e => updateStep(step.id, { status: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Location</label>
                            <input
                              value={step.city}
                              onChange={e => updateStep(step.id, { city: e.target.value })}
                              placeholder="City"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Icon</label>
                            <select
                              value={step.icon}
                              onChange={e => updateStep(step.id, { icon: e.target.value })}
                              className={inputClass}
                            >
                              {ICONS.map(ic => (
                                <option key={ic} value={ic}>
                                  {ic}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addStep}
                    className="w-full py-2.5 border border-dashed border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Milestone Checkpoint
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
              <button
                onClick={saveOrder}
                className="flex-1 bg-foreground text-background py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Dispatch Changes
              </button>
              {editingOrder.status !== "Cancelled" && editingOrder.status !== "Delivered" && (
                <button
                  onClick={() => {
                    cancelOrder(editingOrder.orderId);
                    setEditingOrder(null);
                    toast.success("Order marked as cancelled with return logistics");
                  }}
                  className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Cancel Shipment
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("Delete this order record permanently?")) {
                    handleDeleteOrder(editingOrder.orderId);
                  }
                }}
                className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
