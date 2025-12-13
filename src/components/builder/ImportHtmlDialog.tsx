import React, { useState } from 'react';

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
            // Basic validation - check if it's valid HTML
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Import HTML</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Paste your HTML code. Tables will be converted to columns, and divs to containers.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Tables (&lt;table&gt;, &lt;tr&gt;) will be converted to column layouts</li>
                            <li>Divs with multiple children will be converted to containers</li>
                            <li>Styles and formatting will be preserved</li>
                            <li>Content will be imported into the <strong>{builderMode === 'editorjs' ? 'EditorJS' : 'Drag & Drop'}</strong> builder</li>
                        </ul>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                        Import HTML
                    </button>
                </div>
            </div>
        </div>
    );
}
