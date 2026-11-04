import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Order, TrackingStep } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { isIndiaDestination, calculateEstimatedDeliveryDate } from "@/lib/shipping";

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

// Day offsets from placedAt for each tracking step
// For India: 20–30 day delivery journey (Day 0 to Day 26)
export const STEP_DAY_OFFSETS_INDIA = [0, 0, 1, 2, 3, 4, 6, 16, 21, 24, 26, 26];
// For Europe / Global: 3–5 day delivery journey
export const STEP_DAY_OFFSETS_GLOBAL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 4];
// Backwards compatible alias for existing tests
export const STEP_DAY_OFFSETS = STEP_DAY_OFFSETS_INDIA;

// Hour-of-day (Prague time) at which each step completes
const STEP_HOUR_OFFSETS = [10, 10, 12, 14, 16, 18, 9, 11, 14, 9, 10, 16];

export const createDefaultTrackingSteps = (
  customerCity: string,
  customerState: string,
  customerCountry: string,
  basePlacedAt: string | Date = new Date()
): TrackingStep[] => {
  const isIndia = isIndiaDestination({
    city: customerCity,
    state: customerState,
    country: customerCountry,
  });

  const city = customerCity || (isIndia ? "Dimapur" : "Your City");
  const state = customerState || (isIndia ? "Nagaland" : "");
  const country = customerCountry || (isIndia ? "India" : "Destination");

  // Regional hub routing for Indian destinations
  let regionalHubCity = "Guwahati";
  let regionalHubState = "Assam";
  const stateLower = (state || "").toLowerCase();
  const cityLower = (city || "").toLowerCase();

  if (
    stateLower.includes("maharashtra") ||
    cityLower.includes("mumbai") ||
    cityLower.includes("pune")
  ) {
    regionalHubCity = "Mumbai";
    regionalHubState = "Maharashtra";
  } else if (
    stateLower.includes("karnataka") ||
    cityLower.includes("bengaluru") ||
    cityLower.includes("bangalore")
  ) {
    regionalHubCity = "Bengaluru";
    regionalHubState = "Karnataka";
  } else if (
    stateLower.includes("delhi") ||
    stateLower.includes("haryana") ||
    stateLower.includes("punjab")
  ) {
    regionalHubCity = "New Delhi";
    regionalHubState = "Delhi";
  } else if (stateLower.includes("tamil") || cityLower.includes("chennai")) {
    regionalHubCity = "Chennai";
    regionalHubState = "Tamil Nadu";
  } else if (stateLower.includes("west bengal") || cityLower.includes("kolkata")) {
    regionalHubCity = "Kolkata";
    regionalHubState = "West Bengal";
  }

  const customsCity = isIndia ? "New Delhi" : "Customs Hub";
  const customsState = isIndia ? "Delhi" : "";
  const base = new Date(basePlacedAt);
  const baseTime = isNaN(base.getTime()) ? Date.now() : base.getTime();

  return [
    {
      id: "1",
      status: "Order Received",
      icon: "📦",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      timestamp: new Date(baseTime).toISOString(),
      completed: true,
    },
    {
      id: "2",
      status: "Payment Confirmed",
      icon: "💳",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      timestamp: new Date(baseTime + 10 * 60000).toISOString(),
      completed: true,
    },
    {
      id: "3",
      status: "Processing",
      icon: "🏭",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      timestamp: new Date(baseTime + 45 * 60000).toISOString(),
      completed: true,
    },
    {
      id: "4",
      status: "Packed",
      icon: "📦",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      timestamp: new Date(baseTime + 120 * 60000).toISOString(),
      completed: true,
    },
    {
      id: "5",
      status: "Shipment Created",
      icon: "🏷️",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      timestamp: new Date(baseTime + 180 * 60000).toISOString(),
      completed: true,
    },
    {
      id: "6",
      status: "Departed Origin",
      icon: "✈️",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      timestamp: new Date(baseTime + 240 * 60000).toISOString(),
      completed: true,
    },
    {
      id: "7",
      status: "In Transit",
      icon: "🌍",
      city: isIndia ? "Air Transit (PRG → DEL)" : "International Air Transit",
      state: "",
      country: isIndia ? "Air Corridor" : "Transit",
      timestamp: new Date(baseTime + 300 * 60000).toISOString(),
      completed: true,
    },
    {
      id: "8",
      status: "Customs",
      icon: "🔍",
      city: customsCity,
      state: customsState,
      country: isIndia ? "India" : country,
      timestamp: "",
      completed: false,
    },
    {
      id: "9",
      status: "Regional Hub",
      icon: "🚚",
      city: isIndia ? regionalHubCity : "Regional Logistics Gateway",
      state: isIndia ? regionalHubState : "",
      country: country,
      timestamp: "",
      completed: false,
    },
    {
      id: "10",
      status: "Local Hub",
      icon: "🏪",
      city,
      state,
      country,
      timestamp: "",
      completed: false,
    },
    {
      id: "11",
      status: "Out for Delivery",
      icon: "🛵",
      city,
      state,
      country,
      timestamp: "",
      completed: false,
    },
    {
      id: "12",
      status: "Delivered",
      icon: "✅",
      city,
      state,
      country,
      timestamp: "",
      completed: false,
    },
  ];
};

