import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { toast } from "sonner";

const CartPage = () => {
  const { items, removeFromCart, updateQty, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const tax = (subtotal - appliedDiscount) * 0.2;
  const total = Math.max(0, subtotal - appliedDiscount + tax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "SHIPNEST10") {
      setAppliedDiscount(subtotal * 0.1);
      toast.success("Promo code applied: 10% discount!");
    } else if (promoCode.trim().toUpperCase() === "WELCOME") {
      setAppliedDiscount(50);
      toast.success("$50 welcome credit applied!");
    } else {
      toast.error("Invalid or expired promotional code. Try SHIPNEST10");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
          <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Your shopping bag is empty.</h1>
          <p className="text-muted-foreground text-[14px]">
            Explore our curated catalog of authentic flagships with free worldwide express delivery.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3 rounded-full font-semibold text-[14px] hover:bg-foreground/85 transition-colors shadow-sm"
        >
          Explore Store <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-foreground py-10 lg:py-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
          Review Your Bag
        </h1>
        <p className="text-muted-foreground text-[14px] mb-8">
          {items.length} {items.length === 1 ? "device" : "devices"} · Dispatches within 24 hours from Prague
        </p>

        {/* Free Shipping Progress Callout */}
        <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">
              Complimentary Worldwide Insured Air Express Unlocked!
            </p>
            <p className="text-[12px] text-muted-foreground">
              Your parcel includes 100% full declared value transit insurance with zero deductible.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (8 cols): Cart Items List */}
          <div className="lg:col-span-8 divide-y divide-border/80 border border-border rounded-3xl bg-card p-6 sm:p-8 shadow-xs">
            {items.map(item => (
              <div key={item.product.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-[#fbfbfd] border border-border/70 rounded-2xl flex items-center justify-center p-2 shrink-0 overflow-hidden"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </Link>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {item.product.brand}
                    </span>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="text-[15px] font-semibold text-foreground hover:text-primary transition-colors block truncate"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[12px] text-muted-foreground truncate">
                      {item.product.specs[0] || "Sealed EU Model"}
                    </p>
                    <p className="text-[14px] font-semibold text-foreground sm:hidden tabular-nums pt-1">
                      ${(item.product.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Right Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                  {/* Stepper */}
                  <div className="flex items-center border border-border rounded-full bg-secondary/50 p-0.5">
                    <button
                      onClick={() => updateQty(item.product.id, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-[13px] font-semibold text-foreground tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-[16px] font-bold text-foreground tabular-nums hidden sm:block w-24 text-right">
                    ${(item.product.price * item.qty).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (4 cols): Order Summary */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <h2 className="text-[18px] font-bold text-foreground tracking-tight">Order Summary</h2>

              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span className="tabular-nums">-${appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Worldwide Express Shipping</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated VAT & Duties (20%)</span>
                  <span className="text-foreground font-semibold tabular-nums">${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-border pt-3.5 flex justify-between items-baseline text-foreground">
                  <span className="text-[16px] font-bold">Total</span>
                  <span className="text-2xl font-bold tracking-tight tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="pt-2 border-t border-border/70 flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. SHIPNEST10)"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="w-full bg-secondary border border-border/80 rounded-xl px-3.5 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/70 border border-border text-foreground px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors shrink-0"
                >
                  Apply
                </button>
              </form>

              <Link
                to="/checkout"
                className="block w-full bg-foreground text-background py-3.5 rounded-full font-semibold text-center text-[14px] hover:bg-foreground/85 transition-all shadow-sm active:scale-98"
              >
                Proceed to Checkout
              </Link>

              <div className="pt-2 space-y-2 text-[11px] text-muted-foreground text-center">
                <p className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 256-bit SSL encrypted checkout
                </p>
                <p>30-day money-back guarantee with prepaid return labels.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
