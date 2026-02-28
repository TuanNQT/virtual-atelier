import React, { useEffect, useRef, useState, useCallback } from "react";
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
  onRegenerate: (index: number) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const savedScrollY = useRef(0);
  const isZoomed = zoom > 1;

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      savedScrollY.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, savedScrollY.current);
    }
  }, [isOpen]);
  useEffect(
    () => () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    },
    [],
  );

  // Reset zoom/pan khi đổi ảnh
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    isPanning.current = false;
    panStart.current = null;
  }, [currentIndex]);

  // ── Zoom helpers ───────────────────────────────────────────────────────────
  const zoomIn = useCallback(
    () =>
      setZoom((z) =>
        Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(1))),
      ),
    [],
  );

  const zoomOut = useCallback(
    () =>
      setZoom((z) => {
        const next = Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(1)));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      }),
    [],
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // ── Scroll wheel zoom ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.deltaY < 0 ? zoomIn() : zoomOut();
    };
    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, [isOpen, zoomIn, zoomOut]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onNext, onPrev, onClose, zoomIn, zoomOut]);

  // ── Pan khi zoom ───────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isZoomed) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isPanning.current = false;
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isPanning.current = true;
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
  };
  const handlePointerUp = () => {
    panStart.current = null;
    isPanning.current = false;
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
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 bg-[#141414] flex flex-col overflow-hidden"
          // Click nền đen -> đóng
          onClick={onClose}
        >
          {/* ── Top bar ───────────────────────────────────────────────────── */}
          <div
            className="flex-none relative flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-20 bg-[#141414]/60 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Counter + zoom badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3.5 py-1.5">
                <span className="text-white font-bold text-sm tabular-nums leading-none">
                  {currentIndex + 1}
                </span>
                <span className="text-white/30 text-sm leading-none">/</span>
                <span className="text-white/50 text-sm tabular-nums leading-none">
                  {results.length}
                </span>
              </div>
              <AnimatePresence>
                {isZoomed && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={resetZoom}
                    className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-orange-500/30 transition-all"
                  >
                    {zoom.toFixed(1)}×
                    <span className="text-orange-400/60 ml-0.5 hidden sm:inline">
                      ↩ reset
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="p-2 sm:p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-25"
              >
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="p-2 sm:p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-25"
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="w-px h-4 bg-white/15 mx-0.5" />
              <button
                onClick={() => onRegenerate(currentIndex)}
                className="p-2 sm:p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => onDownload(current.url, filename)}
                className="p-2 sm:p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShortcuts((s) => !s);
                }}
                className={cn(
                  "hidden sm:flex p-2.5 rounded-full transition-all",
                  showShortcuts
                    ? "text-white bg-white/15"
                    : "text-white/50 hover:text-white hover:bg-white/10",
                )}
              >
                <Keyboard className="w-5 h-5" />
              </button>
              <div className="w-px h-4 bg-white/15 mx-0.5" />
              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Shortcuts panel */}
          <AnimatePresence>
            {showShortcuts && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.1 }}
                className="absolute top-16 right-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-50 min-w-[200px]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                  Phím tắt
                </p>
                {[
                  ["← →", "Chuyển ảnh"],
                  ["Scroll", "Zoom in / out"],
                  ["+ / −", "Zoom in / out"],
                  ["Double click", "Zoom 2× / reset"],
                  ["Drag", "Di chuyển khi zoom"],
                  ["Esc", "Đóng"],
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

          {/* ── Image area ────────────────────────────────────────────────── */}
          <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden px-14 sm:px-16">
            {/* Nav Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-2 sm:left-3 z-10 p-2.5 sm:p-3 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            {/* Nav Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-2 sm:right-3 z-10 p-2.5 sm:p-3 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            {/* Image */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "max-h-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]",
                  aspectRatio === "9:16" && "aspect-[9/16] h-full w-auto",
                  aspectRatio === "3:4" && "aspect-[3/4]  h-full w-auto",
                  aspectRatio === "1:1" && "aspect-[1/1]  max-h-full w-auto",
                  aspectRatio === "4:3" && "aspect-[4/3]  w-full max-w-2xl",
                  aspectRatio === "16:9" && "aspect-[16/9] w-full max-w-4xl",
                )}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  cursor: isZoomed
                    ? isPanning.current
                      ? "grabbing"
                      : "grab"
                    : "default",
                  transformOrigin: "center center",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  zoom === 1
                    ? (setZoom(2), setPan({ x: 0, y: 0 }))
                    : resetZoom();
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {current.isRegenerating ? (
                  <div className="w-full h-full rounded-[1.5rem] sm:rounded-[2rem] bg-white/10 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-9 h-9 border-2 border-white/20 border-t-orange-400 rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-semibold text-white/50">
                        Đang tạo lại...
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={current.url}
                    alt={`Ảnh ${currentIndex + 1}`}
                    draggable={false}
                    className="w-full h-full object-contain rounded-[1.5rem] sm:rounded-[2rem] select-none pointer-events-none"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Dot indicators ────────────────────────────────────────────── */}
          <div
            className="flex-none relative flex justify-center items-center gap-1.5 py-4 z-20 bg-[#141414]/60 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {results.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const diff = i - currentIndex;
                  if (diff > 0) for (let d = 0; d < diff; d++) onNext();
                  else if (diff < 0) for (let d = 0; d < -diff; d++) onPrev();
                }}
                className={cn(
                  "rounded-full transition-all duration-200",
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
