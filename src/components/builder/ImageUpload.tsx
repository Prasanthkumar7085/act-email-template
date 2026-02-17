import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
    onImageSelect: (url: string) => void;
    currentUrl?: string;
}

export default function ImageUpload({ onImageSelect, currentUrl }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onImageSelect(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlChange = (url: string) => {
        setPreview(url);
        onImageSelect(url);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs text-surface-500 mb-1.5">Upload Image</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors text-sm font-medium"
                >
                    <Upload className="w-3.5 h-3.5" />
                    Choose File
                </button>
            </div>

            <div>
                <label className="block text-xs text-surface-500 mb-1.5">Or Enter Image URL</label>
                <input
                    type="text"
                    value={currentUrl || ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            {preview && (
                <div className="mt-3">
                    <label className="block text-xs text-surface-500 mb-1.5">Preview</label>
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-surface-200"
                        onError={() => setPreview(null)}
                    />
                </div>
            )}
        </div>
    );
}
