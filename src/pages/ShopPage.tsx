import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { products, brands, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
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
    <div className="bg-background">
      {/* Header — Apple style */}
      <section className="max-w-[980px] mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="display text-4xl sm:text-5xl text-foreground">
          {brand !== "All" ? brand : category !== "All" ? category : "Shop ShipNest"}
        </h1>
        <p className="text-[16px] text-muted-foreground mt-2">{filtered.length} products available</p>
      </section>

      {/* Filters */}
      <div className="sticky top-12 z-40 nav-blur border-y border-border">
        <div className="max-w-[980px] mx-auto px-4 py-3 flex flex-wrap gap-2 justify-center">
          {[
            { value: brand, onChange: setBrand, options: brands, label: "Brand" },
            { value: category, onChange: setCategory, options: categories, label: "Category" },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.onChange(e.target.value)}
              className="bg-secondary border-0 rounded-full px-4 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium appearance-none cursor-pointer pr-8">
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-secondary border-0 rounded-full px-4 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium appearance-none cursor-pointer pr-8">
            {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-[980px] mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-[15px]">No products found matching your filters.</div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
