import React from 'react';
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
    <div className="sticky top-28 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-black/35 bg-black/5 w-6 h-6 flex items-center justify-center rounded-full">03</span>
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-black/75">Kết quả</h2>
        </div>
        {results.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-black/10 shadow-sm">
            <span className="text-xs font-semibold text-black/50">Tỷ lệ {selectedAspectRatio}</span>
          </div>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
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
        <div className="aspect-[4/3] lg:aspect-auto lg:h-[700px] rounded-[2.5rem] border border-black/8 bg-white shadow-sm flex flex-col items-center justify-center p-16 text-center space-y-8 overflow-hidden relative">
          {isGenerating ? (
            <div className="space-y-8 flex flex-col items-center relative z-10">
              <div className="relative">
                <div className="w-28 h-28 border-[5px] border-black/8 border-t-orange-600 rounded-full animate-spin" />
                <div className="absolute inset-0 m-auto w-11 h-11 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-xl">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-serif italic text-2xl font-medium tracking-tight text-[#1a1a1a]">Đang dệt nên phong cách...</p>
                <p className="text-xs font-medium text-black/45 max-w-xs mx-auto leading-relaxed tracking-wide">
                  AI đang phân tích trang phục và tạo hình người mẫu.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center relative">
                <ImageIcon className="w-9 h-9 text-black/20" />
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center shadow-md shadow-orange-600/25">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-serif italic font-medium tracking-tight text-[#1a1a1a]">Chưa có kết quả nào</h3>
                <p className="text-xs font-medium text-black/45 max-w-xs leading-relaxed tracking-wide">
                  Hãy tải ảnh lên và chọn chủ đề để bắt đầu trải nghiệm.
                </p>
              </div>
            </>
          )}
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-orange-500/6 rounded-full blur-3xl" />
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-black/4 rounded-full blur-3xl" />
        </div>
      )}
    </div>
  );
};