/**
 * Toast.tsx
 *
 * Fixed-position notification that slides in from the bottom-right.
 * Receives toast state from useToast — does not manage its own state.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, AlertCircle, X } from 'lucide-react';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toast: ToastType | null;
  onDismiss: () => void;
}

const TYPE_CONFIG = {
  success: {
    icon: <Check size={13} />,
    color: '#00ff9d',
    bg: 'rgba(0,255,157,0.08)',
    border: 'rgba(0,255,157,0.2)',
  },
  info: {
    icon: <Info size={13} />,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.2)',
  },
  error: {
    icon: <AlertCircle size={13} />,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.2)',
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    // z-[90] — above everything including mobile sheet (z-[80])
    <div className="fixed bottom-6 right-5 z-[90] pointer-events-none">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${TYPE_CONFIG[toast.type].border}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
              minWidth: 220,
            }}
          >
            {/* Icon */}
            <span
              className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md"
              style={{
                background: TYPE_CONFIG[toast.type].bg,
                color: TYPE_CONFIG[toast.type].color,
              }}
            >
              {TYPE_CONFIG[toast.type].icon}
            </span>

            {/* Message */}
            <span className="font-mono text-[11px] text-white/70 flex-1 leading-snug">
              {toast.message}
            </span>

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-white/20 hover:text-white/50 transition-colors"
            >
              <X size={11} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
