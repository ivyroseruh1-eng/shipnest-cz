import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
  const { items, removeFromCart, updateQty, subtotal } = useCart();
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-[980px] mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" strokeWidth={1.5} />
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Your bag is empty.</h1>
        <p className="text-muted-foreground text-[15px]">Take a moment to discover what's possible.</p>
        <Link to="/shop" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium text-[14px] hover:bg-primary/90 transition-colors mt-4">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[980px] mx-auto px-4 py-12">
      <h1 className="display text-4xl sm:text-5xl text-foreground text-center mb-2">Bag</h1>
      <p className="text-center text-muted-foreground mb-10">{items.length} {items.length === 1 ? "item" : "items"}</p>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-6 pb-8 border-b border-border last:border-0">
              <Link to={`/product/${item.product.id}`} className="w-28 h-28 bg-secondary rounded-2xl flex items-center justify-center shrink-0 p-3">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
              </Link>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[12px] text-muted-foreground">{item.product.brand}</p>
                <Link to={`/product/${item.product.id}`} className="text-[16px] font-semibold text-foreground hover:opacity-75 transition-opacity block">{item.product.name}</Link>
                <p className="text-[13px] text-muted-foreground">Free delivery</p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 bg-secondary rounded-full">
                    <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="p-2 text-foreground hover:text-primary"><Minus className="w-3 h-3" /></button>
                    <span className="text-[13px] font-medium w-6 text-center text-foreground">{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="p-2 text-foreground hover:text-primary"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="text-[16px] font-semibold text-foreground">${(item.product.price * item.qty).toFixed(2)}</p>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors h-fit" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-secondary rounded-2xl p-6 h-fit space-y-5">
          <h2 className="text-[18px] font-semibold text-foreground">Order Summary</h2>
          <div className="space-y-3 text-[14px]">
            <div className="flex justify-between text-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-foreground"><span>Shipping</span><span className="text-success font-medium">FREE</span></div>
            <div className="flex justify-between text-foreground"><span>Estimated Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="border-t border-border pt-3 flex justify-between text-foreground font-semibold text-[18px]">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout"
            className="block w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-center text-[15px] hover:bg-primary/90 transition-colors">
            Check Out
          </Link>
          <p className="text-[11px] text-muted-foreground text-center">Free returns within 30 days.</p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
