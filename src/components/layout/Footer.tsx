import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/8 py-16 px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-serif italic font-medium tracking-tight text-[#1a1a1a]">Thử Đồ Hàng Hiệu</span>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black/35">Virtual Atelier</p>
          </div>
        </div>
        <p className="text-xs font-medium text-black/35 tracking-wide">© 2026 Thử Đồ Hàng Hiệu. Powered by TuanNQT.</p>
        <div className="flex gap-8 text-xs font-semibold text-black/40">
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
};