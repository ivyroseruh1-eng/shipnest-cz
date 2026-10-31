import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { products, departments, brands, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { Search, SlidersHorizontal, X, ChevronRight, Check, ArrowUpDown } from "lucide-react";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest Releases" },
];

const PAGE_SIZE = 24;

const ShopPage = () => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const [department, setDepartment] = useState(searchParams.get("department") || "All");
  const [brand, setBrand] = useState(searchParams.get("brand") || "All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sync params if URL changes
  useEffect(() => {
    const d = searchParams.get("department");
    const b = searchParams.get("brand");
    const c = searchParams.get("category");
    const q = searchParams.get("q");
    if (d) setDepartment(d);
    if (b) setBrand(b);
    if (c) setCategory(c);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Update URL params
  const updateFilters = (newDept?: string, newBrand?: string, newCategory?: string) => {
    const params = new URLSearchParams();
    const d = newDept !== undefined ? newDept : department;
    const b = newBrand !== undefined ? newBrand : brand;
    const c = newCategory !== undefined ? newCategory : category;

    if (d && d !== "All") params.set("department", d);
    if (b && b !== "All") params.set("brand", b);
    if (c && c !== "All") params.set("category", c);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    setSearchParams(params);
    setVisibleCount(PAGE_SIZE);
  };

  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    // Reset brand and category if they don't belong to the department
    setBrand("All");
    setCategory("All");
    updateFilters(newDept, "All", "All");
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    updateFilters(undefined, newBrand, undefined);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    updateFilters(undefined, undefined, newCategory);
  };

  const clearAllFilters = () => {
    setDepartment("All");
    setBrand("All");
    setCategory("All");
    setSearchQuery("");
    setSort("featured");
    setInStockOnly(false);
    setSearchParams({});
    setVisibleCount(PAGE_SIZE);
  };

  // Filter available brands based on selected department
  const availableBrands = useMemo(() => {
    let pool = products;
    if (department !== "All") {
      pool = pool.filter((p) => p.department === department);
    }
    const set = new Set(pool.map((p) => p.brand));
    return ["All", ...Array.from(set).sort()];
  }, [department]);

  // Filter available categories based on selected department
  const availableCategories = useMemo(() => {
    let pool = products;
    if (department !== "All") {
      pool = pool.filter((p) => p.department === department);
    }
    const set = new Set(pool.map((p) => p.category));
    return ["All", ...Array.from(set).sort()];
  }, [department]);

  // Filtered and sorted products
  const filtered = useMemo(() => {
    let result = [...products];

    // Department filter
    if (department !== "All") {
      result = result.filter((p) => p.department === department);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.draftListingId && p.draftListingId.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          (p.specs && p.specs.some((s) => s.toLowerCase().includes(q)))
      );
    }

    // Brand filter
    if (brand !== "All") {
      result = result.filter((p) => p.brand === brand);
    }

    // Category filter
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // Stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sort (safely handling null prices)
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => (a.price ?? 9999999) - (b.price ?? 9999999));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
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
  }, [department, brand, category, searchQuery, inStockOnly, sort]);

  const pagedProducts = filtered.slice(0, visibleCount);

  const hasActiveFilters =
    department !== "All" ||
    brand !== "All" ||
    category !== "All" ||
    inStockOnly ||
    searchQuery.trim().length > 0;

  return (
    <div className="bg-background min-h-screen text-foreground">
      {/* 1. Header & Department Switcher */}
      <div className="border-b border-border bg-[#fafafc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-medium">Store</span>
            {department !== "All" && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="text-foreground">{department}</span>
              </>
            )}
            {brand !== "All" && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="text-foreground">{brand}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                {brand !== "All"
                  ? `${brand} Collection`
                  : department !== "All"
                  ? department
                  : "Complete Catalogue"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {filtered.length} verified {filtered.length === 1 ? "item" : "items"} available from European luxury houses & flagship tech brands
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search models, brands, fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-full pl-10 pr-8 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Department Chips (Wrapped, No horizontal scrolling) */}
          <div className="flex flex-wrap items-center gap-2 pt-6">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => handleDepartmentChange(dept)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  department === dept
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {dept === "All" ? "All Departments" : dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Secondary Filter Control Bar (Zero horizontal scroll) */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Category Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Brand Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Brand:</span>
              <select
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="bg-secondary/80 border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer max-w-[160px] sm:max-w-[200px]"
              >
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b === "All" ? "All Brands" : b}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Category:</span>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-secondary/80 border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer max-w-[160px] sm:max-w-[200px]"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Stock Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/30 w-3.5 h-3.5"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-secondary/80 border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Grid */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {pagedProducts.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl max-w-lg mx-auto p-8 space-y-3">
            <Search className="w-10 h-10 mx-auto text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground">No Products Match Your Filters</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Try broadening your search or resetting department, brand and stock filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-foreground/85 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {pagedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={isWishlisted(p.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>

            {/* Load More Pagination */}
            {visibleCount < filtered.length && (
              <div className="mt-12 text-center space-y-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="px-8 py-3 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-foreground/85 transition-colors shadow-xs"
                >
                  Load More Products ({filtered.length - visibleCount} remaining)
                </button>
                <p className="text-[11px] text-muted-foreground">
                  Showing {visibleCount} of {filtered.length} products
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
