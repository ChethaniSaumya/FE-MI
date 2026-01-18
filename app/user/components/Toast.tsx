'use client'
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: (id: string) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <ToastContainer toasts={toasts} onClose={hideToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Container Component
function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-24 right-4 flex flex-col gap-3 max-w-sm w-full pointer-events-none" style={{ zIndex: 9999999 }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
}

// Individual Toast Item
function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300);
    };

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-500/20 to-green-600/20',
                    border: 'border-green-500/50',
                    icon: <FaCheckCircle className="text-green-400 text-xl flex-shrink-0" />,
                    text: 'text-green-100'
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
                    border: 'border-red-500/50',
                    icon: <FaExclamationCircle className="text-red-400 text-xl flex-shrink-0" />,
                    text: 'text-red-100'
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20',
                    border: 'border-yellow-500/50',
                    icon: <FaExclamationTriangle className="text-yellow-400 text-xl flex-shrink-0" />,
                    text: 'text-yellow-100'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20',
                    border: 'border-blue-500/50',
                    icon: <FaInfoCircle className="text-blue-400 text-xl flex-shrink-0" />,
                    text: 'text-blue-100'
                };
        }
    };

    const styles = getToastStyles();

    return (
        <div
            className={`
                pointer-events-auto
                ${styles.bg} ${styles.border}
                backdrop-blur-md border rounded-xl p-4 shadow-2xl
                flex items-start gap-3
                transform transition-all duration-300 ease-out
                ${isExiting 
                    ? 'opacity-0 translate-x-full' 
                    : 'opacity-100 translate-x-0 animate-slide-in'
                }
            `}
            role="alert"
        >
            {styles.icon}
            <p className={`${styles.text} text-sm font-medium flex-1`}>
                {toast.message}
            </p>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Close notification"
            >
                <FaTimes className="text-sm" />
            </button>
        </div>
    );
}

// Standalone Toast function (for use without context)
// This creates a simple notification without needing the provider
let toastContainer: HTMLDivElement | null = null;

function getToastContainer() {
    if (typeof window === 'undefined') return null;
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 96px; right: 16px; z-index: 9999999; display: flex; flex-direction: column; gap: 12px; max-width: 384px; width: 100%; pointer-events: none;';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

export function toast(message: string, type: ToastType = 'info', duration: number = 3000) {
    if (typeof window === 'undefined') return;

    const container = getToastContainer();
    if (!container) return;

    const toastElement = document.createElement('div');
    const id = Math.random().toString(36).substring(2, 9);
    
    // Get styles based on type
    const styles = {
        success: {
            bg: 'from-green-500/20 to-green-600/20',
            border: 'border-green-500/50',
            iconColor: 'text-green-400',
            textColor: 'text-green-100',
            icon: '✓'
        },
        error: {
            bg: 'from-red-500/20 to-red-600/20',
            border: 'border-red-500/50',
            iconColor: 'text-red-400',
            textColor: 'text-red-100',
            icon: '✕'
        },
        warning: {
            bg: 'from-yellow-500/20 to-yellow-600/20',
            border: 'border-yellow-500/50',
            iconColor: 'text-yellow-400',
            textColor: 'text-yellow-100',
            icon: '⚠'
        },
        info: {
            bg: 'from-blue-500/20 to-blue-600/20',
            border: 'border-blue-500/50',
            iconColor: 'text-blue-400',
            textColor: 'text-blue-100',
            icon: 'ℹ'
        }
    }[type];

    toastElement.innerHTML = `
        <div class="
            pointer-events-auto
            bg-gradient-to-r ${styles.bg}
            backdrop-blur-md border ${styles.border} rounded-xl p-4 shadow-2xl
            flex items-center gap-3
            transform transition-all duration-300 ease-out
            animate-slide-in
        " role="alert">
            <span class="${styles.iconColor} text-xl flex-shrink-0">${styles.icon}</span>
            <p class="${styles.textColor} text-sm font-medium flex-1">${message}</p>
            <button 
                onclick="this.parentElement.parentElement.remove()"
                class="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Close notification"
            >
                ✕
            </button>
        </div>
    `;

    container.appendChild(toastElement);

    // Animate in
    requestAnimationFrame(() => {
        toastElement.style.opacity = '1';
        toastElement.style.transform = 'translateX(0)';
    });

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            toastElement.style.opacity = '0';
            toastElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                toastElement.remove();
            }, 300);
        }, duration);
    }
}

// Export convenience methods
toast.success = (message: string, duration?: number) => toast(message, 'success', duration);
toast.error = (message: string, duration?: number) => toast(message, 'error', duration);
toast.warning = (message: string, duration?: number) => toast(message, 'warning', duration);
toast.info = (message: string, duration?: number) => toast(message, 'info', duration);

export default toast;