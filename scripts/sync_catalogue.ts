import fs from "fs";
import path from "path";

const PRODUCTS_JSON_PATH = path.join(process.cwd(), "data/catalogue/products.json");
const MANIFEST_PATH = path.join(process.cwd(), "data/catalogue/product-images.json");
const LUXURY_TS_PATH = path.join(process.cwd(), "src/data/luxuryProducts.ts");

function sync() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, "utf-8"));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

  // Check each product against manifest
  products.forEach((p: any) => {
    const m = manifest.find((x: any) => x.draftListingId === p.draftListingId || x.productId === p.id);
    if (m) {
      p.image = m.mainImagePath;
      p.verificationStatus = m.verificationStatus;
      p.fallbackImages = [
        m.directImageUrl,
        m.mainImagePath,
      ].filter(Boolean);
      if (m.galleryImagePaths && m.galleryImagePaths.length > 0) {
        p.gallery = m.galleryImagePaths;
      }
    }
  });

  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), "utf-8");

  const tsContent = `// Automatically generated from data/catalogue/products.json & product-images.json
import { Product } from "@/types";

export const luxuryProducts: Product[] = ${JSON.stringify(products, null, 2)};
`;
  fs.writeFileSync(LUXURY_TS_PATH, tsContent, "utf-8");
  console.log(`[OK] Successfully synchronized ${products.length} luxury products into ${LUXURY_TS_PATH}`);
}

sync();
