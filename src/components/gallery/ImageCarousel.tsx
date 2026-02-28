import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "../../lib/utils";
import { GenerationResult, AspectRatio } from "../../types";

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
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  // Lưu scrollY trước khi lock để khôi phục đúng khi đóng
  const savedScrollY = useRef(0);

  const unlockScroll = () => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY.current);
  };

  // ── Scroll lock — không có cleanup để tránh chạy mỗi lần re-render ──────
  useEffect(() => {
    if (isOpen) {
      savedScrollY.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.width = "100%";
    } else {
      unlockScroll();
    }
  }, [isOpen]);

  // Cleanup khi component unmount thật sự (không phụ thuộc isOpen)
  useEffect(() => {
    return () => {
      unlockScroll();
    };
  }, []);

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
    if (imageWrapperRef.current) {
      const rect = imageWrapperRef.current.getBoundingClientRect();
      const { clientX: x, clientY: y } = e;
      const isInsideImage =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
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
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-10 p-6 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
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
            style={{ touchAction: "pan-y" }}
          >
            {/* Wrapper cố định — không remount khi đổi ảnh, dùng để detect click outside */}
            <div
              ref={imageWrapperRef}
              className={cn(
                "relative flex items-center justify-center pointer-events-none",
                aspectRatio === "9:16" && "aspect-[9/16] h-full",
                aspectRatio === "3:4" && "aspect-[3/4] h-full",
                aspectRatio === "1:1" && "aspect-[1/1] h-full w-auto",
                aspectRatio === "4:3" && "aspect-[4/3] w-full max-w-3xl",
                aspectRatio === "16:9" && "aspect-[16/9] w-full max-w-4xl",
              )}
            >
              <AnimatePresence mode="sync">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{
                    opacity: 1,
                    x: dragOffset,
                    transition: isDragging.current
                      ? { duration: 0 }
                      : { duration: 0.12, ease: "easeOut" },
                  }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "absolute inset-0 pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]",
                    !isDragging.current && "cursor-default",
                    isDragging.current && "cursor-grabbing select-none",
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload();
                      }}
                      className="flex items-center gap-2 text-white/80 hover:text-orange-400 transition-colors text-xs font-semibold whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải xuống
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
