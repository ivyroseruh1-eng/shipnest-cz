import * as XLSX from "xlsx";
import fs from "fs";

const wb = XLSX.readFile("data/imports/ShipNest_Luxury_Catalogue_600.xlsx");
const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets["Luxury Catalogue"]);

console.log(`Total rows read from Luxury Catalogue sheet: ${rows.length}`);

// Group by Department and Brand
const tree: Record<string, Record<string, any[]>> = {};

for (const row of rows) {
  const dept = row["Department"] || "Uncategorized";
  const brand = row["Brand"] || "Unknown";
  if (!tree[dept]) tree[dept] = {};
  if (!tree[dept][brand]) tree[dept][brand] = [];
  tree[dept][brand].push(row);
}

for (const [dept, brands] of Object.entries(tree)) {
  console.log(`\n=== Department: ${dept} (${Object.keys(brands).length} brands) ===`);
  for (const [brand, items] of Object.entries(brands)) {
    console.log(`  ${brand} (${items.length} items): ${items.map(i => i["Product / Model Name"]).join(", ")}`);
  }
}
