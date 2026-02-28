import React from "react";
import { Sparkles, ImageIcon, Download } from "lucide-react";
import { GenerationResult, AspectRatio } from "../../types";
import { GalleryItem } from "./GalleryItem";
import { SkeletonSlot } from "./LoadingSkeleton";

interface ResultsGalleryProps {
  results: GenerationResult[];
  isGenerating: boolean;
  selectedAspectRatio: AspectRatio;
  onItemClick: (index: number) => void;
  onDownload: (url: string, filename: string) => void;
  onRegenerate: (index: number) => void; // #3
  onDownloadAll: () => void; // #7
  selectedTheme: string;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({
  results,
  isGenerating,
  selectedAspectRatio,
  onItemClick,
  onDownload,
  onRegenerate,
  onDownloadAll,
  selectedTheme,
}) => {
  const showSkeleton = isGenerating && results.length < 4;
  const date = new Date().toISOString().slice(0, 10);

  return (
    <div className="md:sticky md:top-28 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-black/35 bg-black/5 w-6 h-6 flex items-center justify-center rounded-full">
            03
          </span>
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-black/75">
            Kết quả
          </h2>
          {isGenerating && results.length > 0 && (
            <span className="text-[11px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
              {results.length}/4
            </span>
          )}
        </div>
        {results.length > 0 && !isGenerating && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-black/40">
              {selectedAspectRatio}
            </span>
            {/* #7 Download all */}
            <button
              onClick={onDownloadAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/12 text-xs font-bold text-black/55 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              <Download className="w-3 h-3" /> Tải tất cả
            </button>
          </div>
        )}
      </div>

      {/* Single grid: results + skeleton placeholders while generating */}
      {(results.length > 0 || showSkeleton) && (
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {[0, 1, 2, 3].map((i) =>
            i < results.length ? (
              <GalleryItem
                key={results[i].id}
                image={results[i]}
                index={i}
                aspectRatio={selectedAspectRatio}
                onView={() => onItemClick(i)}
                onDownload={() =>
                  onDownload(
                    results[i].url,
                    `${selectedTheme}-${date}-${i + 1}.png`,
                  )
                }
                onRegenerate={() => onRegenerate(i)}
              />
            ) : (
              showSkeleton && (
                <SkeletonSlot
                  key={`skeleton-${i}`}
                  index={i}
                  aspectRatio={selectedAspectRatio}
                />
              )
            ),
          )}
        </div>
      )}

      {/* Empty state — only when not generating and no results */}
      {!isGenerating && results.length === 0 && (
        <div className="aspect-[4/3] lg:aspect-auto lg:h-[680px] rounded-[2.5rem] border border-black/8 bg-white shadow-sm flex flex-col items-center justify-center p-16 text-center space-y-8 overflow-hidden relative">
          <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center relative">
            <ImageIcon className="w-9 h-9 text-black/20" />
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center shadow-md shadow-orange-600/25">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif italic font-medium tracking-tight text-[#1a1a1a]">
              Chưa có kết quả nào
            </h3>
            <p className="text-xs font-medium text-black/45 max-w-xs leading-relaxed">
              Tải ảnh lên và nhấn tạo mẫu để bắt đầu.
            </p>
          </div>
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-orange-500/6 rounded-full blur-3xl" />
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-black/4 rounded-full blur-3xl" />
        </div>
      )}
    </div>
  );
};
