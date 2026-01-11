import React, { useState } from 'react';
import { Code2, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import MonacoEditor from '../../editors/MonacoEditor';
import { StatusCodeConfig, ResponseNode } from '../common/types';

interface ResponseEditorProps {
    responseConfigs: StatusCodeConfig[];
    onChange: (configs: StatusCodeConfig[]) => void;
    t: any;
}

const ResponseEditor: React.FC<ResponseEditorProps> = ({
    responseConfigs,
    onChange,
    t
}) => {
    const [activeStatusCode, setActiveStatusCode] = useState('200');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'root_err']));

    // Helpers
    const getActiveResponseConfig = () => responseConfigs.find(c => c.code === activeStatusCode) || responseConfigs[0];
    const activeResConfig = getActiveResponseConfig();

    const updateResponseConfig = (updater: (config: StatusCodeConfig) => StatusCodeConfig) => {
        onChange(responseConfigs.map(c => c.code === activeStatusCode ? updater(c) : c));
    };

    const toggleNodeExpand = (nodeId: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    };

    const updateSchemaNode = (nodes: ResponseNode[], nodeId: string, field: keyof ResponseNode, value: any): ResponseNode[] => {
        return nodes.map(node => {
            if (node.id === nodeId) return { ...node, [field]: value };
            if (node.children) return { ...node, children: updateSchemaNode(node.children, nodeId, field, value) };
            return node;
        });
    };

    const addSchemaChild = (nodes: ResponseNode[], parentId: string): ResponseNode[] => {
        return nodes.map(node => {
            if (node.id === parentId) {
                const newChild: ResponseNode = {
                    id: `n_${Date.now()}`,
                    targetKey: 'newField',
                    type: 'string',
                    required: true,
                    sourcePath: '',
                    mock: '',
                    desc: ''
                };
                return { ...node, children: [...(node.children || []), newChild] };
            }
            if (node.children) return { ...node, children: addSchemaChild(node.children, parentId) };
            return node;
        });
    };

    const deleteSchemaNode = (nodes: ResponseNode[], nodeId: string): ResponseNode[] => {
        return nodes.filter(node => node.id !== nodeId).map(node => {
            if (node.children) return { ...node, children: deleteSchemaNode(node.children, nodeId) };
            return node;
        });
    };

    const handleAddStatus = () => {
        const code = prompt("Enter HTTP Status Code (e.g., 201, 500):");
        if (code && !responseConfigs.find(c => c.code === code)) {
            const newConfig: StatusCodeConfig = {
                code,
                name: 'New Status',
                mode: 'visual',
                schema: [{ id: `root_${code}`, targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Root', children: [] }],
                script: ''
            };
            onChange([...responseConfigs, newConfig]);
            setActiveStatusCode(code);
        }
    };

    const renderSchemaTree = (nodes: ResponseNode[], level = 0) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length >= 0;
            const isExpanded = expandedNodes.has(node.id);
            const isRoot = level === 0;

            return (
                <React.Fragment key={node.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group text-xs">
                        <td className="p-2 pl-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                                {hasChildren && (node.type === 'object' || node.type === 'array') ? (
                                    <button onClick={() => toggleNodeExpand(node.id)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 mr-1 text-gray-500">
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                ) : <div className="w-5" />}
                                <input
                                    type="text"
                                    value={node.targetKey}
                                    onChange={(e) => updateResponseConfig(c => ({ ...c, schema: updateSchemaNode(c.schema, node.id, 'targetKey', e.target.value) }))}
                                    className={`bg-transparent outline-none border-b border-transparent focus:border-nebula-500 w-32 ${isRoot ? 'font-bold text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                                    readOnly={isRoot}
                                />
                            </div>
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <select
                                value={node.type}
                                onChange={(e) => updateResponseConfig(c => ({ ...c, schema: updateSchemaNode(c.schema, node.id, 'type', e.target.value) }))}
                                className="bg-transparent outline-none text-nebula-600 dark:text-nebula-400 w-20"
                            >
                                <option value="object">Object</option>
                                <option value="array">Array</option>
                                <option value="string">String</option>
                                <option value="integer">Integer</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="null">Null</option>
                            </select>
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                                type="text"
                                value={node.mock}
                                onChange={(e) => updateResponseConfig(c => ({ ...c, schema: updateSchemaNode(c.schema, node.id, 'mock', e.target.value) }))}
                                className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 placeholder-gray-300 text-gray-600 dark:text-gray-400"
                                placeholder="Mock Val"
                            />
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                                type="text"
                                value={node.sourcePath}
                                onChange={(e) => updateResponseConfig(c => ({ ...c, schema: updateSchemaNode(c.schema, node.id, 'sourcePath', e.target.value) }))}
                                className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 font-mono text-xs text-gray-500"
                                placeholder="$"
                            />
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                                type="text"
                                value={node.desc}
                                onChange={(e) => updateResponseConfig(c => ({ ...c, schema: updateSchemaNode(c.schema, node.id, 'desc', e.target.value) }))}
                                className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500"
                                placeholder="Description"
                            />
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                {(node.type === 'object' || node.type === 'array') && (
                                    <button onClick={() => {
                                        updateResponseConfig(c => ({ ...c, schema: addSchemaChild(c.schema, node.id) }));
                                        if (!isExpanded) toggleNodeExpand(node.id);
                                    }} className="text-nebula-600 hover:text-nebula-700" title={t.addChild}>
                                        <Plus size={14} />
                                    </button>
                                )}
                                {!isRoot && (
                                    <button onClick={() => updateResponseConfig(c => ({ ...c, schema: deleteSchemaNode(c.schema, node.id) }))} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                    {isExpanded && node.children && renderSchemaTree(node.children, level + 1)}
                </React.Fragment>
            );
        });
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800 min-w-0 border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="h-10 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 flex-shrink-0">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Code2 size={14} className="text-purple-500" />
                    {t.responseTransform}
                </span>
            </div>

            {/* Status Tabs */}
            <div className="px-2 pt-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-1 overflow-x-auto no-scrollbar">
                {responseConfigs.map(c => (
                    <button
                        key={c.code}
                        onClick={() => setActiveStatusCode(c.code)}
                        className={`
                            px-3 py-1.5 text-xs font-medium rounded-t-lg border-t border-l border-r relative top-[1px]
                            ${activeStatusCode === c.code
                                ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-gray-200 dark:border-gray-700'
                                : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 border-transparent hover:bg-gray-300 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        <span className="font-bold mr-1">{c.code}</span> {c.name}
                    </button>
                ))}
                <button onClick={handleAddStatus} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title={t.addStatus}><Plus size={14} /></button>
            </div>

            {/* Mode Toggle & Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-0.5">
                    <button
                        onClick={() => updateResponseConfig(c => ({ ...c, mode: 'visual' }))}
                        className={`px-3 py-1 text-xs rounded transition-colors ${activeResConfig.mode === 'visual' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white' : 'text-gray-500'}`}
                    >
                        {t.visualMode}
                    </button>
                    <button
                        onClick={() => updateResponseConfig(c => ({ ...c, mode: 'code' }))}
                        className={`px-3 py-1 text-xs rounded transition-colors ${activeResConfig.mode === 'code' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white' : 'text-gray-500'}`}
                    >
                        {t.codeMode}
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900 relative">
                {activeResConfig.mode === 'code' ? (
                    <MonacoEditor
                        language="javascript"
                        value={activeResConfig.script}
                        onChange={(val) => updateResponseConfig(c => ({ ...c, script: val || '' }))}
                    />
                ) : (
                    <div className="h-full overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 text-xs text-gray-500 font-medium">
                                <tr>
                                    <th className="p-2 pl-4 border-b border-gray-200 dark:border-gray-700 w-1/4">{t.key}</th>
                                    <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-20">{t.type}</th>
                                    <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-1/5">{t.mockValue}</th>
                                    <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-1/5">{t.sourcePath}</th>
                                    <th className="p-2 border-b border-gray-200 dark:border-gray-700">{t.desc}</th>
                                    <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {renderSchemaTree(activeResConfig.schema)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponseEditor;
