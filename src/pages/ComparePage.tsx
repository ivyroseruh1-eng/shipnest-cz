import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import ProductImage from "@/components/ProductImage";
import { getProductImageBackground } from "@/lib/productPresentation";
import { useCart } from "@/context/CartContext";
import { Check, X, Plus, ArrowRight, ShoppingBag, Search, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import { toast } from "sonner";

const ComparePage = () => {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("ids") || "").split(",").filter(Boolean);
  const [picks, setPicks] = useState<string[]>(
    initial.length ? initial : [products[0]?.id, products[1]?.id].filter(Boolean)
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const { addToCart } = useCart();

  const addProduct = (id: string) => {
    if (picks.includes(id) || picks.length >= 3) return;
    const next = [...picks, id];
    setPicks(next);
    setParams({ ids: next.join(",") });
  };

  const removeProduct = (id: string) => {
    const next = picks.filter(p => p !== id);
    setPicks(next);
    setParams(next.length ? { ids: next.join(",") } : {});
  };

  const selected = picks.map(id => products.find(p => p.id === id)!).filter(Boolean);
  const slots = [...selected, ...Array(Math.max(0, 3 - selected.length)).fill(null)];

  const rows = [
    { label: "Price", get: (p: any) => `$${p.price.toLocaleString()}` },
    { label: "Brand", get: (p: any) => p.brand },
    { label: "Category", get: (p: any) => p.category.toUpperCase() },
    { label: "Rating", get: (p: any) => `${p.rating} / 5.0 (${p.reviews.toLocaleString()} reviews)` },
    { label: "Display / Screen", get: (p: any) => p.specs[0] || "—" },
    {
      label: "Processor / Chip",
      get: (p: any) =>
        p.specs.find((s: string) => /chip|snapdragon|tensor|exynos|dimensity|apple m|intel|amd/i.test(s)) ||
        p.specs[1] ||
        "—",
    },
    {
      label: "Camera / Sensors",
      get: (p: any) =>
        p.specs.find((s: string) => /MP|camera|lens|sensor/i.test(s)) || p.specs[2] || "—",
    },
    {
      label: "Battery / Runtime",
      get: (p: any) =>
        p.specs.find((s: string) => /battery|hour|mah/i.test(s)) || p.specs[3] || "—",
    },
    { label: "Availability", get: (p: any) => (p.inStock ? "Immediate Dispatch" : "Backorder") },
    { label: "Warranty", get: () => "2-Year Official EU Guarantee" },
    { label: "Shipping", get: () => "Complimentary Global Express" },
  ];

  const filteredPickerProducts = products.filter(p => {
    const notSelected = !picks.includes(p.id);
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchesQuery =
      searchFilter === "" ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchFilter.toLowerCase());
    return notSelected && matchesCat && matchesQuery;
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Technical Hardware Matrix
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          Compare Side by Side
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Evaluate flagship specifications, silicon architectures, and pricing across up to 3 models simultaneously.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-10">
        {/* Comparison Slots */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {slots.map((p: any, i) =>
              p ? (
                <div
                  key={p.id}
                  className="bg-card border border-border rounded-2xl p-5 text-center relative flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all"
                >
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="aspect-square bg-secondary/30 rounded-xl flex items-center justify-center overflow-hidden mb-4 p-4">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-contain"
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                      {p.brand}
                    </span>
                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 mt-0.5">
                      {p.name}
                    </h3>
                    <p className="text-lg font-bold text-foreground mt-1">${p.price.toLocaleString()}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex gap-2">
                    <Link
                      to={`/product/${p.id}`}
                      className="flex-1 py-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition-colors text-center"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => {
                        addToCart(p);
                        toast.success(`${p.name} added to bag`);
                      }}
                      className="p-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl transition-colors"
                      title="Add to Bag"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="bg-secondary/20 border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Empty Slot {i + 1}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[160px]">
                    Choose an item from the catalog picker below to compare
                  </p>
                </div>
              )
            )}
          </div>
        </Reveal>

        {/* Detailed Spec Comparison Table / Mobile Layout */}
        {selected.length > 0 && (
          <Reveal>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 bg-secondary/30 border-b border-border">
                <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Technical Specifications Comparison
                </h2>
              </div>

              {/* Mobile View: Stacked per product (Zero horizontal scrolling) */}
              <div className="block sm:hidden divide-y divide-border">
                {selected.map((p) => (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg p-1 border flex items-center justify-center overflow-hidden shrink-0" style={{ background: getProductImageBackground(p.image, p).background, borderColor: getProductImageBackground(p.image, p).borderColor }}><ProductImage src={p.image} alt={p.name} width={48} height={48} className="w-full h-full object-contain" /></div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">{p.price !== null ? `$${p.price}` : "Price Upon Inquiry"}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      {rows.map((row) => (
                        <div key={row.label} className="flex justify-between text-xs py-1 border-b border-border/40">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium text-foreground text-right">{String(row.get(p))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop / Tablet View */}
              <div className="hidden sm:block">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-border">
                    {rows.map((row, idx) => (
                      <tr key={row.label} className={idx % 2 === 0 ? "bg-background/40" : ""}>
                        <td className="px-5 py-3.5 font-semibold text-foreground w-[160px] sm:w-[220px] bg-secondary/10 align-top">
                          {row.label}
                        </td>
                        {selected.map(p => (
                          <td key={p.id} className="px-5 py-3.5 text-muted-foreground align-top">
                            {typeof row.get(p) === "boolean" ? (
                              row.get(p) ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                  <Check className="w-4 h-4" /> Included
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                                  <X className="w-4 h-4" /> No
                                </span>
                              )
                            ) : (
                              <span className="text-foreground font-medium">{String(row.get(p))}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}

        {/* Device Picker Section */}
        <section className="space-y-4 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Available Models to Add</h2>
              <p className="text-xs text-muted-foreground">
                Select up to 3 flagships ({3 - selected.length} slots available)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="bg-card border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="flex flex-wrap items-center bg-secondary/50 border border-border rounded-xl p-0.5 text-xs max-w-full">
                {["all", "smartphones", "laptops", "audio", "wearables"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg capitalize font-medium text-[11px] sm:text-xs transition-colors ${
                      categoryFilter === cat
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredPickerProducts.slice(0, 12).map(p => (
              <button
                key={p.id}
                onClick={() => addProduct(p.id)}
                disabled={picks.length >= 3}
                className="bg-card border border-border hover:border-foreground/40 rounded-2xl p-3.5 text-left transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed group shadow-xs"
              >
                <div className="aspect-square bg-secondary/30 rounded-xl flex items-center justify-center overflow-hidden mb-2.5 p-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    onError={e => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {p.brand}
                </span>
                <p className="text-xs font-semibold text-foreground leading-tight truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                  <span className="text-xs font-bold text-foreground">${p.price.toLocaleString()}</span>
                  <span className="text-[10px] text-primary font-semibold group-hover:underline inline-flex items-center gap-0.5">
                    + Add
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComparePage;
