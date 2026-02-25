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
    <div className="flex flex-wrap gap-2.5">
      {ASPECT_RATIOS.map((ratio) => (
        <button
          key={ratio.id}
          onClick={() => onRatioChange(ratio.id as AspectRatio)}
          className={cn(
            'flex-1 min-w-[72px] py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all',
            selectedRatio === ratio.id
              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md shadow-black/15'
              : 'bg-white border-black/12 text-black/60 hover:border-black/25 hover:text-black hover:bg-black/3'
          )}
        >
          <span className="text-sm">{ratio.icon}</span>
          <span className="text-[11px] font-bold tracking-tight">{ratio.label}</span>
        </button>
      ))}
    </div>
  );
};