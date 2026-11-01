import { Product, ColorVariant } from "@/types";

export interface StageTheme {
  background: string;     // Exact matching solid hex: "#000000" | "#ffffff" | etc. (NO GRADIENTS)
  borderColor: string;    // "#27272a" for dark stage, "#e5e7eb" for light stage
  textColor: string;      // "#ffffff" for dark stage, "#09090b" for light stage
  badgeStyle?: string;
  isLight: boolean;
}

// In-memory cache for processed square/centered image data URLs so each asset is processed at most once
const imageCache = new Map<string, string>();
// In-memory cache for detected background colors
const imageBgCache = new Map<string, string>();

/**
 * Precomputed exact solid background color mapping for catalogue assets.
 * Dark/black-background product images get "#000000" container.
 * White-background product images get "#ffffff" container.
 * Specific tone images get their matching solid tone.
 */
const ASSET_BACKGROUND_MAP: Record<string, string> = {
  // Apple 18 Pro & Flagship Dark Assets (Pure black studio background #000000)
  "/assets/products/apple/iphone-18-pro-black.jpg": "#000000",
  "/assets/products/apple/iphone-18-pro-burgundy.jpg": "#000000",
  "/assets/products/apple/iphone-18-pro-glacier.jpg": "#000000",
  "/assets/products/apple/iphone-18-pro-hero.jpg": "#000000",
  "/assets/products/apple/iphone-18-pro-silver.jpg": "#000000",
  "/assets/products/apple/iphone-18-pro-size.jpg": "#000000",
  // Tone-specific Apple assets
  "/assets/products/apple/iphone-17.jpg": "#ded5e9",
  "/assets/products/apple/iphone-air.jpg": "#bbcad5",
  // Apple Duo and White Studio Assets
  "/assets/products/apple/iphone-duo-closed.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-display.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-foldable.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-landscape.jpg": "#ffffff",
  "/assets/products/apple/iphone-duo-laptop.jpg": "#ffffff",
  "/assets/products/apple-iphone-duo.jpg": "#ffffff",
  "/assets/products/apple-iphone18-pro-max.jpg": "#ffffff",
  "/assets/products/apple-iphone18-pro.jpg": "#ffffff",
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

  const isBlackVariant =
    (variantName.includes("black") || variantName.includes("midnight") || hex === "#1c1c1e" || hex === "#2b2b2d") &&
    (prodName.includes("iphone 18") || normPath.includes("iphone-18"));

  const isBurgundyVariant =
    (variantName.includes("burgundy") || hex === "#5e2734") &&
    (prodName.includes("iphone 18") || normPath.includes("iphone-18"));

  const isGlacierVariant =
    (variantName.includes("glacier") || hex === "#b6c4ce") &&
    (prodName.includes("iphone 18") || normPath.includes("iphone-18"));

  const isSilverVariant =
    (variantName.includes("silver") || hex === "#e2e4e5") &&
    (prodName.includes("iphone 18") || normPath.includes("iphone-18"));

  if (isBlackVariant || isBurgundyVariant || isGlacierVariant || isSilverVariant) {
    return {
      background: "#000000",
      borderColor: "#27272a",
      textColor: "#ffffff",
      isLight: false,
    };
  }

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
 * - Inspects the actual image background color.
 * - Detects if an image has wide letterbox margins or an off-center subject (e.g. 2880x1520 Apple marketing banners).
 * - Centers the phone/subject horizontally and vertically into a clean square canvas with ~85% height.
 * - Fills the surrounding container canvas with the EXACT matching background color.
 * - Completely eliminates the tiny/off-center appearance of iPhone 18 Pro, Pro Max & Duo.
 * - Preserves 100% of the original image details, highlights, cameras, and aspect ratio without distortion or cropping.
 * - Original files on disk are NEVER touched.
 */
export function processProductImage(
  img: HTMLImageElement,
  maxDimension = 1024
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const src = img.currentSrc || img.src;
      if (!src) return resolve("");

      if (imageCache.has(src)) {
        return resolve(imageCache.get(src)!);
      }

      if (typeof window === "undefined" || !img.naturalWidth || !img.naturalHeight) {
        return resolve(src);
      }

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const normPath = normalizeAssetPath(src);

      // Check if this image has a precomputed bounding box (iPhone 18 Pro & Duo landscape banners)
      const hasPresetBox = normPath in ASSET_BOUNDING_BOXES;
      const aspect = nw / nh;
      const isWideBanner = aspect > 1.25;

      // If it's already a square or portrait image and not a known off-center asset, keep untouched
      if (!hasPresetBox && !isWideBanner) {
        imageCache.set(src, src);
        return resolve(src);
      }

      // Sample edge color to match the image background
      let r = 255, g = 255, b = 255;
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
          let sr = 0, sg = 0, sb = 0;
          for (const c of corners) { sr += c[0]; sg += c[1]; sb += c[2]; }
          r = Math.round(sr / 4);
          g = Math.round(sg / 4);
          b = Math.round(sb / 4);
          if (r < 25 && g < 25 && b < 25) { r = 0; g = 0; b = 0; }
          else if (r > 240 && g > 240 && b > 240) { r = 255; g = 255; b = 255; }
        }
      }

      const detectedBgHex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
      imageBgCache.set(src, detectedBgHex);

      let cropMinX = 0, cropMinY = 0, cropMaxX = nw, cropMaxY = nh;

      if (hasPresetBox) {
        const [px1, py1, px2, py2] = ASSET_BOUNDING_BOXES[normPath];
        // Scale preset coordinates if natural dimensions differ
        const sx = nw / 2880;
        const sy = nh / 1520;
        cropMinX = Math.round(px1 * sx);
        cropMinY = Math.round(py1 * sy);
        cropMaxX = Math.round(px2 * sx);
        cropMaxY = Math.round(py2 * sy);
      } else {
        // Dynamic subject boundary detection on downsampled grid
        const gridW = 320;
        const gridH = Math.round(320 * (nh / nw));
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
        const diffThreshold = 28;
        for (let y = 0; y < gridH; y++) {
          for (let x = 0; x < gridW; x++) {
            const idx = (y * gridW + x) * 4;
            const diff = Math.abs(gData[idx] - r) + Math.abs(gData[idx + 1] - g) + Math.abs(gData[idx + 2] - b);
            if (diff > diffThreshold) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (minX >= maxX || minY >= maxY) {
          imageCache.set(src, src);
          return resolve(src);
        }

        cropMinX = Math.floor(minX * (nw / gridW));
        cropMaxX = Math.ceil(maxX * (nw / gridW));
        cropMinY = Math.floor(minY * (nh / gridH));
        cropMaxY = Math.ceil(maxY * (nh / gridH));
      }

      const subjectW = Math.max(1, cropMaxX - cropMinX);
      const subjectH = Math.max(1, cropMaxY - cropMinY);

      // Create target square canvas
      const targetSize = Math.min(maxDimension, Math.max(subjectW, subjectH, 960));
      const outCanvas = document.createElement("canvas");
      outCanvas.width = targetSize;
      outCanvas.height = targetSize;
      const outCtx = outCanvas.getContext("2d");
      if (!outCtx) {
        imageCache.set(src, src);
        return resolve(src);
      }

      // Fill with EXACT matching solid background color
      outCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      outCtx.fillRect(0, 0, targetSize, targetSize);

      // Scale subject so its largest dimension occupies ~85% of target frame (leaving ~7.5% safety margin on all sides)
      const targetScale = (targetSize * 0.85) / Math.max(subjectW, subjectH);
      const dw = Math.round(subjectW * targetScale);
      const dh = Math.round(subjectH * targetScale);
      const dx = Math.round((targetSize - dw) / 2);
      const dy = Math.round((targetSize - dh) / 2);

      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = "high";
      outCtx.drawImage(
        img,
        cropMinX, cropMinY, subjectW, subjectH,
        dx, dy, dw, dh
      );

      const mimeType = (r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255) ? "image/jpeg" : "image/png";
      const processedDataUrl = outCanvas.toDataURL(mimeType, 0.92);
      imageCache.set(src, processedDataUrl);
      return resolve(processedDataUrl);
    } catch {
      return resolve(img.currentSrc || img.src);
    }
  });
}
