import { Link } from "react-router-dom";
import { Smartphone, Gamepad2, Headphones, Watch, Cable } from "lucide-react";

const cats = [
  { label: "Electronics", to: "/shop", icon: Smartphone },
  { label: "Gaming", to: "/shop?category=Gaming", icon: Gamepad2 },
  { label: "Audio", to: "/shop?category=Audio", icon: Headphones },
  { label: "Wearables", to: "/shop?category=Wearables", icon: Watch },
  { label: "Accessories", to: "/shop?category=Accessories", icon: Cable },
];

const CategoryTiles = () => (
  <section className="border-t border-border bg-background py-12">
    <div className="max-w-[980px] mx-auto px-4">
      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight text-center mb-8">Shop by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cats.map(c => (
          <Link key={c.label} to={c.to}
            className="group bg-secondary hover:bg-foreground hover:text-background rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors aspect-square">
            <c.icon className="w-7 h-7" strokeWidth={1.4} />
            <span className="text-[13px] font-semibold">{c.label}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryTiles;