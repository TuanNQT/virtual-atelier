import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoginFormProps {
  isVerifying: boolean;
  authError: string | null;
  emailInput: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  isVerifying,
  authError,
  emailInput,
  onEmailChange,
  onSubmit,
}) => {
  return (
    <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl shadow-black/5 border border-black/5"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-xl shadow-black/10 mx-auto mb-6">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-medium tracking-tight italic mb-3">Thử Đồ Hàng Hiệu</h1>
          <p className="text-[10px] text-black/40 uppercase tracking-[0.3em] font-black">Xác thực quyền truy cập</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 block">Email của bạn</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => {
                onEmailChange(e.target.value);
              }}
              placeholder="email@example.com"
              className={cn(
                "w-full px-8 py-5 rounded-3xl bg-black/5 border-none focus:ring-2 transition-all text-sm font-medium",
                authError ? "focus:ring-red-500/20" : "focus:ring-black/10"
              )}
              required
            />
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 mt-2">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Từ chối truy cập</p>
                      <p className="text-[10px] text-red-500/80 leading-relaxed font-medium">
                        Email này chưa được cấp quyền sử dụng. Vui lòng liên hệ quản trị viên để được thêm vào danh sách trắng.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-5 bg-[#1a1a1a] text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl shadow-black/10"
          >
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Tiếp tục
          </button>
        </form>

        <p className="mt-10 text-[9px] text-center text-black/30 leading-relaxed uppercase tracking-[0.2em] font-bold">
          Chỉ những email được cấp quyền mới có thể truy cập hệ thống này.
        </p>
      </motion.div>
    </div>
  );
};
