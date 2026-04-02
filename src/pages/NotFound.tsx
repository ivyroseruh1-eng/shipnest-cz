import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Home } from "lucide-react";

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4">
    <div className="text-center space-y-6 max-w-md">
      <div className="text-8xl font-extrabold text-foreground/10 tracking-tighter">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Page Not Found</h1>
        <p className="text-[14px] text-muted-foreground leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-semibold text-[14px] hover:bg-foreground/90 transition-colors">
          <ShoppingBag className="w-4 h-4" /> Browse Shop <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/" className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-full font-semibold text-[14px] hover:bg-secondary transition-colors">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
