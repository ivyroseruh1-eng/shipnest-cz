import { useState, lazy, Suspense } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

// Lazy-load the complete ShoppingAssistant module only when explicitly opened by user
const ShoppingAssistant = lazy(() => import("@/components/ai/ShoppingAssistant"));

export const ShoppingAssistantLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide the floating assistant on transactional pages: cart, checkout, payment, and order confirmation
  const isTransactionalRoute =
    location.pathname === "/cart" ||
    location.pathname.startsWith("/cart/") ||
    location.pathname === "/checkout" ||
    location.pathname.startsWith("/checkout/") ||
    location.pathname === "/payment" ||
    location.pathname.startsWith("/payment/") ||
    location.pathname.startsWith("/order-confirmation");

  if (isTransactionalRoute) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2.5 px-4 py-2.5 bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90 transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-[12px] font-semibold tracking-wide flex items-center gap-1">
            <span>Ask Nest</span>
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
          </span>
        </button>
      )}

      {isOpen && (
        <Suspense fallback={null}>
          <ShoppingAssistant initialOpen={true} onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default ShoppingAssistantLauncher;
