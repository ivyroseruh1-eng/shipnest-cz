import { useState, useEffect } from "react";
import { X } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("shipnest_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("shipnest_cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("shipnest_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="max-w-2xl mx-auto bg-foreground text-background rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-[13px] font-semibold">🍪 We use cookies</p>
          <p className="text-[12px] text-background/70 leading-relaxed">
            We use essential cookies for site functionality and analytics cookies to improve your experience. By clicking "Accept", you consent to our use of cookies.{" "}
            <a href="/privacy" className="underline text-background/90 hover:text-background">Learn more</a>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={decline} className="px-4 py-2 rounded-full border border-background/30 text-[12px] font-medium hover:bg-background/10 transition-colors">
            Decline
          </button>
          <button onClick={accept} className="px-4 py-2 rounded-full bg-background text-foreground text-[12px] font-semibold hover:bg-background/90 transition-colors">
            Accept All
          </button>
        </div>
        <button onClick={decline} className="absolute top-3 right-3 sm:static p-1 hover:bg-background/10 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
