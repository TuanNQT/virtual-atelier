import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Gender,
  AspectRatio,
  PoseId,
  DropzoneRootProps,
  DropzoneInputProps,
  GenerationSession,
} from "../../types";
import { ImageUploader } from "./ImageUploader";
import { GenderSelector } from "./GenderSelector";
import { ThemeSelector } from "./ThemeSelector";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { PoseSelector } from "./PoseSelector"; // #2
import { HistoryPanel } from "../gallery/HistoryPanel"; // #1

interface ControlPanelProps {
  productImage: string | null;
  modelImage: string | null;
  gender: Gender;
  selectedTheme: string;
  selectedAspectRatio: AspectRatio;
  selectedPose: PoseId;
  description: string;
  isGenerating: boolean;
  history: GenerationSession[];
  onProductDrop: DropzoneRootProps;
  onProductInput: DropzoneInputProps;
  onModelDrop: DropzoneRootProps;
  onModelInput: DropzoneInputProps;
  isProductDrag: boolean;
  isModelDrag: boolean;
  onProductRemove: () => void;
  onModelRemove: () => void;
  onProductPaste: (d: string) => void;
  onModelPaste: (d: string) => void;
  onGenderChange: (g: Gender) => void;
  onThemeChange: (t: string) => void;
  onAspectRatioChange: (r: AspectRatio) => void;
  onPoseChange: (p: PoseId) => void;
  onDescriptionChange: (d: string) => void;
  onGenerate: () => Promise<void>;
  onLoadSession: (s: GenerationSession) => void;
  onClearHistory: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  productImage,
  modelImage,
  gender,
  selectedTheme,
  selectedAspectRatio,
  selectedPose,
  description,
  isGenerating,
  history,
  onProductDrop,
  onProductInput,
  onModelDrop,
  onModelInput,
  isProductDrag,
  isModelDrag,
  onProductRemove,
  onModelRemove,
  onProductPaste,
  onModelPaste,
  onGenderChange,
  onThemeChange,
  onAspectRatioChange,
  onPoseChange,
  onDescriptionChange,
  onGenerate,
  onLoadSession,
  onClearHistory,
}) => (
  <div className="lg:col-span-5 space-y-6 md:space-y-8">
    {/* #1 History panel */}
    <HistoryPanel
      history={history}
      onLoad={onLoadSession}
      onClear={onClearHistory}
    />

    {/* Section 01 */}
    <section className="space-y-4 md:space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-black/35 bg-black/5 w-6 h-6 flex items-center justify-center rounded-full">
          01
        </span>
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-black/75">
          Tải ảnh lên
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ImageUploader
          label="Ảnh sản phẩm"
          image={productImage}
          isDragging={isProductDrag}
          onDrop={onProductDrop}
          onInput={onProductInput}
          onRemove={onProductRemove}
          onPaste={onProductPaste}
        />
        <ImageUploader
          label="Người mẫu (Tùy chọn)"
          image={modelImage}
          isDragging={isModelDrag}
          isModel
          onDrop={onModelDrop}
          onInput={onModelInput}
          onRemove={onModelRemove}
          onPaste={onModelPaste}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-black/55 block">
          Giới tính
        </label>
        <GenderSelector
          selectedGender={gender}
          onGenderChange={onGenderChange}
        />
      </div>
    </section>

    {/* Section 02 */}
    <section className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-black/35 bg-black/5 w-6 h-6 flex items-center justify-center rounded-full">
          02
        </span>
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-black/75">
          Chủ đề & Pose
        </h2>
      </div>

      <ThemeSelector
        selectedTheme={selectedTheme}
        onThemeChange={onThemeChange}
      />

      {/* #2 Pose selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-black/55 block">
          Pose / Góc chụp
        </label>
        <PoseSelector selectedPose={selectedPose} onPoseChange={onPoseChange} />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-black/55 block">
          Mô tả thêm (Tùy chọn)
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Ví dụ: ánh sáng hoàng hôn, tay cầm túi xách..."
          className="w-full h-24 p-4 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 transition-all resize-none text-sm leading-relaxed text-black placeholder:text-black/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-black/55 block">
          Tỉ lệ khung hình
        </label>
        <AspectRatioSelector
          selectedRatio={selectedAspectRatio}
          onRatioChange={onAspectRatioChange}
        />
      </div>
    </section>

    {/* Generate */}
    <button
      onClick={onGenerate}
      disabled={isGenerating || !productImage}
      className={cn(
        "w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-sm transition-all",
        isGenerating || !productImage
          ? "bg-black/8 text-black/30 cursor-not-allowed"
          : "bg-[#1a1a1a] text-white hover:bg-orange-600 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-black/15 hover:shadow-orange-600/25",
      )}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang thiết kế...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          Bắt đầu tạo mẫu
        </>
      )}
    </button>
  </div>
);
