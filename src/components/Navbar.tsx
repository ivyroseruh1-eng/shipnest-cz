import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, Menu, X, User, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import shipnestLogo from "@/assets/shipnest-logo.png";

const announcements = [
  "Free express shipping worldwide — Ships from Prague, CZ 🇨🇿",
  "✓ 100% Authentic Products — Authorized Distributor",
  "30-Day Returns · 2-Year Warranty · 24/7 Support",
  "🔥 New iPhone 17 Series Now Available — Shop Now",
];

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex(i => (i + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = searchQuery.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-foreground text-background text-[11px] tracking-wide overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <p className="font-medium transition-all duration-500" key={announcementIndex}>{announcements[announcementIndex]}</p>
          <div className="hidden sm:flex items-center gap-5">
            <Link to="/track" className="hover:opacity-70 transition-opacity">Track Order</Link>
            <Link to="/admin" className="hover:opacity-70 transition-opacity">Account</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={shipnestLogo} alt="ShipNest" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-heading text-[15px] font-bold tracking-tight hidden sm:block">SHIPNEST</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "New Arrivals", to: "/shop" },
              { label: "iPhone", to: "/shop?category=iPhone+17" },
              { label: "Samsung", to: "/shop?brand=Samsung" },
              { label: "Mac", to: "/shop?category=Mac" },
              { label: "Audio", to: "/shop?category=Audio" },
            ].map(link => (
              <Link key={link.label} to={link.to} className="px-3 py-2 text-[13px] text-foreground hover:text-muted-foreground transition-colors font-medium">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xs relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search products..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-secondary rounded-full pl-10 pr-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
              {filtered.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  {filtered.map(p => (
                    <button key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchQuery(""); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                        <p className="text-[12px] text-muted-foreground">${p.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/wishlist" className="p-2.5 text-foreground hover:text-muted-foreground transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="p-2.5 text-foreground hover:text-muted-foreground transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">{totalItems}</span>
              )}
            </Link>
            <Link to="/admin" className="p-2.5 text-foreground hover:text-muted-foreground transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground"><Search className="w-5 h-5" /></button>
            <Link to="/cart" className="p-2 text-foreground relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">{totalItems}</span>}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-secondary rounded-full pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            {filtered.length > 0 && (
              <div className="absolute left-4 right-4 top-full bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                {filtered.map(p => (
                  <button key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchQuery(""); setSearchOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="w-8 h-8 object-contain" />
                    </div>
                    <div><p className="text-[13px] font-medium text-foreground">{p.name}</p><p className="text-[12px] text-muted-foreground">${p.price}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="flex flex-col p-4 gap-0.5">
              {[
                { label: "New Arrivals", to: "/shop" },
                { label: "iPhone", to: "/shop?category=iPhone+17" },
                { label: "Samsung", to: "/shop?brand=Samsung" },
                { label: "Mac", to: "/shop?category=Mac" },
                { label: "Audio", to: "/shop?category=Audio" },
              ].map(link => (
                <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors text-[14px] font-medium">{link.label}</Link>
              ))}
              <div className="border-t border-border my-2" />
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2.5 text-[14px]"><Heart className="w-4 h-4" /> Wishlist</Link>
              <Link to="/track" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2.5 text-[14px]"><Truck className="w-4 h-4" /> Track Order</Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2.5 text-[14px]"><User className="w-4 h-4" /> Account</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
