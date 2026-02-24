import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GenerationResult, AspectRatio } from '../../types';

interface ImageCarouselProps {
  isOpen: boolean;
  currentIndex: number | null;
  results: GenerationResult[];
  aspectRatio: AspectRatio;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDownload: () => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  isOpen,
  currentIndex,
  results,
  aspectRatio,
  onClose,
  onNext,
  onPrev,
  onDownload,
}) => {
  return (
    <AnimatePresence>
      {isOpen && currentIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-2xl flex items-center justify-center p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-10 right-10 p-4 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={onPrev}
            className="absolute left-10 p-6 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-10 p-6 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Image Container */}
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className={cn(
                  "relative max-w-full max-h-full pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]",
                  aspectRatio === '9:16' && "aspect-[9/16]",
                  aspectRatio === '3:4' && "aspect-[3/4]",
                  aspectRatio === '1:1' && "aspect-[1/1]",
                  aspectRatio === '4:3' && "aspect-[4/3]",
                  aspectRatio === '16:9' && "aspect-[16/9]"
                )}
              >
                <img
                  src={results[currentIndex].url}
                  alt="Zoomed"
                  className="w-full h-full object-contain rounded-[2rem]"
                />

                {/* Action Bar in Modal */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
                  <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {currentIndex + 1} <span className="mx-1 opacity-20">/</span> {results.length}
                  </span>
                  <div className="w-px h-3 bg-white/10" />
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-2 text-white hover:text-orange-400 transition-all text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải xuống
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
