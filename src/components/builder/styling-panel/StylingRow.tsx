

interface StylingRowProps {
    label: string;
    children: React.ReactNode;
    description?: string;
    className?: string;
}

export default function StylingRow({ label, children, description, className = '' }: StylingRowProps) {
    return (
        <div className={`mb-3 ${className}`}>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600 truncate mr-2" title={label}>
                    {label}
                </label>
            </div>
            {children}
            {description && (
                <p className="mt-1 text-[10px] text-gray-400 leading-tight">
                    {description}
                </p>
            )}
        </div>
    );
}
