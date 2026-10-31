import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import ShoppingAssistantLauncher from "@/components/ai/ShoppingAssistantLauncher";
import { useEffect, lazy, Suspense } from "react";

// Route-based code splitting for ultra-fast initial bundle delivery
import HomePage from "@/pages/HomePage";
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("@/pages/OrderConfirmationPage"));
const TrackPage = lazy(() => import("@/pages/TrackPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const ReturnsPage = lazy(() => import("@/pages/ReturnsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      <span className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
        Loading ShipNest
      </span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <OrderProvider>
              <Sonner position="bottom-right" duration={3000} />
              <BrowserRouter>
                <ScrollToTop />
                <Navbar />
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route
                      path="/order-confirmation/:orderId"
                      element={<OrderConfirmationPage />}
                    />
                    <Route path="/track" element={<TrackPage />} />
                    <Route path="/track/:id" element={<TrackPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/returns" element={<ReturnsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Footer />
                <CookieConsent />
                <ShoppingAssistantLauncher />
              </BrowserRouter>
            </OrderProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
