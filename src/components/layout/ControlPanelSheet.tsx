import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ControlPanelSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const ControlPanelSheet: React.FC<ControlPanelSheetProps> = ({
  isOpen,
  onClose,
  title = "Tùy chỉnh",
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-x-0 bottom-0 z-50 md:hidden max-h-[90vh] rounded-t-3xl bg-white shadow-2xl flex flex-col"
          >
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-black/8">
              <h2 className="text-base font-bold text-black/80">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -m-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5 text-black/50" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
