import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface StylingSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string; // Allow additional classes to be passed
}

export default function StylingSection({ title, children, defaultOpen = true, className = '' }: StylingSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border-b border-gray-100 last:border-0 ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 transition-colors group rounded-md my-1 ${isOpen ? 'bg-gray-50/50' : ''}`}
            >
                <span className={`text-xs font-semibold uppercase tracking-wide transition-colors ${isOpen ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {title}
                </span>
                {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                )}
            </button>
            {isOpen && (
                <div className="pb-4 px-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
