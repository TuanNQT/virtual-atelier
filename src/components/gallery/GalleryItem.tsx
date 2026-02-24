import React from 'react';
import { motion } from 'motion/react';
import { Maximize2, Download } from 'lucide-react';
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
      className={cn(
        "group relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-black/5 border border-black/5",
        aspectRatio === '9:16' && "aspect-[9/16]",
        aspectRatio === '3:4' && "aspect-[3/4]",
        aspectRatio === '1:1' && "aspect-[1/1]",
        aspectRatio === '4:3' && "aspect-[4/3]",
        aspectRatio === '16:9' && "aspect-[16/9]"
      )}
    >
      <img src={image.url} alt="Result" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-8 gap-4">
        <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <button
            onClick={onView}
            className="p-4 bg-white rounded-full hover:bg-orange-600 hover:text-white transition-all shadow-xl"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDownload}
            className="p-4 bg-white rounded-full hover:bg-orange-600 hover:text-white transition-all shadow-xl"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
