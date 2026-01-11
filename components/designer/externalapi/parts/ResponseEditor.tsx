import React, { useState, useEffect } from 'react';
import { Code2, Plus, Trash2, ChevronDown, ChevronRight, Play, Settings, X } from 'lucide-react';
import MonacoEditor from '../../editors/MonacoEditor';
import { StatusCodeConfig, ResponseNode } from '../common/types';

interface ResponseEditorProps {
    responseConfigs: StatusCodeConfig[];
    onChange: (configs: StatusCodeConfig[]) => void;
    isEnabled: boolean;
    onToggleEnabled: (enabled: boolean) => void;
    t: any;
}

const ResponseEditor: React.FC<ResponseEditorProps> = ({
    responseConfigs,
    onChange,
    isEnabled,
    onToggleEnabled,
    t
}) => {
    const [activeRuleId, setActiveRuleId] = useState<string>('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'root_err']));

    // Preview State
    const [showPreview, setShowPreview] = useState(false);
    const [previewInput, setPreviewInput] = useState('{\n  "status": {\n    "code": 200,\n    "message": "success"\n  },\n  "data": {\n    "id": 123,\n    "name": "Test Item"\n  }\n}');
    const [previewResult, setPreviewResult] = useState('');
    const [previewError, setPreviewError] = useState('');

    useEffect(() => {
        if (responseConfigs.length > 0 && !activeRuleId) {
            setActiveRuleId(responseConfigs[0].id);
        } else if (responseConfigs.length > 0 && !responseConfigs.find(c => c.id === activeRuleId)) {
            setActiveRuleId(responseConfigs[0].id);
        }
    }, [responseConfigs, activeRuleId]);

    // Helpers
    const getActiveResponseConfig = () => responseConfigs.find(c => c.id === activeRuleId) || responseConfigs[0];
    const activeResConfig = getActiveResponseConfig();

    const updateResponseConfig = (updater: (config: StatusCodeConfig) => StatusCodeConfig) => {
        onChange(responseConfigs.map(c => c.id === activeRuleId ? updater(c) : c));
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

    const handleAddRule = () => {
        const newId = `rule_${Date.now()}`;
        const newConfig: StatusCodeConfig = {
            id: newId,
            code: 'new', // legacy
            name: 'New Rule',
            condition: '200',
            isDefault: false,
            mode: 'visual',
            schema: [{ id: `root_${newId}`, targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Root', children: [] }],
            script: 'function transform(data) {\n  return { transformed: true, data: data };\n}'
        };
        onChange([...responseConfigs, newConfig]);
        setActiveRuleId(newId);
    };

    const handleDeleteRule = (id: string) => {
        if (responseConfigs.length <= 1) return; // Prevent deleting last rule
        const newConfigs = responseConfigs.filter(c => c.id !== id);
        onChange(newConfigs);
        if (activeRuleId === id) {
            setActiveRuleId(newConfigs[0].id);
        }
    };

    const runPreview = () => {
        setPreviewError('');
        setPreviewResult('');
        try {
            const inputData = JSON.parse(previewInput);
            if (activeResConfig.mode === 'code') {
                // eslint-disable-next-line no-new-func
                const transformFunc = new Function('data', activeResConfig.script + '\nreturn transform(data);');
                const result = transformFunc(inputData);
                setPreviewResult(JSON.stringify(result, null, 2));
            } else {
                setPreviewResult("// Visual mode preview not implemented in client-side demo.\n// Please switch to Code mode to test JS transformation.");
            }
        } catch (e: any) {
            setPreviewError(e.message);
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

    if (!activeResConfig) return null;

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800 min-w-0 border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="h-10 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 flex-shrink-0">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Code2 size={14} className="text-purple-500" />
                    {t.responseTransform}
                </span>
                <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isEnabled} onChange={(e) => onToggleEnabled(e.target.checked)} className="sr-only peer" />
                        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-nebula-600"></div>
                        <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">{isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                </div>
            </div>

            {!isEnabled ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs p-8 text-center bg-gray-50/50 dark:bg-gray-800/50">
                    <Code2 size={32} className="mb-2 opacity-20" />
                    <p>Response encapsulation is disabled.</p>
                    <p className="opacity-70 mt-1">Enable it to configure secondary packaging for return data.</p>
                </div>
            ) : (
                <>
                    {/* Status Tabs / Rules */}
                    <div className="px-2 pt-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {responseConfigs.map(c => (
                            <div key={c.id} className="relative group">
                                <button
                                    onClick={() => setActiveRuleId(c.id)}
                                    className={`
                                    px-3 py-1.5 text-xs font-medium rounded-t-lg border-t border-l border-r relative top-[1px] flex items-center gap-2
                                    ${activeRuleId === c.id
                                            ? 'bg-white dark:bg-gray-800 text-nebula-600 dark:text-nebula-400 border-gray-200 dark:border-gray-700'
                                            : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 border-transparent hover:bg-gray-300 dark:hover:bg-gray-700'
                                        }
                                `}
                                >
                                    <span>{c.name}</span>
                                    {c.isDefault && <span className="text-[9px] bg-gray-300 dark:bg-gray-600 px-1 rounded text-gray-700 dark:text-gray-300">Default</span>}
                                </button>
                                {!c.isDefault && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRule(c.id); }}
                                        className="absolute -top-1 -right-1 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={handleAddRule} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="Add Rule"><Plus size={14} /></button>
                    </div>

                    {/* Editor Toolbar (Rule Settings + Mode + Preview) */}
                    <div className="bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Rule Name</label>
                                <input
                                    type="text"
                                    value={activeResConfig.name}
                                    onChange={(e) => updateResponseConfig(c => ({ ...c, name: e.target.value }))}
                                    className="w-full text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:border-nebula-500 focus:ring-1 focus:ring-nebula-500 outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Trigger Condition {activeResConfig.isDefault && "(Default)"}</label>
                                <input
                                    type="text"
                                    value={activeResConfig.condition}
                                    onChange={(e) => updateResponseConfig(c => ({ ...c, condition: e.target.value }))}
                                    disabled={activeResConfig.isDefault}
                                    placeholder="e.g. 200"
                                    className={`w-full text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:border-nebula-500 focus:ring-1 focus:ring-nebula-500 outline-none ${activeResConfig.isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
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

                            <button
                                onClick={() => setShowPreview(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded text-xs font-medium transition-colors"
                            >
                                <Play size={12} /> Preview
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

                    {/* Preview Modal */}
                    {showPreview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl h-[500px] flex flex-col overflow-hidden">
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        <Play size={14} className="text-green-500" /> Preview Transformation
                                    </h3>
                                    <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700"><X size={16} /></button>
                                </div>
                                <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700 overflow-hidden">
                                    <div className="flex-1 flex flex-col p-2 bg-gray-50 dark:bg-gray-900/50">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">Input (Native Response)</label>
                                        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                                            <MonacoEditor language="json" value={previewInput} onChange={(v) => setPreviewInput(v || '')} />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col p-2 bg-white dark:bg-gray-900">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">Output (Encapsulated)</label>
                                        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded overflow-hidden relative">
                                            {previewError ? (
                                                <div className="p-4 text-red-500 text-xs font-mono whitespace-pre-wrap">{previewError}</div>
                                            ) : (
                                                <MonacoEditor language="json" value={previewResult} readOnly={true} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
                                    <button onClick={runPreview} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold flex items-center gap-2">
                                        <Play size={14} /> Run Transformation
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ResponseEditor;
