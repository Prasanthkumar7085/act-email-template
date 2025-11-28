import { useCallback, useRef, useState } from 'react';
import { buildEmailFromEditor } from '../../lib/renderTemplate';
import BuilderHeader from './BuilderHeader';
import BuilderWorkspace from './BuilderWorkspace';
import { useEffect } from 'react';

interface EditorData {
    time: number;
    blocks: any[];
    version: string;
}

interface PageLayout {
    background: string;
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    width: number;
    maxWidth: number;
    borderRadius: number;
    padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    height?: number;
}

interface ProfessionalOptions {
    fontFamily: string;
    baseColor: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    borderRadius: number;
    buttonStyle: 'flat' | 'rounded' | 'outline';
    spacing: number;
}

export default function BuilderPage() {
    const [editorData, setEditorData] = useState<EditorData>({
        time: Date.now(),
        blocks: [],
        version: '2.30.8'
    });

    const editorRef = useRef<Map<number, any>>(new Map());
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
    const [pageLayouts, setPageLayouts] = useState<PageLayout[]>([{
        background: '#ffffff',
        margins: { top: 40, right: 0, bottom: 0, left: 0 },
        width: 900,
        maxWidth: 900,
        borderRadius: 8,
        padding: { top: 40, right: 40, bottom: 40, left: 40 }
        , height: 800
    }]);
    const [reInitializerEditor, setReInitializerEditor] = useState(false);

    const [professionalOptions, setProfessionalOptions] = useState<ProfessionalOptions>({
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        baseColor: '#06b6d4',
        primaryColor: '#06b6d4',
        secondaryColor: '#64748b',
        textColor: '#1e293b',
        borderRadius: 8,
        buttonStyle: 'rounded',
        spacing: 16
    });

    const loadTemplate = (data: any) => {
        setEditorData(data);
        setReInitializerEditor(!reInitializerEditor);
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem('selectedTemplate')
            if (raw) {
                const parsed = JSON.parse(raw)
                if (parsed) {
                    setEditorData(parsed)
                }
                localStorage.removeItem('selectedTemplate')
            }
        } catch (err) {
            console.warn('Failed to load selected template from storage', err)
        }
    }, [])

    const clearCanvas = () => {
        setEditorData({ time: Date.now(), blocks: [], version: '2.30.8' });
        setReInitializerEditor(!reInitializerEditor);

    };

    const exportHtml = async (view?: 'desktop' | 'mobile') => {
        const usedView = view || activeView || 'desktop'
        const html = await buildEmailFromEditor(editorData, usedView)
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-template-${usedView}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportJson = () => {
        const data = {
            editorData,
            pageLayouts,
            professionalOptions,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'email-template.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const openPreview = async () => {
        const html = await buildEmailFromEditor(editorData, activeView)
        setPreviewHtml(html)
    };

    const updatePageLayout = (partial: Partial<PageLayout>) => {
        setPageLayouts((prev) => {
            const copy = [...prev];
            copy[0] = { ...copy[0], ...partial };
            return copy;
        });
    };

    const updateProfessionalOptions = (partial: Partial<ProfessionalOptions>) => {
        setProfessionalOptions(prev => ({ ...prev, ...partial }));
    };

    const handleChangeEditorjsData = useCallback(
        (content: any, pageIndex: number) => {
            setEditorData(content);
        },
        [editorData]
    );

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <BuilderHeader
                activeView={activeView}
                setActiveView={(v) => setActiveView(v)}
                openPreview={openPreview}
                exportHtml={exportHtml}
                exportJson={exportJson}
                clearCanvas={clearCanvas}
            />

            <BuilderWorkspace
                editorData={editorData}
                onEditorChange={handleChangeEditorjsData}
                editorRef={editorRef}
                pageLayouts={pageLayouts}
                updatePageLayout={updatePageLayout}
                professionalOptions={professionalOptions}
                updateProfessionalOptions={updateProfessionalOptions}
                activeView={activeView}
                loadTemplate={loadTemplate}
                reInitializerEditor={reInitializerEditor}
            />

            {previewHtml && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        const blob = new Blob([previewHtml || ''], { type: 'text/html' });
                                        const url = URL.createObjectURL(blob);
                                        window.open(url, '_blank');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Open in New Tab
                                </button>
                                <button
                                    onClick={() => setPreviewHtml(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-8 bg-gray-50">
                            <div
                                className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
                                style={{ maxWidth: '600px' }}
                                dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}