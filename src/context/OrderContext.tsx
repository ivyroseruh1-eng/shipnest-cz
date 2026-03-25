import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Order, TrackingStep } from "@/types";

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getOrder: (idOrTracking: string) => Order | undefined;
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

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("shipnest-orders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("shipnest-orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, ...updates } : o));
  };

  const getOrder = (idOrTracking: string) => {
    return orders.find(o => o.orderId === idOrTracking || o.trackingId === idOrTracking);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
