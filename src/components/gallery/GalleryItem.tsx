import React from "react";
import { motion } from "motion/react";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { GenerationResult, AspectRatio } from "../../types";

interface GalleryItemProps {
  image: GenerationResult;
  index: number;
  aspectRatio: AspectRatio;
  onView: () => void;
  onDownload: () => void;
  onRegenerate: () => void; // #3
}

export const GalleryItem: React.FC<GalleryItemProps> = ({
  image,
  index,
  aspectRatio,
  onView,
  onDownload,
  onRegenerate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={!image.isRegenerating ? onView : undefined}
      className={cn(
        "group relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-black/5 border border-black/5",
        !image.isRegenerating && "cursor-pointer",
        aspectRatio === "9:16" && "aspect-[9/16]",
        aspectRatio === "3:4" && "aspect-[3/4]",
        aspectRatio === "1:1" && "aspect-[1/1]",
        aspectRatio === "4:3" && "aspect-[4/3]",
        aspectRatio === "16:9" && "aspect-[16/9]",
      )}
    >
      <img
        src={image.url}
        alt="Result"
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          image.isRegenerating && "opacity-30 blur-sm",
          "group-hover:scale-105",
        )}
      />

      {/* Regenerating overlay */}
      {image.isRegenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-xs font-bold text-black/50">Đang tạo lại...</p>
          </div>
        </div>
      )}

      {/* Hover overlay — only when not regenerating */}
      {!image.isRegenerating && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Action buttons */}
      {!image.isRegenerating && (
        <div className="absolute bottom-4 inset-x-4 flex justify-between items-end opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {/* #3 Regenerate */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-lg"
            title="Tạo lại ảnh này"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {/* Download */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-lg"
            title="Tải xuống"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Index badge */}
      <div className="absolute top-3 left-3 w-6 h-6 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold text-white">{index + 1}</span>
      </div>
    </motion.div>
  );
};
