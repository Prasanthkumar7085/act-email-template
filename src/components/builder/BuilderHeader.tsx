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
    PenTool
} from 'lucide-react';

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
    onImportHtml
}: Props) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 px-4 flex items-center justify-between sticky top-0 z-50">
            {/* Left: Brand & Title */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-semibold text-gray-900 leading-tight">Email Builder</h1>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Unsaved changes
                    </div>
                </div>
            </div>

            {/* Center: View Modes & Editor Mode */}
            <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
                {/* Editor Mode Switcher */}
                <div className="flex p-1 bg-gray-100/80 rounded-lg ring-1 ring-gray-900/5">
                    <button
                        onClick={() => setBuilderMode('dragdrop')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${builderMode === 'dragdrop'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                            }`}
                    >
                        <MousePointer2 className="w-3.5 h-3.5" />
                        Visual
                    </button>
                    <button
                        onClick={() => setBuilderMode('editorjs')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${builderMode === 'editorjs'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                            }`}
                    >
                        <PenTool className="w-3.5 h-3.5" />
                        Editor
                    </button>
                </div>

                <div className="w-px h-6 bg-gray-200"></div>

                {/* Device View Switcher */}
                <div className="flex p-1 bg-gray-100/80 rounded-lg ring-1 ring-gray-900/5">
                    <button
                        onClick={() => setActiveView('desktop')}
                        className={`p-1.5 rounded-md transition-all ${activeView === 'desktop'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                            }`}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveView('mobile')}
                        className={`p-1.5 rounded-md transition-all ${activeView === 'mobile'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                            }`}
                        title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={openPreview}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                    <Eye className="w-4 h-4" />
                    Preview
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={showHtml}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Show HTML Code"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onImportHtml}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        title="Import HTML"
                    >
                        <LayoutTemplate className="w-4 h-4" />
                    </button>
                    <button
                        onClick={exportJson}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Save JSON"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Clear Canvas"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                <button
                    onClick={exportHtml}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>
        </header>
    );
}
