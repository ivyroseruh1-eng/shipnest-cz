import fs from "fs";
import path from "path";

const appleImages = [
  // iPhone 18 Pro & Pro Max
  {
    url: "https://www.apple.com/v/iphone-18-pro/c/images/overview/product-viewer/color_burgundy__f95it7a6dnyq_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-18-pro-burgundy.jpg",
  },
  {
    url: "https://www.apple.com/v/iphone-18-pro/c/images/overview/product-viewer/color_glacier__fkxlpbz0ruy6_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-18-pro-glacier.jpg",
  },
  {
    url: "https://www.apple.com/v/iphone-18-pro/c/images/overview/product-viewer/color_silver__c0oudn0fzw4m_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-18-pro-silver.jpg",
  },
  {
    url: "https://www.apple.com/v/iphone-18-pro/c/images/overview/product-viewer/color_black__dseo2tvypuc2_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-18-pro-black.jpg",
  },
  {
    url: "https://www.apple.com/v/iphone-18-pro/c/images/overview/media-hero/hero_endframe__fbxsnz8txcia_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-18-pro-hero.jpg",
  },
  {
    url: "https://www.apple.com/v/iphone-18-pro/c/images/overview/media-hero/colors_endframe__czfie0zmty4i_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-18-pro-lineup.jpg",
  },
  // iPhone Duo
  {
    url: "https://www.apple.com/in/iphone-duo/images/overview/product-viewer/display__bx48n0ntsgvm_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-duo-display.jpg",
  },
  {
    url: "https://www.apple.com/in/iphone-duo/images/overview/product-viewer/foldable__iybtpzlhgj6u_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-duo-foldable.jpg",
  },
  {
    url: "https://www.apple.com/v/iphone-duo/e/images/overview/product-viewer/closed__3le61imm1w2e_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-duo-closed.jpg",
  },
  {
    url: "https://www.apple.com/in/iphone-duo/images/overview/product-viewer/landscape__f7x2oe1oxemy_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-duo-landscape.jpg",
  },
  {
    url: "https://www.apple.com/v/iphone-duo/e/images/overview/product-viewer/laptop__c7kl6vmsqd6q_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-duo-laptop.jpg",
  },
  // iPhone Air
  {
    url: "https://www.apple.com/v/iphone/home/ck/images/overview/select/iphone_air__b5qmgl05ojyq_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-air.jpg",
  },
  // iPhone 17
  {
    url: "https://www.apple.com/in/iphone/home/images/overview/select/iphone_17__fb1277oq3eaa_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-17.jpg",
  },
  // iPhone 16
  {
    url: "https://www.apple.com/in/iphone/home/images/overview/select/iphone_16__c5usose9y2eq_large_2x.jpg",
    dest: "public/assets/products/apple/iphone-16.jpg",
  },
];

async function run() {
  const targetDir = path.resolve("public/assets/products/apple");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Downloading ${appleImages.length} official Apple photography assets...`);

  for (const item of appleImages) {
    try {
      const res = await fetch(item.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(item.dest, Buffer.from(buffer));
        console.log(`[OK] Saved ${item.dest} (${buffer.byteLength} bytes)`);
      } else {
        console.warn(`[WARN] Failed ${item.url} -> HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.error(`[ERROR] ${item.url}:`, e.message);
    }
  }

  console.log("Apple photography download complete.");
}

run();
