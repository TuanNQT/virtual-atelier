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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/8 px-8 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg shadow-black/10">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-medium tracking-tight italic leading-none text-[#1a1a1a]">
                Thử Đồ Hàng Hiệu
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black/40 mt-0.5">Virtual Atelier</p>
            </div>
          </div>

          {/* User pill */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-black/5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-black/70 max-w-[180px] truncate">{userEmail}</span>
            <button
              onClick={onLogout}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 ml-1 transition-colors"
            >
              Thoát
            </button>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <a href="#" className="text-xs font-semibold text-black/50 hover:text-black transition-colors tracking-wide">
            Bộ sưu tập
          </a>
          <a href="#" className="text-xs font-semibold text-black/50 hover:text-black transition-colors tracking-wide">
            Xu hướng
          </a>

          {isAdmin && (
            <button
              onClick={() => onViewChange(currentView === 'home' ? 'admin' : 'home')}
              className={cn(
                'px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2',
                currentView === 'admin'
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-black/15 text-black/70 hover:border-black/30 hover:text-black hover:bg-black/5'
              )}
            >
              <User className="w-3.5 h-3.5" />
              {currentView === 'home' ? 'Admin Panel' : 'Quay lại'}
            </button>
          )}

          <button
            onClick={onSelectKey}
            className={cn(
              'px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2',
              hasApiKey
                ? 'border-green-200 text-green-700 bg-green-50'
                : 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full', hasApiKey ? 'bg-green-500' : 'bg-orange-500 animate-pulse')} />
            {hasApiKey ? 'API Connected' : 'Connect API Key'}
          </button>
        </nav>
      </div>
    </header>
  );
};