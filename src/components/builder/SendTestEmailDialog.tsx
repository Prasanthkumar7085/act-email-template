import React, { useState } from 'react';
import { Send, Loader2, X } from 'lucide-react';

interface SendTestEmailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: string, subject: string) => Promise<void>;
}

export default function SendTestEmailDialog({ isOpen, onClose, onSend }: SendTestEmailDialogProps) {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Test Email');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter an email address');
            return;
        }

        setError(null);
        setIsSending(true);

        try {
            await onSend(email, subject);
            onClose();
            setEmail('');
        } catch (err: any) {
            setError(err.message || 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-surface-950/60 overlay-blur flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-modal overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
                    <h3 className="text-base font-semibold text-surface-900 tracking-tight">Send Test Email</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            To Email (separate multiple with commas)
                        </label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                            placeholder="recipient1@example.com, recipient2@example.com"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                            placeholder="Email Subject"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg font-medium hover:bg-surface-200 transition-colors text-sm"
                            disabled={isSending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800 transition-colors text-sm shadow-brand-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Test
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
