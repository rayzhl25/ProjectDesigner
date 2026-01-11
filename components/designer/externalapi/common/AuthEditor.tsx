import React from 'react';
import { AuthConfig } from './types';
import { AUTH_TYPES } from './constants';
import HookEditor from './HookEditor';

interface AuthEditorProps {
    authConfig: AuthConfig;
    onChange: (config: AuthConfig) => void;
    allowInherit?: boolean;
    texts?: any;
}

const AuthEditor: React.FC<AuthEditorProps> = ({
    authConfig,
    onChange,
    allowInherit = false,
    texts = {}
}) => {
    const config = authConfig.config;
    const updateConfig = (updates: any) => onChange({ ...authConfig, config: { ...config, ...updates } });

    // Styles
    const selectClass = "w-full appearance-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:border-nebula-500 focus:ring-1 focus:ring-nebula-500 transition-all text-sm";
    const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:border-nebula-500 text-sm focus:ring-1 focus:ring-nebula-500 transition-all";
    const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";
    const selectWrapperClass = "relative";
    const SelectChevron = () => (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </div>
    );

    const availableAuthTypes = allowInherit
        ? [{ value: 'inherit', label: texts.inheritSys || 'Inherit System' }, ...AUTH_TYPES]
        : AUTH_TYPES;

    const renderAuthDetails = () => {
        switch (authConfig.type) {
            case 'bearer':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div>
                            <label className={labelClass}>Token</label>
                            <input
                                type="password"
                                value={config.authKey}
                                onChange={e => updateConfig({ authKey: e.target.value })}
                                className={inputClass}
                                placeholder="Bearer Token..."
                            />
                        </div>
                    </div>
                );
            case 'basic':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Username</label>
                                <input
                                    type="text"
                                    value={config.authKey}
                                    onChange={e => updateConfig({ authKey: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Password</label>
                                <input
                                    type="password"
                                    value={config.authSecret}
                                    onChange={e => updateConfig({ authSecret: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'apikey':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div>
                            <label className={labelClass}>Location</label>
                            <div className={selectWrapperClass}>
                                <select
                                    value={config.apiKey?.location || 'header'}
                                    onChange={e => updateConfig({ apiKey: { ...config.apiKey, location: e.target.value } })}
                                    className={selectClass}
                                >
                                    <option value="header">Header</option>
                                    <option value="query">Query Params</option>
                                    <option value="cookie">Cookie</option>
                                </select>
                                <SelectChevron />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Key Name</label>
                                <input
                                    type="text"
                                    value={config.apiKey?.key || ''}
                                    onChange={e => updateConfig({ apiKey: { ...config.apiKey, key: e.target.value } })}
                                    className={inputClass}
                                    placeholder="e.g. X-API-Key"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Value</label>
                                <input
                                    type="text"
                                    value={config.apiKey?.value || ''}
                                    onChange={e => updateConfig({ apiKey: { ...config.apiKey, value: e.target.value } })}
                                    className={inputClass}
                                    placeholder="Value..."
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'jwt':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* Header Config */}
                        <div className="p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Transport</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Add To</label>
                                    <div className={selectWrapperClass}>
                                        <select
                                            value={config.jwt?.location || 'header'}
                                            onChange={e => updateConfig({ jwt: { ...config.jwt, location: e.target.value } })}
                                            className={selectClass}
                                        >
                                            <option value="header">Header</option>
                                            <option value="query">Query</option>
                                        </select>
                                        <SelectChevron />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Header Prefix</label>
                                    <input
                                        type="text"
                                        value={config.jwt?.prefix || ''}
                                        onChange={e => updateConfig({ jwt: { ...config.jwt, prefix: e.target.value } })}
                                        className={inputClass}
                                        placeholder="e.g. Bearer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Algorithm Config */}
                        <div className="p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 space-y-4">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Signing</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Algorithm</label>
                                    <div className={selectWrapperClass}>
                                        <select
                                            value={config.jwt?.algo || 'HS256'}
                                            onChange={e => updateConfig({ jwt: { ...config.jwt, algo: e.target.value } })}
                                            className={selectClass}
                                        >
                                            <option value="HS256">HS256 (Shared Secret)</option>
                                            <option value="HS384">HS384</option>
                                            <option value="HS512">HS512</option>
                                            <option value="RS256">RS256 (Private Key)</option>
                                            <option value="RS384">RS384</option>
                                            <option value="RS512">RS512</option>
                                            <option value="ES256">ES256</option>
                                        </select>
                                        <SelectChevron />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                                        <input
                                            type="checkbox"
                                            checked={config.jwt?.isBase64 || false}
                                            onChange={e => updateConfig({ jwt: { ...config.jwt, isBase64: e.target.checked } })}
                                            className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"
                                        />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Secret is Base64</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>{config.jwt?.algo?.startsWith('RS') || config.jwt?.algo?.startsWith('ES') ? 'Private Key (PEM)' : 'Secret Key'}</label>
                                <textarea
                                    value={config.jwt?.secret || ''}
                                    onChange={e => updateConfig({ jwt: { ...config.jwt, secret: e.target.value } })}
                                    className={`${inputClass} min-h-[80px] font-mono text-xs`}
                                    placeholder={config.jwt?.algo?.startsWith('RS') ? "-----BEGIN PRIVATE KEY-----..." : "Secret key string..."}
                                />
                            </div>
                        </div>

                        {/* Payload */}
                        <div className="p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 space-y-4">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Payload Overrides</h4>
                            <textarea
                                value={config.jwt?.payload || ''}
                                onChange={e => updateConfig({ jwt: { ...config.jwt, payload: e.target.value } })}
                                className={`${inputClass} font-mono text-xs h-24`}
                                placeholder={'{\n  "iss": "...",\n  "sub": "..."\n}'}
                            />
                            <p className="text-[10px] text-gray-400">JSON object. Values here override default claims.</p>
                        </div>
                    </div>
                );
            case 'oauth2':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={labelClass}>Grant Type</label>
                                <div className={selectWrapperClass}>
                                    <select
                                        value={config.oauth2?.grantType || 'authorization_code'}
                                        onChange={e => updateConfig({ oauth2: { ...config.oauth2, grantType: e.target.value } })}
                                        className={selectClass}
                                    >
                                        <option value="authorization_code">Authorization Code</option>
                                        <option value="client_credentials">Client Credentials</option>
                                        <option value="password">Password Credentials</option>
                                        <option value="implicit">Implicit</option>
                                    </select>
                                    <SelectChevron />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50">
                            <div>
                                <label className={labelClass}>Client ID</label>
                                <input
                                    type="text"
                                    value={config.oauth2?.clientId || ''}
                                    onChange={e => updateConfig({ oauth2: { ...config.oauth2, clientId: e.target.value } })}
                                    className={inputClass}
                                />
                            </div>
                            {config.oauth2?.grantType !== 'implicit' && (
                                <div>
                                    <label className={labelClass}>Client Secret</label>
                                    <input
                                        type="password"
                                        value={config.oauth2?.clientSecret || ''}
                                        onChange={e => updateConfig({ oauth2: { ...config.oauth2, clientSecret: e.target.value } })}
                                        className={inputClass}
                                    />
                                </div>
                            )}
                        </div>

                        {['authorization_code', 'implicit'].includes(config.oauth2?.grantType || '') && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Authorization URL</label>
                                    <input
                                        type="text"
                                        value={config.oauth2?.authUrl || ''}
                                        onChange={e => updateConfig({ oauth2: { ...config.oauth2, authUrl: e.target.value } })}
                                        className={inputClass}
                                        placeholder="https://provider.com/oauth/authorize"
                                    />
                                </div>
                                {config.oauth2?.grantType === 'authorization_code' && (
                                    <div>
                                        <label className={labelClass}>Redirect URI (Callback)</label>
                                        <input
                                            type="text"
                                            value={config.oauth2?.redirectUrl || ''}
                                            onChange={e => updateConfig({ oauth2: { ...config.oauth2, redirectUrl: e.target.value } })}
                                            className={inputClass}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {config.oauth2?.grantType !== 'implicit' && (
                            <div>
                                <label className={labelClass}>Access Token URL</label>
                                <input
                                    type="text"
                                    value={config.oauth2?.tokenUrl || ''}
                                    onChange={e => updateConfig({ oauth2: { ...config.oauth2, tokenUrl: e.target.value } })}
                                    className={inputClass}
                                    placeholder="https://provider.com/oauth/token"
                                />
                            </div>
                        )}

                        {config.oauth2?.grantType === 'password' && (
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50">
                                <div>
                                    <label className={labelClass}>Username</label>
                                    <input
                                        type="text"
                                        value={config.oauth2?.username || ''}
                                        onChange={e => updateConfig({ oauth2: { ...config.oauth2, username: e.target.value } })}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Password</label>
                                    <input
                                        type="password"
                                        value={config.oauth2?.password || ''}
                                        onChange={e => updateConfig({ oauth2: { ...config.oauth2, password: e.target.value } })}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Scope</label>
                            <input
                                type="text"
                                value={config.oauth2?.scope || ''}
                                onChange={e => updateConfig({ oauth2: { ...config.oauth2, scope: e.target.value } })}
                                className={inputClass}
                                placeholder="openid profile email"
                            />
                        </div>
                    </div>
                );
            case 'custom':
                return (
                    <HookEditor
                        config={config.customAuth || { enabled: true, className: '', methodName: '', args: {} }}
                        onChange={(customConfig) => updateConfig({ customAuth: customConfig })}
                        showEnableCheckbox={false}
                        texts={texts}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label className={labelClass}>{texts.authType || 'Auth Type'}</label>
                <div className={selectWrapperClass}>
                    <select
                        value={authConfig.type}
                        onChange={(e) => onChange({ ...authConfig, type: e.target.value })}
                        className={selectClass}
                    >
                        {availableAuthTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    <SelectChevron />
                </div>
            </div>

            {(authConfig.type !== 'inherit' && authConfig.type !== 'none') && (
                <div className="p-1">
                    {renderAuthDetails()}
                </div>
            )}
            {authConfig.type === 'inherit' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded text-gray-500 text-xs italic">
                    {texts.sysDefault || 'Using system default authentication.'}
                </div>
            )}
        </div>
    );
};

export default AuthEditor;
