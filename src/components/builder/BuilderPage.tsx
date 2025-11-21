import React, { useRef, useState } from 'react'
import Palette from './Palette'
import EditorJSComponent from '../EditorJs'
import Toolbar from './Toolbar'
import PropertiesPanel from './PropertiesPanel'
import { generateEmailHTML } from './emailTemplates'

export default function BuilderPage() {
    const [editorData, setEditorData] = useState<any>({ time: Date.now(), blocks: [], version: '2.30.8' })
    const editorRef = useRef<Map<number, any>>(new Map())
    const [previewHtml, setPreviewHtml] = useState<string | null>(null)
    const [pageLayouts, setPageLayouts] = useState<any[]>([{ background: '#ffffff', margins: { top: 40, right: 0, bottom: 0, left: 0 } }])
    const [professionalOptions, setProfessionalOptions] = useState({ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto", baseColor: '#06b6d4' })

    function insert(type: 'header' | 'paragraph' | 'image' | 'list' | 'delimiter') {
        const editor = editorRef.current?.get(0)
        try {
            if (!editor) return
            if (type === 'header') editor.blocks.insert('header', { text: 'New heading' }, {}, editor.blocks.getBlocksCount())
            if (type === 'paragraph') editor.blocks.insert('paragraph', { text: 'New paragraph' }, {}, editor.blocks.getBlocksCount())
            if (type === 'image') editor.blocks.insert('image', { file: { url: 'https://via.placeholder.com/600x200' }, caption: '' }, {}, editor.blocks.getBlocksCount())
            if (type === 'list') editor.blocks.insert('list', { style: 'unordered', items: ['List item'] }, {}, editor.blocks.getBlocksCount())
            if (type === 'delimiter') editor.blocks.insert('delimiter', {}, {}, editor.blocks.getBlocksCount())
        } catch (e) {
            console.warn('Insert failed', e)
        }
    }

    function loadTemplate(data: any) {
        setEditorData(data)
    }

    function clearCanvas() {
        setEditorData({ time: Date.now(), blocks: [], version: '2.30.8' })
        const editor = editorRef.current?.get(0)
        try {
            editor?.clear()
        } catch (e) { }
    }

    function exportHtml() {
        const html = generateEmailHTML(editorData)
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'email-template.html'
        a.click()
        URL.revokeObjectURL(url)
    }

    function openPreview() {
        setPreviewHtml(generateEmailHTML(editorData))
    }

    function updatePageLayout(partial: any) {
        setPageLayouts((prev) => {
            const copy = [...prev]
            copy[0] = { ...copy[0], ...partial }
            return copy
        })
    }

    return (
        <div className="min-h-[80vh] p-6">
            <h2 className="text-2xl font-semibold mb-4">Email Template Builder</h2>
            <div className="flex gap-4">
                <div className="w-64">
                    <Palette insert={insert} loadTemplate={loadTemplate} />
                </div>

                <div className="flex-1 bg-white p-4 rounded shadow relative">
                    <Toolbar onExport={exportHtml} onPreview={openPreview} onClear={clearCanvas} />
                    <div className="mt-4" >
                        <EditorJSComponent
                            data={editorData}
                            onChange={(d: any) => setEditorData(d)}
                            pageIndex={0}
                            editorRef={editorRef}
                            pageLayouts={pageLayouts}
                        />
                    </div>
                </div>

                <div className="w-80">
                    <PropertiesPanel
                        pageLayouts={pageLayouts}
                        onUpdatePageLayout={(p: any) => updatePageLayout(p)}
                        professionalOptions={professionalOptions}
                        onUpdateProfessionalOptions={(p: any) => setProfessionalOptions((s) => ({ ...s, ...p }))}
                    />
                </div>
            </div>

            {previewHtml ? (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white max-w-3xl w-full max-h-[80vh] overflow-auto p-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Preview</h3>
                            <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={() => setPreviewHtml(null)}>
                                Close
                            </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                </div>
            ) : null}
        </div>
    )
}
