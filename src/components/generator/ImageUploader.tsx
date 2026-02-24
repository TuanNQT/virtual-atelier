import React from 'react';
import { Upload, User, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  isDragging: boolean;
  isModel?: boolean;
  onDrop: any;
  onInput: any;
  onRemove: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  image,
  isDragging,
  isModel = false,
  onDrop,
  onInput,
  onRemove,
}) => {
  const Icon = isModel ? User : Upload;

  return (
    <div className="space-y-3">
      <label className={cn(
        "text-[10px] font-bold uppercase tracking-widest opacity-40",
        isModel && "tracking-widest"
      )}>
        {label}
      </label>
      <div
        {...onDrop}
        className={cn(
          "relative aspect-[4/5] rounded-[2rem] border border-black/5 bg-white transition-all cursor-pointer overflow-hidden group shadow-sm",
          isDragging ? "ring-2 ring-orange-500/20 bg-orange-50/10" : "hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
          image ? "border-transparent" : "border-dashed border-black/10"
        )}
      >
        <input {...onInput} />
        {image ? (
          <>
            <img src={image} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-xl">
                <X className="w-4 h-4 text-black" onClick={(e) => { e.stopPropagation(); onRemove(); }} />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
              <Icon className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:text-orange-600 transition-all" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-relaxed">
              {isModel ? 'Tải ảnh khuôn mặt của bạn' : 'Kéo thả ảnh quần áo vào đây'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