// Compute the scheduled timestamp for a step given the order's placedAt creation date
export const scheduledTimestampForStep = (
  placedAt: string,
  stepIndex: number,
  isIndia = true
): Date => {
  const offsets = isIndia ? STEP_DAY_OFFSETS_INDIA : STEP_DAY_OFFSETS_GLOBAL;
  const dayOffset = offsets[stepIndex] ?? stepIndex * 2;
  const hourOffset = STEP_HOUR_OFFSETS[stepIndex] ?? 12;
  const d = new Date(placedAt);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hourOffset, Math.floor(Math.random() * 60), 0, 0);
  return d;
};

// Auto-progress non-cancelled orders based on elapsed time from order creation date
export const autoProgressTrackingSteps = (
  order: Order
): { steps: TrackingStep[]; status: string; changed: boolean } => {
  if (order.status === "Cancelled") {
    return { steps: order.trackingSteps, status: order.status, changed: false };
  }

  const isIndia = isIndiaDestination(order.customer);
  const now = new Date();
  let changed = false;

  const steps = order.trackingSteps.map((step, i) => {
    if (step.completed) return step;
    const scheduled = scheduledTimestampForStep(order.placedAt, i, isIndia);
    if (now < scheduled) return step;

    // Out for Delivery gating: only between 9:00 and 18:00
    const isOutForDelivery = step.status === "Out for Delivery";
    if (isOutForDelivery) {
      const currentHour = now.getHours();
      if (currentHour < 9 || currentHour >= 18) return step;
    }

    changed = true;
    return { ...step, completed: true, timestamp: scheduled.toISOString() };
  });

  const lastCompleted = [...steps].reverse().find((s) => s.completed);
  const newStatus = lastCompleted?.status || order.status;
  return { steps, status: newStatus, changed: changed || newStatus !== order.status };
};

