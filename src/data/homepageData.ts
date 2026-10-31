import { Product } from "@/types";
import { technologyProducts } from "@/data/technologyProducts";
import { luxuryHighlights } from "@/data/luxuryHighlights";

export { technologyProducts, luxuryHighlights };

export const homepageProducts: Product[] = [
  ...technologyProducts.map((p) => ({ department: "Technology", ...p })),
  ...luxuryHighlights,
];
