
import { useState } from "react";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const validImages = images.length > 0 ? images : ["/placeholder.svg"];

  const goToPrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden group">
        <img src={validImages[selectedIndex]}
          alt={`${productName} - Imagen ${selectedIndex + 1}`}
          className={cn(
            "w-full h-full object-cover object-contain p-6 transition-transform duration-300",
            isZoomed && "scale-150 cursor-zoom-out"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom indicator */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={isZoomed ? "Quitar zoom" : "Hacer zoom"}
        >
          <ZoomIn className="w-5 h-5 text-brand-text" />
        </button>

        {/* Navigation arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 text-brand-text" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-5 h-5 text-brand-text" />
            </button>
          </>
        )}

        {/* Image counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                selectedIndex === index
                  ? "border-brand-primary"
                  : "border-transparent hover:border-gray-200"
              )}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={selectedIndex === index ? "true" : "false"}
            >
              <img src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

