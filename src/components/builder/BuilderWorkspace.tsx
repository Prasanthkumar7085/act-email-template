import React from 'react'
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
}

export default function BuilderWorkspace({ editorData, onEditorChange, editorRef, pageLayouts, updatePageLayout, professionalOptions, updateProfessionalOptions, activeView, loadTemplate }: Props) {
    const handleEditorHeightChange = (pageIndex: number, height: number) => {
        updatePageLayout({ height })
    }

    const page = pageLayouts?.[0] || {}

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Email Templates</h3>
                    <p className="text-sm text-gray-500">Choose from pre-designed templates</p>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <Palette loadTemplate={loadTemplate} />
                </div>
            </div>

            <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto relative pt-20">
                <div
                    className={`bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${activeView === 'mobile' ? 'max-w-sm scale-90' : 'max-w-4xl'}`}
                    style={{
                        width: activeView === 'mobile' ? '375px' : `${page.width}px`,
                        maxWidth: activeView === 'mobile' ? '375px' : `${page.maxWidth}px`,
                        backgroundColor: page.background || '#ffffff',
                        borderRadius: `${page.borderRadius || 8}px`,
                        padding: `${page.padding?.top || 40}px ${page.padding?.right || 40}px ${page.padding?.bottom || 40}px ${page.padding?.left || 40}px`,
                        minHeight: page.height ? `${page.height}px` : undefined,
                    }}
                >
                    <div className="h-full overflow-y-auto scrollbar-hide relative" style={{ minHeight: page.height ? `${page.height}px` : '800px' }}>
                        <EditorJSComponent
                            data={editorData}
                            onChange={onEditorChange}
                            pageIndex={0}
                            editorRef={editorRef}
                            pageLayouts={pageLayouts}
                            onHeightChange={handleEditorHeightChange}
                        />
                    </div>
                </div>
            </div>

            <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Template Settings</h3>
                    <p className="text-sm text-gray-500">Customize your email template</p>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <PropertiesPanel
                        pageLayouts={pageLayouts}
                        onUpdatePageLayout={updatePageLayout}
                        professionalOptions={professionalOptions}
                        onUpdateProfessionalOptions={updateProfessionalOptions}
                    />
                </div>
            </div>
        </div>
    )
}
