import React from 'react';
import { cn } from '../../lib/utils';
import { GENDERS } from '../../constants/config';
import { Gender } from '../../types';

interface GenderSelectorProps {
  selectedGender: Gender;
  onGenderChange: (gender: Gender) => void;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  selectedGender,
  onGenderChange,
}) => {
  return (
    <div className="flex gap-3">
      {GENDERS.map((g) => (
        <button
          key={g.id}
          onClick={() => onGenderChange(g.id as Gender)}
          className={cn(
            'flex-1 py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all text-sm font-bold',
            selectedGender === g.id
              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg shadow-black/15'
              : 'bg-white border-black/12 text-black/70 hover:border-black/25 hover:text-black hover:bg-black/3'
          )}
        >
          <span className="text-base">{g.icon}</span>
          {g.label}
        </button>
      ))}
    </div>
  );
};