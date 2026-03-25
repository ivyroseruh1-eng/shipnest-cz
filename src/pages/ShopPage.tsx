import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { products, brands, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low-High" },
  { value: "price-desc", label: "Price: High-Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const ShopPage = () => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [searchParams] = useSearchParams();
  const [brand, setBrand] = useState(searchParams.get("brand") || "All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let result = [...products];
    if (brand !== "All") result = result.filter(p => p.brand === brand);
    if (category !== "All") result = result.filter(p => p.category === category);
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [brand, category, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-orbitron text-foreground">Shop</h1>
        <p className="text-muted-foreground text-sm">{filtered.length} products</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={brand} onChange={e => setBrand(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
          {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">No products found matching your filters.</div>
      )}
    </div>
  );
};

export default ShopPage;
