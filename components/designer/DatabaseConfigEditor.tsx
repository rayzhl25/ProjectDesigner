
import React, { useState, useEffect } from 'react';
import { 
  Save, Database, Play, Check, X, Server, HardDrive, Cloud, AlertCircle, Loader2,
  Lock, Globe, Key, Settings, RefreshCw, Pencil
} from 'lucide-react';
import { saveDatabaseConfig, testDatabaseConnection } from '../../services/mockService';
import { Language } from '../../types';

interface DatabaseConfigEditorProps {
  file: { id: string; title: string };
  lang?: Language;
}

interface EnvConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
  schema?: string;
  params?: string;
}

const DatabaseConfigEditor: React.FC<DatabaseConfigEditorProps> = ({ file, lang = 'zh' }) => {
  const [activeTab, setActiveTab] = useState<'test' | 'prod'>('test');
  const [dbType, setDbType] = useState('mysql');
  const [connectionName, setConnectionName] = useState(file.title);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testConfig, setTestConfig] = useState<EnvConfig>({
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '',
    database: 'nebula_test',
    schema: '',
    params: 'useSSL=false&serverTimezone=UTC'
  });

  const [prodConfig, setProdConfig] = useState<EnvConfig>({
    host: '192.168.1.100',
    port: '3306',
    username: 'admin',
    password: '',
    database: 'nebula_prod',
    schema: '',
    params: 'useSSL=true&serverTimezone=UTC'
  });

  // Localization Dictionary
  const texts = {
    zh: {
      headerTitle: '数据库连接配置',
      connName: '连接名称',
      dbType: '数据库类型',
      testEnv: '测试环境',
      prodEnv: '生产环境',
      host: '主机地址 / IP',
      port: '端口',
      dbName: '数据库名称 / SID',
      username: '用户名',
      password: '密码',
      schema: 'Schema (可选)',
      params: '连接参数 (URL Encoding)',
      advanced: '高级设置',
      testConn: '测试连接',
      save: '保存配置',
      success: '连接成功',
      failed: '连接失败',
      connecting: '连接中...',
      saving: '保存中...',
      placeholderHost: '例如: 127.0.0.1',
      placeholderDb: '例如: my_database',
      placeholderUser: '例如: root',
    },
    en: {
      headerTitle: 'Database Configuration',
      connName: 'Connection Name',
      dbType: 'Database Type',
      testEnv: 'Test Environment',
      prodEnv: 'Prod Environment',
      host: 'Host / IP Address',
      port: 'Port',
      dbName: 'Database Name / SID',
      username: 'Username',
      password: 'Password',
      schema: 'Schema (Optional)',
      params: 'Connection Params',
      advanced: 'Advanced Settings',
      testConn: 'Test Connection',
      save: 'Save Config',
      success: 'Connection Successful',
      failed: 'Connection Failed',
      connecting: 'Connecting...',
      saving: 'Saving...',
      placeholderHost: 'e.g. 127.0.0.1',
      placeholderDb: 'e.g. my_database',
      placeholderUser: 'e.g. root',
    }
  };

  const t = texts[lang];

  const dbTypes = [
    { id: 'mysql', label: 'MySQL', icon: Database, defaultPort: '3306', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'postgresql', label: 'PostgreSQL', icon: Server, defaultPort: '5432', color: 'text-indigo-500 dark:text-indigo-400' },
    { id: 'oracle', label: 'Oracle', icon: Database, defaultPort: '1521', color: 'text-red-600 dark:text-red-500' },
    { id: 'sqlserver', label: 'SQL Server', icon: Server, defaultPort: '1433', color: 'text-red-500 dark:text-red-400' },
    { id: 'dameng', label: 'Dameng', icon: HardDrive, defaultPort: '5236', color: 'text-emerald-600 dark:text-emerald-500' },
    { id: 'kingbase', label: 'Kingbase', icon: Database, defaultPort: '54321', color: 'text-purple-600 dark:text-purple-500' },
  ];

  const handleDbTypeChange = (typeId: string, defaultPort: string) => {
    setDbType(typeId);
    // Optionally auto-update ports if they are default
    setTestConfig(prev => ({ ...prev, port: defaultPort }));
    setProdConfig(prev => ({ ...prev, port: defaultPort }));
  };

  const activeConfig = activeTab === 'test' ? testConfig : prodConfig;
  const setActiveConfig = (updates: Partial<EnvConfig>) => {
    if (activeTab === 'test') {
      setTestConfig(prev => ({ ...prev, ...updates }));
    } else {
      setProdConfig(prev => ({ ...prev, ...updates }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDatabaseConfig({
        id: file.id,
        title: connectionName, // Save new name
        type: dbType,
        test: testConfig,
        prod: prodConfig
      });
      // Could show toast here
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const success = await testDatabaseConnection({
        type: dbType,
        config: activeConfig
      });
      setTestResult({
        success,
        message: success ? t.success : `${t.failed}: Timeout or Network unreachable.`
      });
    } catch (e) {
      setTestResult({ success: false, message: `${t.failed}: Error occurred.` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-sm">
      {/* Header */}
      <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              {connectionName}
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-normal text-gray-500 uppercase">
                {dbType}
              </span>
            </h1>
            <p className="text-xs text-gray-500">{t.headerTitle}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium transition-colors"
          >
            {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isTesting ? t.connecting : t.testConn}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-nebula-600 hover:bg-nebula-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? t.saving : t.save}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Database Type Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">{t.dbType}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {dbTypes.map(type => (
                <div 
                  key={type.id}
                  onClick={() => handleDbTypeChange(type.id, type.defaultPort)}
                  className={`
                    cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group
                    ${dbType === type.id 
                      ? 'border-nebula-500 bg-nebula-50 dark:bg-nebula-900/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-nebula-300'
                    }
                  `}
                >
                  <type.icon size={28} className={`${type.color} transition-transform group-hover:scale-110 duration-200`} />
                  <span className={`text-xs font-bold ${dbType === type.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{type.label}</span>
                  {dbType === type.id && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-nebula-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setActiveTab('test'); setTestResult(null); }}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'test' 
                    ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10' 
                    : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeTab === 'test' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                {t.testEnv}
              </button>
              <button
                onClick={() => { setActiveTab('prod'); setTestResult(null); }}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'prod' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeTab === 'prod' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                {t.prodEnv}
              </button>
            </div>

            {/* Test Result Banner */}
            {testResult && (
              <div className={`px-6 py-3 text-xs flex items-center gap-2 border-b border-transparent ${testResult.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                {testResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                {testResult.message}
              </div>
            )}

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              {/* Connection Name Input */}
              <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.connName}</label>
                  <div className="relative">
                    <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all font-medium"
                      placeholder={t.connName}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.host}</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={activeConfig.host}
                      onChange={(e) => setActiveConfig({ host: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all font-mono"
                      placeholder={t.placeholderHost}
                    />
                  </div>
                </div>
                <div className="col-span-4">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.port}</label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={activeConfig.port}
                      onChange={(e) => setActiveConfig({ port: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all font-mono"
                      placeholder="3306"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.dbName}</label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    value={activeConfig.database}
                    onChange={(e) => setActiveConfig({ database: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all"
                    placeholder={t.placeholderDb}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.username}</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={activeConfig.username}
                      onChange={(e) => setActiveConfig({ username: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all"
                      placeholder={t.placeholderUser}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="password" 
                      value={activeConfig.password}
                      onChange={(e) => setActiveConfig({ password: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced / Optional */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                 <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">{t.advanced}</h4>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.schema}</label>
                        <input 
                          type="text" 
                          value={activeConfig.schema}
                          onChange={(e) => setActiveConfig({ schema: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all text-xs"
                          placeholder="public"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.params}</label>
                        <input 
                          type="text" 
                          value={activeConfig.params}
                          onChange={(e) => setActiveConfig({ params: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-nebula-500 transition-all text-xs font-mono"
                          placeholder="useSSL=false&allowPublicKeyRetrieval=true"
                        />
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfigEditor;
