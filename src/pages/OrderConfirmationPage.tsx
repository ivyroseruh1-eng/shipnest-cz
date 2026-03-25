import { useParams, Link } from "react-router-dom";
import { CheckCircle, Copy, Package, ShoppingCart } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { getOrder } = useOrders();
  const order = getOrder(orderId || "");

  if (!order) return <div className="text-center py-20 text-foreground">Order not found</div>;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
        <CheckCircle className="w-24 h-24 text-success mx-auto" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
        <h1 className="text-3xl font-black font-orbitron text-foreground">Order Placed Successfully!</h1>
        <p className="text-muted-foreground">Your order is being prepared at our Prague warehouse</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">TRACKING ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black font-orbitron gold-text">{order.trackingId}</span>
            <button onClick={() => copyToClipboard(order.trackingId, "Tracking ID")}
              className="p-2 rounded-lg bg-muted hover:bg-primary/20 transition-colors">
              <Copy className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">ORDER ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg font-bold font-orbitron text-foreground">{order.orderId}</span>
            <button onClick={() => copyToClipboard(order.orderId, "Order ID")}
              className="p-2 rounded-lg bg-muted hover:bg-primary/20 transition-colors">
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-left">
          <div><p className="text-muted-foreground">Est. Delivery</p><p className="text-foreground font-semibold">{new Date(order.estimatedDelivery).toLocaleDateString()}</p></div>
          <div><p className="text-muted-foreground">Ships From</p><p className="text-foreground font-semibold">Prague, Czech Republic 🇨🇿</p></div>
          <div><p className="text-muted-foreground">Total</p><p className="text-foreground font-semibold font-orbitron">${order.total.toFixed(2)}</p></div>
          <div><p className="text-muted-foreground">Recipient</p><p className="text-foreground font-semibold">{order.customer.name}</p></div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/track/${order.trackingId}`}
          className="gold-gradient text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90">
          <Package className="w-5 h-5" /> Track Order
        </Link>
        <Link to="/shop"
          className="border border-border text-foreground px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muted transition-colors">
          <ShoppingCart className="w-5 h-5" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
