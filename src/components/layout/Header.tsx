import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  userEmail: string;
  isAdmin: boolean;
  currentView: 'home' | 'admin';
  hasApiKey: boolean;
  onLogout: () => void;
  onSelectKey: () => Promise<void>;
  onViewChange: (view: 'home' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  userEmail,
  isAdmin,
  currentView,
  hasApiKey,
  onLogout,
  onSelectKey,
  onViewChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/5 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg shadow-black/10">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-medium tracking-tight italic leading-none">
                Thử Đồ Hàng Hiệu
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mt-1">Virtual Atelier</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-black/5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{userEmail}</span>
            <button onClick={onLogout} className="text-[9px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 ml-2">Thoát</button>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-widest opacity-40">
          {isAdmin && (
            <button
              onClick={() => onViewChange(currentView === 'home' ? 'admin' : 'home')}
              className={cn(
                "px-4 py-2 rounded-full border transition-all flex items-center gap-2",
                currentView === 'admin'
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-black/10 text-black hover:bg-black/5"
              )}
            >
              <User className="w-3.5 h-3.5" />
              {currentView === 'home' ? 'Admin Panel' : 'Quay lại'}
            </button>
          )}
          <a href="#" className="hover:opacity-100 hover:text-orange-600 transition-all">Bộ sưu tập</a>
          <a href="#" className="hover:opacity-100 hover:text-orange-600 transition-all">Xu hướng</a>
          <button
            onClick={onSelectKey}
            className={cn(
              "px-4 py-2 rounded-full border transition-all flex items-center gap-2",
              hasApiKey
                ? "border-green-500/20 text-green-600 bg-green-50/50"
                : "border-orange-500/20 text-orange-600 bg-orange-50/50 hover:bg-orange-100"
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", hasApiKey ? "bg-green-500" : "bg-orange-500")} />
            {hasApiKey ? "API Connected" : "Connect API Key"}
          </button>
        </nav>
      </div>
    </header>
  );
};
