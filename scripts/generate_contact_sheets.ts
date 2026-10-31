import fs from "fs";
import path from "path";

interface LuxuryProductImageManifest {
  id: string;
  brand: string;
  brandSlug: string;
  name: string;
  productSlug: string;
  department: string;
  category: string;
  sourcePageUrl: string;
  directImageUrl: string;
  mainImagePath: string;
  galleryImagePaths: string[];
  downloadStatus: "downloaded" | "pending" | "failed";
  verificationStatus: "verified" | "pending" | "unresolved";
  fileSizeBytes?: number;
  lastAudited?: string;
}

const MANIFEST_PATH = path.join(process.cwd(), "data/catalogue/product-images.json");
const OUTPUT_HTML_PATH = path.join(process.cwd(), "reports/contact-sheets/index.html");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function generateContactSheets() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("Manifest not found:", MANIFEST_PATH);
    process.exit(1);
  }

  const manifest: LuxuryProductImageManifest[] = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

  // Check actual disk existence and sizes
  let totalOnDisk = 0;
  let totalBytesOnDisk = 0;
  let totalPending = 0;

  const auditedItems = manifest.map((item) => {
    let exists = false;
    let size = 0;
    if (item.mainImagePath) {
      const fullDiskPath = path.join(PUBLIC_DIR, item.mainImagePath.replace(/^\//, ""));
      if (fs.existsSync(fullDiskPath)) {
        exists = true;
        size = fs.statSync(fullDiskPath).size;
        totalOnDisk++;
        totalBytesOnDisk += size;
      }
    }

    if (!exists) {
      totalPending++;
    }

    return {
      ...item,
      fileExistsOnDisk: exists,
      diskSizeBytes: size,
    };
  });

  // Group by Brand
  const brandsMap = new Map<string, typeof auditedItems>();
  for (const item of auditedItems) {
    if (!brandsMap.has(item.brand)) {
      brandsMap.set(item.brand, []);
    }
    brandsMap.get(item.brand)!.push(item);
  }

  // HTML Template
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShipNest — Real Product Image QA Contact Sheets</title>
  <style>
    :root {
      --bg: #FAFAFA;
      --card-bg: #FFFFFF;
      --text: #0F172A;
      --muted: #64748B;
      --border: #E2E8F0;
      --accent: #2563EB;
      --success: #16A34A;
      --warning: #D97706;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem 1.5rem;
    }
    .header {
      max-width: 1400px;
      margin: 0 auto 2rem auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    h1 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-success { background: #DCFCE7; color: #15803D; }
    .badge-warning { background: #FEF3C7; color: #B45309; }
    .badge-blue { background: #DBEAFE; color: #1D4ED8; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .stat-card {
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem 1rem;
    }
    .stat-val { font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .stat-lbl { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }

    .controls {
      max-width: 1400px;
      margin: 0 auto 2rem auto;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 0.5rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-btn:hover, .filter-btn.active {
      background: var(--text);
      color: #FFF;
      border-color: var(--text);
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }
    .brand-section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .product-card {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .img-wrap {
      width: 100%;
      height: 190px;
      background: #FBFBFB;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      position: relative;
      border-bottom: 1px solid var(--border);
    }
    .img-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .img-wrap .no-img {
      color: var(--muted);
      font-size: 0.75rem;
      text-align: center;
      font-weight: 500;
    }
    .card-body {
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.4rem;
    }
    .p-id {
      font-size: 0.7rem;
      font-family: monospace;
      color: var(--muted);
    }
    .p-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .p-dept {
      font-size: 0.75rem;
      color: var(--muted);
    }
    .p-meta {
      margin-top: auto;
      padding-top: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
    }
    .source-link {
      color: var(--accent);
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }
    .source-link:hover { text-decoration: underline; }
  </style>
</head>
<body>

  <div class="header">
    <div class="title-row">
      <div>
        <h1>ShipNest — Visual Product Image QA Sheets</h1>
        <p style="color: var(--muted); font-size: 0.9rem; margin-top: 0.25rem;">
          Verified physical files on disk across 50 luxury houses & technology catalogue
        </p>
      </div>
      <div>
        <span class="badge badge-blue">Audit Date: October 31, 2026</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val">${auditedItems.length}</div>
        <div class="stat-lbl">Catalogue Entries</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color: #16A34A;">${totalOnDisk}</div>
        <div class="stat-lbl">Downloaded & Verified</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color: ${totalPending > 0 ? '#D97706' : '#64748B'};">${totalPending}</div>
        <div class="stat-lbl">Pending Images</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${formatBytes(totalBytesOnDisk)}</div>
        <div class="stat-lbl">Total Asset Disk Size</div>
      </div>
    </div>
  </div>

  <div class="controls">
    <button class="filter-btn active" onclick="filterCards('all')">All Products (${auditedItems.length})</button>
    <button class="filter-btn" onclick="filterCards('verified')">Downloaded & Verified (${totalOnDisk})</button>
    <button class="filter-btn" onclick="filterCards('pending')">Pending (${totalPending})</button>
  </div>

  <div class="container">
    ${Array.from(brandsMap.entries())
      .map(([brand, items]) => {
        const brandDownloaded = items.filter((i) => i.fileExistsOnDisk).length;
        return `
      <div class="brand-section" data-brand="${brand}">
        <div class="brand-header">
          <div class="brand-title">
            <span>${brand}</span>
            <span class="badge ${brandDownloaded === items.length ? "badge-success" : "badge-warning"}">
              ${brandDownloaded} / ${items.length} Images Verified
            </span>
          </div>
          <span style="font-size: 0.8rem; color: var(--muted);">${items[0].department}</span>
        </div>
        <div class="product-grid">
          ${items
            .map(
              (item) => `
            <div class="product-card" data-status="${item.fileExistsOnDisk ? "verified" : "pending"}">
              <div class="img-wrap">
                ${
                  item.fileExistsOnDisk
                    ? `<img src="../../public${item.mainImagePath}" alt="${item.name}" loading="lazy" />`
                    : `<div class="no-img">Image Pending</div>`
                }
              </div>
              <div class="card-body">
                <span class="p-id">${item.id}</span>
                <span class="p-name" title="${item.name}">${item.name}</span>
                <span class="p-dept">${item.category}</span>
                <div class="p-meta">
                  <span class="badge ${item.fileExistsOnDisk ? "badge-success" : "badge-warning"}">
                    ${item.fileExistsOnDisk ? formatBytes(item.diskSizeBytes) : "Pending"}
                  </span>
                  ${
                    item.sourcePageUrl
                      ? `<a href="${item.sourcePageUrl}" target="_blank" rel="noopener noreferrer" class="source-link" title="${item.sourcePageUrl}">Source Page</a>`
                      : ""
                  }
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      `;
      })
      .join("")}
  </div>

  <script>
    function filterCards(type) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      const cards = document.querySelectorAll('.product-card');
      cards.forEach(card => {
        if (type === 'all') {
          card.style.display = 'flex';
        } else if (type === 'verified') {
          card.style.display = card.getAttribute('data-status') === 'verified' ? 'flex' : 'none';
        } else if (type === 'pending') {
          card.style.display = card.getAttribute('data-status') === 'pending' ? 'flex' : 'none';
        }
      });
    }
  </script>
</body>
</html>`;

  fs.mkdirSync(path.dirname(OUTPUT_HTML_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_HTML_PATH, html, "utf-8");
  console.log(`Contact sheet generated at: ${OUTPUT_HTML_PATH}`);
  console.log(`Summary: ${totalOnDisk} verified on disk, ${totalPending} pending, ${formatBytes(totalBytesOnDisk)} total bytes.`);
}

generateContactSheets();
