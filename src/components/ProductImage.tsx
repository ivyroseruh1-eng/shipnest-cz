import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProductImageProps {
  src: string;
  fallbackImages?: string[];
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  department?: string;
  category?: string;
  onImageChange?: (resolvedSrc: string) => void;
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
  loading = "lazy",
  department,
  category,
  onImageChange,
}: ProductImageProps) => {
  // Build cascading candidate list: [primary, ...fallbacks, departmentFallback]
  const departmentFallback = department ? DEPARTMENT_FALLBACKS[department] : undefined;
  const candidates: string[] = Array.from(
    new Set([src, ...fallbackImages, departmentFallback].filter(Boolean) as string[])
  );

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [failedAll, setFailedAll] = useState(false);

  // Reset when primary src changes (e.g. variant selection)
  useEffect(() => {
    setCandidateIndex(0);
    setIsLoaded(false);
    setFailedAll(false);
  }, [src]);

  const currentSrc = candidates[candidateIndex];

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      const nextIndex = candidateIndex + 1;
      setCandidateIndex(nextIndex);
      setIsLoaded(false);
      if (onImageChange) {
        onImageChange(candidates[nextIndex]);
      }
    } else {
      setFailedAll(true);
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (onImageChange && currentSrc) {
      onImageChange(currentSrc);
    }
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#fbfbfd] overflow-hidden ${containerClassName}`}
    >
      {/* Subtle loader skeleton during initial network decode */}
      {!isLoaded && !failedAll && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#fbfbfd] z-10">
          <Loader2 className="w-5 h-5 text-muted-foreground/30 animate-spin" />
        </div>
      )}

      {!failedAll && currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
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
