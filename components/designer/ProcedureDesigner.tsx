import React, { useState } from 'react';
import { Save, Play, Settings, ScrollText } from 'lucide-react';
import MonacoEditor from './editors/MonacoEditor';

interface ProcedureDesignerProps {
    file: any;
}

const ProcedureDesigner: React.FC<ProcedureDesignerProps> = ({ file }) => {
    const [definition, setDefinition] = useState(`CREATE PROCEDURE \`${file.name || 'proc_name'}\` (IN param1 INT)\nBEGIN\n  SELECT * FROM sys_users WHERE id = param1;\nEND`);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <ScrollText size={16} className="text-orange-500" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">{file.name || 'New Procedure'}</span>
                    <span className="text-[10px] bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800">PROC</span>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded text-xs hover:bg-nebula-700 shadow-sm transition-all" onClick={() => alert("Procedure Saved!")}>
                        <Save size={14} /> Save
                    </button>
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

            {/* Footer/Status */}
            <div className="h-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-[10px] text-gray-400">
                <span>MySQL Procedure Syntax</span>
            </div>
        </div>
    );
};

export default ProcedureDesigner;
