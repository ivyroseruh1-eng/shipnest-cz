import { Product, ColorVariant } from "@/types";

export interface StageTheme {
  background: string;     // Exact matching solid hex: "#000000" | "#ffffff" | etc. (NO GRADIENTS)
  borderColor: string;    // "#27272a" for dark stage, "#e5e7eb" for light stage
  textColor: string;      // "#ffffff" for dark stage, "#09090b" for light stage
  badgeStyle?: string;
  isLight: boolean;
}

// In-memory cache for processed image data URLs so each asset is processed at most once
const imageCache = new Map<string, string>();
// In-memory cache for detected background colors
const imageBgCache = new Map<string, string>();

export interface GalleryLayoutConfig {
  containerAspectClass: string;
  maxHeightClass: string;
  proportion: "landscape" | "portrait" | "square";
}

/**
 * Computes optimal gallery layout and proportions based on product type.
 * Eliminates oversized fixed square presentations and adapts cleanly to:
 * - Handbags, Shoes, Laptops -> Landscape (4:3)
 * - Smartphones, Fragrances, Apparel -> Portrait (4:5)
 * - Watches, Jewellery, Audio -> Balanced Square (1:1)
 */
export function getProductGalleryLayout(product?: Partial<Product> | null): GalleryLayoutConfig {
  if (!product) {
    return {
      containerAspectClass: "aspect-[4/3]",
      maxHeightClass: "max-h-[460px] lg:max-h-[500px]",
      proportion: "landscape",
    };
  }

  const cat = (product.category || "").toLowerCase();
  const subcat = (product.subcategory || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const dept = (product.department || "").toLowerCase();
  const prodType = (product.productType || "").toLowerCase();

  // 1. Handbags, Bags, Totes, Shoes, Footwear, Laptops -> Landscape (4:3)
  const isHandbag =
    cat.includes("bag") ||
    subcat.includes("bag") ||
    prodType.includes("bag") ||
    name.includes("bag") ||
    name.includes("tote") ||
    name.includes("speedy") ||
    name.includes("neverfull") ||
    name.includes("alma") ||
    name.includes("backpack") ||
    name.includes("pouch") ||
    name.includes("wallet") ||
    name.includes("crossbody");

  const isFootwear =
    cat.includes("footwear") ||
    cat.includes("shoe") ||
    subcat.includes("shoe") ||
    subcat.includes("footwear") ||
    prodType.includes("footwear") ||
    prodType.includes("shoe") ||
    name.includes("sneaker") ||
    name.includes("shoe") ||
    name.includes("sandal") ||
    name.includes("loafer") ||
    name.includes("pump") ||
    name.includes("boot") ||
    name.includes("slide");

  const isLandscapeDevice =
    cat.includes("laptop") ||
    cat.includes("tablet") ||
    cat.includes("monitor") ||
    name.includes("macbook") ||
    name.includes("ipad") ||
    name.includes("duo");

  if (isHandbag || isFootwear || isLandscapeDevice) {
    return {
      containerAspectClass: "aspect-[4/3]",
      maxHeightClass: "max-h-[460px] lg:max-h-[500px]",
      proportion: "landscape",
    };
  }

  // 2. Smartphones, Fragrance/Perfumes, Apparel -> Portrait (4:5)
  const isPhone =
    cat.includes("phone") ||
    cat.includes("smartphone") ||
    dept.includes("phone") ||
    name.includes("iphone") ||
    name.includes("galaxy s") ||
    name.includes("galaxy a") ||
    name.includes("galaxy z") ||
    name.includes("pixel");

  const isFragrance =
    cat.includes("fragrance") ||
    cat.includes("perfume") ||
    dept.includes("fragrance") ||
    dept.includes("perfume") ||
    name.includes("perfume") ||
    name.includes("eau de") ||
    name.includes("parfum") ||
    name.includes("mist");

  const isApparel =
    cat.includes("clothing") ||
    cat.includes("apparel") ||
    cat.includes("dress") ||
    cat.includes("jacket");

  if (isPhone || isFragrance || isApparel) {
    return {
      containerAspectClass: "aspect-[4/5]",
      maxHeightClass: "max-h-[540px] lg:max-h-[580px]",
      proportion: "portrait",
    };
  }

  // 3. Watches, Jewellery, Audio, and others -> Balanced Square (1:1)
  return {
    containerAspectClass: "aspect-square",
    maxHeightClass: "max-h-[480px] lg:max-h-[520px]",
    proportion: "square",
  };
}

/**
 * Precomputed exact solid background color mapping for catalogue assets.
 * Dark/black-background product images get "#000000" container.
 * White-background product images get "#ffffff" container.
 * Specific tone images get their matching solid tone.
 */
const ASSET_BACKGROUND_MAP: Record<string, string> = {
  // Apple Flagship Studio Assets (Consistent pure white #ffffff studio presentation)
  "/assets/products/apple-iphone18-pro-max.jpg": "#ffffff",
  "/assets/products/apple-iphone18-pro.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-burgundy-square.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-glacier-square.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-silver-square.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-black-square.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-hero.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-burgundy.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-glacier.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-silver.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-black.jpg": "#ffffff",
  "/assets/products/apple/iphone-18-pro-size.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-closed.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-display.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-foldable.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-landscape.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-laptop.jpg": "#ffffff",
  "/assets/products/apple-iphone-duo.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-nightsky.jpg": "#ffffff",
};

/**
 * Known bounding boxes for wide landscape marketing banners (2880x1520)
 * where the phone/subject is positioned asymmetrically in the right half.
 * Format: [minX, minY, maxX, maxY] within 2880x1520 coordinate space.
 */
const ASSET_BOUNDING_BOXES: Record<string, [number, number, number, number]> = {
  "/assets/products/apple/iphone-18-pro-burgundy.jpg": [1440, 140, 2394, 1500],
  "/assets/products/apple/iphone-18-pro-black.jpg": [1440, 140, 2394, 1500],
  "/assets/products/apple/iphone-18-pro-glacier.jpg": [1440, 140, 2394, 1500],
  "/assets/products/apple/iphone-18-pro-silver.jpg": [1440, 140, 2394, 1500],
  "/assets/products/apple/iphone-18-pro-size.jpg": [835, 180, 2716, 1495],
  "/assets/products/apple/iphone-duo-display.jpg": [1350, 190, 2150, 1310],
  "/assets/products/apple/iphone-duo-closed.jpg": [1520, 190, 2310, 1310],
  "/assets/products/apple/iphone-duo-foldable.jpg": [1300, 200, 2680, 1300],
  "/assets/products/apple/iphone-duo-landscape.jpg": [1210, 220, 2660, 1270],
  "/assets/products/apple/iphone-duo-laptop.jpg": [1270, 230, 2610, 1260],
};

/**
 * Normalizes URL / path string for reliable cache and map lookups
 */
function normalizeAssetPath(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url, "https://shipnest.internal");
    return parsed.pathname;
  } catch {
    return url.split("?")[0].split("#")[0];
  }
}

