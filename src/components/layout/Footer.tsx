import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/5 py-20 px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-serif italic font-medium tracking-tight">Thử Đồ Hàng Hiệu</span>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30">Virtual Atelier</p>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-20">© 2026 Thử Đồ Hàng Hiệu. Powered by Gemini AI.</p>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
          <a href="#" className="hover:opacity-100 hover:text-orange-600 transition-all">Privacy</a>
          <a href="#" className="hover:opacity-100 hover:text-orange-600 transition-all">Terms</a>
        </div>
      </div>
    </footer>
  );
};
