import React, { useState } from 'react';
import { Save, Play, Settings, Box } from 'lucide-react';
import MonacoEditor from './editors/MonacoEditor';

interface FunctionDesignerProps {
    file: any;
}

const FunctionDesigner: React.FC<FunctionDesignerProps> = ({ file }) => {
    const [definition, setDefinition] = useState(`CREATE FUNCTION \`${file.name || 'func_name'}\` (param1 INT) RETURNS VARCHAR(255)\nBEGIN\n  RETURN 'Hello';\nEND`);
    const [returnType, setReturnType] = useState('VARCHAR(255)');
    const [isDeterministic, setIsDeterministic] = useState(true);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <Box size={16} className="text-pink-500" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">{file.name || 'New Function'}</span>
                    <span className="text-[10px] bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 px-1.5 py-0.5 rounded border border-pink-200 dark:border-pink-800">FUNC</span>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded text-xs hover:bg-nebula-700 shadow-sm transition-all" onClick={() => alert("Function Saved!")}>
                        <Save size={14} /> Save
                    </button>
                </div>
            </div>

            {/* Configuration */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Return Type</label>
                    <input
                        type="text"
                        value={returnType}
                        onChange={e => setReturnType(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 focus:border-nebula-500 outline-none font-mono"
                        placeholder="VARCHAR(255)"
                    />
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <input
                        type="checkbox"
                        id="deterministic"
                        checked={isDeterministic}
                        onChange={e => setIsDeterministic(e.target.checked)}
                        className="rounded border-gray-300 text-nebula-600 focus:ring-nebula-500 cursor-pointer"
                    />
                    <label htmlFor="deterministic" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">Deterministic</label>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden relative">
                <MonacoEditor
                    language="sql"
                    value={definition}
                    onChange={(val) => setDefinition(val || '')}
                />
            </div>
        </div>
    );
};

export default FunctionDesigner;
