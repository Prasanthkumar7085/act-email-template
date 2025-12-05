import { useCallback, useRef, useState, useEffect } from 'react';
import { buildEmailFromEditor } from '../../lib/renderTemplate';
import BuilderHeader from './BuilderHeader';
import BuilderWorkspace from './BuilderWorkspace';
import { EmailElement } from './DragDropBuilder';
import { buildEmailFromDragDrop } from '../../lib/renderDragDropTemplate';

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
    const [builderMode, setBuilderMode] = useState<'editorjs' | 'dragdrop'>('editorjs');
    const [dragDropElements, setDragDropElements] = useState<EmailElement[]>([]);
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
        if (builderMode === 'editorjs') {
            setEditorData({ time: Date.now(), blocks: [], version: '2.30.8' });
            setReInitializerEditor(!reInitializerEditor);
        } else {
            setDragDropElements([]);
        }
    };

    const exportHtml = async (view?: 'desktop' | 'mobile') => {
        const usedView = view || activeView || 'desktop'
        let html: string;
        if (builderMode === 'editorjs') {
            html = await buildEmailFromEditor(editorData, usedView);
        } else {
            html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], usedView);
        }
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
            builderMode,
            editorData: builderMode === 'editorjs' ? editorData : null,
            dragDropElements: builderMode === 'dragdrop' ? dragDropElements : null,
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
        let html: string;
        if (builderMode === 'editorjs') {
            html = await buildEmailFromEditor(editorData, activeView);
        } else {
            html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
        }
        setPreviewHtml(html);
    };
    
    // Update preview when view changes
    useEffect(() => {
        if (previewHtml) {
            openPreview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeView]);

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
                builderMode={builderMode}
                setBuilderMode={setBuilderMode}
            />

            <BuilderWorkspace
                builderMode={builderMode}
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
                dragDropElements={dragDropElements}
                onDragDropElementsChange={setDragDropElements}
            />

            {previewHtml && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                            <div className="flex items-center space-x-3">
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setActiveView('desktop')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                            activeView === 'desktop'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        🖥️ Desktop
                                    </button>
                                    <button
                                        onClick={() => setActiveView('mobile')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                            activeView === 'mobile'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        📱 Mobile
                                    </button>
                                </div>
                                <button
                                    onClick={async () => {
                                        const html = builderMode === 'editorjs' 
                                            ? await buildEmailFromEditor(editorData, activeView)
                                            : buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
                                        const blob = new Blob([html], { type: 'text/html' });
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
                        <div className="flex-1 overflow-auto p-8 bg-gray-50 flex items-center justify-center">
                            <div
                                className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto"
                                style={{
                                    width: activeView === 'mobile' 
                                        ? `${pageLayouts[0]?.width || 375}px`
                                        : `${pageLayouts[0]?.width || 900}px`,
                                    maxWidth: activeView === 'mobile'
                                        ? `${pageLayouts[0]?.maxWidth || 375}px`
                                        : `${pageLayouts[0]?.maxWidth || 900}px`,
                                    transform: activeView === 'mobile' ? 'scale(0.9)' : 'scale(1)',
                                    transition: 'transform 0.3s ease',
                                }}
                                dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}