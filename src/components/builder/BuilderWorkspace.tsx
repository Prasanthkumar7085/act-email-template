import React, { useState, useEffect, useRef } from 'react'
import Palette from './Palette'
import EditorJSComponent from '../EditorJs'
import PropertiesPanel from './PropertiesPanel'
import DragDropBuilder, { EmailElement } from './DragDropBuilder'
import { LayoutTemplate, Settings, Layers, Monitor, Smartphone } from 'lucide-react'

interface Props {
    builderMode: 'editorjs' | 'dragdrop'
    editorData: any
    onEditorChange: any
    editorRef: React.MutableRefObject<Map<number, any> | any>
    pageLayouts: any[]
    updatePageLayout: (partial: any) => void
    professionalOptions: any
    updateProfessionalOptions: (partial: any) => void
    activeView: 'desktop' | 'mobile'
    loadTemplate: (d: any) => void
    reInitializerEditor: boolean
    dragDropElements: EmailElement[]
    onDragDropElementsChange: (elements: EmailElement[]) => void
}

export default function BuilderWorkspace({
    builderMode,
    editorData,
    onEditorChange,
    editorRef,
    pageLayouts,
    updatePageLayout,
    professionalOptions,
    updateProfessionalOptions,
    activeView,
    loadTemplate,
    reInitializerEditor,
    dragDropElements,
    onDragDropElementsChange
}: Props) {
    const [isLoaded, setIsLoaded] = useState(false)
    const canvasRef = useRef<HTMLDivElement>(null)

    // Trigger entrance animations
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const handleEditorHeightChange = (_pageIndex: number, height: number) => {
        updatePageLayout({ height })
    }

    const page = pageLayouts?.[0] || {}

    if (builderMode === 'dragdrop') {
        return (
            <DragDropBuilder
                elements={dragDropElements}
                onElementsChange={onDragDropElementsChange}
                pageLayouts={pageLayouts}
                activeView={activeView}
            />
        );
    }

    return (
        <div className="flex-1 flex overflow-hidden bg-surface-50/50">
            {/* Left Side - Templates Panel */}
            <div 
                className={`
                    w-72 lg:w-80 bg-white border-r border-surface-200/80 
                    flex flex-col h-full flex-shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)]
                    transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
            >
                {/* Panel Header */}
                <div className="p-5 border-b border-surface-200/80 flex-shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                            <LayoutTemplate className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-surface-900 tracking-tight">Templates</h3>
                            <p className="text-[11px] text-surface-500">Pre-designed layouts</p>
                        </div>
                    </div>
                </div>

                {/* Templates Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="space-y-3">
                        <Palette loadTemplate={loadTemplate} />
                    </div>
                </div>
            </div>

            {/* Center - Canvas */}
            <div 
                className={`
                    flex-1 bg-surface-50 flex flex-col overflow-hidden min-w-0 relative
                    transition-all duration-500 delay-100 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                `}
            >
                {/* Canvas Header */}
                <div className="bg-white/90 backdrop-blur-md border-b border-surface-200/80 px-6 py-4 flex-shrink-0 z-20 sticky top-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-md bg-surface-100 flex items-center justify-center">
                                <Layers className="w-3.5 h-3.5 text-surface-500" />
                            </div>
                            <div>
                                <h2 className="text-xs font-semibold text-surface-900 uppercase tracking-wider">Canvas</h2>
                                <p className="text-[10px] text-surface-400 mt-0.5">Design your email</p>
                            </div>
                        </div>
                        
                        {/* View Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 rounded-full">
                            {activeView === 'desktop' ? (
                                <Monitor className="w-3.5 h-3.5 text-surface-500" />
                            ) : (
                                <Smartphone className="w-3.5 h-3.5 text-surface-500" />
                            )}
                            <span className="text-[11px] font-medium text-surface-600 capitalize">{activeView} View</span>
                        </div>
                    </div>
                </div>

                {/* Canvas Content */}
                <div className="flex-1 overflow-auto p-8 lg:p-12 relative custom-scrollbar">
                    <div className="flex items-start justify-center min-h-full pb-20">
                        <div
                            ref={canvasRef}
                            className={`
                                bg-white rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                                shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.16)]
                                ring-1 ring-surface-200/80
                                ${activeView === 'mobile' ? 'scale-[0.85] origin-top' : 'scale-100'}
                            `}
                            style={{
                                width: activeView === 'mobile' ? '375px' : `${page.width || 900}px`,
                                maxWidth: activeView === 'mobile' ? '375px' : `${page.maxWidth || 900}px`,
                                backgroundColor: page.background || '#ffffff',
                                backgroundImage: page.backgroundImage ? `url(${page.backgroundImage})` : undefined,
                                backgroundRepeat: page.backgroundRepeat || 'no-repeat',
                                backgroundSize: page.backgroundSize || 'cover',
                                borderRadius: `${page.borderRadius || 12}px`,
                                padding: `${page.padding?.top || 48}px ${page.padding?.right || 48}px ${page.padding?.bottom || 48}px ${page.padding?.left || 48}px`,
                                minHeight: page.height ? `${page.height}px` : 'auto',
                            }}
                        >
                            <div
                                className="overflow-y-auto relative custom-scrollbar"
                                style={{
                                    minHeight: page.height ? `${page.height}px` : '700px',
                                }}
                            >
                                <EditorJSComponent
                                    data={editorData}
                                    onChange={onEditorChange}
                                    pageIndex={0}
                                    editorRef={editorRef}
                                    pageLayouts={pageLayouts}
                                    onHeightChange={handleEditorHeightChange}
                                    reInitializerEditor={reInitializerEditor}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Properties Panel */}
            <div 
                className={`
                    w-80 lg:w-96 bg-white border-l border-surface-200/80 
                    flex flex-col h-full flex-shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.08)]
                    transition-all duration-500 delay-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                `}
            >
                {/* Panel Header */}
                <div className="p-5 border-b border-surface-200/80 flex-shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-surface-900 tracking-tight">Properties</h3>
                            <p className="text-[11px] text-surface-500">Customize design</p>
                        </div>
                    </div>

                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative p-5">
                    <PropertiesPanel
                        pageLayouts={pageLayouts}
                        onUpdatePageLayout={updatePageLayout}
                        professionalOptions={professionalOptions}
                        onUpdateProfessionalOptions={updateProfessionalOptions}
                    />
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
                }
            `}</style>
        </div>
    )
}