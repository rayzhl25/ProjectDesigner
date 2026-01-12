import React, { useState } from 'react';
import {
    Info, Shield, Settings, FileText, Plus, Edit3, Trash2
} from 'lucide-react';
import TagInput from '../../../common/TagInput';
import MonacoEditor from '../../editors/MonacoEditor';
import AuthEditor from '../common/AuthEditor';
import HookEditor from '../common/HookEditor';
import { Param, AuthConfig, JavaHookConfig } from '../common/types';

interface RequestPanelProps {
    leftWidth: number;
    activeReqTab: 'info' | 'path' | 'params' | 'body' | 'headers' | 'cookies' | 'auth' | 'hooks';
    setActiveReqTab: (tab: any) => void;
    basicInfo: { name: string; tags: string[]; description: string; usage: string; };
    setBasicInfo: (info: any) => void;
    pathParams: Param[];
    setPathParams: React.Dispatch<React.SetStateAction<Param[]>>;
    queryParams: Param[];
    setQueryParams: React.Dispatch<React.SetStateAction<Param[]>>;
    headers: Param[];
    setHeaders: React.Dispatch<React.SetStateAction<Param[]>>;
    cookies: Param[];
    setCookies: React.Dispatch<React.SetStateAction<Param[]>>;
    formDataParams: Param[];
    setFormDataParams: React.Dispatch<React.SetStateAction<Param[]>>;
    urlEncodedParams: Param[];
    setUrlEncodedParams: React.Dispatch<React.SetStateAction<Param[]>>;
    bodyType: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'json' | 'xml' | 'raw' | 'binary' | 'graphql';
    setBodyType: (type: any) => void;
    bodyContent: { json: string; xml: string; raw: string; graphqlQuery: string; graphqlVars: string; };
    setBodyContent: (content: any) => void;
    authConfig: AuthConfig;
    setAuthConfig: (config: AuthConfig) => void;
    preHook: { type: string; config: JavaHookConfig };
    setPreHook: React.Dispatch<React.SetStateAction<{ type: string; config: JavaHookConfig }>>;
    postHook: { type: string; config: JavaHookConfig };
    setPostHook: React.Dispatch<React.SetStateAction<{ type: string; config: JavaHookConfig }>>;
    urlConfig: { path: string };
    setUrlConfig: React.Dispatch<React.SetStateAction<any>>;
    t: any;
}

// --- ParamTable Component ---
interface ParamTableProps {
    data: Param[];
    setter: React.Dispatch<React.SetStateAction<Param[]>>;
    showType?: boolean;
    t: any;
    onBatchEdit?: () => void;
    listName?: string;
    // Special prop for Path Params URL sync
    isPathParams?: boolean;
    setUrlConfig?: React.Dispatch<React.SetStateAction<any>>;
}

