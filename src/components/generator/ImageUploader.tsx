import React, { useEffect, useRef, useState } from "react";
import { Upload, User, X, Clipboard } from "lucide-react";
import { cn } from "../../lib/utils";
import { DropzoneRootProps, DropzoneInputProps } from "../../types";

interface ImageUploaderProps {
  label: string;
  image: string | null;
  isDragging: boolean;
  isModel?: boolean;
  onDrop: DropzoneRootProps;
  onInput: DropzoneInputProps;
  onRemove: () => void;
  onPaste: (dataUrl: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  image,
  isDragging,
  isModel = false,
  onDrop,
  onInput,
  onRemove,
  onPaste,
}) => {
  const Icon = isModel ? User : Upload;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [pasteFlash, setPasteFlash] = useState(false);

  // Đọc ảnh từ clipboard item
  const readClipboardImage = (item: DataTransferItem) => {
    const file = item.getAsFile();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onPaste(reader.result as string);
      setPasteFlash(true);
      setTimeout(() => setPasteFlash(false), 600);
    };
    reader.readAsDataURL(file);
  };

  // Paste qua Ctrl+V khi component đang focused
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isFocused) return;
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      if (imageItem) {
        e.preventDefault();
        readClipboardImage(imageItem);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isFocused]);

  // Click vào icon clipboard để đọc từ Clipboard API
  const handleClickPaste = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = () => {
            onPaste(reader.result as string);
            setPasteFlash(true);
            setTimeout(() => setPasteFlash(false), 600);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      alert("Không tìm thấy ảnh trong clipboard.");
    } catch {
      alert("Không thể đọc clipboard. Hãy dùng Ctrl+V khi click vào vùng này.");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-black/55 block">
        {label}
      </label>
      <div
        ref={containerRef}
        {...onDrop}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "relative aspect-[4/5] rounded-[2rem] border bg-white transition-all cursor-pointer overflow-hidden group shadow-sm outline-none",
          isDragging &&
            "ring-2 ring-orange-500/30 bg-orange-50/10 border-orange-300",
          pasteFlash &&
            "ring-2 ring-green-500/40 bg-green-50/10 border-green-300",
          !isDragging &&
            !pasteFlash &&
            isFocused &&
            "ring-2 ring-black/15 border-black/20",
          !isDragging &&
            !pasteFlash &&
            !isFocused &&
            !image &&
            "border-dashed border-black/10 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
          !isDragging &&
            !pasteFlash &&
            !isFocused &&
            image &&
            "border-transparent hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
        )}
      >
        <input {...onInput} />

        {image ? (
          <>
            <img
              src={image}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              {/* Paste over existing */}
              <button
                onClick={handleClickPaste}
                className="bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-xl hover:bg-orange-500 hover:text-white transition-all"
                title="Dán ảnh từ clipboard"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              {/* Remove */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
              <Icon className="w-5 h-5 text-black/20 group-hover:text-orange-600 transition-all" />
            </div>
            <p className="text-[11px] font-semibold text-black/40 leading-relaxed">
              {isModel
                ? "Kéo thả hoặc click để chọn"
                : "Kéo thả hoặc click để chọn"}
            </p>
            {/* Paste hint */}
            <div
              onClick={handleClickPaste}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all",
                isFocused
                  ? "border-orange-400/50 bg-orange-50 text-orange-600"
                  : "border-black/8 bg-black/3 text-black/35 hover:border-black/20 hover:text-black/60",
              )}
            >
              <Clipboard className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isFocused ? "Ctrl+V để dán" : "Dán từ clipboard"}
              </span>
            </div>
          </div>
        )}

        {/* Flash overlay khi paste thành công */}
        {pasteFlash && (
          <div className="absolute inset-0 bg-green-400/20 pointer-events-none rounded-[2rem]" />
        )}
      </div>
    </div>
  );
};
