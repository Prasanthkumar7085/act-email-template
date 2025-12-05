import React, { useRef, useState } from 'react';

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
                <label className="block text-xs text-gray-600 mb-2">Upload Image</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    📁 Choose File
                </button>
            </div>
            
            <div>
                <label className="block text-xs text-gray-600 mb-2">Or Enter Image URL</label>
                <input
                    type="text"
                    value={currentUrl || ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            {preview && (
                <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-2">Preview</label>
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        onError={() => setPreview(null)}
                    />
                </div>
            )}
        </div>
    );
}

