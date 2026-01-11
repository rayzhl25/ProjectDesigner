import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

import { ResponseNode } from './types';

interface ResponseSchemaEditorProps {
    schema: ResponseNode[];
    onChange: (schema: ResponseNode[]) => void;
    texts: any;
}

const ResponseSchemaEditor: React.FC<ResponseSchemaEditorProps> = ({ schema, onChange, texts }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'root_err']));

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
                                    onChange={(e) => onChange(updateSchemaNode(schema, node.id, 'targetKey', e.target.value))}
                                    className={`bg-transparent outline-none border-b border-transparent focus:border-nebula-500 w-32 ${isRoot ? 'font-bold text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                                    readOnly={isRoot}
                                />
                            </div>
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <select
                                value={node.type}
                                onChange={(e) => onChange(updateSchemaNode(schema, node.id, 'type', e.target.value))}
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
                                onChange={(e) => onChange(updateSchemaNode(schema, node.id, 'mock', e.target.value))}
                                className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 placeholder-gray-300 text-gray-600 dark:text-gray-400"
                                placeholder="Mock Val"
                            />
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                                type="text"
                                value={node.sourcePath}
                                onChange={(e) => onChange(updateSchemaNode(schema, node.id, 'sourcePath', e.target.value))}
                                className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 font-mono text-xs text-gray-500"
                                placeholder="$"
                            />
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <input
                                type="text"
                                value={node.desc}
                                onChange={(e) => onChange(updateSchemaNode(schema, node.id, 'desc', e.target.value))}
                                className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500"
                                placeholder="Description"
                            />
                        </td>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                {(node.type === 'object' || node.type === 'array') && (
                                    <button onClick={() => {
                                        onChange(addSchemaChild(schema, node.id));
                                        if (!isExpanded) toggleNodeExpand(node.id);
                                    }} className="text-nebula-600 hover:text-nebula-700" title={texts.addChild}>
                                        <Plus size={14} />
                                    </button>
                                )}
                                {!isRoot && (
                                    <button onClick={() => onChange(deleteSchemaNode(schema, node.id))} className="text-gray-400 hover:text-red-500">
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
        <div className="h-full overflow-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 text-xs text-gray-500 font-medium">
                    <tr>
                        <th className="p-2 pl-4 border-b border-gray-200 dark:border-gray-700 w-1/4">{texts.key}</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-20">{texts.type}</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-1/5">{texts.mockValue}</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-1/5">{texts.sourcePath}</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">{texts.desc}</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {renderSchemaTree(schema)}
                </tbody>
            </table>
        </div>
    );
};

export default ResponseSchemaEditor;
