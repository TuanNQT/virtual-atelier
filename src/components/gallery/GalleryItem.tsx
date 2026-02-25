import React from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GenerationResult, AspectRatio } from '../../types';

interface GalleryItemProps {
  image: GenerationResult;
  index: number;
  aspectRatio: AspectRatio;
  onView: () => void;
  onDownload: () => void;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({
  image,
  index,
  aspectRatio,
  onView,
  onDownload,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onView}
      className={cn(
        "group relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-black/5 border border-black/5 cursor-pointer",
        aspectRatio === '9:16' && "aspect-[9/16]",
        aspectRatio === '3:4' && "aspect-[3/4]",
        aspectRatio === '1:1' && "aspect-[1/1]",
        aspectRatio === '4:3' && "aspect-[4/3]",
        aspectRatio === '16:9' && "aspect-[16/9]"
      )}
    >
      <img
        src={image.url}
        alt="Result"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Download button — stopPropagation để không trigger onView */}
      <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-orange-600 hover:text-white transition-all shadow-lg"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};