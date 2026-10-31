import { Product, ProductColor } from "@/types";

export interface StageTheme {
  background: string;
  borderColor: string;
  badgeStyle?: string;
  isLight: boolean;
}

// In-memory cache for processed image data URLs so each asset is processed at most once
const imageCache = new Map<string, string>();

/**
 * Calculates visual theme and contrasting background for a product or specific variant
 */
export function getProductStageTheme(
  product?: Partial<Product> | null,
  variant?: ProductColor | null
): StageTheme {
  if (!product) {
    return {
      background: "linear-gradient(145deg, #ffffff 0%, #f3f4f6 100%)",
      borderColor: "#e5e7eb",
      isLight: true,
    };
  }

  const variantName = (variant?.name || "").toLowerCase();
  const hex = (variant?.hex || "").toLowerCase();
  const prodName = (product.name || "").toLowerCase();
  const dept = (product.department || "").toLowerCase();

  // 1. Dark or Black products: Require a sufficiently light, contrasting background
  const isDarkProduct =
    variantName.includes("black") ||
    variantName.includes("midnight") ||
    variantName.includes("obsidian") ||
    variantName.includes("dark") ||
    variantName.includes("noir") ||
    variantName.includes("anthracite") ||
    prodName.includes("black") ||
    prodName.includes("midnight") ||
    prodName.includes("noir") ||
    hex === "#2b2b2d" ||
    hex === "#1c1d22" ||
    hex === "#1f2022" ||
    hex === "#2e3033" ||
    hex === "#000000";

  if (isDarkProduct) {
    return {
      // Crisp, luminous light-platinum contrasting studio stage
      background: "linear-gradient(145deg, #ffffff 0%, #edf0f4 100%)",
      borderColor: "#dce1e8",
      isLight: true,
    };
  }

  // 2. White, Silver, Glacier, and other light-coloured products:
  // Must have enough contrast without looking awkward or washed out
  const isGlacier = variantName.includes("glacier") || hex === "#b6c4ce";
  if (isGlacier) {
    return {
      // Soft glacier-mist neutral with gentle slate-blue depth
      background: "linear-gradient(145deg, #f0f4f8 0%, #dbe3eb 100%)",
      borderColor: "#cbd6e2",
      isLight: true,
    };
  }

  const isSilver =
    variantName.includes("silver") ||
    variantName.includes("titanium natural") ||
    variantName.includes("starlight") ||
    variantName.includes("platinum") ||
    hex === "#e2e4e5" ||
    hex === "#d4d2cd" ||
    hex === "#e3e4e6";

  if (isSilver) {
    return {
      // Refined cool silver-grey neutral providing distinct edge contrast
      background: "linear-gradient(145deg, #f5f6f8 0%, #dfe3e8 100%)",
      borderColor: "#d0d5dc",
      isLight: true,
    };
  }

  const isWhite =
    variantName.includes("white") ||
    variantName.includes("cloud") ||
    hex === "#ffffff" ||
    hex === "#f5f5f7";

  if (isWhite) {
    return {
      // Soft warm-pearl studio neutral
      background: "linear-gradient(145deg, #fafafc 0%, #e6e8ec 100%)",
      borderColor: "#d5d9df",
      isLight: true,
    };
  }

  // 3. Burgundy and deep wine products:
  // Complementary neutral stone / cashmere background that complements the product
  const isBurgundy =
    variantName.includes("burgundy") ||
    variantName.includes("wine") ||
    variantName.includes("bordeaux") ||
    variantName.includes("plum") ||
    hex === "#5e2734";

  if (isBurgundy) {
    return {
      // Warm cashmere / alabaster neutral complementing the deep burgundy luster
      background: "linear-gradient(145deg, #faf8f6 0%, #ece6e1 100%)",
      borderColor: "#dfd8d1",
      isLight: true,
    };
  }

  // 4. Gold / Champagne / Amber
  if (
    variantName.includes("gold") ||
    variantName.includes("champagne") ||
    variantName.includes("bronze") ||
    variantName.includes("amber")
  ) {
    return {
      background: "linear-gradient(145deg, #faf9f6 0%, #ede7dc 100%)",
      borderColor: "#dfd7ca",
      isLight: true,
    };
  }

  // 5. Blue / Navy / Teal
  if (variantName.includes("blue") || variantName.includes("navy") || variantName.includes("teal")) {
    return {
      background: "linear-gradient(145deg, #f4f7fa 0%, #e1e8ef 100%)",
      borderColor: "#d0dce7",
      isLight: true,
    };
  }

  // 6. Department-level neutral palettes for products without specific color variants
  if (dept.includes("fashion") || dept.includes("accessories")) {
    return {
      background: "linear-gradient(145deg, #fdfdfc 0%, #f4f2ec 100%)",
      borderColor: "#e3e0d8",
      isLight: true,
    };
  }

  if (dept.includes("watches") || dept.includes("jewellery")) {
    return {
      background: "linear-gradient(145deg, #ffffff 0%, #f0f2f5 100%)",
      borderColor: "#dfe3e8",
      isLight: true,
    };
  }

  if (dept.includes("perfume") || dept.includes("fragrance")) {
    return {
      background: "linear-gradient(145deg, #fdfbfa 0%, #f4eee9 100%)",
      borderColor: "#e5ded7",
      isLight: true,
    };
  }

  if (dept.includes("makeup") || dept.includes("skincare")) {
    return {
      background: "linear-gradient(145deg, #fdfcfc 0%, #f3eeed 100%)",
      borderColor: "#e4dbd9",
      isLight: true,
    };
  }

  // Default clean gallery neutral
  return {
    background: "linear-gradient(145deg, #ffffff 0%, #f1f3f6 100%)",
    borderColor: "#e2e5ea",
    isLight: true,
  };
}

