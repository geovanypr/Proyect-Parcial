import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  showCloseButton = true,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 25,
              duration: 0.3
            }}
            className={`relative ${maxWidth} w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-emerald-900/10 border border-emerald-100 overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/50 to-white">
              <h2 className="text-lg font-bold text-emerald-800">{title}</h2>
              {showCloseButton && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-emerald-100 transition-all text-gray-400 hover:text-emerald-600 cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
