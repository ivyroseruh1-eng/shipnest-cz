import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import { Check, X, Plus } from "lucide-react";
import Reveal from "@/components/Reveal";

const ComparePage = () => {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("ids") || "").split(",").filter(Boolean);
  const [picks, setPicks] = useState<string[]>(initial.length ? initial : []);

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
    { label: "Price", get: (p: any) => `$${p.price}` },
    { label: "Rating", get: (p: any) => `${p.rating} ★` },
    { label: "Reviews", get: (p: any) => p.reviews.toLocaleString() },
    { label: "Brand", get: (p: any) => p.brand },
    { label: "Category", get: (p: any) => p.category },
    { label: "Display", get: (p: any) => p.specs[0] || "—" },
    { label: "Chip", get: (p: any) => p.specs.find((s: string) => /chip|snapdragon|tensor|exynos|dimensity/i.test(s)) || "—" },
    { label: "Camera", get: (p: any) => p.specs.find((s: string) => /MP|camera/i.test(s)) || "—" },
    { label: "In stock", get: (p: any) => p.inStock },
  ];

  return (
    <div className="bg-background min-h-screen">
      <section className="max-w-[1100px] mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="display text-4xl sm:text-5xl text-foreground">Compare phones.</h1>
        <p className="text-[15px] text-muted-foreground mt-2">Pick up to 3 devices to compare side by side.</p>
      </section>

      <div className="max-w-[1100px] mx-auto px-4 pb-20">
        {/* Slots */}
        <Reveal>
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8">
            {slots.map((p: any, i) => p ? (
              <div key={p.id} className="bg-secondary/60 rounded-2xl p-3 sm:p-5 text-center relative">
                <button onClick={() => removeProduct(p.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-background transition-colors" aria-label="Remove">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <div className="aspect-square bg-background rounded-xl flex items-center justify-center overflow-hidden mb-3">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                </div>
                <p className="text-[12px] sm:text-[13px] font-semibold text-foreground leading-tight">{p.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">${p.price}</p>
              </div>
            ) : (
              <div key={i} className="bg-secondary/30 border-2 border-dashed border-border rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center min-h-[180px]">
                <Plus className="w-6 h-6 text-muted-foreground mb-2" />
                <p className="text-[11px] text-muted-foreground text-center">Add a device below</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Comparison table */}
        {selected.length > 0 && (
          <Reveal>
            <div className="overflow-x-auto bg-secondary/40 rounded-2xl">
              <table className="w-full text-[13px]">
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.label} className={idx % 2 ? "bg-background/40" : ""}>
                      <td className="px-4 py-3 font-semibold text-foreground w-[120px] sm:w-[180px] align-top">{row.label}</td>
                      {selected.map(p => (
                        <td key={p.id} className="px-4 py-3 text-muted-foreground align-top">
                          {typeof row.get(p) === "boolean" ? (
                            row.get(p) ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />
                          ) : row.get(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-4"></td>
                    {selected.map(p => (
                      <td key={p.id} className="px-4 py-4">
                        <Link to={`/product/${p.id}`} className="inline-block bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[12px] font-medium hover:bg-primary/90 transition-colors">
                          Buy
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* Picker grid */}
        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">Add a device</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.filter(p => !picks.includes(p.id)).slice(0, 16).map(p => (
            <button key={p.id} onClick={() => addProduct(p.id)} disabled={picks.length >= 3}
              className="bg-secondary/40 hover:bg-secondary rounded-xl p-3 text-left transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed group">
              <div className="aspect-square bg-background rounded-lg flex items-center justify-center overflow-hidden mb-2">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-[12px] font-semibold text-foreground leading-tight truncate">{p.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">${p.price}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
