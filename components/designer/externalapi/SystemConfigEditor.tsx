
import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Globe, Shield, Code, FileUp, Database, Server, Tag, Info, 
  Play, Plus, Trash2, Key, Box, Settings, X, Lock, FileJson, CheckSquare, Copy, Check
} from 'lucide-react';
import { saveSystemConfig } from '../../../services/mockService';
import TagInput from '../../common/TagInput';

interface SystemConfigEditorProps {
  file: any;
  lang?: 'zh' | 'en'; 
}

// Mock Java Classes for selection (same as before)
const MOCK_JAVA_CLASSES = [
    { 
        name: 'com.nebula.sys.AuthInterceptor', 
        methods: [
            { name: 'preHandle', params: ['request', 'response', 'handler'] },
            { name: 'postHandle', params: ['request', 'response', 'modelAndView'] }
        ]
    },
    { 
        name: 'com.nebula.sys.DataEnricher', 
        methods: [
            { name: 'enrichUserData', params: ['userId', 'context'] },
            { name: 'maskSensitiveInfo', params: ['dataObject'] }
        ]
    },
    { 
        name: 'com.nebula.ext.LogService', 
        methods: [
            { name: 'logRequest', params: ['url', 'payload'] },
            { name: 'logError', params: ['exception', 'context'] }
        ]
    },
    {
        name: 'com.nebula.auth.CustomAuthProvider',
        methods: [
            { name: 'generateSignature', params: ['appId', 'timestamp', 'nonce'] },
            { name: 'getDynamicToken', params: ['context'] }
        ]
    }
];

interface JavaHookConfig {
    enabled: boolean;
    className: string;
    methodName: string;
    args: Record<string, string>;
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

  // Localized Texts
  const texts = {
      zh: {
          save: '保存配置',
          saving: '保存中...',
          basicInfo: '基础信息',
          environments: '环境配置',
          authentication: '鉴权配置',
          hooks: '调用Hook',
          systemName: '系统名称',
          tags: '标签',
          desc: '描述 / 备注',
          importApi: '导入 API 定义',
          dragDrop: '拖拽或点击上传',
          supportMsg: '支持 OpenAPI (Swagger) JSON/YAML',
          testEnv: '测试环境',
          prodEnv: '生产环境',
          envParams: '环境参数',
          addParam: '添加参数',
          key: '键名',
          testVal: '测试值',
          prodVal: '生产值',
          paramDesc: '描述',
          authType: '鉴权类型',
          tokenUser: 'Token / 用户名',
          passSecret: '密码 / Client Secret',
          enableHook: '启用钩子',
          javaClass: 'Java 类',
          method: '方法',
          argsConfig: '参数配置',
          importSuccess: 'API 定义导入成功！',
          saveSuccess: '系统配置保存成功！',
          configJson: '配置 JSON 预览',
          preRequestOp: '全局前置操作',
          postRequestOp: '全局后置操作'
      },
      en: {
          save: 'Save Config',
          saving: 'Saving...',
          basicInfo: 'Basic Info',
          environments: 'Environments',
          authentication: 'Authentication',
          hooks: 'Invoke Hook',
          systemName: 'System Name',
          tags: 'Tags',
          desc: 'Description / Remarks',
          importApi: 'Import API Definitions',
          dragDrop: 'Drag & Drop or Click to Import',
          supportMsg: 'Supports OpenAPI (Swagger) JSON/YAML',
          testEnv: 'Test Environment',
          prodEnv: 'Prod Environment',
          envParams: 'Env Parameters',
          addParam: 'Add Parameter',
          key: 'Key',
          testVal: 'Test Value',
          prodVal: 'Prod Value',
          paramDesc: 'Description',
          authType: 'Auth Type',
          tokenUser: 'Token / Username',
          passSecret: 'Password / Client Secret',
          enableHook: 'Enable Hook',
          javaClass: 'Java Class',
          method: 'Method',
          argsConfig: 'Arguments Config',
          importSuccess: 'API Definitions imported successfully!',
          saveSuccess: 'System configuration saved successfully!',
          configJson: 'Configuration JSON Preview',
          preRequestOp: 'Global Pre-request Operation',
          postRequestOp: 'Global Post-request Operation'
      }
  };

  const t = texts[lang];

