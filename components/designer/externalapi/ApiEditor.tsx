import React, { useState, useEffect } from 'react';
import {
    Save, Play, Info, Shield, Code2, Plus,
    ChevronRight, ChevronDown
} from 'lucide-react';
import { saveApiConfig } from '../../../services/mockService';
import MonacoEditor from '../editors/MonacoEditor';
import TagInput from '../../common/TagInput';
import RichTextEditor from '../../common/RichTextEditor';

import { texts } from './common/texts';
import { Param, ResponseNode, StatusCodeConfig, AuthConfig, JavaHookConfig } from './common/types';
import ParamTable from './common/ParamTable';
import AuthEditor from './common/AuthEditor';
import HookEditor from './common/HookEditor';
import ResponseSchemaEditor from './common/ResponseSchemaEditor';

interface ApiEditorProps {
    file: any;
    lang?: 'zh' | 'en';
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const METHOD_COLORS: Record<string, string> = {
    GET: 'text-green-600 bg-green-50 border-green-200',
    POST: 'text-blue-600 bg-blue-50 border-blue-200',
    PUT: 'text-orange-600 bg-orange-50 border-orange-200',
    DELETE: 'text-red-600 bg-red-50 border-red-200',
    PATCH: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    DEFAULT: 'text-gray-600 bg-gray-50 border-gray-200'
};

const ApiEditor: React.FC<ApiEditorProps> = ({ file, lang = 'zh' }) => {
    const t = texts[lang || 'zh'];

    // --- State ---
    const [name, setName] = useState(file?.title || 'New API');
    const [tags, setTags] = useState<string[]>(['API']);
    const [description, setDescription] = useState('');

    // Request Core
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('/api/v1/resource');
    const [baseUrl, setBaseUrl] = useState('TEST'); // TEST, PROD, MOCK, CUSTOM

    // Params
    const [pathParams, setPathParams] = useState<Param[]>([]);
    const [queryParams, setQueryParams] = useState<Param[]>([]);
    const [headers, setHeaders] = useState<Param[]>([]);
    const [cookies, setCookies] = useState<Param[]>([]);

    // Body
    const [bodyType, setBodyType] = useState('none');
    const [bodyContent, setBodyContent] = useState({
        json: '{\n  "key": "value"\n}',
        xml: '<root>\n  <key>value</key>\n</root>',
        raw: '',
        graphqlQuery: 'query {\n  user {\n    name\n  }\n}',
        graphqlVars: '{\n  "id": 1\n}'
    });
    const [formDataParams, setFormDataParams] = useState<Param[]>([]);
    const [urlEncodedParams, setUrlEncodedParams] = useState<Param[]>([]);

    // Authentication
    const [authConfig, setAuthConfig] = useState<AuthConfig>({
        type: 'inherit',
        config: {}
    });

    // Hooks (Pre/Post)
    const [preHook, setPreHook] = useState<JavaHookConfig>({ enabled: false, className: '', methodName: '', args: {} });
    const [postHook, setPostHook] = useState<JavaHookConfig>({ enabled: false, className: '', methodName: '', args: {} });
    const [inheritPreHook, setInheritPreHook] = useState(true);
    const [inheritPostHook, setInheritPostHook] = useState(true);

    // Response
    const [responseSchema, setResponseSchema] = useState<ResponseNode[]>([
        { id: 'root', targetKey: 'data', type: 'object', required: true, sourcePath: '$.data', mock: '', desc: 'Root Data', children: [] },
        { id: 'root_err', targetKey: 'error', type: 'string', required: false, sourcePath: '$.error', mock: '', desc: 'Error Message' }
    ]);
    const [statusCodes, setStatusCodes] = useState<StatusCodeConfig[]>([
        { code: '200', name: 'Success', mode: 'visual', schema: [], script: '' },
        { code: '400', name: 'Bad Request', mode: 'visual', schema: [], script: '' },
        { code: '500', name: 'Server Error', mode: 'visual', schema: [], script: '' }
    ]);
    const [activeStatusCode, setActiveStatusCode] = useState('200');

    // UI State
    const [activeTab, setActiveTab] = useState('info');
    const [isSaving, setIsSaving] = useState(false);

    // Batch Edit Modal
    const [showBatchEdit, setShowBatchEdit] = useState(false);
    const [batchEditTarget, setBatchEditTarget] = useState<'query' | 'header' | 'cookie' | 'path' | 'form-data' | 'urlencoded' | null>(null);
    const [batchContent, setBatchContent] = useState('');
    const [batchMode, setBatchMode] = useState<'comma' | 'colon'>('comma');

    // Layout
    const [leftPanelWidth, setLeftPanelWidth] = useState(60); // Percentage
    const resizeRef = React.useRef(null);

    // --- Effects ---
    useEffect(() => {
        if (file?.title && name === 'New API') {
            setName(file.title);
        }
    }, [file]);

    // --- Handlers ---
    const handleSave = async () => {
        setIsSaving(true);
        // Build payload
        const payload = {
            name, tags, description, method, url, baseUrl,
            params: { path: pathParams, query: queryParams, header: headers, cookie: cookies },
            body: { type: bodyType, content: bodyContent, formData: formDataParams, urlEncoded: urlEncodedParams },
            auth: authConfig,
            hooks: { pre: inheritPreHook ? 'inherit' : preHook, post: inheritPostHook ? 'inherit' : postHook },
            response: { schema: responseSchema, statusCodes },
            lastModified: new Date().toISOString()
        };

        try {
            await saveApiConfig(payload);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBatchEditOpen = (strType: string, currentParams: Param[]) => {
        setBatchEditTarget(strType as any);
        const text = currentParams.map(p => `${p.key},${p.type},${p.required},${p.value},${p.desc}`).join('\n');
        setBatchContent(text);
        setBatchMode('comma');
        setShowBatchEdit(true);
    };

    const handleBatchSave = () => {
        if (!batchEditTarget) return;

        const lines = batchContent.split('\n').filter(l => l.trim());
        const newParams: Param[] = lines.map((line, idx) => {
            if (batchMode === 'colon') {
                const [key, val] = line.split(':').map(s => s.trim());
                return { id: `b_${idx}`, key: key || '', type: 'string', required: false, value: val || '', desc: '' };
            } else {
                const [k, t, r, v, d] = line.split(',').map(s => s.trim());
                return {
                    id: `b_${idx}`,
                    key: k || '',
                    type: t || 'string',
                    required: r === 'true',
                    value: v || '',
                    desc: d || ''
                };
            }
        });

        const setters: Record<string, Function> = {
            'query': setQueryParams,
            'header': setHeaders,
            'cookie': setCookies,
            'path': setPathParams,
            'form-data': setFormDataParams,
            'urlencoded': setUrlEncodedParams
        };

        setters[batchEditTarget]?.(newParams);
        setShowBatchEdit(false);
    };

    // Resizer Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (resizeRef.current) {
            const containerWidth = (resizeRef.current as HTMLElement).offsetWidth;
            const newLeftWidth = (e.clientX / containerWidth) * 100;
            if (newLeftWidth > 20 && newLeftWidth < 80) {
                setLeftPanelWidth(newLeftWidth);
            }
        }
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // --- Renderers ---
    const renderBodyContent = () => {
        switch (bodyType) {
            case 'none':
                return <div className="text-gray-400 text-center py-10 italic">No Body Content</div>;
            case 'form-data':
                return (
                    <ParamTable
                        data={formDataParams}
                        onChange={setFormDataParams}
                        showType={true}
                        onBatchEdit={() => handleBatchEditOpen('form-data', formDataParams)}
                        texts={t}
                    />
                );
            case 'x-www-form-urlencoded':
                return (
                    <ParamTable
                        data={urlEncodedParams}
                        onChange={setUrlEncodedParams}
                        showType={false}
                        onBatchEdit={() => handleBatchEditOpen('urlencoded', urlEncodedParams)}
                        texts={t}
                    />
                );
            case 'json':
                return <MonacoEditor language="json" value={bodyContent.json} onChange={v => setBodyContent({ ...bodyContent, json: v })} height="300px" />;
            case 'xml':
                return <MonacoEditor language="xml" value={bodyContent.xml} onChange={v => setBodyContent({ ...bodyContent, xml: v })} height="300px" />;
            case 'raw':
                return <MonacoEditor language="text" value={bodyContent.raw} onChange={v => setBodyContent({ ...bodyContent, raw: v })} height="300px" />;
            case 'binary':
                return (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 flex flex-col items-center justify-center text-gray-500">
                        <Code2 size={40} className="mb-2 opacity-50" />
                        <span className="text-sm">{t.dragFile}</span>
                    </div>
                );
            case 'graphql':
                return (
                    <div className="grid grid-cols-2 gap-4 h-[300px]">
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-500 mb-1">Query</label>
                            <div className="flex-1 border rounded overflow-hidden border-gray-200 dark:border-gray-700">
                                <MonacoEditor language="graphql" value={bodyContent.graphqlQuery} onChange={v => setBodyContent({ ...bodyContent, graphqlQuery: v })} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-500 mb-1">Variables (JSON)</label>
                            <div className="flex-1 border rounded overflow-hidden border-gray-200 dark:border-gray-700">
                                <MonacoEditor language="json" value={bodyContent.graphqlVars} onChange={v => setBodyContent({ ...bodyContent, graphqlVars: v })} />
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-sm overflow-hidden">
            {/* Top Toolbar: Method, URL, Actions */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-3 shadow-sm z-10">
                {/* Method Selector */}
                <div className="relative w-28 flex-shrink-0">
                    <select
                        value={method}
                        onChange={e => setMethod(e.target.value)}
                        className={`w-full appearance-none pl-3 pr-8 py-2 border rounded-md font-bold text-xs outline-none focus:ring-2 focus:ring-offset-1 transition-all cursor-pointer ${METHOD_COLORS[method] || METHOD_COLORS.DEFAULT}`}
                    >
                        {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 opacity-50">
                        <ChevronDown size={12} />
                    </div>
                </div>

                {/* URL Bar Group */}
                <div className="flex-1 flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 focus-within:border-nebula-500 focus-within:ring-1 focus-within:ring-nebula-500 overflow-hidden transition-all h-9">
                    <div className="flex-shrink-0 border-r border-gray-300 dark:border-gray-600 h-full flex items-center bg-gray-100 dark:bg-gray-800">
                        <select
                            value={baseUrl}
                            onChange={e => setBaseUrl(e.target.value)}
                            className="appearance-none bg-transparent px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 outline-none cursor-pointer hover:text-gray-900 h-full"
                            style={{ textAlignLast: 'center' }}
                        >
                            <option value="TEST">TEST</option>
                            <option value="PROD">PROD</option>
                            <option value="MOCK">MOCK</option>
                            <option value="CUSTOM">{t.customUrl}</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="flex-1 px-3 py-1 bg-white dark:bg-gray-900 text-gray-800 dark:text-white outline-none text-sm font-mono h-full placeholder-gray-400"
                        placeholder="/path/to/resource"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm text-xs font-bold transition-all transform active:scale-95 whitespace-nowrap">
                        <Play size={14} fill="currentColor" /> {t.send}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-5 py-2 bg-nebula-600 hover:bg-nebula-700 text-white rounded shadow-sm text-xs font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                        <Save size={14} /> {isSaving ? t.saving : t.save}
                    </button>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden relative" ref={resizeRef}>
                {/* Left Panel: Request Config */}
                <div className="flex flex-col h-full bg-white dark:bg-gray-900" style={{ width: `${leftPanelWidth}%` }}>
                    {/* Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-gray-800 scrollbar-hide pt-2">
                        {[
                            { id: 'info', label: t.info },
                            { id: 'path', label: t.path },
                            { id: 'params', label: t.params },
                            { id: 'body', label: t.body },
                            { id: 'headers', label: t.headers },
                            { id: 'cookies', label: t.cookies },
                            { id: 'auth', label: t.auth },
                            { id: 'pre', label: t.pre },
                            { id: 'post', label: t.post },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-nebula-600 text-nebula-600 dark:text-nebula-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {activeTab === 'info' && (
                            <div className="space-y-6 max-w-4xl">
                                {/* Name & Tags Row */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex gap-6">
                                        <div className="flex-1 space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500">{t.basicName}</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-nebula-500 outline-none transition-shadow"
                                                placeholder={t.basicName}
                                            />
                                        </div>
                                        <div className="w-1/3 space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500">{t.basicTags}</label>
                                            <div className="min-h-[38px]">
                                                <TagInput tags={tags} onChange={setTags} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500">{t.basicDesc}</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-nebula-500 outline-none transition-shadow resize-y"
                                            placeholder="..."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500">{t.basicUsage}</label>
                                        <div className="h-[400px] border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white">
                                            <RichTextEditor content="" onChange={() => { }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'path' && <ParamTable data={pathParams} onChange={setPathParams} isPathParams={true} showType={false} texts={t} />}
                        {activeTab === 'params' && <ParamTable data={queryParams} onChange={setQueryParams} onBatchEdit={() => handleBatchEditOpen('query', queryParams)} texts={t} />}
                        {activeTab === 'headers' && <ParamTable data={headers} onChange={setHeaders} onBatchEdit={() => handleBatchEditOpen('header', headers)} texts={t} />}
                        {activeTab === 'cookies' && <ParamTable data={cookies} onChange={setCookies} onBatchEdit={() => handleBatchEditOpen('cookie', cookies)} texts={t} />}

                        {activeTab === 'auth' && (
                            <AuthEditor
                                authConfig={authConfig}
                                onChange={setAuthConfig}
                                allowInherit={true}
                                texts={t}
                            />
                        )}

                        {activeTab === 'body' && (
                            <div className="space-y-4 h-full flex flex-col">
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    {['none', 'form-data', 'x-www-form-urlencoded', 'json', 'xml', 'raw', 'binary', 'graphql'].map(bt => (
                                        <label key={bt} className="flex items-center gap-1.5 cursor-pointer hover:text-nebula-600 transition-colors">
                                            <input
                                                type="radio"
                                                name="bodyType"
                                                checked={bodyType === bt}
                                                onChange={() => setBodyType(bt)}
                                                className="text-nebula-600 focus:ring-nebula-500"
                                            />
                                            <span>{bt === 'x-www-form-urlencoded' ? 'x-www-form' : bt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex-1 overflow-auto">
                                    {renderBodyContent()}
                                </div>
                            </div>
                        )}

                        {activeTab === 'pre' && (
                            <HookEditor
                                label={t.pre}
                                config={preHook}
                                inheritValue={inheritPreHook}
                                onInheritChange={setInheritPreHook}
                                onChange={setPreHook}
                                texts={t}
                            />
                        )}

                        {activeTab === 'post' && (
                            <HookEditor
                                label={t.post}
                                config={postHook}
                                inheritValue={inheritPostHook}
                                onInheritChange={setInheritPostHook}
                                onChange={setPostHook}
                                texts={t}
                            />
                        )}
                    </div>
                </div>

                {/* Resizer */}
                <div
                    className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-nebula-500 cursor-col-resize flex items-center justify-center transition-colors z-10"
                    onMouseDown={handleMouseDown}
                >
                    <div className="h-4 w-0.5 bg-gray-400 rounded-full" />
                </div>

                {/* Right Panel: Response & Schema */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-nebula-600 dark:text-nebula-400 font-bold text-xs uppercase tracking-wide">
                            <Code2 size={16} />
                            <span>{t.responseTransform || 'Response'}</span>
                        </div>
                    </div>

                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto">
                        {(['200', '400', '500'] as const).map(code => (
                            <button
                                key={code}
                                onClick={() => setActiveStatusCode(code)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${activeStatusCode === code
                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                    }`}
                            >
                                {code} {statusCodes.find(s => s.code === code)?.name}
                            </button>
                        ))}
                        <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-nebula-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
                            <ResponseSchemaEditor
                                schema={responseSchema}
                                onChange={setResponseSchema}
                                texts={t}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Edit Modal */}
            {showBatchEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 dark:text-white">{t.batchEdit} - {batchEditTarget}</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4 text-xs">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" checked={batchMode === 'comma'} onChange={() => setBatchMode('comma')} />
                                    {t.commaMode}
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" checked={batchMode === 'colon'} onChange={() => setBatchMode('colon')} />
                                    {t.colonMode}
                                </label>
                            </div>
                            <p className="text-[10px] text-gray-500">{batchMode === 'comma' ? t.batchFormatComma : t.batchFormatColon}</p>
                            <textarea
                                value={batchContent}
                                onChange={e => setBatchContent(e.target.value)}
                                rows={10}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 font-mono text-xs outline-none focus:border-nebula-500"
                            />
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800">
                            <button onClick={() => setShowBatchEdit(false)} className="px-3 py-1.5 text-xs text-gray-600 font-medium hover:bg-gray-200 rounded">{t.cancel}</button>
                            <button onClick={handleBatchSave} className="px-3 py-1.5 text-xs bg-nebula-600 text-white font-medium hover:bg-nebula-700 rounded">{t.confirm}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiEditor;