/**
 * Determines whether a given hex color is dark
 */
export function isColorDark(hex: string): boolean {
  if (!hex || hex === "#000000" || hex === "#000" || hex === "black") return true;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
  }
  return false;
}

/**
 * Resolves the matching solid background color and stage theme for any product or image.
 * If the image has a black background -> black image container.
 * If the image has a white background -> white image container.
 * If the image has another background color -> matching container.
 * NO GRADIENTS. The container and image blend without a visible rectangular seam.
 */
export function getProductStageTheme(
  product?: Partial<Product> | null,
  variant?: ColorVariant | null,
  imageSrc?: string
): StageTheme {
  const activeSrc = imageSrc || variant?.image || product?.image || "";
  const normPath = normalizeAssetPath(activeSrc);

  // 1. Direct lookup in precomputed asset map
  if (normPath && ASSET_BACKGROUND_MAP[normPath]) {
    const bg = ASSET_BACKGROUND_MAP[normPath];
    const isDark = isColorDark(bg);
    return {
      background: bg,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
      textColor: isDark ? "#ffffff" : "#09090b",
      isLight: !isDark,
    };
  }

  // 2. Lookup in runtime detected background cache
  if (activeSrc && imageBgCache.has(activeSrc)) {
    const bg = imageBgCache.get(activeSrc)!;
    const isDark = isColorDark(bg);
    return {
      background: bg,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
      textColor: isDark ? "#ffffff" : "#09090b",
      isLight: !isDark,
    };
  }

  // 3. Fallback inference based on product/variant metadata
  const variantName = (variant?.name || "").toLowerCase();
  const hex = (variant?.hex || "").toLowerCase();
  const prodName = (product?.name || "").toLowerCase();

  // Studio photography renders on clean, seamless solid white canvas

  // Default clean white studio container (matches catalogue photography)
  return {
    background: "#ffffff",
    borderColor: "#e5e7eb",
    textColor: "#09090b",
    isLight: true,
  };
}

