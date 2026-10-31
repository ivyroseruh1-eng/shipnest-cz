import { Product } from "@/types";
import { technologyProducts } from "@/data/technologyProducts";
import { luxuryProducts } from "@/data/luxuryProducts";
import { luxuryHighlights } from "@/data/luxuryHighlights";

export { technologyProducts, luxuryProducts, luxuryHighlights };

export const homepageProducts: Product[] = [
  ...technologyProducts.map((p) => ({ department: "Technology", ...p })),
  ...luxuryHighlights,
];

export const products: Product[] = [
  ...technologyProducts.map((p) => ({ department: "Technology", ...p })),
  ...luxuryProducts,
];

export const departments = [
  "All",
  "Technology",
  "Designer Fashion & Accessories",
  "Makeup & Skincare",
  "Perfumes & Fragrance",
  "Watches & Jewellery",
];

const uniqueBrands = Array.from(new Set(products.map((p) => p.brand))).sort();
export const brands = ["All", ...uniqueBrands];

const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();
export const categories = ["All", ...uniqueCategories];
