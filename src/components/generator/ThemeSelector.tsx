import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { THEMES } from '../../constants/config';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          className={cn(
            "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all gap-3 group relative overflow-hidden",
            selectedTheme === theme.id
              ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-2xl shadow-black/20 scale-[1.02]"
              : "bg-white border-black/5 hover:border-black/20 hover:bg-black/5"
          )}
        >
          {selectedTheme === theme.id && (
            <motion.div
              layoutId="theme-active"
              className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent pointer-events-none"
            />
          )}
          <span className={cn("text-2xl transition-transform duration-500 group-hover:scale-110", selectedTheme === theme.id ? "scale-110" : "")}>{theme.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-widest relative z-10">{theme.label}</span>
        </button>
      ))}
    </div>
  );
};
