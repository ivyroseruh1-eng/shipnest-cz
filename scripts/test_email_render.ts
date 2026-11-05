import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { generateOrderEmail } from "../src/lib/orderEmailGenerator";
import { Order } from "../src/types";

const mockOrder: Order = {
  id: "test-order-1",
  orderId: "SN94820194",
  trackingId: "SNX948201",
  customer: {
    name: "Alexander Wright",
    email: "a.wright@techventures.io",
    phone: "+420 777 000 111",
    address: "Na Příkopě 22, Suite 400",
    city: "Prague",
    state: "Bohemia",
    country: "Czech Republic",
    zip: "110 00",
  },
  items: [
    {
      productId: "prod-iphone-18-pro",
      name: "iPhone 18 Pro Max",
      brand: "Apple",
      image: "/assets/products/apple-iphone18-pro-max.jpg",
      price: 1199,
      qty: 1,
      selectedColor: "Natural Titanium",
      selectedStorage: "256GB",
    },
    {
      productId: "prod-galaxy-s24",
      name: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      image: "/assets/products/galaxy-s24-ultra.jpg",
      price: 1299,
      qty: 1,
      selectedColor: "Titanium Gray",
      selectedStorage: "512GB",
    },
  ],
  subtotal: 2498,
  tax: 499.6,
  total: 2997.6,
  status: "Out for Delivery",
  estimatedDelivery: "Thursday, Nov 12, 2026",
  placedAt: "2026-11-05T10:00:00.000Z",
  notes: "White-glove Prague dispatch",
  paymentMethod: "Visa ending in 7632",
  deliveryPin: "4829",
  trackingSteps: [],
};

async function run() {
  const outputDir = path.resolve("test_email_output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ channel: "msedge", headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const testCases = [
    { step: "Order Received", filename: "01_order_received" },
    { step: "In Transit", filename: "02_in_transit" },
    { step: "Out for Delivery", filename: "03_out_for_delivery" },
    { step: "Delivered", filename: "04_delivered" },
  ];

  const viewports = [
    { name: "320px_iPhone_SE", width: 320, height: 700 },
    { name: "375px_iPhone_Standard", width: 375, height: 812 },
    { name: "430px_iPhone_Pro_Max", width: 430, height: 932 },
    { name: "600px_Desktop", width: 600, height: 900 },
  ];

  let totalErrors = 0;

  for (const tc of testCases) {
    const email = generateOrderEmail(mockOrder, tc.step);

    for (const vp of viewports) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });

      await page.setContent(email.html, { waitUntil: "networkidle" });

      const overflow = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const bodyScrollW = document.body.scrollWidth;
        const maxScroll = Math.max(scrollW, bodyScrollW);
        return {
          clientWidth: docW,
          scrollWidth: maxScroll,
          diff: maxScroll - docW,
        };
      });

      if (overflow.diff > 1) {
        console.error(`[OVERFLOW ERROR] ${tc.step} at ${vp.name}: diff=${overflow.diff}px (client=${overflow.clientWidth}, scroll=${overflow.scrollWidth})`);
        totalErrors++;
      } else {
        console.log(`[PASS] ${tc.step} at ${vp.name}: 0px overflow`);
      }

      // Capture key screenshots for visual audit
      if (vp.width === 375 || vp.width === 320) {
        await page.screenshot({
          path: path.join(outputDir, `${tc.filename}_${vp.name}_light.png`),
          fullPage: true,
        });

        await page.emulateMedia({ colorScheme: "dark" });
        await page.screenshot({
          path: path.join(outputDir, `${tc.filename}_${vp.name}_dark.png`),
          fullPage: true,
        });
      }

      await page.close();
    }
  }

  await browser.close();
  console.log(`\nVisual & Geometry Audit Finished. Total Overflow Errors: ${totalErrors}`);
  if (totalErrors > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