const ParamTable: React.FC<ParamTableProps> = ({ data, setter, showType = true, t, onBatchEdit, listName, isPathParams, setUrlConfig }) => {
    // Handlers
    const addParam = () => {
        const newKey = isPathParams ? 'newParam' : '';
        const newParam: Param = { id: Date.now().toString(), key: newKey, type: 'string', required: isPathParams ? true : false, value: '', desc: '' };

        setter(prev => [...prev, newParam]);

        if (isPathParams && setUrlConfig) {
            setUrlConfig((prev: any) => ({
                ...prev,
                path: prev.path.endsWith('/') ? `${prev.path}:${newKey}` : `${prev.path}/:${newKey}`
            }));
        }
    };

    const updateP = (id: string, f: keyof Param, v: any) => {
        setter(prev => {
            const newParams = prev.map(p => p.id === id ? { ...p, [f]: v } : p);

            if (isPathParams && f === 'key' && setUrlConfig) {
                const oldParam = prev.find(p => p.id === id);
                if (oldParam) {
                    const oldKey = oldParam.key;
                    setUrlConfig((curr: any) => ({
                        ...curr,
                        path: curr.path.replace(`/:${oldKey}`, `/:${v}`)
                    }));
                }
            }
            return newParams;
        });
    };

    const removeP = (id: string) => {
        const paramToRemove = data.find(p => p.id === id);
        setter(prev => prev.filter(p => p.id !== id));

        if (isPathParams && paramToRemove && setUrlConfig) {
            setUrlConfig((curr: any) => ({
                ...curr,
                path: curr.path.replace(`/:${paramToRemove.key}`, '')
            }));
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="p-2 w-1/4">{t.key}</th>
                        {showType && <th className="p-2 w-24">{t.type}</th>}
                        <th className="p-2 w-10 text-center">{t.required}</th>
                        <th className="p-2 w-1/4">{t.example}</th>
                        <th className="p-2">{t.desc}</th>
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
                                <button onClick={addParam} className="flex items-center gap-1 text-gray-400 hover:text-nebula-600 transition-colors text-xs"><Plus size={14} /> {t.addParam}</button>
                                {onBatchEdit && <button onClick={onBatchEdit} className="flex items-center gap-1 text-gray-400 hover:text-nebula-600 transition-colors text-xs"><Edit3 size={14} /> {t.batchEdit}</button>}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const RequestPanel: React.FC<RequestPanelProps> = ({
    leftWidth,
    activeReqTab,
    setActiveReqTab,
    basicInfo,
    setBasicInfo,
    pathParams,
    setPathParams,
    queryParams,
    setQueryParams,
    headers,
    setHeaders,
    cookies,
    setCookies,
    formDataParams,
    setFormDataParams,
    urlEncodedParams,
    setUrlEncodedParams,
    bodyType,
    setBodyType,
    bodyContent,
    setBodyContent,
    authConfig,
    setAuthConfig,
    preHook,
    setPreHook,
    postHook,
    setPostHook,
    urlConfig,
    setUrlConfig,
    t
}) => {
    const [rawType, setRawType] = useState('text');

    // Batch Edit State (Moved locally)
    const [batchModal, setBatchModal] = useState<{ isOpen: boolean, type: string, content: string, mode: 'comma' | 'colon' }>({
        isOpen: false,
        type: '',
        content: '',
        mode: 'comma'
    });

    // Helper to update hook state from HookEditor
    const updateHookState = (
        current: { type: string, config: JavaHookConfig },
        setter: React.Dispatch<React.SetStateAction<{ type: string, config: JavaHookConfig }>>,
        newConfig?: JavaHookConfig,
        newInheritVal?: boolean
    ) => {
        if (newInheritVal !== undefined) {
            setter({ ...current, type: newInheritVal ? 'inherit' : (current.config.enabled ? 'custom' : 'none') });
        } else if (newConfig) {
            setter({
                ...current,
                config: newConfig,
                type: newConfig.enabled ? 'custom' : 'none'
            });
        }
    };

    // --- Batch Edit Handlers ---
    const handleBatchEditOpen = (type: string, data: Param[]) => {
        const mode = batchModal.mode || 'comma';
        let content = '';

        if (mode === 'colon') {
            content = data.map(p => `${p.key}: ${p.value}`).join('\n');
        } else {
            // comma mode
            content = data.map(p => `${p.key},${p.type},${p.required ? '1' : '0'},${p.value},${p.desc}`).join('\n');
        }

        setBatchModal({
            isOpen: true,
            type,
            content,
            mode
        });
    };

    const handleBatchSave = () => {
        const { type, content, mode } = batchModal;
        const lines = content.split('\n').filter(l => l.trim());
        const newParams: Param[] = lines.map((line, index) => {
            const id = `${Date.now()}_${index}`;
            if (mode === 'colon') {
                const [key, ...rest] = line.split(':');
                return {
                    id,
                    key: key.trim(),
                    value: rest.join(':').trim(),
                    type: 'string',
                    required: false,
                    desc: ''
                };
            } else {
                const parts = line.split(',');
                return {
                    id,
                    key: parts[0]?.trim() || '',
                    type: parts[1]?.trim() || 'string',
                    required: parts[2]?.trim() === '1' || parts[2]?.trim() === 'true',
                    value: parts[3]?.trim() || '',
                    desc: parts[4]?.trim() || ''
                };
            }
        });

        if (type === 'queryParams') setQueryParams(newParams);
        else if (type === 'headers') setHeaders(newParams);
        else if (type === 'cookies') setCookies(newParams);
        else if (type === 'formDataParams') setFormDataParams(newParams);
        else if (type === 'urlEncodedParams') setUrlEncodedParams(newParams);

        setBatchModal({ ...batchModal, isOpen: false });
    };

    return (
        <div
            className="flex flex-col border-gray-200 dark:border-gray-700 min-w-[450px] h-full"
            style={{ width: `${leftWidth}%` }}
        >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 overflow-x-auto no-scrollbar">
                {[
                    { id: 'info', label: t.info, icon: Info },
                    { id: 'path', label: t.path, count: pathParams.length },
                    { id: 'params', label: t.params, count: queryParams.length },
                    { id: 'body', label: t.body, dot: bodyType !== 'none' },
                    { id: 'headers', label: t.headers, count: headers.length },
                    { id: 'cookies', label: t.cookies, count: cookies.length },
                    { id: 'auth', label: t.auth, icon: Shield },
                    { id: 'hooks', label: t.hooks, icon: Settings },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveReqTab(tab.id as any)}
                        className={`
                            px-3 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5
                            ${activeReqTab === tab.id ? 'border-nebula-600 text-nebula-600 dark:text-nebula-400 bg-gray-50 dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
                        `}
                    >
                        {tab.icon && <tab.icon size={12} />}
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 rounded-full text-[10px]">{tab.count}</span>}
                        {tab.dot && <span className="w-1.5 h-1.5 rounded-full bg-nebula-500"></span>}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                {activeReqTab === 'info' && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.basicName}</label><input type="text" value={basicInfo.name} onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.basicTags}</label><TagInput tags={basicInfo.tags} onChange={tags => setBasicInfo({ ...basicInfo, tags })} /></div>
                        </div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.basicDesc}</label><textarea value={basicInfo.description} onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm h-20" /></div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.basicUsage}</label>
                            <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                <MonacoEditor
                                    language="markdown"
                                    value={basicInfo.usage}
                                    onChange={(v) => setBasicInfo({ ...basicInfo, usage: v || '' })}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {activeReqTab === 'path' && <ParamTable data={pathParams} setter={setPathParams} showType={false} t={t} isPathParams={true} setUrlConfig={setUrlConfig} />}
                {activeReqTab === 'params' && <ParamTable data={queryParams} setter={setQueryParams} t={t} onBatchEdit={() => handleBatchEditOpen('queryParams', queryParams)} />}
                {activeReqTab === 'headers' && <ParamTable data={headers} setter={setHeaders} t={t} onBatchEdit={() => handleBatchEditOpen('headers', headers)} />}
                {activeReqTab === 'cookies' && <ParamTable data={cookies} setter={setCookies} t={t} onBatchEdit={() => handleBatchEditOpen('cookies', cookies)} />}
                {activeReqTab === 'body' && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4 text-xs overflow-x-auto pb-1 border-b border-gray-100 dark:border-gray-800">
                            {['none', 'form-data', 'x-www-form-urlencoded', 'json', 'xml', 'raw', 'binary', 'graphql'].map(type => (
                                <label key={type} className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors">
                                    <input type="radio" name="bodyType" checked={bodyType === type} onChange={() => setBodyType(type as any)} className="text-nebula-600 focus:ring-nebula-500" />
                                    <span className={`capitalize ${bodyType === type ? 'text-gray-800 dark:text-white font-bold' : 'text-gray-500'}`}>
                                        {type === 'x-www-form-urlencoded' ? 'x-www-form' : type}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            {bodyType === 'none' && <div className="flex h-full items-center justify-center text-gray-400 italic text-xs">No Body Content</div>}
                            {bodyType === 'json' && <div className="h-full border border-gray-200 dark:border-gray-700 rounded overflow-hidden"><MonacoEditor language="json" value={bodyContent.json} onChange={(v) => setBodyContent({ ...bodyContent, json: v || '' })} /></div>}
                            {bodyType === 'xml' && <div className="h-full border border-gray-200 dark:border-gray-700 rounded overflow-hidden"><MonacoEditor language="xml" value={bodyContent.xml} onChange={(v) => setBodyContent({ ...bodyContent, xml: v || '' })} /></div>}
                            {bodyType === 'raw' && (
                                <div className="h-full flex flex-col gap-2">
                                    <div className="flex justify-end">
                                        <select value={rawType} onChange={e => setRawType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800">
                                            <option value="text">Text</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="json">JSON</option>
                                            <option value="html">HTML</option>
                                            <option value="xml">XML</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                                        <MonacoEditor language={rawType} value={bodyContent.raw} onChange={(v) => setBodyContent({ ...bodyContent, raw: v || '' })} />
                                    </div>
                                </div>
                            )}
                            {bodyType === 'binary' && (
                                <div className="h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                                    <FileText size={40} className="mb-2 opacity-50" />
                                    <span className="text-sm">{t.dragFile}</span>
                                </div>
                            )}
                            {bodyType === 'graphql' && (
                                <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col h-full">
                                        <label className="text-xs font-bold text-gray-500 mb-1">Query</label>
                                        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                                            <MonacoEditor language="graphql" value={bodyContent.graphqlQuery} onChange={(v) => setBodyContent({ ...bodyContent, graphqlQuery: v || '' })} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col h-full">
                                        <label className="text-xs font-bold text-gray-500 mb-1">Variables</label>
                                        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                                            <MonacoEditor language="json" value={bodyContent.graphqlVars} onChange={(v) => setBodyContent({ ...bodyContent, graphqlVars: v || '' })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {bodyType === 'form-data' && <ParamTable data={formDataParams} setter={setFormDataParams} t={t} onBatchEdit={() => handleBatchEditOpen('formDataParams', formDataParams)} />}
                            {bodyType === 'x-www-form-urlencoded' && <ParamTable data={urlEncodedParams} setter={setUrlEncodedParams} showType={false} t={t} onBatchEdit={() => handleBatchEditOpen('urlEncodedParams', urlEncodedParams)} />}
                        </div>
                    </div>
                )}
                {activeReqTab === 'auth' && (
                    <div className="space-y-4">
                        <AuthEditor
                            authConfig={authConfig}
                            onChange={setAuthConfig}
                            allowInherit={true}
                            texts={t}
                        />
                    </div>
                )}
                {activeReqTab === 'hooks' && (
                    <div className="space-y-8">
                        <HookEditor
                            label={t.pre} // "Pre-request"
                            config={preHook.config}
                            onChange={(cfg) => updateHookState(preHook, setPreHook, cfg)}
                            allowInherit={true}
                            inheritValue={preHook.type === 'inherit'}
                            onInheritChange={(val) => updateHookState(preHook, setPreHook, undefined, val)}
                            texts={t}
                            headerIcon={true}
                        />
                        <HookEditor
                            label={t.post} // "Post-request"
                            config={postHook.config}
                            onChange={(cfg) => updateHookState(postHook, setPostHook, cfg)}
                            allowInherit={true}
                            inheritValue={postHook.type === 'inherit'}
                            onInheritChange={(val) => updateHookState(postHook, setPostHook, undefined, val)}
                            texts={t}
                            headerIcon={true}
                        />
                    </div>
                )}
            </div>

            {/* Batch Edit Modal - Improved Height */}
            {batchModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-4">
                                <h3 className="font-bold text-gray-800 dark:text-white">{t.batchEdit}</h3>
                                <div className="flex bg-gray-200 dark:bg-gray-700 rounded p-0.5">
                                    <button onClick={() => setBatchModal({ ...batchModal, mode: 'comma' })} className={`px-3 py-1 text-xs rounded transition-colors ${batchModal.mode === 'comma' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white' : 'text-gray-500'}`}>{t.commaMode}</button>
                                    <button onClick={() => setBatchModal({ ...batchModal, mode: 'colon' })} className={`px-3 py-1 text-xs rounded transition-colors ${batchModal.mode === 'colon' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white' : 'text-gray-500'}`}>{t.colonMode}</button>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{batchModal.mode === 'comma' ? t.batchFormatComma : t.batchFormatColon}</div>
                        </div>
                        <div className="flex-1 p-0 relative">
                            <textarea
                                value={batchModal.content}
                                onChange={(e) => setBatchModal({ ...batchModal, content: e.target.value })}
                                className="w-full h-full p-4 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-xs outline-none border-none"
                                placeholder={batchModal.mode === 'comma' ? "key,string,1,value,desc..." : "key: value..."}
                                rows={20}
                            />
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                            <button onClick={() => setBatchModal({ ...batchModal, isOpen: false })} className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">{t.cancel}</button>
                            <button onClick={handleBatchSave} className="px-4 py-2 rounded bg-nebula-600 text-white hover:bg-nebula-700 text-sm font-medium">{t.confirm}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestPanel;
