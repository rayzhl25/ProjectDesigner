
import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Play, Plus, Trash2, Tag, 
  BookOpen, FileText, Settings, ArrowRight,
  Bold, Italic, Underline, List, Link as LinkIcon, X,
  Code2, Database, Shield, Radio, Check, Globe,
  Server, Key, Lock, FileJson, AlertCircle, Info, Cookie, Edit3, AlignLeft,
  ChevronRight, ChevronDown, MoreHorizontal, Copy, GripVertical
} from 'lucide-react';
import { saveApiConfig } from '../../../services/mockService';
import MonacoEditor from '../editors/MonacoEditor';
import TagInput from '../../common/TagInput';
import RichTextEditor from '../../common/RichTextEditor';

interface ApiEditorProps {
  file: any;
  lang?: 'zh' | 'en';
}

interface Param {
    id: string;
    key: string;
    type: string;
    required: boolean;
    value: string; // Example value
    desc: string;
}

interface ResponseNode {
    id: string;
    targetKey: string; // Final output key
    type: string;
    required: boolean;
    sourcePath: string; // Mapping path from raw response
    mock: string;
    desc: string;
    children?: ResponseNode[];
}

interface StatusCodeConfig {
    code: string; // e.g. "200"
    name: string; // e.g. "Success"
    mode: 'visual' | 'code';
    schema: ResponseNode[]; // For visual mode
    script: string; // For code mode
}

// Mock Java Classes for selection (shared with SystemConfig)
const MOCK_JAVA_CLASSES = [
    { 
        name: 'com.nebula.sys.AuthInterceptor', 
        methods: [
            { name: 'preHandle', params: ['request', 'response', 'handler'] },
            { name: 'postHandle', params: ['request', 'response', 'modelAndView'] }
        ]
    },
    { 
        name: 'com.nebula.ext.LogService', 
        methods: [
            { name: 'logRequest', params: ['url', 'payload'] }
        ]
    }
];

