import React, { useState, useEffect, useRef } from 'react';
import {
    Save, Globe, Shield, Box, FileUp, Server, Info, Settings, Trash2
} from 'lucide-react';
import { saveSystemConfig } from '../../../services/mockService';
import TagInput from '../../common/TagInput';

// Import Shared Components
import { texts } from './common/texts';
import { AuthConfig, JavaHookConfig } from './common/types';
import AuthEditor from './common/AuthEditor';
import HookEditor from './common/HookEditor';

interface SystemConfigEditorProps {
    file: any;
    lang?: 'zh' | 'en';
}

interface EnvParam {
    id: string;
    key: string;
    testValue: string;
    prodValue: string;
    description: string;
}

const SystemConfigEditor: React.FC<SystemConfigEditorProps> = ({ file, lang = 'zh' }) => {
    const [activeTab, setActiveTab] = useState<'basic' | 'env' | 'auth' | 'hooks'>('basic');
    const [tags, setTags] = useState<string[]>(['ERP', 'Legacy']);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // JSON Modal State
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [jsonContent, setJsonContent] = useState('');
    const [copied, setCopied] = useState(false);

    const t = texts[lang || 'zh'];

    // Form State
    const [config, setConfig] = useState({
        name: file?.title || 'New System',
        description: 'Main enterprise resource planning system connection.',
        testUrl: 'https://test-api.example.com',
        prodUrl: 'https://api.example.com',

        authConfig: {
            type: 'bearer',
            config: {
                authKey: '',
                authSecret: '',
                apiKey: { location: 'header', key: 'X-API-Key', value: '' },
                jwt: { location: 'header', algo: 'HS256', secret: '', isBase64: false, payload: '{\n  "iss": "nebula",\n  "exp": 1719999999\n}', headerName: 'Authorization', prefix: 'Bearer', customHeader: '' },
                oauth2: { grantType: 'authorization_code', clientId: '', clientSecret: '', authUrl: '', tokenUrl: '', redirectUrl: '', scope: '', username: '', password: '' },
                customAuth: { enabled: true, className: '', methodName: '', args: {} }
            }
        } as AuthConfig,

        // Global Hooks
        preAction: { enabled: false, className: '', methodName: '', args: {} } as JavaHookConfig,
        postAction: { enabled: false, className: '', methodName: '', args: {} } as JavaHookConfig
    });

    const [envParams, setEnvParams] = useState<EnvParam[]>([
        { id: '1', key: 'API_TIMEOUT', testValue: '5000', prodValue: '3000', description: 'Request timeout in ms' },
        { id: '2', key: 'MAX_RETRIES', testValue: '3', prodValue: '1', description: 'Retry count' }
    ]);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (file?.title && config.name === 'New System') {
            setConfig(prev => ({ ...prev, name: file.title }));
        }
    }, [file]);

    const updateHook = (type: 'preAction' | 'postAction', updates: JavaHookConfig) => {
        setConfig(prev => ({
            ...prev,
            [type]: updates
        }));
    };

    const addEnvParam = () => {
        setEnvParams([...envParams, { id: Date.now().toString(), key: '', testValue: '', prodValue: '', description: '' }]);
    };

    const updateEnvParam = (id: string, field: keyof EnvParam, value: string) => {
        setEnvParams(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const deleteEnvParam = (id: string) => {
        setEnvParams(prev => prev.filter(p => p.id !== id));
    };

    // --- Save Logic ---
    const handleSave = async () => {
        setIsSaving(true);
        const payload = {
            ...config,
            tags,
            envParams,
            lastModified: new Date().toISOString()
        };

        setJsonContent(JSON.stringify(payload, null, 2));
        setShowJsonModal(true);

        try {
            await saveSystemConfig(payload);
        } catch (e) {
            console.error(e);
            alert('Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyJson = () => {
        navigator.clipboard.writeText(jsonContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- File Import Logic ---
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTimeout(() => {
                alert(t.importSuccess);
            }, 500);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-sm">
            {/* Toolbar */}
            <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Server size={18} className="text-purple-500" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">{config.name}</span>
                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs px-2 py-0.5 rounded">External System</span>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-nebula-600 text-white rounded hover:bg-nebula-700 text-xs font-medium transition-colors disabled:opacity-50"
                >
                    <Save size={14} /> {isSaving ? t.saving : t.save}
                </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex gap-6">
                {[
                    { id: 'basic', label: t.info, icon: Info },
                    { id: 'env', label: t.systemUrl, icon: Globe }, // Reusing localized key, slightly hacky but effectively 'Environments' concept in texts? No, let's stick to texts['environments'] if exists or fallback
                    { id: 'auth', label: t.auth, icon: Shield },
                    { id: 'hooks', label: t.enableHook, icon: Box }, // using "Enable Hook" text as Label might be weird. 'Hooks' is better? t.pre + t.post?
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-nebula-600 text-nebula-600 dark:text-nebula-400 font-medium'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <tab.icon size={16} />
                        {/* Correct labels mapping */}
                        {tab.id === 'basic' ? t.info :
                            tab.id === 'env' ? (lang === 'zh' ? '环境配置' : 'Environments') :
                                tab.id === 'auth' ? t.auth :
                                    (lang === 'zh' ? '调用Hook' : 'Invoke Hook')}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.basicName}</label>
                                <input
                                    type="text"
                                    value={config.name}
                                    onChange={e => setConfig({ ...config, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.basicTags}</label>
                                <TagInput tags={tags} onChange={setTags} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.desc}</label>
                                <textarea
                                    value={config.description}
                                    onChange={e => setConfig({ ...config, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.importSuccess}</label>
                                <div
                                    onClick={handleImportClick}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-nebula-500 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all"
                                >
                                    <FileUp size={24} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.dragFile}</span>
                                    <span className="text-xs text-gray-400 mt-1">Supports OpenAPI (Swagger) JSON/YAML</span>
                                    <input ref={fileInputRef} type="file" className="hidden" accept=".json,.yaml,.yml" onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Environments Tab */}
                    {activeTab === 'env' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Base URLs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Test Env
                                        </label>
                                        <input
                                            type="text"
                                            value={config.testUrl}
                                            onChange={e => setConfig({ ...config, testUrl: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none font-mono text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Prod Env
                                        </label>
                                        <input
                                            type="text"
                                            value={config.prodUrl}
                                            onChange={e => setConfig({ ...config, prodUrl: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.argsConfig}</h3>
                                    <button onClick={addEnvParam} className="text-xs text-nebula-600 hover:text-nebula-700 font-medium">+ {t.addStatus}</button>
                                </div>

                                <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
                                            <tr>
                                                <th className="p-3 w-1/4">{t.key}</th>
                                                <th className="p-3 w-1/4">Test Val</th>
                                                <th className="p-3 w-1/4">Prod Val</th>
                                                <th className="p-3">{t.desc}</th>
                                                <th className="p-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {envParams.map(p => (
                                                <tr key={p.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="p-2"><input type="text" value={p.key} onChange={e => updateEnvParam(p.id, 'key', e.target.value)} className="w-full bg-transparent outline-none font-bold text-gray-700 dark:text-gray-200" placeholder="KEY_NAME" /></td>
                                                    <td className="p-2"><input type="text" value={p.testValue} onChange={e => updateEnvParam(p.id, 'testValue', e.target.value)} className="w-full bg-transparent outline-none font-mono text-gray-600" placeholder="Value..." /></td>
                                                    <td className="p-2"><input type="text" value={p.prodValue} onChange={e => updateEnvParam(p.id, 'prodValue', e.target.value)} className="w-full bg-transparent outline-none font-mono text-gray-600" placeholder="Value..." /></td>
                                                    <td className="p-2"><input type="text" value={p.description} onChange={e => updateEnvParam(p.id, 'description', e.target.value)} className="w-full bg-transparent outline-none text-gray-500" placeholder="Description..." /></td>
                                                    <td className="p-2 text-center">
                                                        <button onClick={() => deleteEnvParam(p.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Auth Tab */}
                    {activeTab === 'auth' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <AuthEditor
                                authConfig={config.authConfig}
                                onChange={(newAuth) => setConfig({ ...config, authConfig: newAuth })}
                                allowInherit={false}
                                texts={t}
                            />
                        </div>
                    )}

                    {/* Hooks Tab */}
                    {activeTab === 'hooks' && (
                        <div className="space-y-6">
                            <HookEditor
                                label="Global Pre-request Operation"
                                config={config.preAction}
                                onChange={(u) => updateHook('preAction', u)}
                                texts={t}
                                headerIcon={true}
                            />
                            <HookEditor
                                label="Global Post-request Operation"
                                config={config.postAction}
                                onChange={(u) => updateHook('postAction', u)}
                                texts={t}
                                headerIcon={true}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* JSON Preview Modal */}
            {showJsonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                            <h3 className="font-bold text-gray-800 dark:text-white">Configuration JSON Preview</h3>
                            <button onClick={() => setShowJsonModal(false)} className="text-gray-400 hover:text-gray-600"><Settings size={18} /></button>
                        </div>
                        <div className="flex-1 p-0 relative bg-gray-900 overflow-auto">
                            <pre className="text-xs text-green-400 font-mono p-4">{jsonContent}</pre>
                            <button
                                onClick={handleCopyJson}
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-all"
                            >
                                {copied ? <Settings size={16} className="text-green-400" /> : <Settings size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemConfigEditor;
