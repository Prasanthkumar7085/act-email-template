import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImportHtmlDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (htmlString: string) => void;
    builderMode: 'editorjs' | 'dragdrop';
}

export default function ImportHtmlDialog({ isOpen, onClose, onImport, builderMode }: ImportHtmlDialogProps) {
    const [htmlString, setHtmlString] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleImport = () => {
        if (!htmlString.trim()) {
            setError('Please paste some HTML content');
            return;
        }

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const parseError = doc.querySelector('parsererror');

            if (parseError) {
                setError('Invalid HTML format. Please check your HTML and try again.');
                return;
            }

            setError(null);
            onImport(htmlString);
            setHtmlString('');
            onClose();
        } catch (err) {
            setError('Failed to parse HTML. Please check the format and try again.');
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText) {
            setHtmlString(pastedText);
            setError(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-surface-950/60 overlay-blur flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-modal animate-scale-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 flex-shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-surface-900 tracking-tight">Import HTML</h3>
                        <p className="text-xs text-surface-500 mt-1">
                            Paste your HTML code. Tables will be converted to columns, and divs to containers.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            HTML Code
                        </label>
                        <textarea
                            value={htmlString}
                            onChange={(e) => {
                                setHtmlString(e.target.value);
                                setError(null);
                            }}
                            onPaste={handlePaste}
                            placeholder="Paste your HTML code here...&#10;&#10;Example:&#10;&lt;table&gt;&#10;  &lt;tr&gt;&#10;    &lt;td&gt;Column 1&lt;/td&gt;&#10;    &lt;td&gt;Column 2&lt;/td&gt;&#10;  &lt;/tr&gt;&#10;&lt;/table&gt;"
                            className="w-full h-96 p-4 border border-surface-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none resize-none placeholder-surface-400 transition-all"
                        />
                        {error && (
                            <p className="mt-2 text-sm text-rose-600">{error}</p>
                        )}
                    </div>

                    <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-brand-900 mb-2">How it works:</h4>
                        <ul className="text-sm text-brand-800 space-y-1 list-disc list-inside">
                            <li>Tables (&lt;table&gt;, &lt;tr&gt;) will be converted to column layouts</li>
                            <li>Divs with multiple children will be converted to containers</li>
                            <li>Styles and formatting will be preserved</li>
                            <li>Content will be imported into the <strong>{builderMode === 'editorjs' ? 'EditorJS' : 'Drag & Drop'}</strong> builder</li>
                        </ul>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-surface-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg font-medium hover:bg-surface-200 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-4 py-2 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800 transition-colors text-sm shadow-brand-sm"
                    >
                        Import HTML
                    </button>
                </div>
            </div>
        </div>
    );
}
