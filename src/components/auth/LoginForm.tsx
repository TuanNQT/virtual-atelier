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
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-2xl shadow-black/8 border border-black/6"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-xl shadow-black/15 mx-auto mb-5">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-medium tracking-tight italic mb-2 text-[#1a1a1a]">
            Thử Đồ Hàng Hiệu
          </h1>
          <p className="text-xs text-black/50 uppercase tracking-[0.25em] font-semibold">
            Xác thực quyền truy cập
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-black/60 block">
              Email của bạn
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="email@example.com"
              className={cn(
                'w-full px-6 py-4 rounded-2xl bg-black/5 border border-transparent text-sm font-medium text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all',
                authError ? 'focus:ring-red-400' : 'focus:ring-black/20'
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
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 mt-2">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Từ chối truy cập</p>
                      <p className="text-xs text-red-500 leading-relaxed">
                        Email này chưa được cấp quyền. Vui lòng liên hệ quản trị viên.
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
            className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Tiếp tục
          </button>
        </form>

        <p className="mt-8 text-[11px] text-center text-black/40 leading-relaxed tracking-wide">
          Chỉ email được cấp quyền mới có thể truy cập hệ thống.
        </p>
      </motion.div>
    </div>
  );
};