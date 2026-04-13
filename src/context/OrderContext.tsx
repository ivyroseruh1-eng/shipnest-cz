import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Order, TrackingStep } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => void;
  getOrder: (idOrTracking: string) => Order | undefined;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const generateTrackingId = () => "SNX" + Math.floor(1000000 + Math.random() * 9000000);
export const generateOrderId = () => "SN" + Date.now().toString().slice(-8) + Math.floor(10 + Math.random() * 90);

export const createDefaultTrackingSteps = (customerCity: string, customerState: string, customerCountry: string): TrackingStep[] => [
  { id: "1", status: "Order Placed", icon: "📦", city: "Prague", state: "Bohemia", country: "Czech Republic", timestamp: new Date().toISOString(), completed: true },
  { id: "2", status: "Processing at Warehouse", icon: "🏭", city: "Prague", state: "Bohemia", country: "Czech Republic", timestamp: "", completed: false },
  { id: "3", status: "Departed from Prague", icon: "✈️", city: "Prague", state: "Bohemia", country: "Czech Republic", timestamp: "", completed: false },
  { id: "4", status: "In Transit to Istanbul", icon: "🌍", city: "Istanbul", state: "Marmara", country: "Turkey", timestamp: "", completed: false },
  { id: "5", status: "Arrived at Istanbul Hub", icon: "🛬", city: "Istanbul", state: "Marmara", country: "Turkey", timestamp: "", completed: false },
  { id: "6", status: "In Transit to Beijing", icon: "✈️", city: "Beijing", state: "Beijing", country: "China", timestamp: "", completed: false },
  { id: "7", status: "Arrived at Beijing Hub", icon: "🛬", city: "Beijing", state: "Beijing", country: "China", timestamp: "", completed: false },
  { id: "8", status: "In Transit to New Delhi", icon: "✈️", city: "New Delhi", state: "Delhi", country: "India", timestamp: "", completed: false },
  { id: "9", status: "Arrived at New Delhi", icon: "🛬", city: "New Delhi", state: "Delhi", country: "India", timestamp: "", completed: false },
  { id: "10", status: "Received at Local Warehouse", icon: "🏭", city: "New Delhi", state: "Delhi", country: "India", timestamp: "", completed: false },
  { id: "11", status: "Moving to Regional Hub", icon: "🚚", city: "Guwahati", state: "Assam", country: "India", timestamp: "", completed: false },
  { id: "12", status: "Arrived at Regional Hub", icon: "📍", city: "Guwahati", state: "Assam", country: "India", timestamp: "", completed: false },
  { id: "13", status: "Out for Delivery", icon: "🛵", city: customerCity || "Your City", state: customerState, country: customerCountry || "India", timestamp: "", completed: false },
  { id: "14", status: "Delivered", icon: "✅", city: customerCity || "Your City", state: customerState, country: customerCountry || "India", timestamp: "", completed: false },
];

