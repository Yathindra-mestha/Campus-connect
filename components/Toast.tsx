import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.duration !== 0) { // 0 means persistent
            const timer = setTimeout(() => {
                onClose(toast.id);
            }, toast.duration || 5000); // Default 5 seconds

            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <XCircle className="w-5 h-5 text-rose-500" />,
        info: <Info className="w-5 h-5 text-indigo-500" />
    };

    const backgrounds = {
        success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
        error: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
        info: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
    };

    const textColors = {
        success: 'text-emerald-800 dark:text-emerald-200',
        error: 'text-rose-800 dark:text-rose-200',
        info: 'text-indigo-800 dark:text-indigo-200'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 w-full max-w-sm rounded-2xl shadow-lg backdrop-blur-md border ${backgrounds[toast.type]}`}
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
            </div>

            <div className={`flex-1 text-sm font-medium ${textColors[toast.type]}`}>
                {toast.message}
            </div>

            <button
                onClick={() => onClose(toast.id)}
                className={`flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${textColors[toast.type]} opacity-50 hover:opacity-100`}
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-24 right-4 z-[200] flex flex-col items-end gap-3 pointer-events-none sm:top-20 sm:right-6">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
