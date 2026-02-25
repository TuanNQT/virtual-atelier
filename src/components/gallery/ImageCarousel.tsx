import React, { useEffect, useRef, useState } from 'react';
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

const SWIPE_THRESHOLD = 50; // px tối thiểu để tính là swipe

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
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const imageRef = useRef<HTMLDivElement | null>(null);

  // ── Scroll lock ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }
    return () => {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Reset drag offset khi đổi ảnh
  useEffect(() => {
    setDragOffset(0);
  }, [currentIndex]);

  // ── Swipe / drag handlers ────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    const dy = Math.abs(e.clientY - (dragStartY.current ?? e.clientY));

    // Chỉ xử lý swipe ngang, bỏ qua nếu chủ yếu scroll dọc
    if (Math.abs(dx) > dy + 5) {
      isDragging.current = true;
      setDragOffset(dx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;

    if (isDragging.current && Math.abs(dx) >= SWIPE_THRESHOLD) {
      if (dx < 0) onNext();
      else onPrev();
    }

    dragStartX.current = null;
    dragStartY.current = null;
    isDragging.current = false;
    setDragOffset(0);
  };

  // ── Click outside image để đóng ─────────────────────────────────────────
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isDragging.current) return;
    // Đóng nếu click không nằm trong bounds của element ảnh
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const { clientX: x, clientY: y } = e;
      const isInsideImage = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (!isInsideImage) onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && currentIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-2xl flex items-center justify-center p-8"
          onClick={handleBackdropClick}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-10 right-10 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-10 p-6 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-10 p-6 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Image Container — nhận pointer events để xử lý swipe */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'pan-y' }}
          >
            <AnimatePresence mode="sync">
              <motion.div
                key={currentIndex}
                ref={imageRef}
                initial={{ opacity: 0, x: 30 }}
                animate={{
                  opacity: 1,
                  x: dragOffset,
                  transition: isDragging.current
                    ? { duration: 0 }           // khi đang kéo: không delay
                    : { duration: 0.12, ease: "easeOut" }, // khi snap về
                }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "absolute max-w-full max-h-full pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]",
                  !isDragging.current && "cursor-default",
                  isDragging.current && "cursor-grabbing select-none",
                  aspectRatio === '9:16' && "aspect-[9/16] h-full",
                  aspectRatio === '3:4' && "aspect-[3/4] h-full",
                  aspectRatio === '1:1' && "aspect-[1/1]",
                  aspectRatio === '4:3' && "aspect-[4/3] w-full max-w-3xl",
                  aspectRatio === '16:9' && "aspect-[16/9] w-full max-w-4xl"
                )}
              >
                <img
                  src={results[currentIndex].url}
                  alt="Zoomed"
                  draggable={false}
                  className="w-full h-full object-contain rounded-[2rem] pointer-events-none"
                />

                {/* Action Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl pointer-events-auto">
                  <span className="text-white/70 text-xs font-semibold whitespace-nowrap">
                    {currentIndex + 1}
                    <span className="mx-1.5 text-white/20">/</span>
                    {results.length}
                  </span>
                  <div className="w-px h-3 bg-white/15" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownload(); }}
                    className="flex items-center gap-2 text-white/80 hover:text-orange-400 transition-colors text-xs font-semibold whitespace-nowrap"
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