  // Form State
  const [config, setConfig] = useState({
      name: file?.title || 'New System',
      description: 'Main enterprise resource planning system connection.',
      testUrl: 'https://test-api.example.com',
      prodUrl: 'https://api.example.com',
      
      // Auth General
      authType: 'bearer', // bearer, basic, apikey, jwt, oauth2, custom, none
      
      // Simple Auth (Bearer / Basic)
      authKey: '',
      authSecret: '',

      // API Key Config
      apiKey: {
          location: 'header', // header, query
          key: 'X-API-Key',
          value: ''
      },

      // JWT Bearer Config
      jwt: {
          location: 'header',
          algo: 'HS256',
          secret: '',
          isBase64: false,
          payload: '{\n  "iss": "nebula",\n  "exp": 1719999999\n}',
          headerName: 'Authorization',
          prefix: 'Bearer',
          customHeader: ''
      },

      // OAuth 2.0 Config
      oauth2: {
          grantType: 'authorization_code', // authorization_code, client_credentials, password, implicit
          clientId: '',
          clientSecret: '',
          authUrl: '',
          tokenUrl: '',
          redirectUrl: '',
          scope: '',
          username: '',
          password: ''
      },

      // Custom Auth (Java Hook)
      customAuth: { enabled: true, className: '', methodName: '', args: {} } as JavaHookConfig,

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
          setConfig(prev => ({...prev, name: file.title}));
      }
  }, [file]);

  const updateHook = (type: 'preAction' | 'postAction' | 'customAuth', updates: Partial<JavaHookConfig>) => {
      setConfig(prev => ({
          ...prev,
          [type]: { ...prev[type], ...updates }
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
          // Mock file reading/processing
          setTimeout(() => {
              alert(t.importSuccess);
          }, 500);
      }
  };

  // Improved Select Style
  const selectClass = "w-full appearance-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:border-nebula-500 focus:ring-1 focus:ring-nebula-500 transition-all text-sm";
  const selectWrapperClass = "relative";
  const SelectChevron = () => (
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
  );

  const renderJavaMethodSelector = (
      configData: JavaHookConfig, 
      updateFn: (updates: Partial<JavaHookConfig>) => void,
      hideEnableCheckbox: boolean = false
  ) => {
      const selectedClass = MOCK_JAVA_CLASSES.find(c => c.name === configData.className);
      const selectedMethod = selectedClass?.methods.find(m => m.name === configData.methodName);

      return (
          <div className="space-y-4">
              {!hideEnableCheckbox && (
                  <div className="flex items-center gap-2 mb-4">
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t.enableHook}</label>
                      <input 
                        type="checkbox" 
                        checked={configData.enabled}
                        onChange={(e) => updateFn({ enabled: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"
                      />
                  </div>
              )}

              {(configData.enabled || hideEnableCheckbox) && (
                  <div className={`space-y-4 ${!hideEnableCheckbox ? 'pl-4 border-l-2 border-gray-100 dark:border-gray-700' : ''}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.javaClass}</label>
                              <div className={selectWrapperClass}>
                                  <select 
                                    value={configData.className}
                                    onChange={(e) => updateFn({ className: e.target.value, methodName: '', args: {} })}
                                    className={selectClass}
                                  >
                                      <option value="">Select Class...</option>
                                      {MOCK_JAVA_CLASSES.map(cls => (
                                          <option key={cls.name} value={cls.name}>{cls.name}</option>
                                      ))}
                                  </select>
                                  <SelectChevron />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.method}</label>
                              <div className={selectWrapperClass}>
                                  <select 
                                    value={configData.methodName}
                                    onChange={(e) => updateFn({ methodName: e.target.value, args: {} })}
                                    disabled={!configData.className}
                                    className={`${selectClass} disabled:opacity-50`}
                                  >
                                      <option value="">Select Method...</option>
                                      {selectedClass?.methods.map(m => (
                                          <option key={m.name} value={m.name}>{m.name}</option>
                                      ))}
                                  </select>
                                  <SelectChevron />
                              </div>
                          </div>
                      </div>

                      {selectedMethod && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                              <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3">{t.argsConfig}</h4>
                              <div className="space-y-2">
                                  {selectedMethod.params.map(param => (
                                      <div key={param} className="flex items-center gap-3">
                                          <div className="w-32 flex-shrink-0 text-xs font-mono text-blue-600 dark:text-blue-400">{param}</div>
                                          <span className="text-gray-400">=</span>
                                          <input 
                                            type="text" 
                                            value={configData.args[param] || ''}
                                            onChange={(e) => updateFn({ args: { ...configData.args, [param]: e.target.value } })}
                                            placeholder="Value or expression..."
                                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                                          />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  };

  const renderHookSection = (labelKey: string, type: 'preAction' | 'postAction') => {
      const hookData = config[type];
      return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Settings size={16} className="text-nebula-500" />
                      {t[labelKey as keyof typeof t] || labelKey}
                  </h3>
                  <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t.enableHook}</label>
                      <input 
                        type="checkbox" 
                        checked={hookData.enabled}
                        onChange={(e) => updateHook(type, { enabled: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"
                      />
                  </div>
              </div>
              {hookData.enabled && renderJavaMethodSelector(config[type], (updates) => updateHook(type, updates), true)}
          </div>
      );
  };

  const renderAuthContent = () => {
      switch (config.authType) {
          case 'bearer':
              return (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Token</label>
                          <input 
                            type="password" 
                            value={config.authKey}
                            onChange={e => setConfig({...config, authKey: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                            placeholder="Bearer Token..."
                          />
                      </div>
                  </div>
              );
          case 'basic':
              return (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                          <input 
                            type="text" 
                            value={config.authKey}
                            onChange={e => setConfig({...config, authKey: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                          <input 
                            type="password" 
                            value={config.authSecret}
                            onChange={e => setConfig({...config, authSecret: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                          />
                      </div>
                  </div>
              );
          case 'apikey':
              return (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Add Location</label>
                          <div className={selectWrapperClass}>
                              <select 
                                value={config.apiKey.location}
                                onChange={e => setConfig({...config, apiKey: {...config.apiKey, location: e.target.value}})}
                                className={selectClass}
                              >
                                  <option value="header">Header</option>
                                  <option value="query">Query Params</option>
                              </select>
                              <SelectChevron />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Key</label>
                          <input 
                            type="text" 
                            value={config.apiKey.key}
                            onChange={e => setConfig({...config, apiKey: {...config.apiKey, key: e.target.value}})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                            placeholder="Key name (e.g. x-api-key)"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Value</label>
                          <input 
                            type="text" 
                            value={config.apiKey.value}
                            onChange={e => setConfig({...config, apiKey: {...config.apiKey, value: e.target.value}})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                            placeholder="Value"
                          />
                      </div>
                  </div>
              );
          case 'jwt':
              return (
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Add Location</label>
                              <div className={selectWrapperClass}>
                                  <select 
                                    value={config.jwt.location}
                                    onChange={e => setConfig({...config, jwt: {...config.jwt, location: e.target.value}})}
                                    className={selectClass}
                                  >
                                      <option value="header">Header</option>
                                  </select>
                                  <SelectChevron />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Algorithm</label>
                              <div className={selectWrapperClass}>
                                  <select 
                                    value={config.jwt.algo}
                                    onChange={e => setConfig({...config, jwt: {...config.jwt, algo: e.target.value}})}
                                    className={selectClass}
                                  >
                                      <option value="HS256">HS256</option>
                                      <option value="HS384">HS384</option>
                                      <option value="HS512">HS512</option>
                                      <option value="RS256">RS256</option>
                                  </select>
                                  <SelectChevron />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Secret / Private Key</label>
                          <input 
                            type="password" 
                            value={config.jwt.secret}
                            onChange={e => setConfig({...config, jwt: {...config.jwt, secret: e.target.value}})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                            placeholder="Secret..."
                          />
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={config.jwt.isBase64}
                                onChange={e => setConfig({...config, jwt: {...config.jwt, isBase64: e.target.checked}})}
                                className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"
                              />
                              <span className="text-xs text-gray-500">Secret is Base64 encoded</span>
                          </label>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Payload (JSON)</label>
                          <textarea 
                            value={config.jwt.payload}
                            onChange={e => setConfig({...config, jwt: {...config.jwt, payload: e.target.value}})}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-mono text-xs outline-none focus:border-nebula-500"
                            placeholder="{ ... }"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Authorization Header Name</label>
                              <input 
                                type="text" 
                                value={config.jwt.headerName}
                                onChange={e => setConfig({...config, jwt: {...config.jwt, headerName: e.target.value}})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">HTTP Authorization Prefix</label>
                              <input 
                                type="text" 
                                value={config.jwt.prefix}
                                onChange={e => setConfig({...config, jwt: {...config.jwt, prefix: e.target.value}})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Custom JWT Header (Optional JSON)</label>
                          <textarea 
                            value={config.jwt.customHeader}
                            onChange={e => setConfig({...config, jwt: {...config.jwt, customHeader: e.target.value}})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-mono text-xs outline-none focus:border-nebula-500"
                            placeholder="{ ... }"
                          />
                      </div>
                  </div>
              );
          case 'custom':
              return (
                  <div>
                      <div className="mb-3 text-xs text-gray-500">
                          Select a Java class and method to implement custom signature or token generation logic.
                          The method return value will be used as the Authorization header value.
                      </div>
                      {renderJavaMethodSelector(config.customAuth, (updates) => updateHook('customAuth', updates), true)}
                  </div>
              );
          case 'oauth2':
              return (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Grant Type</label>
                          <div className={selectWrapperClass}>
                              <select 
                                value={config.oauth2.grantType}
                                onChange={e => setConfig({...config, oauth2: {...config.oauth2, grantType: e.target.value}})}
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

                      {['authorization_code', 'implicit'].includes(config.oauth2.grantType) && (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Authorization URL</label>
                              <input 
                                type="text" 
                                value={config.oauth2.authUrl}
                                onChange={e => setConfig({...config, oauth2: {...config.oauth2, authUrl: e.target.value}})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                              />
                          </div>
                      )}

                      {config.oauth2.grantType !== 'implicit' && (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Access Token URL</label>
                              <input 
                                type="text" 
                                value={config.oauth2.tokenUrl}
                                onChange={e => setConfig({...config, oauth2: {...config.oauth2, tokenUrl: e.target.value}})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                              />
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Client ID</label>
                              <input 
                                type="text" 
                                value={config.oauth2.clientId}
                                onChange={e => setConfig({...config, oauth2: {...config.oauth2, clientId: e.target.value}})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                              />
                          </div>
                          {config.oauth2.grantType !== 'implicit' && (
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Client Secret</label>
                                  <input 
                                    type="password" 
                                    value={config.oauth2.clientSecret}
                                    onChange={e => setConfig({...config, oauth2: {...config.oauth2, clientSecret: e.target.value}})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                                  />
                              </div>
                          )}
                      </div>

                      {['authorization_code', 'implicit'].includes(config.oauth2.grantType) && (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Callback URL (Redirect URI)</label>
                              <input 
                                type="text" 
                                value={config.oauth2.redirectUrl}
                                onChange={e => setConfig({...config, oauth2: {...config.oauth2, redirectUrl: e.target.value}})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                              />
                          </div>
                      )}

                      {config.oauth2.grantType === 'password' && (
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Username</label>
                                  <input 
                                    type="text" 
                                    value={config.oauth2.username}
                                    onChange={e => setConfig({...config, oauth2: {...config.oauth2, username: e.target.value}})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                                  <input 
                                    type="password" 
                                    value={config.oauth2.password}
                                    onChange={e => setConfig({...config, oauth2: {...config.oauth2, password: e.target.value}})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                                  />
                              </div>
                          </div>
                      )}

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Scope</label>
                          <input 
                            type="text" 
                            value={config.oauth2.scope}
                            onChange={e => setConfig({...config, oauth2: {...config.oauth2, scope: e.target.value}})}
                            placeholder="scope1 scope2"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                          />
                      </div>
                  </div>
              );
          default:
              return null;
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
              { id: 'basic', label: t.basicInfo, icon: Info },
              { id: 'env', label: t.environments, icon: Globe },
              { id: 'auth', label: t.authentication, icon: Shield },
              { id: 'hooks', label: t.hooks, icon: Box },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                    activeTab === tab.id 
                    ? 'border-nebula-600 text-nebula-600 dark:text-nebula-400 font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                  <tab.icon size={16} />
                  {tab.label}
              </button>
          ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
              
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.systemName}</label>
                          <input 
                            type="text" 
                            value={config.name} 
                            onChange={e => setConfig({...config, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none" 
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.tags}</label>
                          <TagInput tags={tags} onChange={setTags} />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.desc}</label>
                          <textarea 
                            value={config.description}
                            onChange={e => setConfig({...config, description: e.target.value})}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none resize-none"
                          />
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.importApi}</label>
                          <div 
                            onClick={handleImportClick}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-nebula-500 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all"
                          >
                              <FileUp size={24} className="text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{t.dragDrop}</span>
                              <span className="text-xs text-gray-400 mt-1">{t.supportMsg}</span>
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
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span> {t.testEnv}
                                  </label>
                                  <input 
                                    type="text" 
                                    value={config.testUrl}
                                    onChange={e => setConfig({...config, testUrl: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none font-mono text-xs"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> {t.prodEnv}
                                  </label>
                                  <input 
                                    type="text" 
                                    value={config.prodUrl}
                                    onChange={e => setConfig({...config, prodUrl: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none font-mono text-xs"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Environment Variables Table */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.envParams}</h3>
                              <button onClick={addEnvParam} className="text-xs flex items-center gap-1 bg-nebula-600 text-white px-2 py-1 rounded hover:bg-nebula-700 transition-colors">
                                  <Plus size={12} /> {t.addParam}
                              </button>
                          </div>
                          <table className="w-full text-left text-xs">
                              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase">
                                  <tr>
                                      <th className="p-3">{t.key}</th>
                                      <th className="p-3 text-green-600">{t.testVal}</th>
                                      <th className="p-3 text-blue-600">{t.prodVal}</th>
                                      <th className="p-3">{t.paramDesc}</th>
                                      <th className="p-3 w-10"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-200">
                                  {envParams.map(param => (
                                      <tr key={param.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                          <td className="p-2">
                                              <input type="text" value={param.key} onChange={(e) => updateEnvParam(param.id, 'key', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded px-2 py-1 outline-none focus:border-nebula-500" placeholder="KEY_NAME" />
                                          </td>
                                          <td className="p-2">
                                              <input type="text" value={param.testValue} onChange={(e) => updateEnvParam(param.id, 'testValue', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded px-2 py-1 outline-none focus:border-nebula-500" placeholder="Test Value" />
                                          </td>
                                          <td className="p-2">
                                              <input type="text" value={param.prodValue} onChange={(e) => updateEnvParam(param.id, 'prodValue', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded px-2 py-1 outline-none focus:border-nebula-500" placeholder="Prod Value" />
                                          </td>
                                          <td className="p-2">
                                              <input type="text" value={param.description} onChange={(e) => updateEnvParam(param.id, 'description', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded px-2 py-1 outline-none focus:border-nebula-500" placeholder="Optional desc..." />
                                          </td>
                                          <td className="p-2 text-center">
                                              <button onClick={() => deleteEnvParam(param.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                  <X size={14} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* Auth Tab */}
              {activeTab === 'auth' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.authType}</label>
                          <div className={selectWrapperClass}>
                              <select 
                                value={config.authType}
                                onChange={e => setConfig({...config, authType: e.target.value})}
                                className={selectClass}
                              >
                                  <option value="none">No Auth</option>
                                  <option value="bearer">Bearer Token</option>
                                  <option value="basic">Basic Auth</option>
                                  <option value="apikey">API Key</option>
                                  <option value="jwt">JWT Bearer</option>
                                  <option value="oauth2">OAuth 2.0</option>
                                  <option value="custom">Custom (Java)</option>
                              </select>
                              <SelectChevron />
                          </div>
                      </div>

                      {config.authType !== 'none' && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              {renderAuthContent()}
                          </div>
                      )}
                  </div>
              )}

              {/* Hooks Tab */}
              {activeTab === 'hooks' && (
                  <div className="space-y-6">
                      {renderHookSection('preRequestOp', 'preAction')}
                      {renderHookSection('postRequestOp', 'postAction')}
                  </div>
              )}

          </div>
      </div>

      {/* JSON Preview Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                 <h3 className="font-bold text-gray-800 dark:text-white">{t.configJson}</h3>
                 <button onClick={() => setShowJsonModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
                    <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-auto p-0 relative group">
                  <pre className="p-4 text-xs font-mono text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-all">
                      {jsonContent}
                  </pre>
                  <button 
                    onClick={handleCopyJson}
                    className="absolute top-2 right-2 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy JSON"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
                 <button 
                    onClick={() => setShowJsonModal(false)} 
                    className="px-4 py-2 bg-nebula-600 hover:bg-nebula-700 text-white rounded text-sm font-medium"
                 >
                    Close
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfigEditor;
