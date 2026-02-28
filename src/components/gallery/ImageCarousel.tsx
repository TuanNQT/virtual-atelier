import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Keyboard,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { GenerationResult, AspectRatio } from "../../types";

interface ImageCarouselProps {
  isOpen: boolean;
  currentIndex: number | null;
  results: GenerationResult[];
  aspectRatio: AspectRatio;
  selectedTheme: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDownload: (url: string, filename: string) => void;
  onRegenerate: (index: number) => void; // #3
}

const SWIPE_THRESHOLD = 50;

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  isOpen,
  currentIndex,
  results,
  aspectRatio,
  selectedTheme,
  onClose,
  onNext,
  onPrev,
  onDownload,
  onRegenerate,
}) => {
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const savedScrollY = useRef(0);

  // #6 Zoom state
  const [zoom, setZoom] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false); // #16

  // Scroll lock
  const unlockScroll = () => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY.current);
  };
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
  useEffect(() => {
    return () => {
      unlockScroll();
    };
  }, []);

  // Reset zoom & drag on image change
  useEffect(() => {
    setDragOffset(0);
    setZoom(1);
  }, [currentIndex]);

  // Drag/swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom > 1) return; // don't swipe when zoomed
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null || zoom > 1) return;
    const dx = e.clientX - dragStartX.current;
    const dy = Math.abs(e.clientY - (dragStartY.current ?? e.clientY));
    if (Math.abs(dx) > dy + 5) {
      isDragging.current = true;
      setDragOffset(dx);
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (isDragging.current && Math.abs(dx) >= SWIPE_THRESHOLD) {
      dx < 0 ? onNext() : onPrev();
    }
    dragStartX.current = null;
    dragStartY.current = null;
    isDragging.current = false;
    setDragOffset(0);
  };

  // Click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isDragging.current) return;
    if (imageWrapperRef.current) {
      const rect = imageWrapperRef.current.getBoundingClientRect();
      const { clientX: x, clientY: y } = e;
      if (
        !(
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        )
      )
        onClose();
    }
  };

  if (currentIndex === null) return null;
  const current = results[currentIndex];
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${selectedTheme}-${date}-${currentIndex + 1}.png`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-[#1a1a1a]/96 backdrop-blur-2xl flex items-center justify-center p-8"
          onClick={handleBackdropClick}
        >
          {/* Top bar */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-8 py-5 z-50">
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm font-semibold">
                {currentIndex + 1} / {results.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* #6 Zoom controls */}
              <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                disabled={zoom <= 1}
                className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
                className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              {zoom !== 1 && (
                <span className="text-white/50 text-xs font-bold px-2 py-1 bg-white/10 rounded-full">
                  {zoom}×
                </span>
              )}
              <div className="w-px h-5 bg-white/15 mx-1" />
              {/* #3 Regenerate in preview */}
              <button
                onClick={() => {
                  onRegenerate(currentIndex);
                }}
                className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                title="Tạo lại ảnh này"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {/* Download */}
              <button
                onClick={() => onDownload(current.url, filename)}
                className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <Download className="w-5 h-5" />
              </button>
              {/* #16 Shortcuts */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShortcuts((s) => !s);
                }}
                className={cn(
                  "p-2.5 rounded-full transition-all",
                  showShortcuts
                    ? "text-white bg-white/15"
                    : "text-white/50 hover:text-white hover:bg-white/10",
                )}
              >
                <Keyboard className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white/15 mx-1" />
              <button
                onClick={onClose}
                className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* #16 Shortcuts panel */}
          <AnimatePresence>
            {showShortcuts && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-20 right-8 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-50 min-w-[180px]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                  Phím tắt
                </p>
                {[
                  ["←  →", "Chuyển ảnh"],
                  ["Esc", "Đóng"],
                  ["+  −", "Phóng to / thu nhỏ"],
                ].map(([key, desc]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-6 py-1.5"
                  >
                    <span className="text-[11px] font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">
                      {key}
                    </span>
                    <span className="text-[11px] text-white/50">{desc}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-6 p-5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-6 p-5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Image area */}
          <div
            className="relative w-full h-full flex items-center justify-center mt-14"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "pan-y" }}
          >
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
                    scale: zoom,
                    transition: isDragging.current
                      ? { duration: 0 }
                      : { duration: 0.12, ease: "easeOut" },
                  }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ cursor: zoom > 1 ? "zoom-out" : "default" }}
                  onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
                  className={cn(
                    "absolute inset-0 pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]",
                    isDragging.current && "select-none",
                  )}
                >
                  {current.isRegenerating ? (
                    <div className="w-full h-full rounded-[2rem] bg-white/10 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 border-2 border-white/20 border-t-orange-400 rounded-full animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-white/50">
                          Đang tạo lại...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={current.url}
                      alt="Zoomed"
                      draggable={false}
                      className="w-full h-full object-contain rounded-[2rem] pointer-events-none"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
            {results.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation(); /* jump to index via parent */
                }}
                className={cn(
                  "rounded-full transition-all",
                  i === currentIndex
                    ? "w-5 h-2 bg-white"
                    : "w-2 h-2 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
