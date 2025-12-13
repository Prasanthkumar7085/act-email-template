import { useCallback, useRef, useState, useEffect } from 'react';
import { buildEmailFromEditor } from '../../lib/renderTemplate';
import BuilderHeader from './BuilderHeader';
import BuilderWorkspace from './BuilderWorkspace';
import { EmailElement } from './DragDropBuilder';
import { buildEmailFromDragDrop } from '../../lib/renderDragDropTemplate';
import ImportHtmlDialog from './ImportHtmlDialog';
import { htmlToEditorJS } from '../../lib/htmlToEditorJS';
import { htmlToBlocks } from '@/lib/htmlToDragDrop';

interface EditorData {
    time: number;
    blocks: any[];
    version: string;
}

interface PageLayout {
    background: string;
    backgroundImage?: string;
    backgroundRepeat?: string;
    backgroundSize?: string;
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
    const [showHtmlDialog, setShowHtmlDialog] = useState(false);
    const [htmlCode, setHtmlCode] = useState<string>('');
    const [showImportHtmlDialog, setShowImportHtmlDialog] = useState(false);
    const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
    const [builderMode, setBuilderMode] = useState<'editorjs' | 'dragdrop'>('editorjs');
    const [dragDropElements, setDragDropElements] = useState<EmailElement[]>([]);
    const [pageLayouts, setPageLayouts] = useState<PageLayout[]>([{
        background: '#ffffff',
        backgroundImage: '',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        margins: { top: 40, right: 0, bottom: 0, left: 0 },
        width: 600,
        maxWidth: 900,
        borderRadius: 8,
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        height: 800
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
            html = await buildEmailFromEditor(editorData, usedView, pageLayouts[0]);
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
            html = await buildEmailFromEditor(editorData, activeView, pageLayouts[0]);
        } else {
            html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
        }
        setPreviewHtml(html);
    };

    const formatHtml = (html: string): string => {
        // Simple formatter: preserve existing structure and just ensure consistent indentation
        const lines = html.split('\n');
        let formatted: string[] = [];
        let indent = 0;
        const indentSize = 2;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) {
                formatted.push('');
                continue;
            }

            // Decrease indent before closing tags
            if (line.startsWith('</')) {
                indent = Math.max(0, indent - indentSize);
            }

            // Add line with proper indentation
            formatted.push(' '.repeat(indent) + line);

            // Increase indent after opening tags (but not self-closing or void elements)
            if (line.startsWith('<') &&
                !line.startsWith('</') &&
                !line.startsWith('<!') &&
                !line.endsWith('/>') &&
                !line.match(/<(img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr)\s/i)) {
                indent += indentSize;
            }
        }

        return formatted.join('\n');
    };


    const showHtml = async () => {
        let html: string;
        if (builderMode === 'editorjs') {
            html = await buildEmailFromEditor(editorData, activeView, pageLayouts[0]);
        } else {
            html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
        }
        // Format the HTML nicely before storing
        const formattedHtml = formatHtml(html);
        setHtmlCode(formattedHtml);
        setShowHtmlDialog(true);
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
        (content: any, _pageIndex: number) => {
            setEditorData(content);
        },
        [editorData]
    );

    const handleImportHtml = (htmlString: string) => {
        try {
            if (builderMode === 'editorjs') {
                // Convert HTML to EditorJS blocks
                const editorJSData = htmlToEditorJS(htmlString);
                setEditorData(editorJSData);
                setReInitializerEditor(!reInitializerEditor);
            } else {
                // Convert HTML to DragDrop elements
                const dragDropElements = htmlToBlocks(htmlString);
                setDragDropElements(dragDropElements);
            }
        } catch (error) {
            console.error('Error importing HTML:', error);
            alert('Failed to import HTML. Please check the HTML format and try again.');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <BuilderHeader
                activeView={activeView}
                setActiveView={(v) => setActiveView(v)}
                openPreview={openPreview}
                exportHtml={exportHtml}
                showHtml={showHtml}
                exportJson={exportJson}
                clearCanvas={clearCanvas}
                builderMode={builderMode}
                setBuilderMode={setBuilderMode}
                onImportHtml={() => setShowImportHtmlDialog(true)}
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
                    <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                            <div className="flex items-center space-x-3">
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
                                    onClick={async () => {
                                        const html = builderMode === 'editorjs'
                                            ? await buildEmailFromEditor(editorData, activeView, pageLayouts[0])
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
                        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 flex items-start justify-center p-8">
                            <div className="w-full flex items-start justify-center min-h-full">
                                <div
                                    className="bg-white shadow-2xl rounded-lg border border-gray-200"
                                    style={{
                                        width: activeView === 'mobile' ? '375px' : '600px',
                                        maxWidth: activeView === 'mobile' ? '375px' : '600px',
                                        backgroundColor: pageLayouts[0]?.background || '#ffffff',
                                        backgroundImage: pageLayouts[0]?.backgroundImage ? `url(${pageLayouts[0]?.backgroundImage})` : undefined,
                                        backgroundRepeat: pageLayouts[0]?.backgroundRepeat || 'no-repeat',
                                        backgroundSize: pageLayouts[0]?.backgroundSize || 'cover',
                                        transition: 'all 0.3s ease',
                                        overflow: 'auto',
                                        maxHeight: 'calc(100vh - 200px)',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showHtmlDialog && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">HTML Code</h3>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={async () => {
                                        // Copy the original unformatted HTML (before formatting)
                                        let html: string;
                                        if (builderMode === 'editorjs') {
                                            html = await buildEmailFromEditor(editorData, activeView, pageLayouts[0]);
                                        } else {
                                            html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
                                        }
                                        await navigator.clipboard.writeText(html);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                >
                                    📋 Copy
                                </button>
                                <button
                                    onClick={() => setShowHtmlDialog(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-6 bg-gray-900">
                            <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words overflow-x-auto">
                                <code>{(htmlCode)}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            <ImportHtmlDialog
                isOpen={showImportHtmlDialog}
                onClose={() => setShowImportHtmlDialog(false)}
                onImport={handleImportHtml}
                builderMode={builderMode}
            />
        </div>
    )
}