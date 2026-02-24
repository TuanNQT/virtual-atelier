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
    <div className="flex gap-4">
      {GENDERS.map((g) => (
        <button
          key={g.id}
          onClick={() => onGenderChange(g.id as Gender)}
          className={cn(
            "flex-1 py-4 px-6 rounded-2xl border flex items-center justify-center gap-3 transition-all text-xs font-bold uppercase tracking-widest",
            selectedGender === g.id
              ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-xl shadow-black/10"
              : "bg-white border-black/5 hover:border-black/20 hover:bg-black/5"
          )}
        >
          <span className="text-lg">{g.icon}</span>
          {g.label}
        </button>
      ))}
    </div>
  );
};
