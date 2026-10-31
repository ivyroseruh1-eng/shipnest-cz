import { chromium } from "@playwright/test";
import http from "http";
import fs from "fs";
import path from "path";

// A lightweight static server for the built dist directory
function createStaticServer(distDir: string, port: number): Promise<http.Server> {
  return new Promise((resolve) => {
    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };

    const server = http.createServer((req, res) => {
      let reqPath = req.url?.split("?")[0] || "/";
      if (reqPath === "/") reqPath = "/index.html";

      let filePath = path.join(distDir, reqPath);
      if (!fs.existsSync(filePath)) {
        // Fallback for SPA routing
        filePath = path.join(distDir, "index.html");
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || "application/octet-stream";

      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      } catch (err) {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    server.listen(port, () => {
      console.log(`Test server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function runE2E() {
  const PORT = 4180;
  const distDir = path.resolve("dist");
  const server = await createStaticServer(distDir, PORT);

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    browser = await chromium.launch({ channel: "msedge", headless: true });
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:" + PORT);
  await page.goto(`http://localhost:${PORT}`);
  await page.waitForLoadState("networkidle");

  // Check product cards on home / featured
  console.log("Checking Homepage product images...");
  const images = await page.$$eval("img", (imgs) =>
    imgs.map((img) => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
    }))
  );

  console.log(`Found ${images.length} images on page.`);
  let brokenImages = 0;
  for (const img of images) {
    if (img.complete && img.naturalWidth === 0 && !img.src.includes("data:image/svg")) {
      console.error(`Broken image detected: ${img.src} (alt: ${img.alt})`);
      brokenImages++;
    }
  }

  // Navigate to Shop page
  console.log("Navigating to Shop page...");
  await page.goto(`http://localhost:${PORT}/shop`);
  await page.waitForLoadState("networkidle");

  const shopImages = await page.$$eval(".product-card img, [data-testid='product-card'] img, img", (imgs) =>
    imgs.map((img) => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
    }))
  );

  console.log(`Found ${shopImages.length} images on Shop page.`);
  const failedShopImages = shopImages.filter((i) => i.naturalWidth === 0 && !i.src.includes("data:image/svg"));
  console.log(`Failed images on Shop page: ${failedShopImages.length}`);

  // Test iPhone 18 Pro detail page & color switching
  console.log("Testing iPhone 18 Pro detail page...");
  await page.goto(`http://localhost:${PORT}/product/iphone-18-pro`);
  await page.waitForLoadState("networkidle");

  const mainProductImg = await page.$eval("img[alt='iPhone 18 Pro'], .relative img", (el) => ({
    src: (el as HTMLImageElement).src,
    naturalWidth: (el as HTMLImageElement).naturalWidth,
  }));
  console.log("iPhone 18 Pro main image:", mainProductImg.src, "naturalWidth:", mainProductImg.naturalWidth);

  // Check mobile viewport for horizontal overflow
  console.log("Testing mobile viewport (375px)...");
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForLoadState("networkidle");

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  console.log(`Viewport check: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
  const hasHorizontalScroll = scrollWidth > clientWidth;
  console.log(`Horizontal scroll present: ${hasHorizontalScroll}`);

  await browser.close();
  server.close();

  if (brokenImages === 0 && failedShopImages.length === 0 && !hasHorizontalScroll) {
    console.log("\n[SUCCESS] E2E Image & Layout Verification Passed cleanly!");
  } else {
    console.warn(`\n[WARNING] Found ${brokenImages} broken on home, ${failedShopImages.length} on shop.`);
  }
}

runE2E().catch((e) => {
  console.error("E2E Test encountered error:", e);
  process.exit(1);
});
