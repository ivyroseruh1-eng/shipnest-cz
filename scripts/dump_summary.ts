import * as XLSX from "xlsx";
import fs from "fs";

const wb = XLSX.readFile("ShipNest_Luxury_Catalogue_600.xlsx");
const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets["Luxury Catalogue"]);

const summary: Record<string, string[]> = {};
rows.forEach(r => {
  const b = r["Brand"];
  if (!summary[b]) summary[b] = [];
  summary[b].push(r["Product / Model Name"]);
});

fs.writeFileSync("luxury_summary.json", JSON.stringify(summary, null, 2));
console.log("Wrote luxury_summary.json");
