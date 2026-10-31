import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import {
  Package,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Heart,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

type Filter = "all" | "active" | "delivered" | "cancelled";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Delivered
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    case "Out for Delivery":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Truck className="w-3 h-3" /> Courier Out
        </span>
      );
    case "In Transit":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
          <Truck className="w-3 h-3" /> In Transit
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
          <Clock className="w-3 h-3" /> {status}
        </span>
      );
  }
};

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const myOrders = useMemo(() => {
    if (!user?.email) return [];
    return orders.filter(
      o => o.customer?.email?.toLowerCase() === user.email?.toLowerCase()
    );
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-muted-foreground">
        Loading account details…
      </div>
    );
  }

  if (!user) return null;

  const name =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Valued Customer";

  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center text-xl font-bold tracking-tight shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{name}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Member
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            toast.success("Signed out successfully");
            navigate("/");
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Purchases", value: counts.all, icon: Package },
          { label: "Active En Route", value: counts.active, icon: Truck },
          { label: "Delivered Packages", value: counts.delivered, icon: CheckCircle2 },
          { label: "Cancelled / Returns", value: counts.cancelled, icon: XCircle },
        ].map(t => (
          <div key={t.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold tracking-wider uppercase">{t.label}</span>
              <t.icon className="w-4 h-4 text-foreground" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{t.value}</p>
          </div>
        ))}
      </div>

      {/* Order Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-2">
        {(["all", "active", "delivered", "cancelled"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === f
                ? "bg-foreground text-background shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {f} {f !== "all" && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* My Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Order & Dispatch History</h2>
          <span className="text-xs text-muted-foreground">Dispatched via Prague Central</span>
        </div>

        {ordersLoading ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Loading shipment records…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <Package className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">No orders in this category</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Orders placed under {user.email} will automatically synchronize with live tracking milestones here.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-block mt-2 bg-foreground text-background px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-foreground/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const item = o.items[0];
              const eta = new Date(o.estimatedDelivery).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={o.id}
                  className="bg-card border border-border hover:border-foreground/30 transition-all rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-secondary/40 rounded-xl overflow-hidden flex items-center justify-center p-2 shrink-0">
                      <img
                        src={item?.image}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={o.status} />
                        <span className="text-xs font-mono font-semibold text-foreground">
                          {o.orderId}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {item?.name}
                        {o.items.length > 1 && (
                          <span className="text-muted-foreground font-normal text-xs ml-1">
                            +{o.items.length - 1} more item(s)
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Est. Delivery: {eta}
                        </span>
                        <span>Total: ${o.total.toLocaleString()}</span>
                        {o.deliveryPin && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground bg-secondary px-2 py-0.5 rounded-md">
                            <KeyRound className="w-3 h-3 text-primary" /> PIN: {o.deliveryPin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <Link
                      to={`/track/${o.trackingId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <span>Track Shipment</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border">
        {[
          {
            label: "Saved Wishlist",
            desc: "View saved electronics and price alerts",
            to: "/wishlist",
            icon: Heart,
          },
          {
            label: "Tracking Portal",
            desc: "Check live radar with tracking ID",
            to: "/track",
            icon: MapPin,
          },
          {
            label: "Returns & Warranty",
            desc: "30-day EU guarantee and return slips",
            to: "/returns",
            icon: RotateCcw,
          },
        ].map(q => (
          <Link
            key={q.label}
            to={q.to}
            className="bg-card border border-border hover:border-foreground/40 rounded-2xl p-5 flex items-start justify-between transition-all hover:-translate-y-0.5 group shadow-xs"
          >
            <div className="space-y-1">
              <div className="p-2 w-fit rounded-lg bg-secondary text-foreground mb-2 group-hover:bg-foreground group-hover:text-background transition-colors">
                <q.icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{q.label}</h3>
              <p className="text-xs text-muted-foreground">{q.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-2" />
          </Link>
        ))}
      </section>
    </div>
  );
};

export default AccountPage;