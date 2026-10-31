import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { products, brands, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { Search, SlidersHorizontal, X, ArrowUpDown, ChevronRight, Check } from "lucide-react";
import Reveal from "@/components/Reveal";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest Releases" },
];

const ShopPage = () => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const [brand, setBrand] = useState(searchParams.get("brand") || "All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync params if URL changes
  useEffect(() => {
    const b = searchParams.get("brand");
    const c = searchParams.get("category");
    const q = searchParams.get("q");
    if (b) setBrand(b);
    if (c) setCategory(c);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Update URL params
  const updateFilters = (newBrand?: string, newCategory?: string) => {
    const params = new URLSearchParams();
    const b = newBrand !== undefined ? newBrand : brand;
    const c = newCategory !== undefined ? newCategory : category;
    if (b && b !== "All") params.set("brand", b);
    if (c && c !== "All") params.set("category", c);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    setSearchParams(params);
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    updateFilters(newBrand, undefined);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    updateFilters(undefined, newCategory);
  };

  const clearAllFilters = () => {
    setBrand("All");
    setCategory("All");
    setSearchQuery("");
    setSort("featured");
    setInStockOnly(false);
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.specs.some(s => s.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (brand !== "All") {
      result = result.filter(p => p.brand === brand);
    }

    // Category filter
    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.badge === "NEW" ? 1 : 0) - (a.badge === "NEW" ? 1 : 0));
        break;
      default:
        // featured: prioritize badges
        result.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
        break;
    }

    return result;
  }, [brand, category, searchQuery, inStockOnly, sort]);

  const hasActiveFilters = brand !== "All" || category !== "All" || inStockOnly || searchQuery.trim().length > 0;

  return (
    <div className="bg-background min-h-screen text-foreground">
      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-[#fafafc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
          <nav className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Store</span>
            {brand !== "All" && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">{brand}</span>
              </>
            )}
            {category !== "All" && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">{category}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {brand !== "All" ? `${brand} Hardware` : category !== "All" ? category : "Flagship Electronics"}
              </h1>
              <p className="text-[14px] text-muted-foreground mt-1">
                {filtered.length} authentic {filtered.length === 1 ? "device" : "devices"} available for international express dispatch
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search models or chips..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-full pl-10 pr-8 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter Control Bar */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1 hidden sm:inline">
              Brand:
            </span>
            {["All", ...brands.filter(b => b !== "All")].map(b => (
              <button
                key={b}
                onClick={() => handleBrandChange(b)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium shrink-0 transition-all ${
                  brand === b
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Right Controls: Sort & Stock Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/30 w-3.5 h-3.5"
              />
              <span className="hidden sm:inline">In Stock Only</span>
            </label>

            {/* Category Dropdown */}
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="bg-secondary/80 border border-border/80 rounded-full px-3 py-1.5 text-[12px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-secondary/80 border border-border/80 rounded-full px-3 py-1.5 text-[12px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
            >
              {sortOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Tags Row */}
        {hasActiveFilters && (
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-2.5 flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-muted-foreground">Active filters:</span>
            {brand !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Brand: {brand}
                <button onClick={() => handleBrandChange("All")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {category !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Category: {category}
                <button onClick={() => handleCategoryChange("All")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground underline ml-1"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Product Grid Area */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product, idx) => (
              <Reveal key={product.id} delay={idx * 30}>
                <ProductCard
                  product={product}
                  isWishlisted={isWishlisted(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No devices match your criteria</h3>
            <p className="text-[14px] text-muted-foreground">
              Try adjusting your search terms or clearing selected brand and category filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-foreground/90 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
