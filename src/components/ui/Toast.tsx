'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const toastConfig = {
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-600',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-600',
  },
  info: {
    icon: Info,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-600',
  },
};

export function Toast({ message, type = 'error', isVisible, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${config.bg} ${config.border} border-2 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 min-w-[280px] max-w-[90vw]`}
          role="alert"
          aria-live="polite"
        >
          <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} aria-hidden="true" />
          <span className={`${config.text} text-sm font-medium flex-1`}>{message}</span>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-white/50 transition-colors ${config.text}`}
            aria-label="关闭提示"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useToast() {
  return {
    Toast,
  };
}
