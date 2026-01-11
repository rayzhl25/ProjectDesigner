import React, { useState, useRef } from 'react';
import { Upload, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { LOCALE } from '../../../constants';
import { Language } from '../../../types';
import { editImageWithGemini } from '../../../services/geminiService';

interface ImageEditorProps {
    lang: Language;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ lang }) => {
    const t = LOCALE[lang];
    const [image, setImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImage(base64);
                setResultImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!image || !prompt) return;

        setLoading(true);
        try {
            // Extract base64 data without prefix for API
            const base64Data = image.split(',')[1];
            const mimeType = image.split(';')[0].split(':')[1];

            const newImage = await editImageWithGemini(base64Data, prompt, mimeType);
            setResultImage(newImage);
        } catch (err) {
            console.error(err);
            alert('Generation failed. Please check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Wand2 className="text-nebula-500" />
                    {t.imageEditor}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t.editorDescription}</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Input Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4 overflow-auto">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 min-h-[300px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${image ? 'border-nebula-500 bg-nebula-50 dark:bg-nebula-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-nebula-400'}`}
                    >
                        {image ? (
                            <img src={image} alt="Original" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center p-6">
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{t.uploadImage}</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t.promptPlaceholder}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!image || !prompt || loading}
                            className="bg-nebula-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-nebula-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                            {t.generate}
                        </button>
                    </div>
                </div>

                {/* Result Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {loading ? (
                            <div className="text-center">
                                <Loader2 className="h-10 w-10 text-nebula-500 animate-spin mx-auto mb-4" />
                                <p className="text-gray-500">{t.loading}</p>
                            </div>
                        ) : resultImage ? (
                            <img src={resultImage} alt="Result" className="max-h-full max-w-full object-contain" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <ArrowRight className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Generated image will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
