import React from 'react';
import { cn } from '../../lib/utils';
import { ASPECT_RATIOS } from '../../constants/config';
import { AspectRatio } from '../../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedRatio,
  onRatioChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {ASPECT_RATIOS.map((ratio) => (
        <button
          key={ratio.id}
          onClick={() => onRatioChange(ratio.id as AspectRatio)}
          className={cn(
            "flex-1 min-w-[80px] py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all",
            selectedRatio === ratio.id
              ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg shadow-black/10"
              : "bg-white border-black/5 hover:border-black/20 hover:bg-black/5"
          )}
        >
          <span className="text-sm">{ratio.icon}</span>
          <span className="text-[9px] font-black tracking-tighter">{ratio.label}</span>
        </button>
      ))}
    </div>
  );
};
