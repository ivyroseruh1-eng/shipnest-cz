import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Order, TrackingStep } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getOrder: (idOrTracking: string) => Order | undefined;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const generateTrackingId = () => "SNX" + Math.floor(1000000 + Math.random() * 9000000);
export const generateOrderId = () => "SN" + Date.now().toString().slice(-8) + Math.floor(10 + Math.random() * 90);

export const createDefaultTrackingSteps = (customerCity: string, customerState: string, customerCountry: string): TrackingStep[] => [
  { id: "1", status: "Order Placed", icon: "📦", city: "Prague", state: "Bohemia", country: "Czech Republic", timestamp: new Date().toISOString(), completed: true },
  { id: "2", status: "Processing at Warehouse", icon: "🏭", city: "Prague", state: "Bohemia", country: "Czech Republic", timestamp: "", completed: false },
  { id: "3", status: "Dispatched", icon: "🚚", city: "Prague", state: "Bohemia", country: "Czech Republic", timestamp: "", completed: false },
  { id: "4", status: "In Transit", icon: "✈️", city: "Frankfurt", state: "Hesse", country: "Germany", timestamp: "", completed: false },
  { id: "5", status: "Arrived at Hub", icon: "🛬", city: "Amsterdam", state: "North Holland", country: "Netherlands", timestamp: "", completed: false },
  { id: "6", status: "Customs Clearance", icon: "🔍", city: customerCity || "Local Hub", state: customerState, country: customerCountry || "Destination", timestamp: "", completed: false },
  { id: "7", status: "Out for Delivery", icon: "🛵", city: customerCity || "Your City", state: customerState, country: customerCountry || "Destination", timestamp: "", completed: false },
  { id: "8", status: "Delivered", icon: "✅", city: customerCity || "Your City", state: customerState, country: customerCountry || "Destination", timestamp: "", completed: false },
];

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

  const getOrder = (idOrTracking: string) => {
    return orders.find(o => o.orderId === idOrTracking || o.trackingId === idOrTracking);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, getOrder, loading }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
