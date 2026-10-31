import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface CategoryTileItem {
  title: string;
  subtitle: string;
  to: string;
  image: string;
  tag: string;
}

const categories: CategoryTileItem[] = [
  {
    title: "Flagship Smartphones",
    subtitle: "Apple iPhone 18 Pro, Galaxy S26 Ultra & Foldables",
    to: "/shop?department=Technology",
    image: "/assets/products/apple/iphone-18-pro-hero.jpg",
    tag: "Technology",
  },
  {
    title: "Designer Leather Goods",
    subtitle: "Louis Vuitton, Gucci, Hermès & Chanel",
    to: "/shop?department=Designer+Fashion+%26+Accessories",
    image: "/assets/categories/luxury-bags.jpg",
    tag: "Luxury",
  },
  {
    title: "Haute Horlogerie",
    subtitle: "Rolex, Cartier & Swiss Precision Watches",
    to: "/shop?department=Watches+%26+Jewellery",
    image: "/assets/categories/luxury-watches.jpg",
    tag: "Timepieces",
  },
  {
    title: "Fine Perfumery",
    subtitle: "Creed, Le Labo, MFK & Tom Ford Extraits",
    to: "/shop?department=Perfumes+%26+Fragrance",
    image: "/assets/categories/luxury-fragrance.jpg",
    tag: "Fragrance",
  },
  {
    title: "High Jewellery",
    subtitle: "Cartier Love, Van Cleef Alhambra & Tiffany HardWear",
    to: "/shop?category=Jewellery",
    image: "/assets/categories/fine-jewellery.jpg",
    tag: "Jewellery",
  },
  {
    title: "Skincare & Cosmetics",
    subtitle: "Charlotte Tilbury, Dior Beauty & Clinical Formulations",
    to: "/shop?department=Makeup+%26+Skincare",
    image: "/assets/categories/skincare-beauty.jpg",
    tag: "Beauty",
  },
];

const CategoryTiles = () => (
  <section className="border-t border-border bg-[#fafafc] py-16 sm:py-20">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest">Curated Departments</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
            Explore by Department
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Authentic flagship electronics and certified European luxury houses, all dispatched with live radar milestone tracking.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors shrink-0"
        >
          View all 660+ items <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="group relative rounded-2xl overflow-hidden bg-card border border-border/80 shadow-xs hover:shadow-xl hover:border-foreground/20 transition-all duration-300 flex flex-col justify-end min-h-[260px] sm:min-h-[290px] p-6 text-white"
          >
            {/* Background Photography */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-900">
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              {/* Gradient Overlay for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />
            </div>

            {/* Content Stage */}
            <div className="relative z-10 space-y-1.5">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white/90 border border-white/20">
                {c.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-primary-foreground transition-colors flex items-center justify-between">
                <span>{c.title}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-white/80" />
              </h3>
              <p className="text-xs text-white/75 leading-relaxed line-clamp-1">
                {c.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryTiles;