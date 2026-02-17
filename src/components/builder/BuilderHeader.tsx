import {
    Monitor,
    Smartphone,
    Eye,
    Code,
    Save,
    Download,
    Trash2,
    Mail,
    LayoutTemplate,
    MousePointer2,
    PenTool,
    Send,
    ArrowLeft
} from 'lucide-react';
import { useRouter } from '@tanstack/react-router';

interface Props {
    activeView: 'desktop' | 'mobile'
    setActiveView: (v: 'desktop' | 'mobile') => void
    openPreview: () => void
    exportHtml: () => void
    showHtml: () => void
    exportJson: () => void
    clearCanvas: () => void
    builderMode: 'editorjs' | 'dragdrop'
    setBuilderMode: (mode: 'editorjs' | 'dragdrop') => void
    onImportHtml: () => void
    onSendTestEmail: () => void
}

export default function BuilderHeader({
    activeView,
    setActiveView,
    openPreview,
    exportHtml,
    showHtml,
    exportJson,
    clearCanvas,
    builderMode,
    setBuilderMode,
    onImportHtml,
    onSendTestEmail
}: Props) {
    const router = useRouter()

    return (
        <header className="bg-white border-b border-surface-200 h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-50">
            {/* Left: Back + Brand */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.navigate({ to: '/templates' })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                    title="Back to Templates"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-surface-200" />
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-surface-900 leading-tight tracking-tight">Email Builder</h1>
                        <div className="flex items-center gap-1.5 text-xs text-surface-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft"></span>
                            Unsaved changes
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: View Modes & Editor Mode */}
            <div className="hidden md:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
                {/* Editor Mode Switcher */}
                <div className="flex p-0.5 bg-surface-100 rounded-lg">
                    <button
                        onClick={() => setBuilderMode('dragdrop')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${builderMode === 'dragdrop'
                            ? 'bg-white text-surface-900 shadow-subtle'
                            : 'text-surface-500 hover:text-surface-900'
                            }`}
                    >
                        <MousePointer2 className="w-3.5 h-3.5" />
                        Visual
                    </button>
                    <button
                        onClick={() => setBuilderMode('editorjs')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${builderMode === 'editorjs'
                            ? 'bg-white text-surface-900 shadow-subtle'
                            : 'text-surface-500 hover:text-surface-900'
                            }`}
                    >
                        <PenTool className="w-3.5 h-3.5" />
                        Editor
                    </button>
                </div>

                <div className="w-px h-5 bg-surface-200"></div>

                {/* Device View Switcher */}
                <div className="flex p-0.5 bg-surface-100 rounded-lg">
                    <button
                        onClick={() => setActiveView('desktop')}
                        className={`p-1.5 rounded-md transition-all ${activeView === 'desktop'
                            ? 'bg-white text-surface-900 shadow-subtle'
                            : 'text-surface-500 hover:text-surface-900'
                            }`}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveView('mobile')}
                        className={`p-1.5 rounded-md transition-all ${activeView === 'mobile'
                            ? 'bg-white text-surface-900 shadow-subtle'
                            : 'text-surface-500 hover:text-surface-900'
                            }`}
                        title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
                <button
                    onClick={openPreview}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
                >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                </button>

                <div className="hidden sm:block h-5 w-px bg-surface-200 mx-0.5"></div>

                <div className="flex items-center gap-0.5">
                    <button
                        onClick={showHtml}
                        className="p-2 text-surface-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all"
                        title="Show HTML Code"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onImportHtml}
                        className="p-2 text-surface-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all"
                        title="Import HTML"
                    >
                        <LayoutTemplate className="w-4 h-4" />
                    </button>
                    <button
                        onClick={exportJson}
                        className="p-2 text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Save JSON"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="p-2 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Clear Canvas"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-5 w-px bg-surface-200 mx-0.5"></div>

                <button
                    onClick={onSendTestEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-brand-700 bg-brand-50 hover:bg-brand-100 text-xs font-medium rounded-lg transition-all border border-brand-200"
                >
                    <Send className="w-3.5 h-3.5" />
                    Test
                </button>

                <button
                    onClick={exportHtml}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-medium rounded-lg shadow-brand-sm hover:shadow-brand-md transition-all active:scale-[0.98]"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export
                </button>
            </div>
        </header>
    );
}
