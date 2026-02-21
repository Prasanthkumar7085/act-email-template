import { useCallback, useRef, useState, useEffect } from 'react';
import { buildEmailFromEditor } from '../../lib/renderTemplate';
import BuilderHeader from './BuilderHeader';
import BuilderWorkspace from './BuilderWorkspace';
import { EmailElement } from './DragDropBuilder';
import { buildEmailFromDragDrop } from '../../lib/renderDragDropTemplate';
import ImportHtmlDialog from './ImportHtmlDialog';
import { htmlToEditorJS } from '../../lib/htmlToEditorJS';
import { htmlToBlocks } from '@/lib/htmlToDragDrop';
import SendTestEmailDialog from './SendTestEmailDialog';
import { sendEmail } from '../../server/sendEmail';
import Toast from '../common/Toast';
import {
    createTemplate,
    updateTemplate,
} from '../../services/templateService';
import { useAuth } from '../../store/authContext';

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
    const { workspaceId } = useAuth();

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
    const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Save / load state
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const lastSavedDataRef = useRef<string>('');

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
        setHasUnsavedChanges(false);
        lastSavedDataRef.current = JSON.stringify(data);
    };

    // On mount: restore template from localStorage (set by TemplatesPage)
    useEffect(() => {
        const tplId = localStorage.getItem('editingTemplateId');
        const tplName = localStorage.getItem('editingTemplateName');

        if (tplId) {
            setEditingTemplateId(tplId);
            localStorage.removeItem('editingTemplateId');
        }
        if (tplName) {
            setTemplateName(tplName);
            localStorage.removeItem('editingTemplateName');
        }

        try {
            const raw = localStorage.getItem('selectedTemplate');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed) {
                    setEditorData(parsed);
                    lastSavedDataRef.current = raw;
                }
                localStorage.removeItem('selectedTemplate');
            }
        } catch (err) {
            console.warn('Failed to load selected template from storage', err);
        }
    }, []);

    // Track unsaved changes
    useEffect(() => {
        const current = JSON.stringify(editorData);
        setHasUnsavedChanges(current !== lastSavedDataRef.current);
    }, [editorData]);

    const clearCanvas = () => {
        if (builderMode === 'editorjs') {
            setEditorData({ time: Date.now(), blocks: [], version: '2.30.8' });
            setReInitializerEditor(!reInitializerEditor);
        } else {
            setDragDropElements([]);
        }
    };

    const exportHtml = async (view?: 'desktop' | 'mobile') => {
        const usedView = view || activeView || 'desktop';
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

    // Save template to API
    const handleSave = async () => {
        if (!workspaceId) {
            setToast({ message: 'No workspace selected. Please log in again.', type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            // Generate compiled HTML for preview
            let compiledHtml = '';
            try {
                compiledHtml = await buildEmailFromEditor(editorData, 'desktop', pageLayouts[0]);
            } catch {}

            const payload = {
                name: templateName || 'Untitled Template',
                editorData: editorData as unknown as Record<string, unknown>,
                compiledHtml,
                status: 'draft' as const,
            };

            let saved;
            if (editingTemplateId) {
                const res = await updateTemplate(editingTemplateId, payload);
                saved = res.data;
            } else {
                const res = await createTemplate(payload);
                saved = res.data;
                setEditingTemplateId(saved._id);
                setTemplateName(saved.name);
            }

            lastSavedDataRef.current = JSON.stringify(editorData);
            setHasUnsavedChanges(false);
            setToast({ message: `"${saved.name}" saved successfully`, type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to save template', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const formatHtml = (html: string): string => {
        let formatted = '';
        let indent = 0;
        const tab = '  ';

        const tokens = html.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).filter(Boolean);

        const voidElements = [
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'
        ];

        for (const token of tokens) {
            if (token.match(/^<\//)) {
                indent = Math.max(0, indent - 1);
                formatted += '\n' + tab.repeat(indent) + token;
            } else if (token.match(/^<.*>$/)) {
                const tagNameMatch = token.match(/^<([a-z0-9]+)/i);
                const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';

                const isSelfClosing = token.endsWith('/>') || voidElements.includes(tagName);

                formatted += '\n' + tab.repeat(indent) + token;

                if (!isSelfClosing && !token.startsWith('<!')) {
                    indent++;
                }
            } else {
                const text = token.trim();
                if (text) {
                    formatted += '\n' + tab.repeat(indent) + text;
                }
            }
        }

        return formatted.trim();
    };

    const showHtml = async () => {
        let html: string;
        if (builderMode === 'editorjs') {
            html = await buildEmailFromEditor(editorData, activeView, pageLayouts[0]);
        } else {
            html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
        }
        const formattedHtml = formatHtml(html);
        setHtmlCode(formattedHtml);
        setShowHtmlDialog(true);
    };

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
                const editorJSData = htmlToEditorJS(htmlString);
                setEditorData(editorJSData);
                setReInitializerEditor(!reInitializerEditor);
            } else {
                const dragDropElements = htmlToBlocks(htmlString);
                setDragDropElements(dragDropElements);
            }
        } catch (error) {
            console.error('Error importing HTML:', error);
            alert('Failed to import HTML. Please check the HTML format and try again.');
        }
    };

    const handleSendTestEmail = async (to: string, subject: string) => {
        try {
            const emails = to.split(',').map(e => e.trim()).filter(Boolean);
            if (emails.length === 0) {
                throw new Error('Please enter at least one valid email address');
            }

            let html: string;
            if (builderMode === 'editorjs') {
                html = await buildEmailFromEditor(editorData, activeView, pageLayouts[0]);
            } else {
                html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
            }

            await sendEmail({ data: { to: emails, subject, htmlContent: html } });
            setToast({ message: 'Test email sent successfully', type: 'success' });
        } catch (error: any) {
            console.error('Error sending test email:', error);
            setToast({ message: error.message || 'Failed to send test email', type: 'error' });
            throw error;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-surface-50">
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
                onSendTestEmail={() => setShowTestEmailDialog(true)}
                onSave={workspaceId ? handleSave : undefined}
                isSaving={isSaving}
                templateName={templateName}
                hasUnsavedChanges={hasUnsavedChanges}
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

            {/* Preview Modal */}
            {previewHtml && (
                <div className="fixed inset-0 bg-surface-950/60 overlay-blur flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] flex flex-col shadow-modal animate-scale-in">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 flex-shrink-0">
                            <h3 className="text-base font-semibold text-surface-900 tracking-tight">Email Preview</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex p-0.5 bg-surface-100 rounded-lg">
                                    <button
                                        onClick={() => setActiveView('desktop')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeView === 'desktop'
                                            ? 'bg-white text-surface-900 shadow-subtle'
                                            : 'text-surface-500 hover:text-surface-900'
                                            }`}
                                    >
                                        Desktop
                                    </button>
                                    <button
                                        onClick={() => setActiveView('mobile')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeView === 'mobile'
                                            ? 'bg-white text-surface-900 shadow-subtle'
                                            : 'text-surface-500 hover:text-surface-900'
                                            }`}
                                    >
                                        Mobile
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
                                    className="px-3.5 py-1.5 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800 transition-colors text-xs"
                                >
                                    Open in New Tab
                                </button>
                                <button
                                    onClick={() => setPreviewHtml(null)}
                                    className="px-3.5 py-1.5 bg-surface-100 text-surface-700 rounded-lg font-medium hover:bg-surface-200 transition-colors text-xs"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-surface-50 flex items-start justify-center p-8">
                            <div className="w-full flex items-start justify-center min-h-full">
                                <div
                                    className={`bg-white shadow-elevated rounded-lg border border-surface-200 ${activeView === 'mobile' ? 'mobile-view-active' : ''}`}
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

            {/* HTML Code Modal */}
            {showHtmlDialog && (
                <div className="fixed inset-0 bg-surface-950/60 overlay-blur flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-modal animate-scale-in">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 flex-shrink-0">
                            <h3 className="text-base font-semibold text-surface-900 tracking-tight">HTML Code</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        let html: string;
                                        if (builderMode === 'editorjs') {
                                            html = await buildEmailFromEditor(editorData, activeView, pageLayouts[0]);
                                        } else {
                                            html = buildEmailFromDragDrop(dragDropElements, pageLayouts[0], activeView);
                                        }
                                        await navigator.clipboard.writeText(html);
                                        setToast({ message: 'HTML copied to clipboard', type: 'success' });
                                    }}
                                    className="px-3.5 py-1.5 bg-surface-100 text-surface-700 rounded-lg font-medium hover:bg-surface-200 transition-colors text-xs"
                                >
                                    Copy
                                </button>
                                <button
                                    onClick={() => setShowHtmlDialog(false)}
                                    className="px-3.5 py-1.5 bg-surface-100 text-surface-700 rounded-lg font-medium hover:bg-surface-200 transition-colors text-xs"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-6 bg-surface-900 rounded-b-2xl">
                            <pre className="text-sm text-surface-100 font-mono whitespace-pre-wrap break-words overflow-x-auto">
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

            <SendTestEmailDialog
                isOpen={showTestEmailDialog}
                onClose={() => setShowTestEmailDialog(false)}
                onSend={handleSendTestEmail}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
