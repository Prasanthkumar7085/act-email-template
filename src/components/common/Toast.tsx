import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

    return (
        <div
            className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                } ${bgColor} ${borderColor} ${textColor}`}
        >
            {type === 'success' ? (
                <CheckCircle className={`w-5 h-5 ${iconColor}`} />
            ) : (
                <AlertCircle className={`w-5 h-5 ${iconColor}`} />
            )}
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className={`p-1 hover:bg-black/5 rounded-full transition-colors ${textColor}`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
