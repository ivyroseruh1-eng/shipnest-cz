import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
  const { items, removeFromCart, updateQty, subtotal } = useCart();
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold font-orbitron text-foreground">Your cart is empty</h1>
        <Link to="/shop" className="inline-block gold-gradient text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-orbitron text-foreground mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-contain rounded-lg bg-muted/30"
                onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase">{item.product.brand}</p>
                <h3 className="text-sm font-semibold text-foreground truncate">{item.product.name}</h3>
                <p className="text-lg font-bold font-orbitron text-foreground mt-1">${item.product.price}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 bg-muted rounded-lg">
                  <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="p-2 text-foreground hover:text-primary"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm font-bold w-6 text-center text-foreground">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="p-2 text-foreground hover:text-primary"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-6 h-fit space-y-4">
          <h2 className="text-lg font-bold font-orbitron text-foreground">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success font-semibold">FREE</span></div>
            <div className="flex justify-between text-muted-foreground"><span>VAT (20%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="border-t border-border pt-2 flex justify-between text-foreground font-bold text-lg">
              <span>Total</span><span className="font-orbitron">${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout"
            className="block w-full gold-gradient text-primary-foreground py-3 rounded-xl font-bold text-center hover:opacity-90 transition-opacity">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
