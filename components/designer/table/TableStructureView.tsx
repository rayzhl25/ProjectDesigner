import React, { useState } from 'react';
import { Plus, GripVertical, Key, Trash2, ChevronDown, Settings, X, Code, Zap } from 'lucide-react';
import { ColumnDefinition } from './types';

interface TableStructureViewProps {
    columns: ColumnDefinition[];
    setColumns: (cols: ColumnDefinition[]) => void;
    readOnly: boolean;
    viewMode: 'structure' | 'gen_crud';
    onSave: () => void;
}

const COMMON_TYPES = [
    { label: 'Numeric', options: ['INT', 'BIGINT', 'TINYINT', 'DECIMAL', 'FLOAT'] },
    { label: 'String', options: ['VARCHAR', 'TEXT', 'CHAR', 'LONGTEXT'] },
    { label: 'Date/Time', options: ['DATETIME', 'TIMESTAMP', 'DATE', 'TIME'] },
    { label: 'Other', options: ['JSON', 'BOOLEAN', 'BLOB'] },
];

const TableStructureView: React.FC<TableStructureViewProps> = ({
    columns,
    setColumns,
    readOnly,
    viewMode,
    onSave
}) => {
    const [draggedColId, setDraggedColId] = useState<string | null>(null);
    const [activeSidePanelColId, setActiveSidePanelColId] = useState<string | null>(null);

    // Handlers moved from parent
    const handleAddColumn = () => {
        if (readOnly) return;
        const newCol: ColumnDefinition = {
            id: `c_${Date.now()}`,
            name: `new_column_${columns.length + 1}`,
            label: `Label ${columns.length + 1}`,
            type: 'VARCHAR',
            length: '255',
            pk: false,
            nn: false,
            ai: false,
            default: '',
            comment: '',
            required: false,
            showInTable: true,
            showInForm: true,
            showInDetail: true,
            queryType: 'none',
            componentType: 'Input',
            componentProps: '{}'
        };
        setColumns([...columns, newCol]);
    };

    const handleDeleteColumn = (id: string) => {
        if (readOnly) return;
        if (columns.length <= 1) {
            alert("Table must have at least one column.");
            return;
        }
        if (confirm("Are you sure you want to delete this column?")) {
            setColumns(columns.filter(c => c.id !== id));
        }
    };

    const updateColumn = (id: string, field: keyof ColumnDefinition, value: any) => {
        if (readOnly) return;
        setColumns(columns.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedColId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedColId || draggedColId === targetId) return;

        const newCols = [...columns];
        const draggedIdx = newCols.findIndex(c => c.id === draggedColId);
        const targetIdx = newCols.findIndex(c => c.id === targetId);

        if (draggedIdx === -1 || targetIdx === -1) return;

        const [moved] = newCols.splice(draggedIdx, 1);
        newCols.splice(targetIdx, 0, moved);
        setColumns(newCols);
    };

    return (
        <div className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 overflow-auto flex flex-col">
                <div className="flex-1 overflow-auto relative">
                    <table className="w-full text-left border-collapse table-auto min-w-[1200px]">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 uppercase font-medium sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-3 w-10 text-center">#</th>
                                <th className="p-3 w-48">Name</th>
                                <th className="p-3 w-32">Type</th>
                                <th className="p-3 w-20">Length</th>
                                <th className="p-3 w-10 text-center" title="Primary Key">PK</th>
                                <th className="p-3 w-10 text-center" title="Not Null">NN</th>
                                <th className="p-3 w-10 text-center" title="Auto Increment">AI</th>
                                <th className="p-3 w-32">Default</th>
                                <th className="p-3 min-w-[150px]">Comment</th>

                                {/* Low-code Config Headers */}
                                <th className="p-3 w-32">Label</th>
                                <th className="p-3 w-24">Query</th>
                                <th className="p-3 w-24 text-center">Show</th>
                                <th className="p-3 w-28">Component</th>
                                <th className="p-3 w-16 text-center">Req</th>
                                <th className="p-3 w-8"></th>

                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                            {columns.map((col, idx) => (
                                <tr
                                    key={col.id}
                                    draggable={!readOnly}
                                    onDragStart={(e) => !readOnly && handleDragStart(e, col.id)}
                                    onDragOver={(e) => !readOnly && handleDragOver(e, col.id)}
                                    className={`group transition-all duration-200 hover:bg-nebula-50/30 dark:hover:bg-nebula-900/10 ${activeSidePanelColId === col.id ? 'bg-nebula-50/50 dark:bg-nebula-900/20' : ''} ${draggedColId === col.id ? 'opacity-50 bg-gray-100 dark:bg-gray-700' : ''}`}
                                >
                                    {/* Drag Handle */}
                                    <td className={`p-3 text-center ${readOnly ? '' : 'cursor-move text-gray-300 hover:text-gray-500 active:cursor-grabbing'}`}>
                                        {!readOnly && <GripVertical size={14} className="mx-auto" />}
                                    </td>

                                    {/* Name Input */}
                                    <td className="p-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={col.name}
                                                disabled={readOnly || viewMode === 'gen_crud'}
                                                onChange={(e) => updateColumn(col.id, 'name', e.target.value)}
                                                className={`w-full bg-transparent font-medium text-gray-700 dark:text-gray-200 focus:outline-none border-b border-transparent focus:border-nebula-500 transition-colors pb-0.5 placeholder-gray-300 ${(readOnly || viewMode === 'gen_crud') ? 'cursor-default' : ''}`}
                                                placeholder="Column Name"
                                            />
                                            {col.pk && <Key size={10} className="absolute -left-3 top-1 text-yellow-500" />}
                                        </div>
                                    </td>

                                    {/* Type Select */}
                                    <td className="p-3">
                                        <div className="relative group/type">
                                            <select
                                                value={col.type}
                                                disabled={readOnly || viewMode === 'gen_crud'}
                                                onChange={(e) => updateColumn(col.id, 'type', e.target.value)}
                                                className={`appearance-none w-full bg-gray-50 dark:bg-gray-900 text-xs py-1.5 px-2.5 rounded border border-gray-200 dark:border-gray-700 focus:border-nebula-500 focus:ring-1 focus:ring-nebula-500 outline-none font-mono ${(readOnly || viewMode === 'gen_crud') ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                            >
                                                {COMMON_TYPES.map(group => (
                                                    <optgroup key={group.label} label={group.label}>
                                                        {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </td>

                                    {/* Length Input */}
                                    <td className="p-3">
                                        {['VARCHAR', 'CHAR', 'DECIMAL'].includes(col.type) ? (
                                            <input
                                                type="text"
                                                value={col.length}
                                                disabled={readOnly || viewMode === 'gen_crud'}
                                                onChange={(e) => updateColumn(col.id, 'length', e.target.value)}
                                                className={`w-full bg-transparent text-xs text-gray-500 focus:text-gray-900 dark:focus:text-gray-100 border-b border-gray-200 dark:border-gray-700 focus:border-nebula-500 outline-none text-center ${(readOnly || viewMode === 'gen_crud') ? 'cursor-default' : ''}`}
                                                placeholder={col.type === 'DECIMAL' ? '10,2' : '255'}
                                            />
                                        ) : (
                                            <span className="text-gray-300 text-xs block text-center">-</span>
                                        )}
                                    </td>

                                    {/* Toggles: PK, NN, AI */}
                                    <td className="p-3 text-center">
                                        <input type="checkbox" checked={col.pk} disabled={readOnly || viewMode === 'gen_crud'} onChange={(e) => updateColumn(col.id, 'pk', e.target.checked)} className="rounded border-gray-300 text-nebula-600 focus:ring-nebula-500 cursor-pointer disabled:cursor-default" />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input type="checkbox" checked={col.nn} disabled={readOnly || viewMode === 'gen_crud'} onChange={(e) => updateColumn(col.id, 'nn', e.target.checked)} className="rounded border-gray-300 text-nebula-600 focus:ring-nebula-500 cursor-pointer disabled:cursor-default" />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={col.ai}
                                            disabled={readOnly || viewMode === 'gen_crud' || !['INT', 'BIGINT', 'TINYINT'].includes(col.type) || !col.pk}
                                            onChange={(e) => updateColumn(col.id, 'ai', e.target.checked)}
                                            className="rounded border-gray-300 text-nebula-600 focus:ring-nebula-500 cursor-pointer disabled:opacity-30 disabled:cursor-default"
                                        />
                                    </td>

                                    {/* Default & Comment */}
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={col.default}
                                            disabled={readOnly || viewMode === 'gen_crud'}
                                            onChange={(e) => updateColumn(col.id, 'default', e.target.value)}
                                            className={`w-full bg-transparent text-xs text-blue-600 dark:text-blue-400 focus:text-blue-700 outline-none placeholder-gray-300/50 ${(readOnly || viewMode === 'gen_crud') ? 'cursor-default' : ''}`}
                                            placeholder="NULL"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={col.comment}
                                            disabled={readOnly || viewMode === 'gen_crud'}
                                            onChange={(e) => updateColumn(col.id, 'comment', e.target.value)}
                                            className={`w-full bg-transparent text-xs text-gray-500 focus:text-gray-800 dark:focus:text-gray-200 outline-none placeholder-gray-300 ${(readOnly || viewMode === 'gen_crud') ? 'cursor-default' : ''}`}
                                            placeholder="Add comment..."
                                        />
                                    </td>

                                    {/* Label Input */}
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={col.label}
                                            disabled={readOnly}
                                            onChange={(e) => updateColumn(col.id, 'label', e.target.value)}
                                            className={`w-full bg-transparent text-xs text-green-600 dark:text-green-400 focus:text-green-700 outline-none placeholder-gray-300/50 ${readOnly ? 'cursor-default' : ''}`}
                                            placeholder={col.name}
                                        />
                                    </td>

                                    {/* Query Type */}
                                    <td className="p-3">
                                        <select
                                            value={col.queryType}
                                            disabled={readOnly}
                                            onChange={(e) => updateColumn(col.id, 'queryType', e.target.value)}
                                            className={`w-full bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:text-nebula-600 outline-none border-b border-transparent focus:border-nebula-500 ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                                        >
                                            <option value="none">None</option>
                                            <option value="eq">Exact</option>
                                            <option value="like">Like</option>
                                            <option value="between">Range</option>
                                            <option value="gt">&gt;</option>
                                            <option value="lt">&lt;</option>
                                        </select>
                                    </td>

                                    {/* Show T/F/D */}
                                    <td className="p-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => updateColumn(col.id, 'showInTable', !col.showInTable)}
                                                disabled={readOnly}
                                                title="Show in Table"
                                                className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold transition-all ${col.showInTable ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >T</button>
                                            <button
                                                onClick={() => updateColumn(col.id, 'showInForm', !col.showInForm)}
                                                disabled={readOnly}
                                                title="Show in Form"
                                                className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold transition-all ${col.showInForm ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >F</button>
                                            <button
                                                onClick={() => updateColumn(col.id, 'showInDetail', !col.showInDetail)}
                                                disabled={readOnly}
                                                title="Show in Detail"
                                                className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold transition-all ${col.showInDetail ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >D</button>
                                        </div>
                                    </td>

                                    {/* Component Type */}
                                    <td className="p-3">
                                        <select
                                            value={col.componentType}
                                            disabled={readOnly}
                                            onChange={(e) => updateColumn(col.id, 'componentType', e.target.value)}
                                            className={`w-full bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:text-nebula-600 outline-none border-b border-transparent focus:border-nebula-500 ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                                        >
                                            <option value="Input">Input</option>
                                            <option value="NumberInput">Number</option>
                                            <option value="Textarea">Textarea</option>
                                            <option value="Select">Select</option>
                                            <option value="Switch">Switch</option>
                                            <option value="DatePicker">Date</option>
                                            <option value="Upload">Upload</option>
                                        </select>
                                    </td>

                                    {/* Required Toggle */}
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={col.required}
                                            disabled={readOnly}
                                            onChange={(e) => updateColumn(col.id, 'required', e.target.checked)}
                                            className="rounded border-gray-300 text-nebula-600 focus:ring-nebula-500 cursor-pointer disabled:cursor-default"
                                        />
                                    </td>

                                    {/* Config Button */}
                                    <td className="p-3">
                                        <button
                                            onClick={() => !readOnly && setActiveSidePanelColId(activeSidePanelColId === col.id ? null : col.id)}
                                            disabled={readOnly}
                                            className={`p-1.5 rounded transition-all ${activeSidePanelColId === col.id ? 'bg-nebula-100 text-nebula-600 dark:bg-nebula-900/50 dark:text-nebula-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'} ${readOnly ? 'cursor-default opacity-50' : ''}`}
                                            title="Configure Component Props"
                                        >
                                            <Settings size={14} />
                                        </button>
                                    </td>

                                    {/* Delete Action */}
                                    <td className="p-3 text-center">
                                        {!readOnly && viewMode === 'structure' && (
                                            <button
                                                onClick={() => handleDeleteColumn(col.id)}
                                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer Action */}
                    {!readOnly && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                            {viewMode === 'structure' && (
                                <button onClick={handleAddColumn} className="flex items-center gap-2 text-nebula-600 hover:text-nebula-700 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-nebula-300 shadow-sm px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-md">
                                    <div className="bg-nebula-100 dark:bg-nebula-900 text-nebula-600 rounded-full p-0.5"><Plus size={14} /></div>
                                    Add New Column
                                </button>
                            )}
                            {viewMode === 'gen_crud' && (
                                <button onClick={onSave} className="flex items-center gap-2 text-white bg-nebula-600 hover:bg-nebula-700 shadow-sm px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-md">
                                    <Zap size={14} />
                                    Generate Page
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Side Panel */}
            {activeSidePanelColId && (
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col transition-all">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Settings size={16} className="text-nebula-500" />
                            Configuration
                        </h3>
                        <button onClick={() => setActiveSidePanelColId(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <Code size={24} className="opacity-50" />
                        </div>
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Component Properties</h4>
                        <p className="text-xs max-w-[200px]">Detailed component configuration panel is implemented in external modules.</p>
                        <div className="mt-4 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-[10px] rounded border border-yellow-100 dark:border-yellow-900/50">
                            Editing: {columns.find(c => c.id === activeSidePanelColId)?.name}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableStructureView;
