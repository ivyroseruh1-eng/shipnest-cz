import * as XLSX from "xlsx";
import fs from "fs";

const wb = XLSX.readFile("ShipNest_Luxury_Catalogue_600.xlsx");
const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets["Luxury Catalogue"]);

console.log("Total rows:", rows.length);

const brandsMap = new Map<string, any[]>();
const deptsMap = new Map<string, number>();
const subcatsMap = new Map<string, number>();

rows.forEach((r, idx) => {
  const brand = r["Brand"] || "Unknown";
  const dept = r["Department"] || "Unknown";
  const subcat = r["Subcategory"] || "Unknown";

  if (!brandsMap.has(brand)) brandsMap.set(brand, []);
  brandsMap.get(brand)!.push(r);

  deptsMap.set(dept, (deptsMap.get(dept) || 0) + 1);
  subcatsMap.set(subcat, (subcatsMap.get(subcat) || 0) + 1);
});

console.log("\nDepartments:");
for (const [dept, count] of deptsMap.entries()) {
  console.log(`- ${dept}: ${count} products`);
}

console.log("\nSubcategories:");
for (const [subcat, count] of subcatsMap.entries()) {
  console.log(`- ${subcat}: ${count} products`);
}

console.log("\nBrands count:", brandsMap.size);
const brandList = Array.from(brandsMap.keys());
console.log("Brands:", brandList.join(", "));
