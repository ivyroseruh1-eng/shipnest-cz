import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, User, Heart, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import shipnestLogo from "@/assets/shipnest-logo.png";

const announcements = [
  "Free delivery and free returns. Ships from Prague, CZ.",
  "Get help buying. Chat with a Specialist.",
  "iPhone 17 Pro is here. Buy now.",
];

const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "iPhone", to: "/shop?category=iPhone+17" },
  { label: "Galaxy", to: "/shop?brand=Samsung" },
  { label: "Pixel", to: "/shop?brand=Google" },
  { label: "Mac", to: "/shop?category=Mac" },
  { label: "Audio", to: "/shop?category=Audio" },
  { label: "Support", to: "/contact" },
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
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const filtered = searchQuery.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  return (
    <>
      {/* Top utility bar — Apple style */}
      <div className="bg-secondary text-foreground/80 text-[12px]">
        <div className="max-w-[980px] mx-auto px-4 h-9 flex items-center justify-between">
          <p className="transition-opacity duration-500" key={announcementIndex}>{announcements[announcementIndex]}</p>
          <div className="hidden sm:flex items-center gap-5">
            <Link to="/track" className="hover:text-foreground transition-colors">Track Order</Link>
            <Link to="/admin" className="hover:text-foreground transition-colors">Account</Link>
          </div>
        </div>
      </div>

      {/* Main nav — slim, translucent, centered */}
      <nav className="sticky top-0 z-50 nav-blur border-b border-border/60">
        <div className="max-w-[980px] mx-auto px-4 h-12 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" aria-label="ShipNest">
            <img src={shipnestLogo} alt="ShipNest" className="h-7 md:h-8 w-auto object-contain" />
          </Link>

          {/* Desktop nav — centered */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (
              <Link key={link.label} to={link.to} className="px-3 py-2 text-[13px] text-foreground/80 hover:text-foreground transition-colors font-normal">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground/80 hover:text-foreground transition-colors" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
            <Link to="/wishlist" className="p-2 text-foreground/80 hover:text-foreground transition-colors" aria-label="Wishlist">
              <Heart className="w-4 h-4" />
            </Link>
            <Link to="/cart" className="p-2 text-foreground/80 hover:text-foreground transition-colors relative" aria-label="Bag">
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">{totalItems}</span>
              )}
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground" aria-label="Search"><Search className="w-4 h-4" /></button>
            <Link to="/cart" className="p-2 text-foreground relative" aria-label="Bag">
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">{totalItems}</span>}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground" aria-label="Menu">
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="border-t border-border bg-background">
            <div className="max-w-[980px] mx-auto px-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search shipnest.com" autoFocus
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary border-0 rounded-full pl-10 pr-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              {filtered.length > 0 && (
                <div className="mt-3 bg-background border border-border rounded-2xl overflow-hidden">
                  {filtered.map(p => (
                    <button key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchQuery(""); setSearchOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-contain" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                        <p className="text-[12px] text-muted-foreground">From ${p.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="flex flex-col p-4 gap-0.5">
              {navLinks.map(link => (
                <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors text-[15px] font-medium">{link.label}</Link>
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
