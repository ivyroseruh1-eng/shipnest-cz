import { useState, lazy, Suspense } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

// Lazy-load the complete ShoppingAssistant module only when explicitly opened by user
const ShoppingAssistant = lazy(() => import("@/components/ai/ShoppingAssistant"));

export const ShoppingAssistantLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // On checkout or cart pages where bottom sticky action bars exist on mobile,
  // float cleanly above the sticky bar so it NEVER intercepts the primary Checkout CTA
  const isBottomActionRoute = location.pathname.startsWith("/cart") || location.pathname.startsWith("/checkout");

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed z-30 flex items-center gap-2.5 px-4 py-2.5 bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90 transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            isBottomActionRoute
              ? "bottom-24 right-4 sm:bottom-6 sm:right-6"
              : "bottom-5 right-5 sm:bottom-6 sm:right-6"
          }`}
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
