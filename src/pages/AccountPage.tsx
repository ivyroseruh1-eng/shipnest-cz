import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { Package, MapPin, Settings, LogOut, ChevronRight, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

type Filter = "all" | "active" | "delivered" | "cancelled";

const StatusBadge = ({ status }: { status: string }) => {
  const isDelivered = status === "Delivered";
  const isCancelled = status === "Cancelled";
  const cls = isDelivered ? "bg-success/10 text-success" : isCancelled ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>{status}</span>;
};

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);

  const myOrders = useMemo(() => {
    if (!user?.email) return [];
    return orders.filter(o => o.customer?.email?.toLowerCase() === user.email?.toLowerCase());
  }, [orders, user]);

  const filtered = useMemo(() => {
    if (filter === "all") return myOrders;
    if (filter === "delivered") return myOrders.filter(o => o.status === "Delivered");
    if (filter === "cancelled") return myOrders.filter(o => o.status === "Cancelled");
    return myOrders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
  }, [myOrders, filter]);

  const counts = {
    all: myOrders.length,
    active: myOrders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length,
    delivered: myOrders.filter(o => o.status === "Delivered").length,
    cancelled: myOrders.filter(o => o.status === "Cancelled").length,
  };

  if (loading) return <div className="max-w-[980px] mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  const name = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "there";

  return (
    <div className="max-w-[980px] mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="display text-4xl text-foreground">Hi, {name}.</h1>
          <p className="text-[14px] text-muted-foreground mt-1">{user.email}</p>
        </div>
        <button onClick={async () => { await signOut(); toast.success("Signed out"); navigate("/"); }}
          className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: counts.all, icon: Package },
          { label: "Active", value: counts.active, icon: Truck },
          { label: "Delivered", value: counts.delivered, icon: CheckCircle2 },
          { label: "Cancelled", value: counts.cancelled, icon: XCircle },
        ].map(t => (
          <div key={t.label} className="bg-secondary rounded-2xl p-4">
            <t.icon className="w-4 h-4 text-muted-foreground" />
            <p className="text-2xl font-semibold text-foreground mt-2">{t.value}</p>
            <p className="text-[12px] text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "active", "delivered", "cancelled"] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium capitalize transition-colors ${filter === f ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f} {f !== "all" && `· ${counts[f]}`}
          </button>
        ))}
      </div>

      {/* My Orders */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">My Orders</h2>
        {ordersLoading ? (
          <p className="text-muted-foreground text-[14px]">Loading orders…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-secondary rounded-2xl p-10 text-center">
            <Package className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-[14px] text-foreground mt-3 font-medium">No orders here yet</p>
            <p className="text-[12px] text-muted-foreground mt-1">Your purchases tied to {user.email} will show up here automatically.</p>
            <Link to="/shop" className="inline-block mt-4 bg-primary text-primary-foreground px-5 py-2 rounded-full text-[13px] font-medium hover:bg-primary/90 transition-colors">Browse products</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const item = o.items[0];
              const eta = new Date(o.estimatedDelivery).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              return (
                <Link key={o.id} to={`/track/${o.trackingId}`}
                  className="block bg-secondary hover:bg-secondary/70 transition-colors rounded-2xl p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <img src={item?.image} alt="" className="w-16 h-16 object-contain bg-background rounded-xl p-1.5 shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={o.status} />
                        <p className="text-[11px] text-muted-foreground font-mono">{o.orderId}</p>
                      </div>
                      <p className="text-[14px] font-semibold text-foreground mt-1 truncate">{item?.name}{o.items.length > 1 && <span className="text-muted-foreground font-normal"> +{o.items.length - 1} more</span>}</p>
                      <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />ETA {eta}</span>
                        <span>${o.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Wishlist", to: "/wishlist", icon: Package },
          { label: "Track Order", to: "/track", icon: MapPin },
          { label: "Support", to: "/contact", icon: Settings },
        ].map(q => (
          <Link key={q.label} to={q.to} className="bg-secondary hover:bg-secondary/70 rounded-2xl p-4 flex items-center justify-between transition-colors">
            <span className="text-[14px] text-foreground font-medium flex items-center gap-2"><q.icon className="w-4 h-4 text-muted-foreground" />{q.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </section>
    </div>
  );
};

export default AccountPage;