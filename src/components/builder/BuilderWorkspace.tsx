import React, { useState } from 'react'
import Palette from './Palette'
import EditorJSComponent from '../EditorJs'
import PropertiesPanel from './PropertiesPanel'

interface Props {
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
}

export default function BuilderWorkspace({ editorData, onEditorChange, editorRef, pageLayouts, updatePageLayout, professionalOptions, updateProfessionalOptions, activeView, loadTemplate, reInitializerEditor }: Props) {
    const [rightTab, setRightTab] = useState<'settings' | 'templates'>('settings')

    const handleEditorHeightChange = (_pageIndex: number, height: number) => {
        updatePageLayout({ height })
    }

    const page = pageLayouts?.[0] || {}

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="font-semibold text-gray-900 mb-2">Email Templates</h3>
                    <p className="text-sm text-gray-500">Choose from pre-designed templates</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Palette loadTemplate={loadTemplate} />
                </div>
            </div>

            <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Email Builder</h2>
                            <p className="text-sm text-gray-500">Design your email template</p>
                        </div>

                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="flex items-center justify-center min-h-full">
                        <div
                            className={`bg-white rounded-xl shadow-lg transform transition-all duration-300 ${activeView === 'mobile' ? 'scale-90' : 'scale-100'
                                }`}
                            style={{
                                width: activeView === 'mobile' ? '375px' : `${page.width}px`,
                                maxWidth: activeView === 'mobile' ? '375px' : `${page.maxWidth}px`,
                                backgroundColor: page.background || '#ffffff',
                                borderRadius: `${page.borderRadius || 8}px`,
                                padding: `${page.padding?.top || 40}px ${page.padding?.right || 40}px ${page.padding?.bottom || 40}px ${page.padding?.left || 40}px`,
                                minHeight: page.height ? `${page.height}px` : 'auto',
                            }}
                        >
                            <div
                                className="overflow-y-auto relative"
                                style={{
                                    minHeight: page.height ? `${page.height}px` : '600px',
                                    maxHeight: 'calc(100vh - 200px)'
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

            <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Properties</h3>
                            <p className="text-sm text-gray-500">Customize your template</p>
                        </div>
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setRightTab('settings')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${rightTab === 'settings'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Settings
                            </button>
                            <button
                                onClick={() => setRightTab('templates')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${rightTab === 'templates'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Templates
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
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
                                <h4 className="font-medium text-gray-900 mb-2">Template Library</h4>
                                <p className="text-sm text-gray-500">Browse available templates</p>
                            </div>
                            <Palette loadTemplate={loadTemplate} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}