export const createCancelledReturnSteps = (order: Order): TrackingStep[] => {
  const completedSteps = order.trackingSteps.filter((s) => s.completed);
  const lastCompleted = completedSteps[completedSteps.length - 1];
  if (!lastCompleted) return [];

  const now = new Date();
  const cancelStep: TrackingStep = {
    id: crypto.randomUUID(),
    status: "❌ Order Cancelled",
    icon: "🚫",
    city: lastCompleted.city,
    state: lastCompleted.state,
    country: lastCompleted.country,
    timestamp: now.toISOString(),
    completed: true,
  };

  const returnRoute: { status: string; icon: string; city: string; state: string; country: string }[] = [];
  const isIndia = isIndiaDestination(order.customer);

  if (isIndia) {
    returnRoute.push({
      status: "Return: Picked up from customer",
      icon: "📦",
      city: lastCompleted.city,
      state: lastCompleted.state,
      country: "India",
    });
    returnRoute.push({
      status: "Return: Departed New Delhi Cargo Hub",
      icon: "✈️",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
    });
  }

  returnRoute.push({
    status: "Return: Arrived back at Prague warehouse",
    icon: "🏭",
    city: "Prague",
    state: "Bohemia",
    country: "Czech Republic",
  });
  returnRoute.push({
    status: "Return: Refund processed",
    icon: "💰",
    city: "Prague",
    state: "Bohemia",
    country: "Czech Republic",
  });

  const returnSteps: TrackingStep[] = returnRoute.map((r) => ({
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
  customer: row.customer,
  items: row.items,
  subtotal: Number(row.subtotal),
  tax: Number(row.tax),
  total: Number(row.total),
  status: row.status,
  estimatedDelivery: row.estimated_delivery,
  placedAt: row.placed_at,
  notes: row.notes,
  paymentMethod: row.payment_method,
  deliveryPin: row.delivery_pin,
  trackingSteps: row.tracking_steps || [],
});

export const DEMO_SEED_ORDERS: Order[] = [
  {
    id: "ord-demo-in-1",
    orderId: "SN9284489643",
    trackingId: "SNX9284489",
    customer: {
      name: "Alex Vance",
      email: "alex.vance@example.com",
      phone: "+91 98765 43210",
      address: "Circular Road, Near Clock Tower",
      city: "Dimapur",
      state: "Nagaland",
      country: "India",
      zip: "797112",
    },
    items: [
      {
        productId: "iphone-18-pro-max",
        name: "Apple iPhone 18 Pro Max",
        brand: "Apple",
        price: 1399,
        qty: 1,
        image: "/assets/products/apple/iphone-18-pro-max.png",
      },
    ],
    subtotal: 1399,
    tax: 279.8,
    total: 1678.8,
    status: "In Transit",
    estimatedDelivery: calculateEstimatedDeliveryDate(
      "2026-03-28T10:14:04.000Z",
      true,
      "standard",
      "SN9284489643"
    ),
    placedAt: "2026-03-28T10:14:04.000Z",
    notes: "Express Priority Air Cargo PRG → DEL · 20–30 Days Guaranteed",
    paymentMethod: "Apple Pay",
    deliveryPin: "8821",
    trackingSteps: createDefaultTrackingSteps(
      "Dimapur",
      "Nagaland",
      "India",
      "2026-03-28T10:14:04.000Z"
    ),
  },
  {
    id: "ord-demo-in-2",
    orderId: "SN1037910513",
    trackingId: "SNX1037910",
    customer: {
      name: "Kenji Sato",
      email: "kenji.sato@kyoto-craft.jp",
      phone: "+91 98123 45678",
      address: "Midland Colony",
      city: "Dimapur",
      state: "Nagaland",
      country: "India",
      zip: "797112",
    },
    items: [
      {
        productId: "galaxy-s25-ultra",
        name: "Samsung Galaxy S25 Ultra",
        brand: "Samsung",
        price: 1299,
        qty: 1,
        image: "/assets/products/samsung/galaxy-s25-ultra.png",
      },
    ],
    subtotal: 1299,
    tax: 259.8,
    total: 1558.8,
    status: "In Transit",
    estimatedDelivery: calculateEstimatedDeliveryDate(
      "2026-04-11T12:26:19.000Z",
      true,
      "standard",
      "SN1037910513"
    ),
    placedAt: "2026-04-11T12:26:19.000Z",
    notes: "Express Priority Air Cargo PRG → DEL · 20–30 Days Guaranteed",
    paymentMethod: "Credit Card",
    deliveryPin: "7134",
    trackingSteps: createDefaultTrackingSteps(
      "Dimapur",
      "Nagaland",
      "India",
      "2026-04-11T12:26:19.000Z"
    ),
  },
  {
    id: "ord-demo-eu-1",
    orderId: "SN8879399396",
    trackingId: "SNX4829104",
    customer: {
      name: "Ingrid Lindqvist",
      email: "ingrid.l@scanditech.se",
      phone: "+420 777 000 111",
      address: "Karlova 256/1",
      city: "Prague",
      state: "Bohemia",
      country: "Czech Republic",
      zip: "110 00",
    },
    items: [
      {
        productId: "oneplus-13",
        name: "OnePlus 13 Flagship",
        brand: "OnePlus",
        price: 899,
        qty: 1,
        image: "/assets/products/oneplus/oneplus-13.png",
      },
    ],
    subtotal: 899,
    tax: 179.8,
    total: 1078.8,
    status: "In Transit",
    estimatedDelivery: calculateEstimatedDeliveryDate(
      "2026-11-02T09:30:00.000Z",
      false,
      "standard",
      "SN8879399396"
    ),
    placedAt: "2026-11-02T09:30:00.000Z",
    notes: "Priority Insured Air Express Freight · White-Glove Dispatch",
    paymentMethod: "SEPA Direct Debit",
    deliveryPin: "4192",
    trackingSteps: createDefaultTrackingSteps(
      "Prague",
      "Bohemia",
      "Czech Republic",
      "2026-11-02T09:30:00.000Z"
    ),
  },
];

const mergeWithDemos = (loadedOrders: Order[]): Order[] => {
  const existing = new Set(loadedOrders.map((o) => o.orderId));
  const merged = [...loadedOrders];
  DEMO_SEED_ORDERS.forEach((demo) => {
    if (!existing.has(demo.orderId)) {
      merged.push(demo);
    }
  });
  return merged;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("shipnest-orders");
      if (saved) return mergeWithDemos(JSON.parse(saved));
    } catch {
      // Ignore parse failure
    }
    return DEMO_SEED_ORDERS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Network timeout") }), 2500)
        );
        const supabasePromise = supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);

      if (error) {
        console.warn("Using local cache / seed orders (Supabase sync note):", error.message || error);
        try {
          const saved = localStorage.getItem("shipnest-orders");
          if (saved) {
            setOrders(mergeWithDemos(JSON.parse(saved)));
            setLoading(false);
            return;
          }
        } catch {
          // Ignore
        }
        setOrders(DEMO_SEED_ORDERS);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(mapDbToOrder);
      let combined = mapped;
      if (combined.length === 0) {
        combined = DEMO_SEED_ORDERS;
      } else {
        // Ensure demo seed orders remain accessible for tracking reference lookups
        const existingIds = new Set(combined.map((o) => o.orderId));
        DEMO_SEED_ORDERS.forEach((demo) => {
          if (!existingIds.has(demo.orderId)) {
            combined.push(demo);
          }
        });
      }

      const progressed = await Promise.all(
        combined.map(async (o) => {
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
            supabase
              .from("orders")
              .update(updates)
              .eq("id", o.id)
              .then(({ error: e }) => {
                if (e) console.error("Auto-progress save failed:", e);
              });
          }
          return { ...o, trackingSteps: steps, status, deliveryPin: pin };
        })
      );

      setOrders(progressed);
      setLoading(false);
    } catch (err) {
      console.warn("Using offline demo orders:", err);
      setOrders(DEMO_SEED_ORDERS);
      setLoading(false);
    }
    };
    fetchOrders();
  }, []);

  const addOrder = async (order: Order) => {
    const isIndia = isIndiaDestination(order.customer);
    const estDelivery =
      order.estimatedDelivery ||
      calculateEstimatedDeliveryDate(order.placedAt, isIndia, "standard", order.orderId);

    const orderWithPin: Order = {
      ...order,
      estimatedDelivery: estDelivery,
      deliveryPin: order.deliveryPin || generateDeliveryPin(),
    };

    setOrders((prev) => [orderWithPin, ...prev]);

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
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...updates } : o))
    );

    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.trackingSteps !== undefined) dbUpdates.tracking_steps = updates.trackingSteps;
    if (updates.estimatedDelivery !== undefined) dbUpdates.estimated_delivery = updates.estimatedDelivery;
    if (updates.customer !== undefined) dbUpdates.customer = updates.customer;
    if (updates.items !== undefined) dbUpdates.items = updates.items;
    if (updates.deliveryPin !== undefined) dbUpdates.delivery_pin = updates.deliveryPin;

    const { error } = await supabase.from("orders").update(dbUpdates).eq("order_id", orderId);
    if (error) console.error("Failed to update order:", error);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    const { error } = await supabase.from("orders").delete().eq("order_id", orderId);
    if (error) console.error("Failed to delete order:", error);
  };

  const cancelOrder = (orderId: string) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    const newSteps = createCancelledReturnSteps(order);
    updateOrder(orderId, { status: "Cancelled", trackingSteps: newSteps });
  };

  const getOrder = (idOrTracking: string) => {
    if (!idOrTracking) return undefined;
    const clean = idOrTracking.trim().toLowerCase();
    const found = orders.find(
      (o) => o.orderId.toLowerCase() === clean || o.trackingId.toLowerCase() === clean
    );
    if (found) return found;
    return DEMO_SEED_ORDERS.find(
      (o) => o.orderId.toLowerCase() === clean || o.trackingId.toLowerCase() === clean
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        cancelOrder,
        getOrder,
        loading,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};

export const getScheduledTimestamp = (
  placedAt: string,
  stepIndex: number,
  isIndia = true
): Date => scheduledTimestampForStep(placedAt, stepIndex, isIndia);
