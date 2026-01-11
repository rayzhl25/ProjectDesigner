import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Terminal, Eye } from 'lucide-react';
import MonacoEditor from '../../editors/MonacoEditor';

interface DebugResultPanelProps {
    data: any;
    error?: string;
    loading?: boolean;
    t: any;
    height?: string;
}

const JsonTreeNode: React.FC<{ name: string; value: any; level: number }> = ({ name, value, level }) => {
    const [expanded, setExpanded] = useState(true);
    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const type = isArray ? '[]' : '{}';

    if (!isObject) {
        let displayValue = JSON.stringify(value);
        let colorClass = 'text-green-600 dark:text-green-400';
        if (typeof value === 'number') colorClass = 'text-blue-600 dark:text-blue-400';
        if (typeof value === 'boolean') colorClass = 'text-purple-600 dark:text-purple-400';
        if (value === null) {
            displayValue = 'null';
            colorClass = 'text-gray-500';
        }

        return (
            <div className="flex font-mono text-xs hover:bg-gray-50 dark:hover:bg-gray-800/50 py-0.5" style={{ paddingLeft: `${level * 20}px` }}>
                <span className="text-gray-700 dark:text-gray-300 mr-1">{name}:</span>
                <span className={colorClass}>{displayValue}</span>
            </div>
        );
    }

    const keys = Object.keys(value);
    const suffix = isArray ? `Array(${keys.length})` : `Object{${keys.length}}`;

    return (
        <div>
            <div className="flex font-mono text-xs hover:bg-gray-50 dark:hover:bg-gray-800/50 py-0.5 cursor-pointer" style={{ paddingLeft: `${level * 20}px` }} onClick={() => setExpanded(!expanded)}>
                <span className="mr-1 text-gray-500">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <span className="text-gray-700 dark:text-gray-300 mr-2 font-bold">{name || (isArray ? 'List' : 'Root')}</span>
                <span className="text-gray-400 italic">{suffix}</span>
            </div>
            {expanded && (
                <div>
                    {keys.map(key => (
                        <JsonTreeNode key={key} name={key} value={value[key]} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const DebugResultPanel: React.FC<DebugResultPanelProps> = ({ data, error, loading, t, height = '100%' }) => {
    const [mode, setMode] = useState<'visual' | 'code'>('visual');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" style={{ height }}>
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-nebula-600"></div>
                    <span className="text-xs">Processing Request...</span>
                </div>
            </div>
        );
    }

    if (!data && !error) return null;

    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    let jsonData = data;
    try {
        if (typeof data === 'string') jsonData = JSON.parse(data);
    } catch (e) {
        // If not JSON, force code mode
    }

    return (
        <div className="flex flex-col bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" style={{ height }}>
            <div className="h-9 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                        Response Result
                    </span>
                    {error && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded">ERROR</span>}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-200 dark:bg-gray-700 rounded p-0.5">
                        <button onClick={() => setMode('visual')} className={`p-1 rounded ${mode === 'visual' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`} title={t.visualMode}>
                            <Eye size={14} />
                        </button>
                        <button onClick={() => setMode('code')} className={`p-1 rounded ${mode === 'code' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`} title={t.codeMode}>
                            <Terminal size={14} />
                        </button>
                    </div>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button onClick={handleCopy} className="text-gray-500 hover:text-nebula-600">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 relative">
                {error ? (
                    <div className="p-4 text-red-500 font-mono text-xs whitespace-pre-wrap">{error}</div>
                ) : (
                    mode === 'code' ? (
                        <MonacoEditor language="json" value={jsonString} readOnly={true} />
                    ) : (
                        <div className="p-4 overflow-auto">
                            <JsonTreeNode name="Root" value={jsonData} level={0} />
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default DebugResultPanel;