const ApiEditor: React.FC<ApiEditorProps> = ({ file, lang = 'zh' }) => {
  const [loading, setLoading] = useState(false);
  const [activeReqTab, setActiveReqTab] = useState<'info' | 'path' | 'params' | 'body' | 'headers' | 'cookies' | 'auth' | 'pre' | 'post'>('info');
  
  // Layout Resizing
  const [leftWidth, setLeftWidth] = useState(60); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  
  // URL Config
  const [urlConfig, setUrlConfig] = useState({
      baseUrlType: 'system' as 'system' | 'custom',
      customBaseUrl: 'http://localhost:8080',
      systemBaseUrl: 'http://192.168.1.100:8000/api', // Mock system url
      path: '/v1/pet'
  });

  // Body Config
  const [bodyType, setBodyType] = useState<'none' | 'form-data' | 'x-www-form-urlencoded' | 'json' | 'xml' | 'raw' | 'binary' | 'graphql'>('json');
  const [rawType, setRawType] = useState('text'); // text, javascript, json, html, xml

  // Basic Info
  const [basicInfo, setBasicInfo] = useState({
      name: file?.title || 'New Interface',
      tags: [] as string[],
      description: '',
      usage: '' // Added Rich Text content
  });

  // Auth & Hooks
  const [authConfig, setAuthConfig] = useState({ 
      type: 'inherit', 
      config: {
          authKey: '',
          authSecret: '',
          apiKey: { location: 'header', key: '', value: '' },
          jwt: { location: 'header', algo: 'HS256', secret: '', isBase64: false, payload: '', headerName: 'Authorization', prefix: 'Bearer', customHeader: '' },
          oauth2: { grantType: 'authorization_code', clientId: '', clientSecret: '', authUrl: '', tokenUrl: '', redirectUrl: '', scope: '', username: '', password: '' },
          customAuth: { enabled: true, className: '', methodName: '', args: {} }
      } as any 
  }); 
  const [preHook, setPreHook] = useState({ type: 'none', config: { enabled: true, className: '', methodName: '', args: {} } });
  const [postHook, setPostHook] = useState({ type: 'none', config: { enabled: true, className: '', methodName: '', args: {} } });

  // Parameter Lists
  const [pathParams, setPathParams] = useState<Param[]>([]);
  const [queryParams, setQueryParams] = useState<Param[]>([]);
  const [headers, setHeaders] = useState<Param[]>([]);
  const [cookies, setCookies] = useState<Param[]>([]);
  const [formDataParams, setFormDataParams] = useState<Param[]>([]);
  const [urlEncodedParams, setUrlEncodedParams] = useState<Param[]>([]);

  // Response Configuration State
  const [activeStatusCode, setActiveStatusCode] = useState('200');
  const [responseConfigs, setResponseConfigs] = useState<StatusCodeConfig[]>([
      { 
          code: '200', 
          name: '成功', 
          mode: 'visual', 
          schema: [
              { id: 'root', targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Root Object', children: [
                  { id: 'r1', targetKey: 'code', type: 'integer', required: true, sourcePath: 'status.code', mock: '200', desc: 'Status Code' },
                  { id: 'r2', targetKey: 'data', type: 'object', required: true, sourcePath: 'response.body', mock: '', desc: 'Data Payload', children: [] },
                  { id: 'r3', targetKey: 'msg', type: 'string', required: true, sourcePath: 'status.message', mock: 'Success', desc: 'Message' }
              ]} 
          ],
          script: '// Transform response data\nfunction transform(data) {\n  return {\n    success: true,\n    result: data\n  };\n}'
      },
      { 
          code: '404', 
          name: '记录不存在', 
          mode: 'visual', 
          schema: [
              { id: 'root_err', targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Error Root', children: [
                  { id: 'e1', targetKey: 'error', type: 'string', required: true, sourcePath: 'err.msg', mock: 'Not Found', desc: 'Error Msg' }
              ]}
          ],
          script: 'return { error: "Not found" }'
      }
  ]);

  // Expanded Tree Nodes in Response Editor
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'root_err']));

  // Batch Edit State
  const [batchModal, setBatchModal] = useState<{ isOpen: boolean, type: string, content: string, mode: 'comma' | 'colon' }>({
      isOpen: false,
      type: '',
      content: '',
      mode: 'comma'
  });

  // Body Content
  const [bodyContent, setBodyContent] = useState({
      json: '{\n  "name": "Hello Kitty",\n  "status": "sold"\n}',
      xml: '<pet>\n  <name>Hello Kitty</name>\n  <status>sold</status>\n</pet>',
      raw: '',
      graphqlQuery: '',
      graphqlVars: ''
  });

  const texts = {
      zh: {
          save: '保存',
          send: '调试',
          info: '基础信息',
          path: 'Path 参数',
          params: 'Query 参数',
          body: '请求体',
          headers: 'Headers',
          cookies: 'Cookies',
          auth: '鉴权',
          pre: '前置操作',
          post: '后置操作',
          responseTransform: '返回响应',
          outputPreview: '输出数据实例',
          key: '参数名',
          type: '类型',
          required: '必填',
          example: '示例值',
          desc: '说明',
          addParam: '添加参数',
          batchEdit: '批量编辑',
          saving: '保存中...',
          systemUrl: '系统地址',
          customUrl: '自定义地址',
          inheritSys: '继承系统配置',
          sysDefault: '使用上级系统的鉴权配置',
          enableHook: '启用钩子',
          javaClass: 'Java 类',
          method: '方法',
          argsConfig: '参数配置',
          importSuccess: '导入成功',
          basicName: '接口名称',
          basicTags: '接口标签',
          basicDesc: '接口说明',
          basicUsage: '使用说明 (支持 Markdown)',
          dragFile: '点击或拖拽上传文件',
          authType: '鉴权类型',
          inheritOp: '继承系统操作',
          customOp: '自定义操作',
          none: '无',
          commaMode: '逗号模式',
          colonMode: '冒号模式',
          batchFormatComma: '格式: 参数名,类型,必需,示例值,说明',
          batchFormatColon: '格式: 参数名: 示例值 (其他字段默认)',
          cancel: '取消',
          confirm: '确定',
          visualMode: '可视化模式',
          codeMode: '代码模式',
          sourcePath: '映射路径',
          mockValue: 'Mock',
          addStatus: '添加',
          rootNode: '根节点',
          addChild: '添加子节点'
      },
      en: {
          save: 'Save',
          send: 'Debug',
          info: 'Basic Info',
          path: 'Path Params',
          params: 'Query Params',
          body: 'Body',
          headers: 'Headers',
          cookies: 'Cookies',
          auth: 'Auth',
          pre: 'Pre-request',
          post: 'Post-request',
          responseTransform: 'Response',
          outputPreview: 'Output Preview',
          key: 'Key',
          type: 'Type',
          required: 'Required',
          example: 'Example',
          desc: 'Description',
          addParam: 'Add Param',
          batchEdit: 'Batch Edit',
          saving: 'Saving...',
          systemUrl: 'System URL',
          customUrl: 'Custom URL',
          inheritSys: 'Inherit System',
          sysDefault: 'Use system authentication',
          enableHook: 'Enable Hook',
          javaClass: 'Java Class',
          method: 'Method',
          argsConfig: 'Arguments',
          importSuccess: 'Imported',
          basicName: 'API Name',
          basicTags: 'Tags',
          basicDesc: 'Description',
          basicUsage: 'Usage (Markdown)',
          dragFile: 'Click or Drag to upload',
          authType: 'Auth Type',
          inheritOp: 'Inherit System',
          customOp: 'Custom Operation',
          none: 'None',
          commaMode: 'Comma Mode',
          colonMode: 'Colon Mode',
          batchFormatComma: 'Format: Key,Type,Required,Example,Description',
          batchFormatColon: 'Format: Key: Example',
          cancel: 'Cancel',
          confirm: 'Confirm',
          visualMode: 'Visual Mode',
          codeMode: 'Code Mode',
          sourcePath: 'Source Path',
          mockValue: 'Mock',
          addStatus: 'Add',
          rootNode: 'Root',
          addChild: 'Add Child'
      }
  };

  const t = texts[lang];

  // Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const totalWidth = document.body.clientWidth;
      const newPercent = (e.clientX / totalWidth) * 100;
      if (newPercent > 20 && newPercent < 80) {
        setLeftWidth(newPercent);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Initial Path Parsing (Only on mount or manual URL edit via text input, 
  // but we want to avoid loop with path params editor.
  // Simple heuristic: If parsing URL produces different params than current state, update state.
  useEffect(() => {
      const matches = urlConfig.path.match(/:([a-zA-Z0-9_]+)/g);
      if (matches) {
          const keysFromUrl = matches.map(m => m.substring(1));
          
          setPathParams(prev => {
              const currentKeys = prev.map(p => p.key);
              // Only add if not exists. Do not remove to keep values if user is typing URL.
              // Actually, simplified: Sync is tricky. 
              // We'll rely on explicit "add param" to update URL, and URL input to update params.
              const newParams = [...prev];
              keysFromUrl.forEach(k => {
                  if (!currentKeys.includes(k)) {
                      newParams.push({ id: `p_${Date.now()}_${k}`, key: k, type: 'string', required: true, value: '', desc: '' });
                  }
              });
              return newParams;
          });
      }
  }, [urlConfig.path]);

  const handleSave = async () => {
      setLoading(true);
      try {
          await saveApiConfig({ 
              basicInfo, urlConfig, bodyType, authConfig, preHook, postHook, 
              params: { path: pathParams, query: queryParams, headers, cookies, body: bodyContent },
              responseConfigs
          });
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  // --- Response Schema Handlers ---
  const getActiveResponseConfig = () => responseConfigs.find(c => c.code === activeStatusCode) || responseConfigs[0];
  
  const updateResponseConfig = (updater: (config: StatusCodeConfig) => StatusCodeConfig) => {
      setResponseConfigs(prev => prev.map(c => c.code === activeStatusCode ? updater(c) : c));
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
          setResponseConfigs([...responseConfigs, {
              code,
              name: 'New Status',
              mode: 'visual',
              schema: [{ id: `root_${code}`, targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Root', children: [] }],
              script: ''
          }]);
          setActiveStatusCode(code);
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
          content = data.map(p => `${p.key},${p.type},${p.required ? '1':'0'},${p.value},${p.desc}`).join('\n');
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

  // --- Render Helpers ---

  const renderParamTable = (data: Param[], setter: React.Dispatch<React.SetStateAction<Param[]>>, showType = true) => {
      let listName = '';
      if (setter === setQueryParams) listName = 'queryParams';
      else if (setter === setHeaders) listName = 'headers';
      else if (setter === setCookies) listName = 'cookies';
      else if (setter === setFormDataParams) listName = 'formDataParams';
      else if (setter === setUrlEncodedParams) listName = 'urlEncodedParams';
      else if (setter === setPathParams) listName = 'pathParams';

      const isPathTable = listName === 'pathParams';

      // Custom handler for adding params
      const addParam = () => {
          const newKey = isPathTable ? 'newParam' : '';
          const newParam = { id: Date.now().toString(), key: newKey, type: 'string', required: isPathTable ? true : false, value: '', desc: '' };
          
          setter(prev => [...prev, newParam]);

          if (isPathTable) {
              // Automatically append path param to URL
              setUrlConfig(prev => ({
                  ...prev,
                  path: prev.path.endsWith('/') ? `${prev.path}:${newKey}` : `${prev.path}/:${newKey}`
              }));
          }
      };

      const updateP = (id: string, f: keyof Param, v: any) => {
          setter(prev => {
              const newParams = prev.map(p => p.id === id ? { ...p, [f]: v } : p);
              
              if (isPathTable && f === 'key') {
                  // Sync URL path when key changes
                  const oldParam = prev.find(p => p.id === id);
                  if (oldParam) {
                      const oldKey = oldParam.key;
                      // Replace /:oldKey with /:newKey in URL
                      setUrlConfig(curr => ({
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
          
          if (isPathTable && paramToRemove) {
              // Remove param from URL
              setUrlConfig(curr => ({
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
                              <input type="checkbox" checked={item.required} onChange={(e) => updateP(item.id, 'required', e.target.checked)} className="rounded text-nebula-600 focus:ring-nebula-500" disabled={isPathTable} />
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
                            {listName && <button onClick={() => handleBatchEditOpen(listName, data)} className="flex items-center gap-1 text-gray-400 hover:text-nebula-600 transition-colors text-xs"><Edit3 size={14} /> {t.batchEdit}</button>}
                          </div>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
      );
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
                                onChange={(e) => updateResponseConfig(c => ({...c, schema: updateSchemaNode(c.schema, node.id, 'targetKey', e.target.value)}))}
                                className={`bg-transparent outline-none border-b border-transparent focus:border-nebula-500 w-32 ${isRoot ? 'font-bold text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`} 
                                readOnly={isRoot} 
                              />
                          </div>
                      </td>
                      <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                          <select 
                            value={node.type} 
                            onChange={(e) => updateResponseConfig(c => ({...c, schema: updateSchemaNode(c.schema, node.id, 'type', e.target.value)}))}
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
                      {/* Required Column Removed in View */}
                      <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                          <input 
                            type="text" 
                            value={node.mock} 
                            onChange={(e) => updateResponseConfig(c => ({...c, schema: updateSchemaNode(c.schema, node.id, 'mock', e.target.value)}))}
                            className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 placeholder-gray-300 text-gray-600 dark:text-gray-400"
                            placeholder="Mock Val"
                          />
                      </td>
                      <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                          <input 
                            type="text" 
                            value={node.sourcePath} 
                            onChange={(e) => updateResponseConfig(c => ({...c, schema: updateSchemaNode(c.schema, node.id, 'sourcePath', e.target.value)}))}
                            className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500 font-mono text-xs text-gray-500"
                            placeholder="$"
                          />
                      </td>
                      <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                          <input 
                            type="text" 
                            value={node.desc} 
                            onChange={(e) => updateResponseConfig(c => ({...c, schema: updateSchemaNode(c.schema, node.id, 'desc', e.target.value)}))}
                            className="w-full bg-transparent outline-none border-b border-transparent focus:border-nebula-500"
                            placeholder="Description"
                          />
                      </td>
                      <td className="p-2 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              {(node.type === 'object' || node.type === 'array') && (
                                  <button onClick={() => {
                                      updateResponseConfig(c => ({...c, schema: addSchemaChild(c.schema, node.id)}));
                                      if (!isExpanded) toggleNodeExpand(node.id);
                                  }} className="text-nebula-600 hover:text-nebula-700" title={t.addChild}>
                                      <Plus size={14} />
                                  </button>
                              )}
                              {!isRoot && (
                                  <button onClick={() => updateResponseConfig(c => ({...c, schema: deleteSchemaNode(c.schema, node.id)}))} className="text-gray-400 hover:text-red-500">
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

  // Improved Hook Options Render
  const renderHookConfig = (hookType: 'pre' | 'post', data: any, setData: any) => {
      const type = data.type;
      
      const setType = (t: string) => setData({...data, type: t});

      return (
          <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={type === 'none'} onChange={() => setType('none')} className="text-nebula-600" />
                      <span className="text-gray-700 dark:text-gray-300">{t.none}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={type === 'inherit'} onChange={() => setType('inherit')} className="text-nebula-600" />
                      <span className="text-gray-700 dark:text-gray-300">{t.inheritOp}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={type === 'custom'} onChange={() => setType('custom')} className="text-nebula-600" />
                      <span className="text-gray-700 dark:text-gray-300">{t.customOp}</span>
                  </label>
              </div>

              {type === 'inherit' && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-500 text-xs italic">
                      {t.sysDefault}
                  </div>
              )}

              {type === 'custom' && renderJavaSelector(hookType, data, setData)}
          </div>
      );
  };

  // Reused Java Selector
  const renderJavaSelector = (hookType: 'pre' | 'post' | 'auth', data: any, setData: any) => {
      const currentConfig = data.config || {};
      const selectedClass = MOCK_JAVA_CLASSES.find(c => c.name === currentConfig.className);
      const updateConfig = (updates: any) => setData({ ...data, config: { ...currentConfig, ...updates } });

      return (
          <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.javaClass}</label>
                      <select 
                        value={currentConfig.className}
                        onChange={(e) => updateConfig({ className: e.target.value, methodName: '' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm outline-none"
                      >
                          <option value="">Select Class...</option>
                          {MOCK_JAVA_CLASSES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.method}</label>
                      <select 
                        value={currentConfig.methodName}
                        onChange={(e) => updateConfig({ methodName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm outline-none"
                      >
                          <option value="">Select Method...</option>
                          {selectedClass?.methods.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                      </select>
                  </div>
              </div>
          </div>
      );
  };

  const renderAuthDetails = () => {
      const config = authConfig.config;
      const updateAuth = (updates: any) => setAuthConfig({ ...authConfig, config: { ...config, ...updates } });

      switch (authConfig.type) {
          case 'bearer':
              return (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Token</label>
                          <input 
                            type="password" 
                            value={config.authKey}
                            onChange={e => updateAuth({ authKey: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                            placeholder="Bearer Token..."
                          />
                      </div>
                  </div>
              );
          // ... (Basic, APIKey, JWT, OAuth2 cases remain same)
          case 'basic': return (<div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label><input type="text" value={config.authKey} onChange={e => updateAuth({ authKey: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500" /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label><input type="password" value={config.authSecret} onChange={e => updateAuth({ authSecret: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500" /></div></div></div>);
          case 'apikey': return (<div className="space-y-4"><div className="grid grid-cols-3 gap-4"><div><label className="block text-xs font-bold text-gray-500 mb-1">Location</label><select value={config.apiKey.location} onChange={e => updateAuth({ apiKey: {...config.apiKey, location: e.target.value} })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm outline-none"><option value="header">Header</option><option value="query">Query</option></select></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Key</label><input type="text" value={config.apiKey.key} onChange={e => updateAuth({ apiKey: {...config.apiKey, key: e.target.value} })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500" /></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Value</label><input type="text" value={config.apiKey.value} onChange={e => updateAuth({ apiKey: {...config.apiKey, value: e.target.value} })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500" /></div></div></div>);
          case 'jwt': return (<div className="space-y-6"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 mb-1">Algorithm</label><select value={config.jwt.algo} onChange={e => updateAuth({ jwt: {...config.jwt, algo: e.target.value} })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"><option value="HS256">HS256</option><option value="RS256">RS256</option></select></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Secret</label><input type="password" value={config.jwt.secret} onChange={e => updateAuth({ jwt: {...config.jwt, secret: e.target.value} })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" /></div></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Payload</label><textarea value={config.jwt.payload} onChange={e => updateAuth({ jwt: {...config.jwt, payload: e.target.value} })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm h-20 font-mono" /></div></div>);
          case 'oauth2': return (<div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 mb-1">Grant Type</label><select value={config.oauth2.grantType} onChange={e => updateAuth({ oauth2: {...config.oauth2, grantType: e.target.value} })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"><option value="authorization_code">Authorization Code</option><option value="client_credentials">Client Credentials</option></select></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Client ID</label><input type="text" value={config.oauth2.clientId} onChange={e => updateAuth({ oauth2: {...config.oauth2, clientId: e.target.value} })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" /></div></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Access Token URL</label><input type="text" value={config.oauth2.tokenUrl} onChange={e => updateAuth({ oauth2: {...config.oauth2, tokenUrl: e.target.value} })} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" /></div></div>);
          case 'custom':
              return renderJavaSelector('auth', authConfig.config.customAuth ? { config: authConfig.config.customAuth } : { config: { enabled: true, className: '', methodName: '', args: {} } }, (data: any) => updateAuth({ customAuth: data.config }));
          default:
              return null;
      }
  };

  const activeResConfig = getActiveResponseConfig();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-sm overflow-hidden">
      
      {/* 1. Top Bar: URL & Send */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between px-4 flex-shrink-0 gap-4">
          <div className="flex items-center gap-0 flex-1 max-w-5xl h-9">
              <select className="h-full px-3 rounded-l-md font-bold text-xs outline-none border border-r-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                  <option>POST</option><option>GET</option><option>PUT</option><option>DELETE</option>
              </select>
              
              <div className="relative h-full border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 min-w-[140px] max-w-[200px]">
                  <select 
                    value={urlConfig.baseUrlType}
                    onChange={(e) => setUrlConfig({...urlConfig, baseUrlType: e.target.value as any})}
                    className="w-full h-full px-2 text-xs appearance-none outline-none bg-transparent text-gray-700 dark:text-gray-200"
                  >
                      <option value="system">{t.systemUrl}</option>
                      <option value="custom">{t.customUrl}</option>
                  </select>
              </div>

              <div className="h-full border-t border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center px-3 min-w-[200px]">
                  {urlConfig.baseUrlType === 'system' ? (
                      <span className="text-gray-500 text-xs truncate">{urlConfig.systemBaseUrl}</span>
                  ) : (
                      <input 
                        type="text" 
                        value={urlConfig.customBaseUrl}
                        onChange={(e) => setUrlConfig({...urlConfig, customBaseUrl: e.target.value})}
                        className="w-full bg-transparent outline-none text-xs text-gray-700 dark:text-gray-200"
                      />
                  )}
              </div>

              <input 
                type="text" 
                value={urlConfig.path}
                onChange={(e) => setUrlConfig({...urlConfig, path: e.target.value})}
                className="flex-1 h-full px-3 border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-nebula-500 font-mono text-sm"
              />

              <button className="h-full px-6 bg-nebula-600 hover:bg-nebula-700 text-white font-medium text-xs rounded-r-md transition-colors flex items-center gap-2">
                  {t.send} <Play size={12} fill="currentColor" />
              </button>
          </div>

          <button onClick={handleSave} disabled={loading} className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm disabled:opacity-50 h-9">
             <Save size={14} /> {loading ? t.saving : t.save}
          </button>
      </div>

      {/* 2. Main Content Split */}
      <div className="flex-1 flex overflow-hidden relative">
          
          {/* LEFT COLUMN: Request Config */}
          <div 
            className="flex flex-col border-r border-gray-200 dark:border-gray-700 min-w-[450px]"
            style={{ width: `${leftWidth}%` }}
          >
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 overflow-x-auto no-scrollbar">
                  {[
                      {id: 'info', label: t.info, icon: Info},
                      {id: 'path', label: t.path, count: pathParams.length},
                      {id: 'params', label: t.params, count: queryParams.length},
                      {id: 'body', label: t.body, dot: bodyType !== 'none'},
                      {id: 'headers', label: t.headers, count: headers.length},
                      {id: 'cookies', label: t.cookies, count: cookies.length},
                      {id: 'auth', label: t.auth, icon: Shield},
                      {id: 'pre', label: t.pre},
                      {id: 'post', label: t.post},
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
                  {/* --- Content based on activeReqTab --- */}
                  {activeReqTab === 'info' && (
                      <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.basicName}</label><input type="text" value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" /></div>
                              <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.basicTags}</label><TagInput tags={basicInfo.tags} onChange={tags => setBasicInfo({...basicInfo, tags})} /></div>
                          </div>
                          <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.basicDesc}</label><textarea value={basicInfo.description} onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800 text-sm h-20" /></div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.basicUsage}</label>
                              <RichTextEditor value={basicInfo.usage} onChange={(val) => setBasicInfo({...basicInfo, usage: val})} height="250px" />
                          </div>
                      </div>
                  )}
                  {activeReqTab === 'path' && renderParamTable(pathParams, setPathParams, false)}
                  {activeReqTab === 'params' && renderParamTable(queryParams, setQueryParams)}
                  {activeReqTab === 'headers' && renderParamTable(headers, setHeaders)}
                  {activeReqTab === 'cookies' && renderParamTable(cookies, setCookies)}
                  {activeReqTab === 'body' && (
                      <div className="flex flex-col h-full">
                          <div className="flex items-center gap-4 mb-4 text-xs overflow-x-auto pb-1">
                              {['none', 'form-data', 'x-www-form-urlencoded', 'json', 'xml', 'raw', 'binary', 'graphql'].map(type => (
                                  <label key={type} className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap"><input type="radio" name="bodyType" checked={bodyType === type} onChange={() => setBodyType(type as any)} className="text-nebula-600" /><span className={`capitalize ${bodyType === type ? 'text-gray-800 dark:text-white font-bold' : 'text-gray-500'}`}>{type}</span></label>
                              ))}
                          </div>
                          {bodyType === 'json' && <div className="h-full border border-gray-200 dark:border-gray-700 rounded overflow-hidden"><MonacoEditor language="json" value={bodyContent.json} onChange={(v) => setBodyContent({...bodyContent, json: v||''})} /></div>}
                      </div>
                  )}
                  {activeReqTab === 'auth' && (
                      <div className="space-y-4">
                          <label className="block text-xs font-bold text-gray-500 mb-2">{t.authType}</label>
                          <select value={authConfig.type} onChange={(e) => setAuthConfig({ ...authConfig, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 outline-none text-sm mb-4">
                              <option value="inherit">{t.inheritSys}</option><option value="none">No Auth</option><option value="bearer">Bearer Token</option><option value="basic">Basic Auth</option><option value="apikey">API Key</option><option value="jwt">JWT Bearer</option><option value="oauth2">OAuth 2.0</option><option value="custom">Custom (Java)</option>
                          </select>
                          {authConfig.type !== 'inherit' && authConfig.type !== 'none' && <div className="p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800/20">{renderAuthDetails()}</div>}
                      </div>
                  )}
                  {activeReqTab === 'pre' && renderHookConfig('pre', preHook, setPreHook)}
                  {activeReqTab === 'post' && renderHookConfig('post', postHook, setPostHook)}
              </div>
          </div>

          {/* Resizer Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-nebula-500 z-50 transition-colors bg-transparent hover:w-1.5"
            style={{ left: `${leftWidth}%` }}
            onMouseDown={() => setIsResizing(true)}
          ></div>

          {/* RIGHT COLUMN: Enhanced Response Encapsulation */}
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
                  <button onClick={handleAddStatus} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title={t.addStatus}><Plus size={14}/></button>
              </div>

              {/* Mode Toggle & Toolbar */}
              <div className="bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-0.5">
                      <button 
                        onClick={() => updateResponseConfig(c => ({...c, mode: 'visual'}))}
                        className={`px-3 py-1 text-xs rounded transition-colors ${activeResConfig.mode === 'visual' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white' : 'text-gray-500'}`}
                      >
                          {t.visualMode}
                      </button>
                      <button 
                        onClick={() => updateResponseConfig(c => ({...c, mode: 'code'}))}
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
                        onChange={(val) => updateResponseConfig(c => ({...c, script: val || ''}))} 
                      />
                  ) : (
                      <div className="h-full overflow-auto">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 text-xs text-gray-500 font-medium">
                                  <tr>
                                      <th className="p-2 pl-4 border-b border-gray-200 dark:border-gray-700 w-1/4">{t.key}</th>
                                      <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-20">{t.type}</th>
                                      {/* Removed Required Column */}
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

      </div>

      {/* Batch Edit Modal - Improved Height */}
      {batchModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-4">
                          <h3 className="font-bold text-gray-800 dark:text-white">{t.batchEdit}</h3>
                          <div className="flex bg-gray-200 dark:bg-gray-700 rounded p-0.5">
                              <button onClick={() => setBatchModal({...batchModal, mode: 'comma'})} className={`px-3 py-1 text-xs rounded transition-colors ${batchModal.mode === 'comma' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white' : 'text-gray-500'}`}>{t.commaMode}</button>
                              <button onClick={() => setBatchModal({...batchModal, mode: 'colon'})} className={`px-3 py-1 text-xs rounded transition-colors ${batchModal.mode === 'colon' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white' : 'text-gray-500'}`}>{t.colonMode}</button>
                          </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{batchModal.mode === 'comma' ? t.batchFormatComma : t.batchFormatColon}</div>
                  </div>
                  <div className="flex-1 p-0 relative">
                      <textarea 
                          value={batchModal.content}
                          onChange={(e) => setBatchModal({...batchModal, content: e.target.value})}
                          className="w-full h-full p-4 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-xs outline-none border-none"
                          placeholder={batchModal.mode === 'comma' ? "key,string,1,value,desc..." : "key: value..."}
                          rows={20}
                      />
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                      <button onClick={() => setBatchModal({...batchModal, isOpen: false})} className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">{t.cancel}</button>
                      <button onClick={handleBatchSave} className="px-4 py-2 rounded bg-nebula-600 text-white hover:bg-nebula-700 text-sm font-medium">{t.confirm}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ApiEditor;
