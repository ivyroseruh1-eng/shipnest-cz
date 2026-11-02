import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { processProductImage, getProductImageBackground, StageTheme } from "@/lib/productPresentation";

interface ProductImageProps {
  src: string;
  fallbackImages?: string[];
  alt: string;
  className?: string;
  containerClassName?: string;
  stageTheme?: StageTheme;
  loading?: "lazy" | "eager";
  priority?: boolean;
  width?: number | string;
  height?: number | string;
  sizes?: string;
  department?: string;
  category?: string;
  onImageChange?: (resolvedSrc: string) => void;
}

// In-memory global cache of successfully decoded/loaded image URLs so they never flash loaders
export const loadedImageCache = new Set<string>();

export function preloadProductImage(url: string): Promise<void> {
  if (!url || loadedImageCache.has(url)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      loadedImageCache.add(url);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

// Department-level verified fallback photography if specific product asset fails to resolve
const DEPARTMENT_FALLBACKS: Record<string, string> = {
  "Designer Fashion & Accessories": "/assets/categories/luxury-bags.jpg",
  "Makeup & Skincare": "/assets/categories/skincare-beauty.jpg",
  "Perfumes & Fragrance": "/assets/categories/luxury-fragrance.jpg",
  "Watches & Jewellery": "/assets/categories/luxury-watches.jpg",
  "Technology": "/assets/categories/audio-acoustics.jpg",
};

export const ProductImage = ({
  src,
  fallbackImages = [],
  alt,
  className = "w-full h-full object-contain",
  containerClassName = "",
  stageTheme,
  loading = "lazy",
  priority = false,
  width = 600,
  height = 600,
  sizes,
  department,
  category,
  onImageChange,
}: ProductImageProps) => {
  // Build cascading candidate list: [primary, ...fallbacks, departmentFallback]
  const departmentFallback = department ? DEPARTMENT_FALLBACKS[department] : undefined;
  const candidates: string[] = Array.from(
    new Set([src, ...fallbackImages, departmentFallback].filter(Boolean) as string[])
  );

  const isEager = priority || loading === "eager";
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(() => loadedImageCache.has(src) || isEager);
  const [failedAll, setFailedAll] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string>(candidates[0] || src);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset when primary src changes (e.g. variant selection)
  useEffect(() => {
    setCandidateIndex(0);
    const cached = loadedImageCache.has(src);
    setIsLoaded(cached || isEager);
    setFailedAll(false);
    setDisplaySrc(src);
  }, [src, isEager]);

  const currentSrc = candidates[candidateIndex];
  const effectiveTheme = stageTheme || getProductImageBackground(currentSrc);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      const nextIndex = candidateIndex + 1;
      setCandidateIndex(nextIndex);
      setIsLoaded(loadedImageCache.has(candidates[nextIndex]));
      setDisplaySrc(candidates[nextIndex]);
      if (onImageChange) {
        onImageChange(candidates[nextIndex]);
      }
    } else {
      setFailedAll(true);
      setIsLoaded(true);
    }
  };

  const handleLoad = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    try {
      const optimizedSrc = await processProductImage(target);
      if (optimizedSrc && optimizedSrc !== displaySrc) {
        setDisplaySrc(optimizedSrc);
        loadedImageCache.add(optimizedSrc);
      }
    } catch {
      // Graceful fallback to original
    }
    loadedImageCache.add(displaySrc);
    loadedImageCache.add(src);
    setIsLoaded(true);
    if (onImageChange && currentSrc) {
      onImageChange(currentSrc);
    }
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-colors duration-200 ${containerClassName}`}
      style={{ background: effectiveTheme.background }}
    >
      {/* Subtle loader skeleton only during cold initial network decode on lazy images */}
      {!isLoaded && !failedAll && !isEager && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: effectiveTheme.background }}
        >
          <Loader2 className={`w-5 h-5 animate-spin ${effectiveTheme.isLight ? "text-neutral-400" : "text-neutral-600"}`} />
        </div>
      )}

      {!failedAll && currentSrc ? (
        <img
          ref={imgRef}
          key={displaySrc}
          src={displaySrc}
          alt={alt}
          loading={isEager ? "eager" : "lazy"}
          decoding="async"
          {...({ fetchpriority: isEager ? "high" : "low" } as any)}
          width={width}
          height={height}
          sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-200 ${
            isLoaded || isEager ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-secondary/30">
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground">SN</span>
          </div>
          <span className="text-[11px] font-medium text-foreground">Photography Pending</span>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 max-w-[160px]">{alt}</p>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
