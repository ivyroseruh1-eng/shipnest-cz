export interface ColorVariant {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  fallbackImages: string[];
  rating: number;
  reviews: number;
  badge?: string;
  specs: string[];
  inStock: boolean;
  colors?: ColorVariant[];
}

export interface CartItem {
  product: Product;
  qty: number;
  selectedColor?: string;
}

export interface TrackingStep {
  id: string;
  status: string;
  icon: string;
  city: string;
  state: string;
  country: string;
  timestamp: string;
  completed: boolean;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  orderId: string;
  trackingId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  estimatedDelivery: string;
  placedAt: string;
  notes: string;
  paymentMethod?: string;
  deliveryPin?: string;
  trackingSteps: TrackingStep[];
}
