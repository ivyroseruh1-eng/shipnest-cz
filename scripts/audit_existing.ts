import fs from "fs";
import path from "path";

const productsContent = fs.readFileSync("src/data/products.ts", "utf8");
const existingFiles = fs.readdirSync("public/assets/products").filter(f => !fs.statSync(path.join("public/assets/products", f)).isDirectory());

const imageRefs = productsContent.match(/\/assets\/products\/[^\s"']+/g) || [];
const usedBasenames = new Set(imageRefs.map(r => path.basename(r)));

const unusedOnDisk = existingFiles.filter(f => !usedBasenames.has(f));
console.log("Unused files on disk in public/assets/products:", unusedOnDisk.length);
console.log("Unused files:", unusedOnDisk);

if (fs.existsSync(".tmp-image-map.txt")) {
  const mapContent = fs.readFileSync(".tmp-image-map.txt", "utf8");
  const lines = mapContent.trim().split("\n");
  console.log("\nSample map entries:");
  lines.slice(0, 10).forEach(l => console.log(" ", l));
}
