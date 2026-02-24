import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GenerationResult, AspectRatio } from '../../types';
import { GalleryItem } from './GalleryItem';

interface ResultsGalleryProps {
  results: GenerationResult[];
  isGenerating: boolean;
  selectedAspectRatio: AspectRatio;
  onItemClick: (index: number) => void;
  onDownload: (url: string, id: string) => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({
  results,
  isGenerating,
  selectedAspectRatio,
  onItemClick,
  onDownload,
}) => {
  return (
    <div className="sticky top-32 space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono opacity-20 bg-black/5 w-6 h-6 flex items-center justify-center rounded-full">03</span>
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] opacity-80">Kết quả</h2>
        </div>
        {results.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-black/5 shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
              Tỷ lệ {selectedAspectRatio}
            </span>
          </div>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-8">
          {results.map((res, index) => (
            <GalleryItem
              key={res.id}
              image={res}
              index={index}
              aspectRatio={selectedAspectRatio}
              onView={() => onItemClick(index)}
              onDownload={() => onDownload(res.url, res.id)}
            />
          ))}
        </div>
      ) : (
        <div className="aspect-[4/3] lg:aspect-auto lg:h-[750px] rounded-[3rem] border border-black/5 bg-white shadow-sm flex flex-col items-center justify-center p-16 text-center space-y-10 overflow-hidden relative">
          {isGenerating ? (
            <div className="space-y-10 flex flex-col items-center relative z-10">
              <div className="relative">
                <div className="w-32 h-32 border-[6px] border-black/5 border-t-orange-600 rounded-full animate-spin" />
                <div className="absolute inset-0 m-auto w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-serif italic text-3xl font-medium tracking-tight">Đang dệt nên phong cách...</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-30 max-w-xs mx-auto leading-loose">
                  Hệ thống AI đang phân tích trang phục và tạo hình người mẫu Việt Nam trẻ trung.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-black/5 rounded-[2rem] flex items-center justify-center relative">
                <ImageIcon className="w-10 h-10 opacity-10" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-600/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif italic font-medium tracking-tight">Chưa có kết quả nào</h3>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-30 max-w-xs leading-loose">
                  Hãy tải ảnh lên và chọn chủ đề để bắt đầu trải nghiệm thử đồ hàng hiệu.
                </p>
              </div>
            </>
          )}
          {/* Decorative background element */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-black/5 rounded-full blur-3xl" />
        </div>
      )}
    </div>
  );
};