export const createCancelledReturnSteps = (order: Order): TrackingStep[] => {
  // Find the last completed step to know where the package currently is
  const completedSteps = order.trackingSteps.filter(s => s.completed);
  const lastCompleted = completedSteps[completedSteps.length - 1];
  if (!lastCompleted) return [];

  const now = new Date();
  const cancelStep: TrackingStep = {
    id: crypto.randomUUID(), status: "❌ Order Cancelled", icon: "🚫",
    city: lastCompleted.city, state: lastCompleted.state, country: lastCompleted.country,
    timestamp: now.toISOString(), completed: true,
  };

  // Build return journey based on where the package currently is
  const returnRoute: { status: string; icon: string; city: string; state: string; country: string }[] = [];
  const locationKey = `${lastCompleted.city}-${lastCompleted.country}`;

  // Reverse route: wherever it is → back through hubs → Prague
  const hubOrder = [
    { city: "Guwahati", state: "Assam", country: "India" },
    { city: "New Delhi", state: "Delhi", country: "India" },
    { city: "Beijing", state: "Beijing", country: "China" },
    { city: "Istanbul", state: "Marmara", country: "Turkey" },
    { city: "Prague", state: "Bohemia", country: "Czech Republic" },
  ];

  // Find the index of the last completed location in the hub order
  let startIdx = -1;
  for (let i = 0; i < hubOrder.length; i++) {
    if (lastCompleted.city === hubOrder[i].city && lastCompleted.country === hubOrder[i].country) {
      startIdx = i;
      break;
    }
  }

  // If location is a customer city (not a hub), start return from nearest hub
  if (startIdx === -1) {
    // Check if it's an Indian city (customer destination)
    if (lastCompleted.country === "India") {
      returnRoute.push({ status: "Return: Picked up from customer", icon: "📦", city: lastCompleted.city, state: lastCompleted.state, country: "India" });
      startIdx = 0; // Start from Guwahati
    } else {
      startIdx = hubOrder.length - 1; // Default to Prague
    }
  }

  // Add return hubs from current position back to Prague
  for (let i = startIdx; i < hubOrder.length; i++) {
    const hub = hubOrder[i];
    if (hub.city === "Prague") {
      returnRoute.push({ status: "Return: Arrived back at Prague warehouse", icon: "🏭", ...hub });
      returnRoute.push({ status: "Return: Refund processed", icon: "💰", ...hub });
    } else {
      returnRoute.push({ status: `Return: Departed from ${hub.city}`, icon: "✈️", ...hub });
    }
  }

  const returnSteps: TrackingStep[] = returnRoute.map((r, i) => ({
    id: crypto.randomUUID(),
    status: r.status,
    icon: r.icon,
    city: r.city,
    state: r.state,
    country: r.country,
    timestamp: "",
    completed: false,
  }));

  return [...completedSteps, cancelStep, ...returnSteps];
};

const mapDbToOrder = (row: any): Order => ({
  id: row.id,
  orderId: row.order_id,
  trackingId: row.tracking_id,
  customer: row.customer as any,
  items: row.items as any,
  subtotal: Number(row.subtotal),
  tax: Number(row.tax),
  total: Number(row.total),
  status: row.status,
  estimatedDelivery: row.estimated_delivery,
  placedAt: row.placed_at,
  notes: row.notes || "",
  paymentMethod: row.payment_method || "",
  trackingSteps: row.tracking_steps as any,
});

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Supabase on mount
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Failed to fetch orders:", error);
        // Fallback to localStorage
        const saved = localStorage.getItem("shipnest-orders");
        if (saved) setOrders(JSON.parse(saved));
      } else {
        setOrders((data || []).map(mapDbToOrder));
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const addOrder = async (order: Order) => {
    // Optimistic update
    setOrders(prev => [order, ...prev]);

    const { error } = await supabase.from("orders").insert({
      id: order.id,
      order_id: order.orderId,
      tracking_id: order.trackingId,
      customer: order.customer as any,
      items: order.items as any,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      estimated_delivery: order.estimatedDelivery,
      placed_at: order.placedAt,
      notes: order.notes,
      payment_method: (order as any).paymentMethod || "",
      tracking_steps: order.trackingSteps as any,
    });

    if (error) {
      console.error("Failed to save order:", error);
      // Still keep in localStorage as backup
      const saved = localStorage.getItem("shipnest-orders");
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem("shipnest-orders", JSON.stringify([order, ...existing]));
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, ...updates } : o));

    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.trackingSteps !== undefined) dbUpdates.tracking_steps = updates.trackingSteps;
    if (updates.estimatedDelivery !== undefined) dbUpdates.estimated_delivery = updates.estimatedDelivery;
    if (updates.customer !== undefined) dbUpdates.customer = updates.customer;
    if (updates.items !== undefined) dbUpdates.items = updates.items;

    const { error } = await supabase
      .from("orders")
      .update(dbUpdates)
      .eq("order_id", orderId);

    if (error) console.error("Failed to update order:", error);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
    const { error } = await supabase.from("orders").delete().eq("order_id", orderId);
    if (error) console.error("Failed to delete order:", error);
  };

  const getOrder = (idOrTracking: string) => {
    return orders.find(o => o.orderId === idOrTracking || o.trackingId === idOrTracking);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, getOrder, loading }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
