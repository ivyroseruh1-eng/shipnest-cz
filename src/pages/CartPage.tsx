import { Link } from "react-router-dom";
import ProductImage from "@/components/ProductImage";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Lock } from "lucide-react";
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
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
          <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Your shopping bag is empty.</h1>
          <p className="text-muted-foreground text-[14px]">
            Explore our curated catalog of authentic flagships and certified luxury with worldwide express delivery.
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
    <div className="bg-background min-h-screen text-foreground py-6 sm:py-10 lg:py-14 pb-36 lg:pb-16 w-full max-w-full overflow-x-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 w-full max-w-full min-w-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Review Your Bag
          </h1>
          <p className="text-muted-foreground text-[13px] sm:text-[14px] mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} · Dispatches within 24 hours via Insured Air Express
          </p>
        </div>

        {/* Free Shipping Progress Callout (Mobile-first compact banner) */}
        <div className="mb-6 p-3.5 sm:p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3 w-full max-w-full min-w-0 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] sm:text-[13px] font-semibold text-foreground">
              Complimentary Insured Air Express Unlocked
            </p>
            <p className="text-[11px] sm:text-[12px] text-muted-foreground truncate">
              Includes 100% full declared value transit coverage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start w-full max-w-full min-w-0">
          {/* Left Column (8 cols): Mobile-First Cart Items List */}
          <div className="lg:col-span-8 divide-y divide-border/70 border border-border/80 rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-6 lg:p-8 shadow-xs w-full max-w-full min-w-0 overflow-hidden">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="py-4 sm:py-6 first:pt-0 last:pb-0 flex gap-3.5 sm:gap-5 items-start w-full min-w-0"
              >
                {/* Product Thumbnail (Standardized Studio Container) */}
                <Link
                  to={`/product/${item.product.id}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-border/70 flex items-center justify-center p-2 shrink-0 overflow-hidden bg-white shadow-2xs"
                >
                  <ProductImage
                    src={item.product.image}
                    fallbackImages={item.product.fallbackImages}
                    alt={item.product.name}
                    department={item.product.department}
                    category={item.product.category}
                    width={160}
                    height={160}
                    className="w-full h-full object-contain"
                  />
                </Link>

                {/* Content & Controls (Mobile First Layout) */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary block truncate">
                          {item.product.brand}
                        </span>
                        <Link
                          to={`/product/${item.product.id}`}
                          className="text-[14px] sm:text-[15px] font-semibold text-foreground hover:text-primary transition-colors block truncate"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      {/* Delete Icon (Comfortable mobile touch target) */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-8 h-8 -mr-1.5 -mt-1 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10 flex items-center justify-center shrink-0 active:scale-90"
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] sm:text-[12px] text-muted-foreground truncate mt-0.5">
                      {item.product.specs?.[0] || "Authentic Sealed Package"}
                    </p>
                  </div>

                  {/* Quantity Stepper & Price Row */}
                  <div className="flex items-center justify-between gap-3 pt-3 mt-auto">
                    {/* Stepper with comfortable tap zones */}
                    <div className="flex items-center border border-border/80 rounded-full bg-secondary/60 p-0.5 shrink-0 shadow-2xs">
                      <button
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-all active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="w-7 sm:w-8 text-center text-[12px] sm:text-[13px] font-bold text-foreground tabular-nums select-none">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.product.id, item.qty + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-all active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                    {/* Price Block */}
                    <div className="text-right">
                      {item.qty > 1 && item.product.price !== null && (
                        <span className="text-[10px] text-muted-foreground block tabular-nums">
                          ${item.product.price.toLocaleString()} each
                        </span>
                      )}
                      <span className="text-[15px] sm:text-[16px] font-bold text-foreground tabular-nums">
                        {item.product.price !== null
                          ? `$${(item.product.price * item.qty).toLocaleString()}`
                          : "Upon Inquiry"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (4 cols): Order Summary */}
          <div className="lg:col-span-4 space-y-5 w-full max-w-full min-w-0">
            <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 w-full max-w-full min-w-0 overflow-hidden">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-foreground tracking-tight">Order Summary</h2>

              <div className="space-y-3 text-[13px] w-full min-w-0">
                <div className="flex justify-between items-baseline gap-2 text-muted-foreground min-w-0">
                  <span className="truncate">Subtotal</span>
                  <span className="text-foreground font-semibold tabular-nums shrink-0">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between items-baseline gap-2 text-emerald-600 font-medium min-w-0">
                    <span className="truncate">Discount</span>
                    <span className="tabular-nums shrink-0">-${appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline gap-2 text-muted-foreground min-w-0">
                  <span className="truncate">Worldwide Express Shipping</span>
                  <span className="text-emerald-600 font-semibold shrink-0">FREE</span>
                </div>

                <div className="flex justify-between items-baseline gap-2 text-muted-foreground min-w-0">
                  <span className="truncate">Estimated VAT & Duties (20%)</span>
                  <span className="text-foreground font-semibold tabular-nums shrink-0">${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="border-t border-border pt-3.5 flex justify-between items-baseline gap-2 text-foreground min-w-0">
                  <span className="text-[15px] sm:text-[16px] font-bold">Total</span>
                  <span className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums shrink-0">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="pt-2 border-t border-border/70 flex gap-2 w-full min-w-0">
                <input
                  type="text"
                  placeholder="Promo (e.g. SHIPNEST10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 min-w-0 bg-secondary/70 border border-border/80 rounded-xl px-3.5 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/70 border border-border text-foreground px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors shrink-0 active:scale-95"
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

              <div className="pt-2 space-y-1.5 text-[11px] text-muted-foreground text-center w-full min-w-0">
                <p className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" /> 256-bit SSL encrypted checkout
                </p>
                <p>30-day money-back guarantee with prepaid return labels.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Floating Checkout Action Bar (Apple / Amazon Style) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-20 shadow-xl">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium uppercase tracking-wider">Estimated Total</span>
            <span className="text-[18px] sm:text-[20px] font-bold text-foreground tabular-nums leading-none block mt-0.5">
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <Link
            to="/checkout"
            className="flex-1 max-w-[210px] bg-foreground text-background py-3 px-5 rounded-full font-semibold text-center text-[13px] sm:text-[14px] hover:bg-foreground/85 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" /> Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
