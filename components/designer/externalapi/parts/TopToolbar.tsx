import React from 'react';
import { Play, Save } from 'lucide-react';

interface TopToolbarProps {
    method: string;
    setMethod: (m: string) => void;
    urlConfig: {
        baseUrlType: 'system' | 'custom';
        customBaseUrl: string;
        systemBaseUrl: string;
        path: string;
    };
    setUrlConfig: (config: any) => void;
    handleSave: () => void;
    onSend: () => void;
    loading: boolean;
    t: any;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
    method,
    setMethod,
    urlConfig,
    setUrlConfig,
    handleSave,
    onSend,
    loading,
    t
}) => {
    return (
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between px-4 flex-shrink-0 gap-4">
            <div className="flex items-center gap-0 flex-1 max-w-5xl h-9">
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="h-full px-3 rounded-l-md font-bold text-xs outline-none border border-r-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>

                <div className="relative h-full border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 min-w-[140px] max-w-[200px]">
                    <select
                        value={urlConfig.baseUrlType}
                        onChange={(e) => setUrlConfig({ ...urlConfig, baseUrlType: e.target.value as any })}
                        className="w-full h-full px-2 text-xs appearance-none outline-none bg-transparent text-gray-700 dark:text-gray-200"
                    >
                        <option value="system">{t.systemUrl}</option>
                        <option value="custom">{t.customUrl}</option>
                    </select>
                </div>

                <div className="h-full border-t border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center px-3 min-w-[200px]">
                    {urlConfig.baseUrlType === 'system' ? (
                        <span className="text-gray-500 text-xs truncate">{urlConfig.systemBaseUrl}</span>
                    ) : (
                        <input
                            type="text"
                            value={urlConfig.customBaseUrl}
                            onChange={(e) => setUrlConfig({ ...urlConfig, customBaseUrl: e.target.value })}
                            className="w-full bg-transparent outline-none text-xs text-gray-700 dark:text-gray-200"
                        />
                    )}
                </div>

                <input
                    type="text"
                    value={urlConfig.path}
                    onChange={(e) => setUrlConfig({ ...urlConfig, path: e.target.value })}
                    className="flex-1 h-full px-3 border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-nebula-500 font-mono text-sm"
                />

                <button onClick={onSend} className="h-full px-6 bg-nebula-600 hover:bg-nebula-700 text-white font-medium text-xs rounded-r-md transition-colors flex items-center gap-2">
                    {t.send} <Play size={12} fill="currentColor" />
                </button>
            </div>

            <button onClick={handleSave} disabled={loading} className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm disabled:opacity-50 h-9">
                <Save size={14} /> {loading ? t.saving : t.save}
            </button>
        </div>
    );
};

export default TopToolbar;
