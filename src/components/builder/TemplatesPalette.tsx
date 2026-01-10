
import { PREDEFINED_TEMPLATES } from '@/data/predefinedDragAndDropTemplates';
import { ArrowRight, LayoutTemplate } from 'lucide-react';

interface TemplatesPaletteProps {
    onSelect: (templateId: string) => void;
}

export default function TemplatesPalette({ onSelect }: TemplatesPaletteProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Email Templates</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Start with a pre-designed layout
                    </p>
                </div>
                <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                    {PREDEFINED_TEMPLATES.length} Available
                </span>
            </div>

            <div className="grid gap-3">
                {PREDEFINED_TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        onClick={() => onSelect(template.id)}
                    >
                        {/* Hover Decor */}
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border border-blue-100/50 group-hover:scale-105 transition-transform">
                                <span className="text-xl shadow-sm filter drop-shadow-sm">{template.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                                        {template.name}
                                    </h5>
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2.5">
                                    {template.description}
                                </p>

                                <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-[10px] font-medium text-gray-500">
                                        <LayoutTemplate className="w-3 h-3" />
                                        {template.elements.length} Blocks
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom interaction hint */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </div>
                ))}
            </div>
        </div>
    );
}
