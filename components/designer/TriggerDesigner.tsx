import React, { useState } from 'react';
import { Save, Zap, Clock, Activity } from 'lucide-react';
import MonacoEditor from './editors/MonacoEditor';

interface TriggerDesignerProps {
    file: any;
}

const TriggerDesigner: React.FC<TriggerDesignerProps> = ({ file }) => {
    const [definition, setDefinition] = useState(`CREATE TRIGGER \`${file.name || 'trig_name'}\` BEFORE INSERT ON \`table_name\`\nFOR EACH ROW\nBEGIN\n  -- Trigger logic here\nEND`);
    const [timing, setTiming] = useState('BEFORE');
    const [event, setEvent] = useState('INSERT');
    const [tableName, setTableName] = useState('sys_users');

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">{file.name || 'New Trigger'}</span>
                    <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">TRIG</span>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded text-xs hover:bg-nebula-700 shadow-sm transition-all" onClick={() => alert("Trigger Saved!")}>
                        <Save size={14} /> Save
                    </button>
                </div>
            </div>

            {/* Configuration */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Timing</label>
                    <select
                        value={timing}
                        onChange={e => setTiming(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 focus:border-nebula-500 outline-none"
                    >
                        <option value="BEFORE">BEFORE</option>
                        <option value="AFTER">AFTER</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Event</label>
                    <select
                        value={event}
                        onChange={e => setEvent(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 focus:border-nebula-500 outline-none"
                    >
                        <option value="INSERT">INSERT</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Table</label>
                    <input
                        type="text"
                        value={tableName}
                        onChange={e => setTableName(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 focus:border-nebula-500 outline-none font-mono"
                        placeholder="table_name"
                    />
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

export default TriggerDesigner;
