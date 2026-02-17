import React, { useState } from 'react'
import Palette from './Palette'
import EditorJSComponent from '../EditorJs'
import PropertiesPanel from './PropertiesPanel'
import DragDropBuilder, { EmailElement } from './DragDropBuilder'

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
    const [rightTab, setRightTab] = useState<'settings' | 'templates'>('settings')

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
        <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Templates Panel */}
            <div className="w-72 lg:w-80 bg-white border-r border-surface-200 flex flex-col h-full flex-shrink-0">
                <div className="p-4 border-b border-surface-200 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-surface-900 mb-0.5 tracking-tight">Email Templates</h3>
                    <p className="text-xs text-surface-500">Choose from pre-designed templates</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 panel-scroll">
                    <Palette loadTemplate={loadTemplate} />
                </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 bg-surface-50 flex flex-col overflow-hidden min-w-0">
                <div className="bg-white border-b border-surface-200 px-6 py-3.5 flex-shrink-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Editor Canvas</h2>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
                    <div className="flex items-start justify-center min-h-full pb-20">
                        <div
                            className={`bg-white rounded-xl shadow-elevated transform transition-all duration-300 ring-1 ring-surface-200 ${activeView === 'mobile' ? 'scale-90 mobile-view-active' : 'scale-100'
                                }`}
                            style={{
                                width: activeView === 'mobile' ? '420px' : `${page.width || 900}px`,
                                maxWidth: activeView === 'mobile' ? '420px' : `${page.maxWidth || 900}px`,
                                backgroundColor: page.background || '#ffffff',
                                backgroundImage: page.backgroundImage ? `url(${page.backgroundImage})` : undefined,
                                backgroundRepeat: page.backgroundRepeat || 'no-repeat',
                                backgroundSize: page.backgroundSize || 'cover',
                                borderRadius: `${page.borderRadius || 8}px`,
                                padding: `${page.padding?.top || 40}px ${page.padding?.right || 40}px ${page.padding?.bottom || 40}px ${page.padding?.left || 40}px`,
                                minHeight: page.height ? `${page.height}px` : 'auto',
                            }}
                        >
                            <div
                                className="overflow-y-auto relative"
                                style={{
                                    minHeight: page.height ? `${page.height}px` : '600px',
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
            <div className="w-80 lg:w-96 bg-white border-l border-surface-200 flex flex-col h-full flex-shrink-0">
                <div className="p-4 border-b border-surface-200 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-surface-900 leading-tight tracking-tight text-sm">Properties</h3>
                            <p className="text-xs text-surface-500 mt-0.5">Customize your template</p>
                        </div>
                    </div>
                    <div className="flex p-0.5 bg-surface-100 rounded-lg">
                        <button
                            onClick={() => setRightTab('settings')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${rightTab === 'settings'
                                ? 'bg-white text-surface-900 shadow-subtle'
                                : 'text-surface-500 hover:text-surface-900'
                                }`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setRightTab('templates')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${rightTab === 'templates'
                                ? 'bg-white text-surface-900 shadow-subtle'
                                : 'text-surface-500 hover:text-surface-900'
                                }`}
                        >
                            Templates
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto panel-scroll">
                    {rightTab === 'settings' ? (
                        <PropertiesPanel
                            pageLayouts={pageLayouts}
                            onUpdatePageLayout={updatePageLayout}
                            professionalOptions={professionalOptions}
                            onUpdateProfessionalOptions={updateProfessionalOptions}
                        />
                    ) : (
                        <div className="h-full p-4">
                            <div className="mb-4">
                                <h4 className="font-medium text-surface-900 mb-1 text-sm">Template Library</h4>
                                <p className="text-xs text-surface-500">Browse available templates</p>
                            </div>
                            <Palette loadTemplate={loadTemplate} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
