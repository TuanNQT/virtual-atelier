import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, Trash2, ChevronDown } from "lucide-react";
import { GenerationSession } from "../../types";
import { THEMES } from "../../constants/config";
import { cn } from "../../lib/utils";

interface HistoryPanelProps {
  history: GenerationSession[];
  onLoad: (session: GenerationSession) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onLoad,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-black/8 bg-white hover:bg-black/3 transition-colors shadow-sm"
      >
        <History className="w-4 h-4 text-black/40" />
        <span className="text-xs font-bold uppercase tracking-widest text-black/60">
          Lịch sử
        </span>
        <span
          className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded-full",
            history.length > 0
              ? "bg-orange-100 text-orange-600"
              : "bg-black/8 text-black/35",
          )}
        >
          {history.length}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 text-black/30 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 min-w-[320px] max-w-full bg-white rounded-2xl border border-black/10 shadow-xl shadow-black/15 overflow-hidden"
          >
            {history.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-black/40">Chưa có lịch sử</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto">
                  {history.map((session) => {
                    const theme = THEMES.find((t) => t.id === session.theme);
                    const time = new Date(session.timestamp);
                    const label = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")} ${time.getDate()}/${time.getMonth() + 1}`;
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => {
                          onLoad(session);
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-black/3 transition-colors text-left border-b border-black/4 last:border-0"
                      >
                        <div className="w-28 h-14 rounded-xl overflow-hidden bg-black/5 flex-shrink-0 grid grid-cols-4 gap-px">
                          {session.productImageUrl && (
                            <img
                              src={
                                session.productImageUrl +
                                "?tr=w-80,h-80,fo-auto"
                              }
                              className="w-full h-full object-cover"
                              alt="Sản phẩm"
                              title="Ảnh sản phẩm"
                            />
                          )}
                          {session.modelImageUrl && (
                            <img
                              src={
                                session.modelImageUrl +
                                "?tr=w-80,h-80,fo-auto"
                              }
                              className="w-full h-full object-cover"
                              alt="Mẫu"
                              title="Ảnh mẫu"
                            />
                          )}
                          {session.results.slice(0, 4).map((r) => (
                            <img
                              key={r.id}
                              src={r.url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-black/70 truncate">
                            {theme?.icon} {theme?.label} · {session.aspectRatio}
                          </p>
                          <p className="text-[11px] text-black/35 mt-0.5">
                            {label} · {session.results.length} ảnh
                          </p>
                        </div>
                        <span className="text-[10px] text-orange-500 font-bold flex-shrink-0">
                          Tải lại
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="px-5 py-3 border-t border-black/6 bg-black/[0.02]">
                  <button
                    type="button"
                    onClick={() => {
                      onClear();
                      setOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-black/35 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa lịch sử
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
