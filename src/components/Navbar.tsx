import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, User, Heart, Truck, GitCompare, ChevronDown, LogOut, Package, ShieldCheck, Globe } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";
import Logo from "@/components/brand/Logo";
import LocationChip from "@/components/location/LocationChip";

const announcements = [
  "Direct European hub dispatch from Prague · Worldwide insured express air shipping",
  "Official manufacturer warranty on electronics · Verified authenticity on all luxury items",
  "Apple iPhone 18 Pro lineup & certified luxury collections available now",
];

type MegaItem = {
  label: string;
  to: string;
  mega?: { brand?: string; category?: string; department?: string; tagline: string };
};

const navLinks: MegaItem[] = [
  { label: "Shop", to: "/shop", mega: { tagline: "Browse our complete catalogue of flagships and luxury items." } },
  { label: "iPhone", to: "/shop?brand=Apple", mega: { brand: "Apple", tagline: "iPhone 18 Pro, iPhone Duo and Apple Silicon hardware." } },
  { label: "Luxury", to: "/shop?department=Designer+Fashion+%26+Accessories", mega: { department: "Designer Fashion & Accessories", tagline: "Iconic leather goods and accessories from premier fashion houses." } },
  { label: "Fragrance", to: "/shop?department=Perfumes+%26+Fragrance", mega: { department: "Perfumes & Fragrance", tagline: "Artisanal scents from Creed, Le Labo, Byredo and MFK." } },
  { label: "Timepieces", to: "/shop?department=Watches+%26+Jewellery", mega: { department: "Watches & Jewellery", tagline: "Master Swiss horology and fine jewellery." } },
  { label: "Compare", to: "/compare" },
  { label: "Track Shipment", to: "/track" },
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
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex(i => (i + 1) % announcements.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMegaOpen(null);
  }, [location.pathname]);

  const filtered = searchQuery.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.draftListingId && p.draftListingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const openMega = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(null), 180);
  };

  const megaProducts = (link: MegaItem) => {
    if (!link.mega) return [];
    let pool = products;
    if (link.mega.department) pool = pool.filter(p => p.department === link.mega!.department);
    if (link.mega.brand) pool = pool.filter(p => p.brand === link.mega!.brand);
    if (link.mega.category) pool = pool.filter(p => p.category === link.mega!.category);
    if (!link.mega.department && !link.mega.brand && !link.mega.category) pool = products.filter(p => p.badge);
    return pool.slice(0, 4);
  };

  return (
    <>
      {/* Top Utility Announcement Bar */}
      <div className="bg-[#1d1d1f] text-white text-[11px] sm:text-[12px] font-normal transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 h-8 flex items-center justify-between">
          <p className="transition-opacity duration-500 truncate pr-4 text-white/90" key={announcementIndex}>
            {announcements[announcementIndex]}
          </p>
          <div className="hidden sm:flex items-center gap-5 shrink-0 text-white/80">
            <LocationChip />
            <Link to="/track" className="hover:text-white transition-colors flex items-center gap-1">
              <Truck className="w-3 h-3 text-primary" />
              <span>Track Order</span>
            </Link>
            {user ? (
              <Link to="/account" className="hover:text-white transition-colors">My Account</Link>
            ) : (
              <Link to="/auth" className="hover:text-white transition-colors">Sign In</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 nav-blur border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Logo variant="full" size={32} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <div
                  key={link.label}
                  onMouseEnter={() => link.mega && openMega(link.label)}
                  onMouseLeave={scheduleClose}
                  className="relative"
                >
                  <Link
                    to={link.to}
                    className={`px-3.5 py-1.5 text-[13px] rounded-full transition-all flex items-center gap-1 ${
                      isActive
                        ? "text-foreground font-semibold bg-secondary/80"
                        : megaOpen === link.label
                        ? "text-foreground bg-secondary/50"
                        : "text-foreground/75 hover:text-foreground hover:bg-secondary/40 font-normal"
                    }`}
                  >
                    {link.label}
                    {link.mega && (
                      <ChevronDown
                        className={`w-3 h-3 opacity-60 transition-transform duration-200 ${
                          megaOpen === link.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${
                searchOpen ? "bg-secondary text-primary" : "text-foreground/80 hover:text-foreground hover:bg-secondary/60"
              }`}
              aria-label="Search products"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to="/wishlist"
              className="p-2 text-foreground/80 hover:text-foreground hover:bg-secondary/60 rounded-full transition-colors hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
            </Link>

            <Link
              to="/cart"
              className="p-2 text-foreground/80 hover:text-foreground hover:bg-secondary/60 rounded-full transition-colors relative"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Account / User Menu */}
            <div className="hidden sm:block">
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setAccountOpen(true)}
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <button
                    className="p-2 text-foreground/80 hover:text-foreground hover:bg-secondary/60 rounded-full transition-colors"
                    aria-label="Account Menu"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full pt-1 w-52 z-50 animate-fade-in">
                      <div className="bg-card border border-border rounded-2xl shadow-xl py-2 overflow-hidden">
                        <div className="px-3.5 py-2 border-b border-border text-[12px]">
                          <p className="text-muted-foreground font-medium">Signed in as</p>
                          <p className="text-foreground font-semibold truncate mt-0.5">{user.email}</p>
                        </div>
                        <Link to="/account" className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-foreground hover:bg-secondary transition-colors">
                          <Package className="w-3.5 h-3.5 text-muted-foreground" /> My Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-foreground hover:bg-secondary transition-colors">
                          <Heart className="w-3.5 h-3.5 text-muted-foreground" /> Wishlist
                        </Link>
                        <Link to="/track" className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-foreground hover:bg-secondary transition-colors">
                          <Truck className="w-3.5 h-3.5 text-muted-foreground" /> Track Order
                        </Link>
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={async () => { await signOut(); navigate("/"); }}
                            className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="ml-1 text-[13px] font-medium px-4 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/85 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-foreground md:hidden hover:bg-secondary/60 rounded-full transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Overlay Panel */}
        {searchOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-xl animate-fade-in shadow-xl">
            <div className="max-w-[720px] mx-auto px-4 py-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search flagship devices, luxury collections, model names, SNL IDs..."
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                  className="w-full bg-secondary border border-border/60 rounded-full pl-11 pr-10 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filtered.length > 0 ? (
                <div className="mt-3 bg-card border border-border rounded-2xl overflow-hidden shadow-lg divide-y divide-border/60">
                  {filtered.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigate(`/product/${p.id}`);
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 p-3 hover:bg-secondary/70 transition-colors text-left group"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl border border-border/50 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="text-[12px] text-muted-foreground">{p.specs[0] || p.brand}</p>
                      </div>
                      <span className="text-[13px] font-semibold text-foreground">${p.price}</span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length > 1 ? (
                <p className="text-center text-muted-foreground text-[13px] py-4">No matching devices found for "{searchQuery}".</p>
              ) : null}
            </div>
          </div>
        )}

        {/* Mega Menu Dropdown */}
        {megaOpen && navLinks.find(l => l.label === megaOpen)?.mega && (
          <div
            onMouseEnter={() => openMega(megaOpen)}
            onMouseLeave={scheduleClose}
            className="hidden md:block absolute left-0 right-0 top-full bg-background/95 backdrop-blur-2xl border-b border-border shadow-2xl animate-fade-in"
          >
            <div className="max-w-[1240px] mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[13px] text-muted-foreground font-medium">
                  {navLinks.find(l => l.label === megaOpen)?.mega?.tagline}
                </p>
                <Link
                  to={navLinks.find(l => l.label === megaOpen)?.to || "/shop"}
                  onClick={() => setMegaOpen(null)}
                  className="text-[13px] text-primary hover:underline font-medium"
                >
                  View all {megaOpen} →
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {megaProducts(navLinks.find(l => l.label === megaOpen)!).map(p => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => setMegaOpen(null)}
                    className="group bg-card border border-border/70 rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-foreground/20 hover:-translate-y-0.5"
                  >
                    <div className="w-full aspect-[4/3] bg-secondary/30 rounded-xl flex items-center justify-center overflow-hidden mb-3 p-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {p.badge && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                        {p.badge}
                      </span>
                    )}
                    <p className="text-[13px] font-semibold text-foreground leading-tight">{p.name}</p>
                    <p className="text-[12px] text-muted-foreground mt-1 font-medium">
                      {p.price !== null ? `From $${p.price}` : "Price on Request"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-2xl animate-fade-in">
            <div className="flex flex-col p-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors text-[15px] font-medium flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  {link.mega && <span className="text-[11px] text-muted-foreground">Explore →</span>}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2.5 bg-secondary/50 rounded-xl flex items-center gap-2 text-[13px] text-foreground font-medium"
                >
                  <Heart className="w-4 h-4 text-primary" /> Wishlist
                </Link>
                <Link
                  to="/compare"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2.5 bg-secondary/50 rounded-xl flex items-center gap-2 text-[13px] text-foreground font-medium"
                >
                  <GitCompare className="w-4 h-4 text-primary" /> Compare
                </Link>
              </div>

              {user ? (
                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="px-4 py-2 text-[12px] text-muted-foreground truncate">{user.email}</div>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-2 text-[14px]"
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setMobileOpen(false);
                      navigate("/");
                    }}
                    className="w-full px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-colors flex items-center gap-2 text-[14px] text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-foreground border border-border text-center rounded-full text-[13px] font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 bg-primary text-primary-foreground text-center rounded-full text-[13px] font-medium"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
