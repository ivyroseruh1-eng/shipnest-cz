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
export const generateDeliveryPin = () => String(Math.floor(1000 + Math.random() * 9000));

// Day offsets from placedAt for each tracking step (16-step flow).
// Index matches the steps returned by createDefaultTrackingSteps.
export const STEP_DAY_OFFSETS = [0, 1, 6, 6, 8, 13, 15, 19, 21, 22, 23, 23, 24, 25, 26, 26];
// Hour-of-day (Prague time) at which each step should auto-complete.
// Out for delivery (idx 14) is intentionally between 9 and 18.
const STEP_HOUR_OFFSETS = [10, 14, 9, 11, 16, 9, 17, 8, 14, 11, 15, 9, 18, 10, 11, 16];

export const createDefaultTrackingSteps = (customerCity: string, customerState: string, customerCountry: string): TrackingStep[] => {
  const city = customerCity || "Your City";
  const state = customerState || "";
  const country = customerCountry || "India";
  const stateOrCity = state || city;
  return [
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
    { id: "13", status: `Dispatched to ${stateOrCity}`, icon: "🚛", city: "Guwahati", state: "Assam", country: "India", timestamp: "", completed: false },
    { id: "14", status: "Arrived at Local Delivery Hub", icon: "🏪", city, state, country, timestamp: "", completed: false },
    { id: "15", status: "Out for Delivery", icon: "🛵", city, state, country, timestamp: "", completed: false },
    { id: "16", status: "Delivered", icon: "✅", city, state, country, timestamp: "", completed: false },
  ];
};

// Compute the scheduled timestamp for a step given the order's placedAt.
const scheduledTimestampForStep = (placedAt: string, stepIndex: number): Date => {
  const dayOffset = STEP_DAY_OFFSETS[stepIndex] ?? stepIndex * 2;
  const hourOffset = STEP_HOUR_OFFSETS[stepIndex] ?? 12;
  const d = new Date(placedAt);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hourOffset, Math.floor(Math.random() * 60), 0, 0);
  return d;
};