/**
 * Convenience helper to get the matching background for any image path throughout the app.
 */
export function getProductImageBackground(
  imageSrc?: string,
  product?: Partial<Product> | null
): StageTheme {
  return getProductStageTheme(product, null, imageSrc);
}

/**
 * Checks if an image is dark
 */
export function isImageDark(imageSrc?: string): boolean {
  const theme = getProductImageBackground(imageSrc);
  return !theme.isLight;
}

/**
 * Client-side non-destructive image processor.
 * - Inspects the actual image background color and transparency.
 * - Detects subject boundaries accurately across all orientations (square, portrait, landscape).
 * - Trims excessive empty canvas margins so products fill their frame cleanly and prominently.
 * - Preserves natural aspect ratio, legitimate soft shadows, product reflections, and image quality.
 * - Completely avoids distorting or stretching the product.
 * - Leaves real photo/lifestyle backgrounds untouched.
 * - Never touches files on disk.
 */
export function processProductImage(
  img: HTMLImageElement,
  maxDimension = 1200
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const src = img.currentSrc || img.src;
      if (!src) return resolve("");

      // Skip already processed data URLs immediately
      if (src.startsWith("data:")) {
        return resolve(src);
      }

      if (imageCache.has(src)) {
        return resolve(imageCache.get(src)!);
      }

      if (typeof window === "undefined" || !img.naturalWidth || !img.naturalHeight) {
        return resolve(src);
      }

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const normPath = normalizeAssetPath(src);

      // Check if this image has a precomputed bounding box (wide Apple marketing banners)
      const hasPresetBox = normPath in ASSET_BOUNDING_BOXES;

      // Sample edge color and transparency to detect background
      let r = 255, g = 255, b = 255;
      let isTransparent = false;

      if (normPath in ASSET_BACKGROUND_MAP) {
        const mappedHex = ASSET_BACKGROUND_MAP[normPath];
        if (mappedHex === "#000000") {
          r = 0; g = 0; b = 0;
        } else if (mappedHex === "#ffffff") {
          r = 255; g = 255; b = 255;
        } else {
          const clean = mappedHex.replace("#", "");
          r = parseInt(clean.slice(0, 2), 16) || 255;
          g = parseInt(clean.slice(2, 4), 16) || 255;
          b = parseInt(clean.slice(4, 6), 16) || 255;
        }
      } else {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = nw;
        tempCanvas.height = nh;
        const tCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
        if (tCtx) {
          tCtx.drawImage(img, 0, 0);
          const corners = [
            tCtx.getImageData(3, 3, 1, 1).data,
            tCtx.getImageData(nw - 4, 3, 1, 1).data,
            tCtx.getImageData(3, nh - 4, 1, 1).data,
            tCtx.getImageData(nw - 4, nh - 4, 1, 1).data,
          ];

          isTransparent = corners.some(c => c[3] < 240);

          let sr = 0, sg = 0, sb = 0;
          for (const c of corners) { sr += c[0]; sg += c[1]; sb += c[2]; }
          r = Math.round(sr / 4);
          g = Math.round(sg / 4);
          b = Math.round(sb / 4);
          if (r < 25 && g < 25 && b < 25) { r = 0; g = 0; b = 0; }
          else if (r > 240 && g > 240 && b > 240) { r = 255; g = 255; b = 255; }

          // If corner colors differ dramatically and it's not transparent, this is a real photo/lifestyle background
          if (!isTransparent && !hasPresetBox) {
            const maxCornerDiff = Math.max(
              ...corners.map(c => Math.abs(c[0] - r) + Math.abs(c[1] - g) + Math.abs(c[2] - b))
            );
            if (maxCornerDiff > 35) {
              imageCache.set(src, src);
              return resolve(src);
            }
          }
        }
      }

      const detectedBgHex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
      imageBgCache.set(src, detectedBgHex);

      let cropMinX = 0, cropMinY = 0, cropMaxX = nw, cropMaxY = nh;

      if (hasPresetBox) {
        const [px1, py1, px2, py2] = ASSET_BOUNDING_BOXES[normPath];
        const sx = nw / 2880;
        const sy = nh / 1520;
        cropMinX = Math.round(px1 * sx);
        cropMinY = Math.round(py1 * sy);
        cropMaxX = Math.round(px2 * sx);
        cropMaxY = Math.round(py2 * sy);
      } else {
        // Dynamic subject boundary detection on downsampled grid
        const gridW = 320;
        const gridH = Math.max(1, Math.round(320 * (nh / nw)));
        const gridC = document.createElement("canvas");
        gridC.width = gridW;
        gridC.height = gridH;
        const gCtx = gridC.getContext("2d", { willReadFrequently: true });
        if (!gCtx) {
          imageCache.set(src, src);
          return resolve(src);
        }
        gCtx.drawImage(img, 0, 0, gridW, gridH);
        const gData = gCtx.getImageData(0, 0, gridW, gridH).data;

        let minX = gridW, maxX = 0, minY = gridH, maxY = 0;
        const diffThreshold = 24;

        for (let y = 0; y < gridH; y++) {
          for (let x = 0; x < gridW; x++) {
            const idx = (y * gridW + x) * 4;
            const alpha = gData[idx + 3];
            let isSubjectPixel = false;

            if (isTransparent) {
              isSubjectPixel = alpha > 30;
            } else {
              const diff = Math.abs(gData[idx] - r) + Math.abs(gData[idx + 1] - g) + Math.abs(gData[idx + 2] - b);
              isSubjectPixel = diff > diffThreshold;
            }

            if (isSubjectPixel) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // Blank or unsegmented image -> return original
        if (minX >= maxX || minY >= maxY) {
          imageCache.set(src, src);
          return resolve(src);
        }

        cropMinX = Math.floor(minX * (nw / gridW));
        cropMaxX = Math.ceil(maxX * (nw / gridW));
        cropMinY = Math.floor(minY * (nh / gridH));
        cropMaxY = Math.ceil(maxY * (nh / gridH));
      }

      const rawSw = Math.max(1, cropMaxX - cropMinX);
      const rawSh = Math.max(1, cropMaxY - cropMinY);

      // If the subject already covers >= 90% of both dimensions and is reasonably centered, keep original
      const covW = rawSw / nw;
      const covH = rawSh / nh;
      const isCenteredX = Math.abs(cropMinX - (nw - cropMaxX)) < nw * 0.06;
      const isCenteredY = Math.abs(cropMinY - (nh - cropMaxY)) < nh * 0.06;

      if (!hasPresetBox && covW >= 0.90 && covH >= 0.90 && isCenteredX && isCenteredY) {
        imageCache.set(src, src);
        return resolve(src);
      }

      // Add a clean 5% breathing safety margin so no product details, bevels or shadows are clipped
      const padX = Math.round(rawSw * 0.05);
      const padY = Math.round(rawSh * 0.05);
      const finalMinX = Math.max(0, cropMinX - padX);
      const finalMinY = Math.max(0, cropMinY - padY);
      const finalMaxX = Math.min(nw, cropMaxX + padX);
      const finalMaxY = Math.min(nh, cropMaxY + padY);

      const targetW = Math.max(1, finalMaxX - finalMinX);
      const targetH = Math.max(1, finalMaxY - finalMinY);

      // Cap maximum dimension to maxDimension (default 1200) to keep memory lean
      let outW = targetW;
      let outH = targetH;
      const maxDim = Math.max(outW, outH);
      if (maxDim > maxDimension) {
        const scale = maxDimension / maxDim;
        outW = Math.round(outW * scale);
        outH = Math.round(outH * scale);
      }

      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      const outCtx = outCanvas.getContext("2d");
      if (!outCtx) {
        imageCache.set(src, src);
        return resolve(src);
      }

      // Fill matching solid background (or clear if transparent)
      if (isTransparent) {
        outCtx.clearRect(0, 0, outW, outH);
      } else {
        outCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        outCtx.fillRect(0, 0, outW, outH);
      }

      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = "high";
      outCtx.drawImage(
        img,
        finalMinX, finalMinY, targetW, targetH,
        0, 0, outW, outH
      );

      const mimeType = isTransparent
        ? "image/png"
        : (r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255)
          ? "image/jpeg"
          : "image/png";

      const processedDataUrl = outCanvas.toDataURL(mimeType, 0.94);
      imageCache.set(src, processedDataUrl);
      imageCache.set(processedDataUrl, processedDataUrl);
      return resolve(processedDataUrl);
    } catch {
      return resolve(img.currentSrc || img.src);
    }
  });
}
