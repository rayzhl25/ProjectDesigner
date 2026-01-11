import React from 'react';
import { Trash2, Plus, Edit3 } from 'lucide-react';
import { Param } from './types';

interface ParamTableProps {
    data: Param[];
    onChange: (data: Param[]) => void;
    showType?: boolean;
    isPathParams?: boolean;
    onBatchEdit?: () => void;
    texts: any;
}

const ParamTable: React.FC<ParamTableProps> = ({
    data,
    onChange,
    showType = true,
    isPathParams = false,
    onBatchEdit,
    texts
}) => {

    const updateP = (id: string, field: keyof Param, value: any) => {
        onChange(data.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removeP = (id: string) => {
        onChange(data.filter(p => p.id !== id));
    };

    const addParam = () => {
        const newParam: Param = {
            id: Date.now().toString(),
            key: isPathParams ? 'newParam' : '',
            type: 'string',
            required: isPathParams,
            value: '',
            desc: ''
        };
        onChange([...data, newParam]);
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="p-2 w-1/4">{texts.key}</th>
                        {showType && <th className="p-2 w-24">{texts.type}</th>}
                        <th className="p-2 w-10 text-center">{texts.required}</th>
                        <th className="p-2 w-1/4">{texts.example}</th>
                        <th className="p-2">{texts.desc}</th>
                        <th className="p-2 w-8"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.map(item => (
                        <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="p-2">
                                <input type="text" value={item.key} onChange={(e) => updateP(item.id, 'key', e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 transition-colors" placeholder="Key" />
                            </td>
                            {showType && (
                                <td className="p-2">
                                    <select value={item.type} onChange={(e) => updateP(item.id, 'type', e.target.value)} className="w-full bg-transparent outline-none text-nebula-600 dark:text-nebula-400">
                                        <option value="string">string</option>
                                        <option value="integer">integer</option>
                                        <option value="boolean">boolean</option>
                                        <option value="file">file</option>
                                    </select>
                                </td>
                            )}
                            <td className="p-2 text-center">
                                <input type="checkbox" checked={item.required} onChange={(e) => updateP(item.id, 'required', e.target.checked)} className="rounded text-nebula-600 focus:ring-nebula-500" disabled={isPathParams} />
                            </td>
                            <td className="p-2">
                                <input type="text" value={item.value} onChange={(e) => updateP(item.id, 'value', e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 transition-colors" placeholder="Value" />
                            </td>
                            <td className="p-2">
                                <input type="text" value={item.desc} onChange={(e) => updateP(item.id, 'desc', e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 transition-colors" placeholder="Desc" />
                            </td>
                            <td className="p-2 text-center">
                                <button onClick={() => removeP(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={6} className="p-2">
                            <div className="flex gap-4">
                                <button onClick={addParam} className="flex items-center gap-1 text-gray-400 hover:text-nebula-600 transition-colors text-xs"><Plus size={14} /> {texts.addParam}</button>
                                {onBatchEdit && <button onClick={onBatchEdit} className="flex items-center gap-1 text-gray-400 hover:text-nebula-600 transition-colors text-xs"><Edit3 size={14} /> {texts.batchEdit}</button>}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ParamTable;
