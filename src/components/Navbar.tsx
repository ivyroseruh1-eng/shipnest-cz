import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, User, Heart, Truck, GitCompare, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import shipnestLogo from "@/assets/shipnest-logo.png";

const announcements = [
  "Free delivery and free returns. Ships from Prague, CZ.",
  "Get help buying. Chat with a Specialist.",
  "iPhone 17 Pro is here. Buy now.",
];

type MegaItem = {
  label: string;
  to: string;
  mega?: { brand?: string; category?: string; tagline: string };
};

const navLinks: MegaItem[] = [
  { label: "Shop", to: "/shop", mega: { tagline: "Browse every device we carry." } },
  { label: "iPhone", to: "/shop?category=iPhone+17", mega: { brand: "Apple", tagline: "Pro cameras. Titanium design. A19 Pro." } },
  { label: "Galaxy", to: "/shop?brand=Samsung", mega: { brand: "Samsung", tagline: "Galaxy AI. One UI. Bold design." } },
  { label: "Pixel", to: "/shop?brand=Google", mega: { brand: "Google", tagline: "Built by Google. Magic in every shot." } },
  { label: "Compare", to: "/compare" },
  { label: "Support", to: "/contact" },
];

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
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

  const openMega = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(null), 150);
  };

  const megaProducts = (link: MegaItem) => {
    if (!link.mega) return [];
    let pool = products;
    if (link.mega.brand) pool = pool.filter(p => p.brand === link.mega!.brand);
    if (link.mega.category) pool = pool.filter(p => p.category === link.mega!.category);
    if (!link.mega.brand && !link.mega.category) pool = products.filter(p => p.badge);
    return pool.slice(0, 4);
  };

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

      {/* Main nav — branded, translucent, centered */}
      <nav className="sticky top-0 z-50 nav-blur border-b border-border/60">
        <div className="max-w-[980px] mx-auto px-4 h-20 md:h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="ShipNest">
            <img src={shipnestLogo} alt="ShipNest" className="h-16 w-16 md:h-14 md:w-14 object-contain drop-shadow-sm" />
            <span className="text-[17px] md:text-[15px] font-semibold tracking-tight text-foreground">ShipNest</span>
          </Link>

          {/* Desktop nav — centered */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (
              <div key={link.label}
                onMouseEnter={() => link.mega && openMega(link.label)}
                onMouseLeave={scheduleClose}
                className="relative">
                <Link to={link.to}
                  className={`px-3 py-2 text-[13px] transition-colors font-normal flex items-center gap-1 ${megaOpen === link.label ? "text-foreground" : "text-foreground/80 hover:text-foreground"}`}>
                  {link.label}
                  {link.mega && <ChevronDown className={`w-3 h-3 transition-transform ${megaOpen === link.label ? "rotate-180" : ""}`} />}
                </Link>
              </div>
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

        {/* Mega menu panel */}
        {megaOpen && navLinks.find(l => l.label === megaOpen)?.mega && (
          <div
            onMouseEnter={() => openMega(megaOpen)}
            onMouseLeave={scheduleClose}
            className="hidden md:block absolute left-0 right-0 top-full bg-background/95 backdrop-blur-xl border-b border-border shadow-lg animate-fade-in">
            <div className="max-w-[980px] mx-auto px-4 py-8">
              <p className="text-[13px] text-muted-foreground mb-5">{navLinks.find(l => l.label === megaOpen)?.mega?.tagline}</p>
              <div className="grid grid-cols-4 gap-5">
                {megaProducts(navLinks.find(l => l.label === megaOpen)!).map(p => (
                  <Link key={p.id} to={`/product/${p.id}`}
                    onClick={() => setMegaOpen(null)}
                    className="group">
                    <div className="aspect-square bg-secondary/60 rounded-xl flex items-center justify-center overflow-hidden mb-2 group-hover:bg-secondary transition-colors">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-[13px] font-semibold text-foreground leading-tight">{p.name}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">From ${p.price}</p>
                  </Link>
                ))}
              </div>
              <div className="flex gap-5 mt-6 pt-5 border-t border-border text-[13px]">
                <Link to={navLinks.find(l => l.label === megaOpen)?.to || "/shop"} onClick={() => setMegaOpen(null)} className="text-primary hover:opacity-75 transition-opacity">Shop all {megaOpen} →</Link>
                <Link to="/compare" onClick={() => setMegaOpen(null)} className="text-primary hover:opacity-75 transition-opacity">Compare models →</Link>
              </div>
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
              <Link to="/compare" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2.5 text-[14px]"><GitCompare className="w-4 h-4" /> Compare</Link>
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
