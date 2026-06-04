import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, User, Heart, Truck, GitCompare, ChevronDown, LogOut, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";
import Logo from "@/components/brand/Logo";
import LocationChip from "@/components/location/LocationChip";

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
  { label: "iPhone", to: "/shop?category=iPhone+17", mega: { brand: "Apple", tagline: "Forged aluminum unibody. A19 Pro. Pro cameras." } },
  { label: "Galaxy", to: "/shop?brand=Samsung", mega: { brand: "Samsung", tagline: "Galaxy AI. One UI. Bold design." } },
  { label: "Pixel", to: "/shop?brand=Google", mega: { brand: "Google", tagline: "Built by Google. Magic in every shot." } },
  { label: "Compare", to: "/compare" },
  { label: "Support", to: "/contact" },
];

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
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
            <LocationChip />
            <Link to="/track" className="hover:text-foreground transition-colors">Track Order</Link>
            {user ? (
              <Link to="/account" className="hover:text-foreground transition-colors">My Account</Link>
            ) : (
              <Link to="/auth" className="hover:text-foreground transition-colors">Sign in</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav — branded, translucent, centered */}
      <nav className="sticky top-0 z-50 nav-blur border-b border-border/60">
        <div className="max-w-[980px] mx-auto px-4 h-20 md:h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Logo variant="full" size={36} className="md:!h-[34px]" />

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
            {user ? (
              <div className="relative" onMouseEnter={() => setAccountOpen(true)} onMouseLeave={() => setAccountOpen(false)}>
                <button className="p-2 text-foreground/80 hover:text-foreground transition-colors" aria-label="Account">
                  <User className="w-4 h-4" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full bg-background border border-border rounded-xl shadow-lg py-1.5 w-48 z-50">
                    <p className="px-3 py-2 text-[11px] text-muted-foreground truncate border-b border-border mb-1">{user.email}</p>
                    <Link to="/account" className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-secondary"><Package className="w-3.5 h-3.5" /> My Orders</Link>
                    <Link to="/wishlist" className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-secondary"><Heart className="w-3.5 h-3.5" /> Wishlist</Link>
                    <Link to="/track" className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-secondary"><Truck className="w-3.5 h-3.5" /> Track</Link>
                    <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-secondary border-t border-border mt-1"><LogOut className="w-3.5 h-3.5" /> Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-2">
                <Link to="/auth" className="px-3 py-1.5 text-[13px] text-foreground/80 hover:text-foreground">Sign in</Link>
                <Link to="/auth" className="px-3 py-1.5 text-[13px] font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">Sign up</Link>
              </div>
            )}
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
              {user ? (
                <>
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2.5 text-[14px]"><Package className="w-4 h-4" /> My Orders</Link>
                  <button onClick={async () => { await signOut(); setMobileOpen(false); navigate("/"); }} className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2.5 text-[14px] text-left"><LogOut className="w-4 h-4" /> Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2.5 text-[14px]"><User className="w-4 h-4" /> Sign in</Link>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="px-4 py-3 bg-primary text-primary-foreground rounded-xl flex items-center gap-2.5 text-[14px] font-medium justify-center">Create account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
