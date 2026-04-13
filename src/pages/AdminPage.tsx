import { useState } from "react";
import { useOrders, generateTrackingId, generateOrderId, createDefaultTrackingSteps, createCancelledReturnSteps } from "@/context/OrderContext";
import { products } from "@/data/products";
import { Order, TrackingStep } from "@/types";
import { toast } from "sonner";
import { LogOut, Edit, Package, DollarSign, Truck, CheckCircle, Plus, Trash2, Save, Search, Eye, RefreshCw, BarChart3, Users, Clock, Settings, ChevronDown, ChevronUp, ClipboardCopy, Shuffle, AlertTriangle, XCircle } from "lucide-react";

const ADMIN_PASSWORD = "shipnest2024";
const ICONS = ["📦", "🏭", "🚚", "✈️", "🛬", "🔍", "🛵", "✅", "🔄", "🌍", "📍", "🚢", "🏪", "📋", "⏳"];

const FAKE_NAMES = ["James Wilson", "Emma Thompson", "Liam Carter", "Sophia Martinez", "Noah Brown", "Olivia Davis", "Ethan Garcia", "Ava Johnson", "Mason Lee", "Isabella Clark"];
const FAKE_EMAILS = ["james.w@gmail.com", "emma.t@outlook.com", "liam.c@yahoo.com", "sophia.m@gmail.com", "noah.b@hotmail.com", "olivia.d@gmail.com", "ethan.g@yahoo.com", "ava.j@outlook.com", "mason.l@gmail.com", "isabella.c@hotmail.com"];
const FAKE_CITIES = [
  { city: "Mumbai", state: "Maharashtra", country: "India", zip: "400001" },
  { city: "Kolkata", state: "West Bengal", country: "India", zip: "700001" },
  { city: "Bangalore", state: "Karnataka", country: "India", zip: "560001" },
  { city: "Chennai", state: "Tamil Nadu", country: "India", zip: "600001" },
  { city: "Hyderabad", state: "Telangana", country: "India", zip: "500001" },
  { city: "Pune", state: "Maharashtra", country: "India", zip: "411001" },
  { city: "Dibrugarh", state: "Assam", country: "India", zip: "786001" },
  { city: "Jorhat", state: "Assam", country: "India", zip: "785001" },
  { city: "Silchar", state: "Assam", country: "India", zip: "788001" },
  { city: "Tezpur", state: "Assam", country: "India", zip: "784001" },
];

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"dashboard" | "orders" | "products" | "settings">("dashboard");
  const { orders, updateOrder, addOrder, deleteOrder, cancelOrder } = useOrders();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true, order: true, timeline: true,
  });

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(filteredOrders.map(o => o.orderId)));
  };

  const handleDeleteOrder = async (orderId: string) => {
    await deleteOrder(orderId);
    setDeleteConfirm(null);
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

  const generateFakeOrder = () => {
    const nameIdx = Math.floor(Math.random() * FAKE_NAMES.length);
    const loc = FAKE_CITIES[Math.floor(Math.random() * FAKE_CITIES.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, numItems);
    
    const items = selectedProducts.map(p => ({
      productId: p.id, name: p.name, brand: p.brand, image: p.image,
      price: p.price, qty: Math.floor(Math.random() * 2) + 1,
    }));
    
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.2;
    const total = subtotal + tax;
    
    // Random date in the past 1-30 days
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const placedDate = new Date();
    placedDate.setDate(placedDate.getDate() - daysAgo);
    
    const deliveryDate = new Date(placedDate);
    deliveryDate.setDate(deliveryDate.getDate() + 25);
    
    const steps = createDefaultTrackingSteps(loc.city, loc.state, loc.country);
    // Day offsets for each step: 0,1,6,6,8,13,15,19,21,22,23,23,24,25
    const dayOffsets = [0, 1, 6, 6, 8, 13, 15, 19, 21, 22, 23, 23, 24, 25];
    steps.forEach((step, i) => {
      const stepDay = dayOffsets[i] || i * 2;
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
        name: FAKE_NAMES[nameIdx], email: FAKE_EMAILS[nameIdx],
        phone: `+91 ${Math.floor(70000 + Math.random() * 29999)}${Math.floor(10000 + Math.random() * 89999)}`,
        address: `${Math.floor(1 + Math.random() * 999)} ${["Oak St", "Main Ave", "Elm Rd", "Park Blvd", "King St"][Math.floor(Math.random() * 5)]}`,
        city: loc.city, state: loc.state, country: loc.country, zip: loc.zip,
      },
      items, subtotal, tax, total,
      status: latestCompleted?.status || "Order Placed",
      estimatedDelivery: deliveryDate.toISOString(),
      placedAt: placedDate.toISOString(),
      notes: "",
      paymentMethod: ["Credit Card", "PayPal", "Apple Pay", "Google Pay"][Math.floor(Math.random() * 4)],
      trackingSteps: steps,
    };
    
    addOrder(order);
    toast.success(`Generated order ${order.orderId}`);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-foreground mx-auto flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Enter credentials to access the control panel</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <input type="password" placeholder="Admin Password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { if (password === ADMIN_PASSWORD) setAuthenticated(true); else toast.error("Invalid credentials"); }}}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground text-sm" />
            <button onClick={() => { if (password === ADMIN_PASSWORD) setAuthenticated(true); else toast.error("Invalid credentials"); }}
              className="w-full bg-foreground text-background py-3 rounded-xl font-semibold hover:bg-foreground/90 text-sm transition-colors">Authenticate</button>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const processing = orders.filter(o => o.status !== "Delivered").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;

  const filteredOrders = searchQuery
    ? orders.filter(o => o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.trackingId.toLowerCase().includes(searchQuery.toLowerCase()))
    : orders;

  const saveOrder = () => {
    if (!editingOrder) return;
    const latestCompleted = [...editingOrder.trackingSteps].reverse().find(s => s.completed);
    const updatedOrder = { ...editingOrder, status: latestCompleted?.status || editingOrder.status };
    updateOrder(updatedOrder.orderId, updatedOrder);
    setEditingOrder(null);
    toast.success("Order updated successfully!");
  };

  const copyOrderDetails = (order: Order) => {
    const latestCompleted = [...order.trackingSteps].reverse().find(s => s.completed);
    const currentStatus = latestCompleted?.status || order.status;
    const siteUrl = "https://shipnest-cz.lovable.app";
    const items = order.items.map(i => `  • ${i.name} (${i.brand}) x${i.qty} — $${(i.price * i.qty).toFixed(2)}\n    📷 Image: ${siteUrl}${i.image}`).join("\n");
    const czechTime = new Date(order.placedAt).toLocaleString("en-GB", { timeZone: "Europe/Prague" });

    // Build status-specific subject and message
    let subject = "";
    let statusMessage = "";
    
    switch (currentStatus.toLowerCase()) {
      case "order placed":
        subject = `Order Confirmed — ${order.orderId}`;
        statusMessage = "Your order has been confirmed and is being prepared at our warehouse in Prague.";
        break;
      case "processing":
        subject = `Order Processing — ${order.orderId}`;
        statusMessage = "Your order is currently being processed and prepared for shipment.";
        break;
      case "shipped":
        subject = `Order Shipped — ${order.orderId}`;
        statusMessage = "Great news! Your order has been shipped and is on its way to you.";
        break;
      case "in transit":
        subject = `Order In Transit — ${order.orderId}`;
        statusMessage = "Your package is currently in transit and moving through our logistics network.";
        break;
      case "out for delivery":
        subject = `Out for Delivery — ${order.orderId}`;
        statusMessage = "Your package is out for delivery and will arrive soon!";
        break;
      case "delivered":
        subject = `Order Delivered — ${order.orderId}`;
        statusMessage = "Your order has been successfully delivered. We hope you enjoy your purchase!";
        break;
      default:
        subject = `Order Update — ${order.orderId}`;
        statusMessage = `Current status: ${currentStatus}`;
    }

    // Build completed tracking steps
    const completedSteps = order.trackingSteps
      .filter(s => s.completed)
      .map(s => {
        const time = s.timestamp ? new Date(s.timestamp).toLocaleString("en-GB", { timeZone: "Europe/Prague" }) : "";
        return `  ${s.icon} ${s.status}${s.city ? ` — ${s.city}${s.country ? `, ${s.country}` : ""}` : ""}${time ? ` (${time})` : ""}`;
      })
      .join("\n");

    const text = `Subject: ${subject}

Dear ${order.customer.name},

${statusMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${order.orderId}
Tracking ID: ${order.trackingId}
Status: ${currentStatus}
Placed: ${czechTime} (CET)

ITEMS
${items}

Subtotal: $${order.subtotal.toFixed(2)}
Shipping: FREE
VAT (20%): $${order.tax.toFixed(2)}
Total: $${order.total.toFixed(2)}

SHIPPING TO
${order.customer.name}
${order.customer.address}, ${order.customer.city}${order.customer.state ? `, ${order.customer.state}` : ""}
${order.customer.country} ${order.customer.zip}
${order.customer.email} | ${order.customer.phone}

${completedSteps ? `TRACKING UPDATES\n${completedSteps}\n` : ""}
Est. Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
Ships From: Prague, Czech Republic
${order.notes ? `\nInternal Notes: ${order.notes}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ShipNest · Premium Tech · Shipped from Prague, CZ 🇨🇿
Track your order: shipnest-cz.lovable.app/track/${order.trackingId}`;

    navigator.clipboard.writeText(text);
    toast.success(`"${subject}" copied to clipboard!`);
  };

  const updateStep = (stepId: string, updates: Partial<TrackingStep>) => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      trackingSteps: editingOrder.trackingSteps.map(s =>
        s.id === stepId ? { ...s, ...updates, timestamp: updates.completed && !s.timestamp ? new Date().toISOString() : (updates.timestamp ?? s.timestamp) } : s
      ),
    });
  };

  const addStep = () => {
    if (!editingOrder) return;
    const newStep: TrackingStep = {
      id: crypto.randomUUID(), status: "New Step", icon: "📍",
      city: "", state: "", country: "", timestamp: "", completed: false,
    };
    setEditingOrder({ ...editingOrder, trackingSteps: [...editingOrder.trackingSteps, newStep] });
  };

  const removeStep = (stepId: string) => {
    if (!editingOrder) return;
    setEditingOrder({ ...editingOrder, trackingSteps: editingOrder.trackingSteps.filter(s => s.id !== stepId) });
  };

  const inputClass = "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground";
  const labelClass = "text-[10px] text-muted-foreground font-medium tracking-widest uppercase mb-1 block";

  const tabs = [
    { id: "dashboard" as const, icon: BarChart3, label: "Dashboard" },
    { id: "orders" as const, icon: Package, label: "Orders" },
    { id: "products" as const, icon: Eye, label: "Products" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Control Panel</h1>
          <p className="text-xs text-muted-foreground mt-0.5">ShipNest Admin · {new Date().toLocaleString("en-GB", { timeZone: "Europe/Prague" })}</p>
        </div>
        <button onClick={() => setAuthenticated(false)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors bg-card border border-border rounded-lg px-3 py-2">
          <LogOut className="w-3 h-3" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            <t.icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Package, label: "Total Orders", value: orders.length, color: "text-foreground" },
              { icon: Clock, label: "Processing", value: processing, color: "text-foreground" },
              { icon: CheckCircle, label: "Delivered", value: delivered, color: "text-emerald-600" },
              { icon: DollarSign, label: "Revenue", value: `$${totalRevenue.toFixed(0)}`, color: "text-foreground" },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wider">{s.label.toUpperCase()}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          {orders.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm">Recent Orders</h3>
                <button onClick={() => setTab("orders")} className="text-xs text-muted-foreground hover:text-foreground">View all →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border text-muted-foreground bg-muted/30">
                    <th className="p-3 text-left font-medium">Order</th>
                    <th className="p-3 text-left font-medium">Customer</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Total</th>
                    <th className="p-3 text-left font-medium">Action</th>
                  </tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.orderId} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-medium text-foreground">{o.orderId}</td>
                        <td className="p-3 text-foreground">{o.customer.name}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-foreground text-background">{o.status}</span></td>
                        <td className="p-3 font-medium text-foreground">${o.total.toFixed(2)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingOrder({ ...o })} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => copyOrderDetails(o)} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                              <ClipboardCopy className="w-3 h-3" /> Copy
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
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input placeholder="Search by Order ID, Customer, or Tracking ID..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground" />
            </div>
            <button onClick={generateFakeOrder}
              className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium bg-card border border-border rounded-xl hover:border-foreground/30 transition-colors text-foreground">
              <Shuffle className="w-3.5 h-3.5" /> Generate Order
            </button>
            {selectedOrders.size > 0 && (
              <button onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium bg-destructive/10 border border-destructive/30 rounded-xl hover:bg-destructive/20 transition-colors text-destructive">
                <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedOrders.size})
              </button>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 bg-card border border-border rounded-xl">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No orders found</p>
              <button onClick={generateFakeOrder} className="mt-3 text-xs text-foreground underline">Generate a test order</button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border text-muted-foreground bg-muted/30">
                    <th className="p-3 text-left font-medium">
                      <input type="checkbox" checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAll} className="rounded border-border w-3.5 h-3.5" />
                    </th>
                    <th className="p-3 text-left font-medium">Order ID</th>
                    <th className="p-3 text-left font-medium">Customer</th>
                    <th className="p-3 text-left font-medium">Tracking</th>
                    <th className="p-3 text-left font-medium">Items</th>
                    <th className="p-3 text-left font-medium">Total</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.orderId} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${selectedOrders.has(o.orderId) ? "bg-muted/30" : ""}`}>
                        <td className="p-3">
                          <input type="checkbox" checked={selectedOrders.has(o.orderId)}
                            onChange={() => toggleSelectOrder(o.orderId)} className="rounded border-border w-3.5 h-3.5" />
                        </td>
                        <td className="p-3 font-medium text-foreground">{o.orderId}</td>
                        <td className="p-3">
                          <p className="text-foreground font-medium">{o.customer.name}</p>
                          <p className="text-muted-foreground">{o.customer.email}</p>
                        </td>
                        <td className="p-3 text-foreground font-medium">{o.trackingId}</td>
                        <td className="p-3 text-foreground">{o.items.length} item{o.items.length > 1 ? "s" : ""}</td>
                        <td className="p-3 font-medium text-foreground">${o.total.toFixed(2)}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-foreground text-background">{o.status}</span></td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingOrder({ ...o })}
                              className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => copyOrderDetails(o)}
                              className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <ClipboardCopy className="w-3 h-3" /> Copy
                            </button>
                            {deleteConfirm === o.orderId ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDeleteOrder(o.orderId)}
                                  className="flex items-center gap-1 text-destructive font-semibold">
                                  <AlertTriangle className="w-3 h-3" /> Confirm
                                </button>
                                <button onClick={() => setDeleteConfirm(null)}
                                  className="text-muted-foreground text-[10px]">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(o.orderId)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            )}
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
      )}

      {/* Products */}
      {tab === "products" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
              <img src={p.image} alt={p.name} className="w-14 h-14 object-contain rounded-lg bg-white" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{p.brand}</p>
                <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-foreground">${p.price}</span>
                  {p.badge && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-foreground text-background">{p.badge}</span>}
                  <span className={`text-[9px] font-bold ${p.inStock ? "text-emerald-600" : "text-destructive"}`}>
                    {p.inStock ? "● In Stock" : "● Out"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 max-w-md">
          <h3 className="font-bold text-foreground text-sm">System Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Platform</span><span className="text-foreground">ShipNest v2.0</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Timezone</span><span className="text-foreground">Europe/Prague (CET)</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Orders</span><span className="text-foreground">{orders.length}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Products</span><span className="text-foreground">{products.length}</span></div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-start justify-center overflow-y-auto py-4 px-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Edit Order</h2>
                <p className="text-xs text-muted-foreground">{editingOrder.orderId}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyOrderDetails(editingOrder)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-muted border border-border rounded-lg hover:border-foreground/30 transition-colors text-foreground">
                  <ClipboardCopy className="w-3.5 h-3.5" /> Copy for Email
                </button>
                <button onClick={() => setEditingOrder(null)} className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded-lg">✕</button>
              </div>
            </div>

            {/* Customer Details Section */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button onClick={() => toggleSection("customer")} className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-foreground" />
                  <span className="font-semibold text-foreground text-sm">Customer Details</span>
                </div>
                {expandedSections.customer ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedSections.customer && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Name</label><input value={editingOrder.customer.name} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, name: e.target.value } })} className={inputClass} /></div>
                    <div><label className={labelClass}>Email</label><input value={editingOrder.customer.email} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, email: e.target.value } })} className={inputClass} /></div>
                    <div><label className={labelClass}>Phone</label><input value={editingOrder.customer.phone} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, phone: e.target.value } })} className={inputClass} /></div>
                    <div><label className={labelClass}>Address</label><input value={editingOrder.customer.address} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, address: e.target.value } })} className={inputClass} /></div>
                    <div><label className={labelClass}>City</label><input value={editingOrder.customer.city} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, city: e.target.value } })} className={inputClass} /></div>
                    <div><label className={labelClass}>State</label><input value={editingOrder.customer.state} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, state: e.target.value } })} className={inputClass} /></div>
                    <div><label className={labelClass}>Country</label><input value={editingOrder.customer.country} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, country: e.target.value } })} className={inputClass} /></div>
                    <div><label className={labelClass}>ZIP</label><input value={editingOrder.customer.zip} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, zip: e.target.value } })} className={inputClass} /></div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Details Section */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button onClick={() => toggleSection("order")} className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-foreground" />
                  <span className="font-semibold text-foreground text-sm">Order Details</span>
                </div>
                {expandedSections.order ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedSections.order && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Tracking ID</label>
                      <div className="flex gap-2">
                        <input value={editingOrder.trackingId} onChange={e => setEditingOrder({ ...editingOrder, trackingId: e.target.value })} className={inputClass} />
                        <button onClick={() => setEditingOrder({ ...editingOrder, trackingId: generateTrackingId() })}
                          className="shrink-0 p-2.5 bg-muted border border-border rounded-lg hover:border-foreground/30 transition-colors" title="Generate new">
                          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Estimated Delivery</label>
                      <input type="date" value={editingOrder.estimatedDelivery.split("T")[0]}
                        onChange={e => setEditingOrder({ ...editingOrder, estimatedDelivery: new Date(e.target.value).toISOString() })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Admin Notes</label>
                    <textarea value={editingOrder.notes} onChange={e => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                      placeholder="Internal notes..." rows={2} className={inputClass} />
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Timeline Section */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button onClick={() => toggleSection("timeline")} className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-foreground" />
                  <span className="font-semibold text-foreground text-sm">Tracking Timeline</span>
                  <span className="text-[10px] text-muted-foreground">({editingOrder.trackingSteps.length} steps)</span>
                </div>
                {expandedSections.timeline ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedSections.timeline && (
                <div className="p-4 space-y-3">
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {editingOrder.trackingSteps.map((step, i) => (
                      <div key={step.id} className={`border rounded-xl p-3 space-y-2 transition-all ${step.completed ? "border-foreground/30 bg-muted/30" : "border-border"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{step.icon}</span>
                            <span className="text-[10px] text-muted-foreground font-medium tracking-wider">STEP {i + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-[10px] text-foreground cursor-pointer bg-muted px-2 py-1 rounded-lg">
                              <input type="checkbox" checked={step.completed}
                                onChange={e => updateStep(step.id, { completed: e.target.checked })}
                                className="rounded border-border w-3 h-3" />
                              Done
                            </label>
                            <button onClick={() => removeStep(step.id)} className="p-1 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={labelClass}>Status</label>
                            <input value={step.status} onChange={e => updateStep(step.id, { status: e.target.value })} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Icon</label>
                            <select value={step.icon} onChange={e => updateStep(step.id, { icon: e.target.value })} className={inputClass}>
                              {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>City</label>
                            <input value={step.city} onChange={e => updateStep(step.id, { city: e.target.value })} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>State</label>
                            <input value={step.state} onChange={e => updateStep(step.id, { state: e.target.value })} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Country</label>
                            <input value={step.country} onChange={e => updateStep(step.id, { country: e.target.value })} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Timestamp</label>
                            <input type="datetime-local" value={step.timestamp ? step.timestamp.slice(0, 16) : ""}
                              onChange={e => updateStep(step.id, { timestamp: e.target.value ? new Date(e.target.value).toISOString() : "" })} className={inputClass} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={addStep} className="w-full border border-dashed border-border rounded-xl p-3 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-3.5 h-3.5" /> Add Tracking Step
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={saveOrder}
                className="flex-1 bg-foreground text-background py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors">
                <Save className="w-4 h-4" /> Save All Changes
              </button>
              <button onClick={() => { if (confirm("Delete this order permanently?")) handleDeleteOrder(editingOrder.orderId); }}
                className="px-5 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-colors">
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
