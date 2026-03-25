import { useState } from "react";
import { useOrders, generateTrackingId } from "@/context/OrderContext";
import { Order, TrackingStep } from "@/types";
import { toast } from "sonner";
import { LogOut, Edit, Package, DollarSign, Truck, CheckCircle, Plus, Trash2, Save } from "lucide-react";

const ADMIN_PASSWORD = "shipnest2024";
const ICONS = ["📦", "🏭", "🚚", "✈️", "🛬", "🔍", "🛵", "✅", "🔄", "🌍", "📍", "🚢"];

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"dashboard" | "orders" | "products">("dashboard");
  const { orders, updateOrder } = useOrders();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <h1 className="text-2xl font-bold font-orbitron text-foreground text-center">Admin Access</h1>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <input type="password" placeholder="Enter admin password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { if (password === ADMIN_PASSWORD) setAuthenticated(true); else toast.error("Wrong password"); }}}
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
          <button onClick={() => { if (password === ADMIN_PASSWORD) setAuthenticated(true); else toast.error("Wrong password"); }}
            className="w-full gold-gradient text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90">Login</button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const processing = orders.filter(o => o.status !== "Delivered").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;

  const saveOrder = () => {
    if (!editingOrder) return;
    const latestCompleted = [...editingOrder.trackingSteps].reverse().find(s => s.completed);
    const updatedOrder = { ...editingOrder, status: latestCompleted?.status || editingOrder.status };
    updateOrder(updatedOrder.orderId, updatedOrder);
    setEditingOrder(null);
    toast.success("Order updated!");
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

  const inputClass = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-orbitron text-foreground">Admin Panel</h1>
        <button onClick={() => setAuthenticated(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {(["dashboard", "orders", "products"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-card text-primary border border-border border-b-0" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: "Total Orders", value: orders.length, color: "text-accent" },
              { icon: Truck, label: "Processing", value: processing, color: "text-primary" },
              { icon: CheckCircle, label: "Delivered", value: delivered, color: "text-success" },
              { icon: DollarSign, label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "gold-text" },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                <p className="text-2xl font-bold font-orbitron text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          {orders.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border"><h3 className="font-bold text-foreground font-orbitron">Recent Orders</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-muted-foreground">
                    <th className="p-3 text-left">Order ID</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Total</th>
                  </tr></thead>
                  <tbody>
                    {orders.slice(0, 10).map(o => (
                      <tr key={o.orderId} className="border-b border-border/50">
                        <td className="p-3 font-orbitron text-xs text-foreground">{o.orderId}</td>
                        <td className="p-3 text-foreground">{o.customer.name}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold gold-gradient text-primary-foreground">{o.status}</span></td>
                        <td className="p-3 font-orbitron text-foreground">${o.total.toFixed(2)}</td>
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
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No orders yet</p>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-muted-foreground">
                    <th className="p-3 text-left">Order ID</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Tracking</th>
                    <th className="p-3 text-left">Items</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Actions</th>
                  </tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.orderId} className="border-b border-border/50">
                        <td className="p-3 font-orbitron text-xs text-foreground">{o.orderId}</td>
                        <td className="p-3"><p className="text-foreground">{o.customer.name}</p><p className="text-xs text-muted-foreground">{o.customer.email}</p></td>
                        <td className="p-3 font-orbitron text-xs gold-text">{o.trackingId}</td>
                        <td className="p-3 text-foreground">{o.items.length}</td>
                        <td className="p-3 font-orbitron text-foreground">${o.total.toFixed(2)}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold gold-gradient text-primary-foreground">{o.status}</span></td>
                        <td className="p-3">
                          <button onClick={() => setEditingOrder({ ...o })} className="flex items-center gap-1 text-accent hover:text-primary transition-colors text-xs">
                            <Edit className="w-3 h-3" /> Edit
                          </button>
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

      {/* Products (simplified view) */}
      {tab === "products" && (
        <div className="text-center text-muted-foreground py-10">
          <p>Products are managed via the data file. {orders.length} products loaded.</p>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full mx-4 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-orbitron text-foreground">Edit Order</h2>
              <button onClick={() => setEditingOrder(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Customer Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <input value={editingOrder.customer.name} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, name: e.target.value } })} placeholder="Name" className={inputClass} />
                <input value={editingOrder.customer.email} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, email: e.target.value } })} placeholder="Email" className={inputClass} />
                <input value={editingOrder.customer.phone} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, phone: e.target.value } })} placeholder="Phone" className={inputClass} />
                <input value={editingOrder.customer.address} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, address: e.target.value } })} placeholder="Address" className={inputClass} />
                <input value={editingOrder.customer.city} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, city: e.target.value } })} placeholder="City" className={inputClass} />
                <input value={editingOrder.customer.country} onChange={e => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, country: e.target.value } })} placeholder="Country" className={inputClass} />
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Order Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex gap-2">
                  <input value={editingOrder.trackingId} onChange={e => setEditingOrder({ ...editingOrder, trackingId: e.target.value })} placeholder="Tracking ID" className={inputClass} />
                  <button onClick={() => setEditingOrder({ ...editingOrder, trackingId: generateTrackingId() })}
                    className="shrink-0 px-3 py-2 bg-muted border border-border rounded-lg text-xs text-foreground hover:border-primary">New</button>
                </div>
                <input type="date" value={editingOrder.estimatedDelivery.split("T")[0]}
                  onChange={e => setEditingOrder({ ...editingOrder, estimatedDelivery: new Date(e.target.value).toISOString() })} className={inputClass} />
              </div>
              <textarea value={editingOrder.notes} onChange={e => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                placeholder="Admin notes..." rows={2} className={inputClass} />
            </div>

            {/* Tracking Steps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Tracking Timeline</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {editingOrder.trackingSteps.map((step, i) => (
                  <div key={step.id} className={`border rounded-xl p-4 space-y-3 ${step.completed ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-orbitron">Step {i + 1}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                          <input type="checkbox" checked={step.completed}
                            onChange={e => updateStep(step.id, { completed: e.target.checked })}
                            className="rounded border-border" /> ✅ Completed
                        </label>
                        <button onClick={() => removeStep(step.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={step.status} onChange={e => updateStep(step.id, { status: e.target.value })} placeholder="Status" className={inputClass} />
                      <select value={step.icon} onChange={e => updateStep(step.id, { icon: e.target.value })} className={inputClass}>
                        {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                      <input value={step.city} onChange={e => updateStep(step.id, { city: e.target.value })} placeholder="City" className={inputClass} />
                      <input value={step.state} onChange={e => updateStep(step.id, { state: e.target.value })} placeholder="State" className={inputClass} />
                      <input value={step.country} onChange={e => updateStep(step.id, { country: e.target.value })} placeholder="Country" className={inputClass} />
                      <input type="datetime-local" value={step.timestamp ? step.timestamp.slice(0, 16) : ""}
                        onChange={e => updateStep(step.id, { timestamp: e.target.value ? new Date(e.target.value).toISOString() : "" })} className={inputClass} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addStep} className="w-full border border-dashed border-border rounded-xl p-3 text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Tracking Step
              </button>
            </div>

            <button onClick={saveOrder}
              className="w-full gold-gradient text-primary-foreground py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90">
              <Save className="w-5 h-5" /> Save All Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
