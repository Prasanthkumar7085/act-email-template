import React from 'react'

interface Props {
    activeView: 'desktop' | 'mobile'
    setActiveView: (v: 'desktop' | 'mobile') => void
    openPreview: () => void
    exportHtml: () => void
    exportJson: () => void
    clearCanvas: () => void
    builderMode: 'editorjs' | 'dragdrop'
    setBuilderMode: (mode: 'editorjs' | 'dragdrop') => void
}

export default function BuilderHeader({ activeView, setActiveView, openPreview, exportHtml, exportJson, clearCanvas, builderMode, setBuilderMode }: Props) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✉️</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Email Template Builder</h1>
                        <p className="text-sm text-gray-500">Create professional email templates</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setBuilderMode('editorjs')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${builderMode === 'editorjs'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ✏️ EditorJS
                        </button>
                        <button
                            onClick={() => setBuilderMode('dragdrop')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${builderMode === 'dragdrop'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            🎨 Drag & Drop
                        </button>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveView('desktop')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'desktop'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            🖥️ Desktop
                        </button>
                        <button
                            onClick={() => setActiveView('mobile')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'mobile'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📱 Mobile
                        </button>
                    </div>

                    <button
                        onClick={openPreview}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                        👁️ Preview
                    </button>
                    <button
                        onClick={exportHtml}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                        📄 Export HTML
                    </button>
                    <button
                        onClick={exportJson}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                    >
                        💾 Save JSON
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>
        </div>
    )
}