// Auto-progress non-cancelled orders. Only fills forward — never unmarks completed steps.
// "Out for Delivery" only marks complete during 9:00–18:00 Prague time.
export const autoProgressTrackingSteps = (order: Order): { steps: TrackingStep[]; status: string; changed: boolean } => {
  if (order.status === "Cancelled") return { steps: order.trackingSteps, status: order.status, changed: false };

  const now = new Date();
  let changed = false;
  const steps = order.trackingSteps.map((step, i) => {
    if (step.completed) return step;
    const scheduled = scheduledTimestampForStep(order.placedAt, i);
    if (now < scheduled) return step;

    // Out for Delivery gating: only between 9am–6pm local Prague hour
    const isOutForDelivery = step.status === "Out for Delivery";
    if (isOutForDelivery) {
      const pragueHour = parseInt(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Prague", hour: "2-digit", hour12: false }).format(now), 10);
      if (pragueHour < 9 || pragueHour >= 18) return step;
    }

    changed = true;
    return { ...step, completed: true, timestamp: scheduled.toISOString() };
  });

  const lastCompleted = [...steps].reverse().find(s => s.completed);
  const newStatus = lastCompleted?.status || order.status;
  return { steps, status: newStatus, changed: changed || newStatus !== order.status };
};

export const createCancelledReturnSteps = (order: Order): TrackingStep[] => {
  const completedSteps = order.trackingSteps.filter(s => s.completed);
  const lastCompleted = completedSteps[completedSteps.length - 1];
  if (!lastCompleted) return [];

  const now = new Date();
  const cancelStep: TrackingStep = {
    id: crypto.randomUUID(), status: "❌ Order Cancelled", icon: "🚫",
    city: lastCompleted.city, state: lastCompleted.state, country: lastCompleted.country,
    timestamp: now.toISOString(), completed: true,
  };

  const returnRoute: { status: string; icon: string; city: string; state: string; country: string }[] = [];

  const hubOrder = [
    { city: "Guwahati", state: "Assam", country: "India" },
    { city: "New Delhi", state: "Delhi", country: "India" },
    { city: "Beijing", state: "Beijing", country: "China" },
    { city: "Istanbul", state: "Marmara", country: "Turkey" },
    { city: "Prague", state: "Bohemia", country: "Czech Republic" },
  ];

  let startIdx = -1;
  for (let i = 0; i < hubOrder.length; i++) {
    if (lastCompleted.city === hubOrder[i].city && lastCompleted.country === hubOrder[i].country) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    if (lastCompleted.country === "India") {
      returnRoute.push({ status: "Return: Picked up from customer", icon: "📦", city: lastCompleted.city, state: lastCompleted.state, country: "India" });
      startIdx = 0;
    } else {
      startIdx = hubOrder.length - 1;
    }
  }

  for (let i = startIdx; i < hubOrder.length; i++) {
    const hub = hubOrder[i];
    if (hub.city === "Prague") {
      returnRoute.push({ status: "Return: Arrived back at Prague warehouse", icon: "🏭", ...hub });
      returnRoute.push({ status: "Return: Refund processed", icon: "💰", ...hub });
    } else {
      returnRoute.push({ status: `Return: Departed from ${hub.city}`, icon: "✈️", ...hub });
    }
  }

  const returnSteps: TrackingStep[] = returnRoute.map(r => ({
    id: crypto.randomUUID(),
    status: r.status, icon: r.icon, city: r.city, state: r.state, country: r.country,
    timestamp: "", completed: false,
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
  deliveryPin: row.delivery_pin || "",
  trackingSteps: row.tracking_steps as any,
});

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Supabase on mount and run auto-progress
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch orders:", error);
        const saved = localStorage.getItem("shipnest-orders");
        if (saved) setOrders(JSON.parse(saved));
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(mapDbToOrder);
      // Auto-progress every order based on elapsed time, persist any changes
      const progressed = await Promise.all(mapped.map(async (o) => {
        // Backfill missing pin
        let needsPinUpdate = false;
        let pin = o.deliveryPin;
        if (!pin) {
          pin = generateDeliveryPin();
          needsPinUpdate = true;
        }

        const { steps, status, changed } = autoProgressTrackingSteps(o);
        if (changed || needsPinUpdate) {
          const updates: any = {};
          if (changed) {
            updates.tracking_steps = steps;
            updates.status = status;
          }
          if (needsPinUpdate) updates.delivery_pin = pin;
          supabase.from("orders").update(updates).eq("id", o.id).then(({ error: e }) => {
            if (e) console.error("Auto-progress save failed:", e);
          });
        }
        return { ...o, trackingSteps: steps, status, deliveryPin: pin };
      }));

      setOrders(progressed);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const addOrder = async (order: Order) => {
    const orderWithPin: Order = { ...order, deliveryPin: order.deliveryPin || generateDeliveryPin() };
    setOrders(prev => [orderWithPin, ...prev]);

    const { error } = await supabase.from("orders").insert({
      id: orderWithPin.id,
      order_id: orderWithPin.orderId,
      tracking_id: orderWithPin.trackingId,
      customer: orderWithPin.customer as any,
      items: orderWithPin.items as any,
      subtotal: orderWithPin.subtotal,
      tax: orderWithPin.tax,
      total: orderWithPin.total,
      status: orderWithPin.status,
      estimated_delivery: orderWithPin.estimatedDelivery,
      placed_at: orderWithPin.placedAt,
      notes: orderWithPin.notes,
      payment_method: orderWithPin.paymentMethod || "",
      delivery_pin: orderWithPin.deliveryPin,
      tracking_steps: orderWithPin.trackingSteps as any,
    });

    if (error) {
      console.error("Failed to save order:", error);
      const saved = localStorage.getItem("shipnest-orders");
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem("shipnest-orders", JSON.stringify([orderWithPin, ...existing]));
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, ...updates } : o));

    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.trackingSteps !== undefined) dbUpdates.tracking_steps = updates.trackingSteps;
    if (updates.estimatedDelivery !== undefined) dbUpdates.estimated_delivery = updates.estimatedDelivery;
    if (updates.customer !== undefined) dbUpdates.customer = updates.customer;
    if (updates.items !== undefined) dbUpdates.items = updates.items;
    if (updates.deliveryPin !== undefined) dbUpdates.delivery_pin = updates.deliveryPin;

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

  const cancelOrder = (orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;
    const newSteps = createCancelledReturnSteps(order);
    updateOrder(orderId, { status: "Cancelled", trackingSteps: newSteps });
  };

  const getOrder = (idOrTracking: string) => {
    return orders.find(o => o.orderId === idOrTracking || o.trackingId === idOrTracking);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, cancelOrder, getOrder, loading }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};

// Helper exposed for UI components — returns the next scheduled date for a pending step
export const getScheduledTimestamp = (placedAt: string, stepIndex: number): Date =>
  scheduledTimestampForStep(placedAt, stepIndex);