/**
 * Client-side non-destructive presentation processor.
 * If an asset has a contiguous black/dark studio background (e.g. Apple banner shots),
 * this detects the dark outer boundary, keys it out to alpha in memory,
 * and centers the subject perfectly into a square canvas.
 * Original image assets on disk are NEVER touched or modified.
 */
export function processProductImage(
  img: HTMLImageElement,
  maxDimension = 960
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const src = img.currentSrc || img.src;
      if (imageCache.has(src)) {
        return resolve(imageCache.get(src)!);
      }

      if (typeof window === "undefined" || !img.naturalWidth || !img.naturalHeight) {
        return resolve(src);
      }

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      // Sample image dimensions to a high-fidelity working canvas
      const scale = Math.min(1, maxDimension / Math.max(nw, nh));
      const w = Math.round(nw * scale);
      const h = Math.round(nh * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(src);

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Check the 4 outer corners to detect if image has a dark studio backdrop
      const corners = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
      ];
      let darkCorners = 0;
      for (const [cx, cy] of corners) {
        const idx = (cy * w + cx) * 4;
        if (data[idx] < 22 && data[idx + 1] < 22 && data[idx + 2] < 22) {
          darkCorners++;
        }
      }

      // If outer corners are not dark studio backdrop, return the original untouched image
      if (darkCorners < 3) {
        imageCache.set(src, src);
        return resolve(src);
      }

      // Fast BFS flood-fill to mask contiguous dark outer background
      const isBg = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0;
      let tail = 0;

      for (let x = 0; x < w; x++) {
        queue[tail++] = x;
        queue[tail++] = (h - 1) * w + x;
      }
      for (let y = 1; y < h - 1; y++) {
        queue[tail++] = y * w;
        queue[tail++] = y * w + (w - 1);
      }

      while (head < tail) {
        const idx = queue[head++];
        if (isBg[idx]) continue;
        const pIdx = idx * 4;
        // Background threshold (< 24 intensity in all RGB channels)
        if (data[pIdx] < 24 && data[pIdx + 1] < 24 && data[pIdx + 2] < 24) {
          isBg[idx] = 1;
          const x = idx % w;
          const y = (idx / w) | 0;
          if (x > 0 && !isBg[idx - 1]) queue[tail++] = idx - 1;
          if (x < w - 1 && !isBg[idx + 1]) queue[tail++] = idx + 1;
          if (y > 0 && !isBg[idx - w]) queue[tail++] = idx - w;
          if (y < h - 1 && !isBg[idx + w]) queue[tail++] = idx + w;
        }
      }

      // Find precise bounding box of the non-background product
      let minX = w;
      let maxX = 0;
      let minY = h;
      let maxY = 0;

      for (let i = 0; i < w * h; i++) {
        if (isBg[i]) {
          data[i * 4 + 3] = 0; // Transparent background
        } else {
          const x = i % w;
          const y = (i / w) | 0;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }

      // If no valid subject detected, fallback to original
      if (maxX <= minX || maxY <= minY) {
        imageCache.set(src, src);
        return resolve(src);
      }

      ctx.putImageData(imgData, 0, 0);

      // Crop and center the product into a square bounding canvas
      const cropW = maxX - minX;
      const cropH = maxY - minY;
      const margin = Math.round(Math.max(cropW, cropH) * 0.04);
      const size = Math.max(cropW, cropH) + margin * 2;

      const outCanvas = document.createElement("canvas");
      outCanvas.width = size;
      outCanvas.height = size;
      const outCtx = outCanvas.getContext("2d");
      if (!outCtx) {
        imageCache.set(src, src);
        return resolve(src);
      }

      const offsetX = Math.round((size - cropW) / 2);
      const offsetY = Math.round((size - cropH) / 2);
      outCtx.drawImage(canvas, minX, minY, cropW, cropH, offsetX, offsetY, cropW, cropH);

      const processedUrl = outCanvas.toDataURL("image/webp", 0.94);
      imageCache.set(src, processedUrl);
      resolve(processedUrl);
    } catch {
      // In case of any browser security or canvas errors, safely fallback to untouched source
      resolve(img.currentSrc || img.src);
    }
  });
}
