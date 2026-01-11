import React, { useState, useEffect, useRef } from 'react';
import { saveApiConfig } from '../../../services/mockService';
import { texts } from './common/texts';
import { Param, StatusCodeConfig, AuthConfig, JavaHookConfig } from './common/types';

import TopToolbar from './parts/TopToolbar';
import RequestPanel from './parts/RequestPanel';
import ResponseEditor from './parts/ResponseEditor';
import DebugResultPanel from './parts/DebugResultPanel';
import MonacoEditor from '../editors/MonacoEditor';

interface ApiEditorProps {
    file: any;
    lang?: 'zh' | 'en';
}

const ApiEditor: React.FC<ApiEditorProps> = ({ file, lang = 'zh' }) => {
    const [loading, setLoading] = useState(false);
    const [activeReqTab, setActiveReqTab] = useState<'info' | 'path' | 'params' | 'body' | 'headers' | 'cookies' | 'auth' | 'hooks'>('info');

    // Layout Resizing (Horizontal Split - Left/Right)
    const [leftWidth, setLeftWidth] = useState(60); // Percentage
    const [isResizingH, setIsResizingH] = useState(false);

    // Layout Resizing (Vertical Split - Request/Response)
    const [reqPanelHeight, setReqPanelHeight] = useState(60); // Percentage
    const [isResizingV, setIsResizingV] = useState(false);
    const leftColRef = useRef<HTMLDivElement>(null);

    // Method (Restored state)
    const [method, setMethod] = useState('POST');

    // URL Config
    const [urlConfig, setUrlConfig] = useState({
        baseUrlType: 'system' as 'system' | 'custom',
        customBaseUrl: 'http://localhost:8080',
        systemBaseUrl: 'http://192.168.1.100:8000/api', // Mock system url
        path: '/v1/pet'
    });

    // Body Config
    const [bodyType, setBodyType] = useState<'none' | 'form-data' | 'x-www-form-urlencoded' | 'json' | 'xml' | 'raw' | 'binary' | 'graphql'>('json');

    // Basic Info
    const [basicInfo, setBasicInfo] = useState({
        name: file?.title || 'New Interface',
        tags: [] as string[],
        description: '',
        usage: ''
    });

    // Auth & Hooks
    const [authConfig, setAuthConfig] = useState<AuthConfig>({
        type: 'inherit',
        config: {
            authKey: '',
            authSecret: '',
            apiKey: { location: 'header', key: '', value: '' },
            jwt: { location: 'header', algo: 'HS256', secret: '', isBase64: false, payload: '', headerName: 'Authorization', prefix: 'Bearer', customHeader: '' },
            oauth2: { grantType: 'authorization_code', clientId: '', clientSecret: '', authUrl: '', tokenUrl: '', redirectUrl: '', scope: '', username: '', password: '' },
            customAuth: { enabled: true, className: '', methodName: '', args: {} }
        }
    });

    // Helper to create default hook config
    const defaultHookConfig: JavaHookConfig = { enabled: true, className: '', methodName: '', args: {} };

    const [preHook, setPreHook] = useState({ type: 'inherit', config: { ...defaultHookConfig } });
    const [postHook, setPostHook] = useState({ type: 'inherit', config: { ...defaultHookConfig } });


    // Parameter Lists
    const [pathParams, setPathParams] = useState<Param[]>([]);
    const [queryParams, setQueryParams] = useState<Param[]>([]);
    const [headers, setHeaders] = useState<Param[]>([]);
    const [cookies, setCookies] = useState<Param[]>([]);
    const [formDataParams, setFormDataParams] = useState<Param[]>([]);
    const [urlEncodedParams, setUrlEncodedParams] = useState<Param[]>([]);

    // Body Content
    const [bodyContent, setBodyContent] = useState({
        json: '{\n  "name": "Hello Kitty",\n  "status": "sold"\n}',
        xml: '<pet>\n  <name>Hello Kitty</name>\n  <status>sold</status>\n</pet>',
        raw: '',
        graphqlQuery: '',
        graphqlVars: ''
    });

    // Response Configuration State
    const [isTransformEnabled, setIsTransformEnabled] = useState(false);
    // Helper for creating IDs
    const uuid = () => Math.random().toString(36).substring(2, 9);

    const [responseConfigs, setResponseConfigs] = useState<StatusCodeConfig[]>([
        {
            id: 'default_rule',
            code: '200',
            name: '默认规则',
            condition: { field: 'httpStatus', operator: '==', value: '200' },
            isDefault: true,
            mode: 'visual',
            schema: [
                {
                    id: 'root', targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Root Object', children: [
                        { id: 'r1', targetKey: 'code', type: 'integer', required: true, sourcePath: 'status.code', mock: '200', desc: 'Status Code' },
                        { id: 'r2', targetKey: 'data', type: 'object', required: true, sourcePath: 'response.body', mock: '', desc: 'Data Payload', children: [] },
                        { id: 'r3', targetKey: 'msg', type: 'string', required: true, sourcePath: 'status.message', mock: 'Success', desc: 'Message' }
                    ]
                }
            ],
            script: `// Default Encapsulation Rule
function transform(data) {
  return {
    success: true,
    data: data.data || data,
    timestamp: new Date().toISOString()
  };
}`
        },
        {
            id: uuid(),
            code: '404',
            name: '资源未找到',
            condition: { field: 'httpStatus', operator: '==', value: '404' },
            isDefault: false,
            mode: 'visual',
            schema: [
                {
                    id: 'root_err', targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Error Root', children: [
                        { id: 'e1', targetKey: 'error', type: 'string', required: true, sourcePath: 'err.msg', mock: 'Not Found', desc: 'Error Msg' }
                    ]
                }
            ],
            script: 'function transform(data) { return { error: "Not found", original: data }; }'
        }
    ]);

    // Debug State
    const [debugData, setDebugData] = useState<any>(null);
    const [debugError, setDebugError] = useState<string | undefined>(undefined);
    const [debugLoading, setDebugLoading] = useState(false);

    // Save Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveJsonContent, setSaveJsonContent] = useState('');

    const t = texts[lang];

    // Resizing Logic (Horizontal)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingH) return;
            const totalWidth = document.body.clientWidth;
            const newPercent = (e.clientX / totalWidth) * 100;
            if (newPercent > 20 && newPercent < 80) {
                setLeftWidth(newPercent);
            }
        };
        const handleMouseUp = () => setIsResizingH(false);

        if (isResizingH) {
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
    }, [isResizingH]);

    // Resizing Logic (Vertical - Request/Debug)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingV || !leftColRef.current) return;
            const dims = leftColRef.current.getBoundingClientRect();
            // Calculate percentage relative to left column height
            const relativeY = e.clientY - dims.top;
            const newPercent = (relativeY / dims.height) * 100;
            if (newPercent > 20 && newPercent < 90) {
                setReqPanelHeight(newPercent);
            }
        };
        const handleMouseUp = () => setIsResizingV(false);

        if (isResizingV) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingV]);


    // Initial Path Parsing (Heuristic for URL -> Params)
    useEffect(() => {
        const matches = urlConfig.path.match(/:([a-zA-Z0-9_]+)/g);
        if (matches) {
            const keysFromUrl = matches.map(m => m.substring(1));

            setPathParams(prev => {
                const currentKeys = prev.map(p => p.key);
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

    const getFullConfig = () => {
        return {
            basicInfo, urlConfig, method, bodyType, authConfig, preHook, postHook,
            params: { path: pathParams, query: queryParams, headers, cookies, body: bodyContent },
            responseConfigs,
            isTransformEnabled
        };
    };

    const handleOpenSave = () => {
        const config = getFullConfig();
        setSaveJsonContent(JSON.stringify(config, null, 2));
        setShowSaveModal(true);
    };

    const handleConfirmSave = async () => {
        setLoading(true);
        try {
            const config = getFullConfig();
            await saveApiConfig(config);
            setShowSaveModal(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        setDebugLoading(true);
        setDebugError(undefined);
        setDebugData(null);

        try {
            // Simulate Request Delay
            await new Promise(resolve => setTimeout(resolve, 500));

            let rawData: any = null;
            let httpStatus = 200; // Initialize HTTP status

            // MOCK LOGIC for Demo or System URL
            if (urlConfig.baseUrlType === 'system' || !urlConfig.customBaseUrl) {
                httpStatus = 200;
                rawData = {
                    status: { code: 200, message: "Success" },
                    data: {
                        id: 1024,
                        name: "Simulated Pet",
                        category: { id: 1, name: "Dogs" },
                        status: "available",
                        photoUrls: ["url1", "url2"]
                    }
                };
            } else {
                // Real Request Logic (Simplified for brevity, kept structure)
                // In a real app, we would execute the fetch here.
                // For this "Simulate" requirement, we will wrap it in a try-catch-mock
                try {
                    // 1. Base URL
                    let currentUrl = urlConfig.baseUrlType === 'system' ? urlConfig.systemBaseUrl : urlConfig.customBaseUrl;
                    // Remove trailing slash
                    if (currentUrl.endsWith('/')) currentUrl = currentUrl.slice(0, -1);
                    let path = urlConfig.path;

                    // 2. Path Params
                    pathParams.forEach(p => {
                        if (p.value) {
                            path = path.replace(`:${p.key}`, p.value);
                        }
                    });
                    // Ensure path starts with slash
                    if (!path.startsWith('/')) path = '/' + path;

                    const urlObj = new URL(currentUrl + path);

                    // 3. Query Params
                    queryParams.forEach(p => {
                        if (p.key && p.value) {
                            urlObj.searchParams.append(p.key, p.value);
                        }
                    });

                    // 4. Headers
                    const reqHeaders: Record<string, string> = {};
                    headers.forEach(h => {
                        if (h.key && h.value) reqHeaders[h.key] = h.value;
                    });

                    // 5. Body
                    let reqBody: any = undefined;
                    if (method !== 'GET' && method !== 'HEAD') {
                        if (bodyType === 'json') {
                            reqHeaders['Content-Type'] = 'application/json';
                            reqBody = bodyContent.json;
                        } else if (bodyType === 'xml') {
                            reqHeaders['Content-Type'] = 'application/xml';
                            reqBody = bodyContent.xml;
                        } else if (bodyType === 'x-www-form-urlencoded') {
                            reqHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
                            const params = new URLSearchParams();
                            urlEncodedParams.forEach(p => { if (p.key) params.append(p.key, p.value); });
                            reqBody = params.toString();
                        } else if (bodyType === 'form-data') {
                            // Start multipart manual construction or use FormData (fetch handles boundary)
                            const formData = new FormData();
                            formDataParams.forEach(p => { if (p.key) formData.append(p.key, p.value); });
                            reqBody = formData;
                            // Note: Do not manually set Content-Type for FormData, let browser set boundary
                        } else if (bodyType === 'raw') {
                            reqBody = bodyContent.raw;
                        } else if (bodyType === 'graphql') {
                            reqHeaders['Content-Type'] = 'application/json';
                            reqBody = JSON.stringify({ query: bodyContent.graphqlQuery, variables: JSON.parse(bodyContent.graphqlVars || '{}') });
                        }
                    }

                    const response = await fetch(urlObj.toString(), {
                        method,
                        headers: reqHeaders,
                        body: reqBody
                    });

                    httpStatus = response.status; // Capture HTTP status
                    const text = await response.text();

                    // Try to parse JSON
                    try {
                        rawData = JSON.parse(text);
                    } catch {
                        rawData = text;
                    }

                    if (!response.ok) {
                        setDebugError(`Status: ${response.status} ${response.statusText}`);
                    }

                } catch (e) {
                    console.warn("Fetch failed, using mock data for demo", e);
                    httpStatus = 200; // Fallback mock status
                    rawData = {
                        status: { code: 200, message: "Success" },
                        data: {
                            id: 999,
                            name: "Fallback Mock Pet",
                            status: "sold"
                        }
                    };
                }
            }

            // APPLY TRANSFORMATION
            if (isTransformEnabled && rawData) {
                try {
                    // Match Logic
                    // Priority: First matching specific rule -> Default rule
                    let appliedConfig: StatusCodeConfig | undefined;

                    const getValue = (obj: any, path: string) => {
                        if (path === 'httpStatus') return httpStatus;
                        return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
                    };

                    for (const cfg of responseConfigs) {
                        if (cfg.isDefault) continue; // Skip default in first pass

                        const leftVal = getValue(rawData, cfg.condition.field);
                        const rightVal = cfg.condition.value;
                        let match = false;

                        switch (cfg.condition.operator) {
                            case '==': match = String(leftVal) == rightVal; break;
                            case '!=': match = String(leftVal) != rightVal; break;
                            case '>': match = Number(leftVal) > Number(rightVal); break;
                            case '<': match = Number(leftVal) < Number(rightVal); break;
                            case 'contains': match = String(leftVal).includes(rightVal); break;
                            default: match = false;
                        }

                        if (match) {
                            appliedConfig = cfg;
                            break;
                        }
                    }

                    if (!appliedConfig) {
                        appliedConfig = responseConfigs.find(c => c.isDefault) || responseConfigs[0];
                    }

                    if (appliedConfig) {
                        if (appliedConfig.mode === 'code' && appliedConfig.script) {
                            // Safe-ish eval for demo
                            // eslint-disable-next-line no-new-func
                            const transformFunc = new Function('data', appliedConfig.script + '\nreturn transform(data);');
                            const transformed = transformFunc(rawData);
                            setDebugData(transformed);
                        } else {
                            // For Visual mode, we would parse schema. For now, just show raw + note
                            setDebugData({
                                ...rawData,
                                _note: `Transformed via rule: ${appliedConfig.name} (Visual mode not implemented in runtime)`
                            });
                        }
                    } else {
                        // No rule found (shouldn't happen if default exists)
                        setDebugData(rawData);
                    }

                } catch (err: any) {
                    setDebugError("Transformation Error: " + err.message);
                    setDebugData(rawData); // Show raw on error
                }
            } else {
                setDebugData(rawData);
            }

        } catch (e: any) {
            console.error(e);
            setDebugError(e.message || 'Unknown Error');
        } finally {
            setDebugLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-sm overflow-hidden">
            <TopToolbar
                method={method}
                setMethod={setMethod}
                urlConfig={urlConfig}
                setUrlConfig={setUrlConfig}
                handleSave={handleOpenSave}
                onSend={handleSend}
                loading={loading}
                t={t}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT COLUMN */}
                <div
                    ref={leftColRef}
                    className="flex flex-col border-r border-gray-200 dark:border-gray-700 min-w-[450px]"
                    style={{ width: `${leftWidth}%` }}
                >
                    <div className="flex flex-col w-full relative" style={{ height: `${reqPanelHeight}%` }}>
                        <RequestPanel
                            leftWidth={100} // RequestPanel thinks it's full width of its container
                            activeReqTab={activeReqTab}
                            setActiveReqTab={setActiveReqTab}
                            basicInfo={basicInfo}
                            setBasicInfo={setBasicInfo}
                            pathParams={pathParams}
                            setPathParams={setPathParams}
                            queryParams={queryParams}
                            setQueryParams={setQueryParams}
                            headers={headers}
                            setHeaders={setHeaders}
                            cookies={cookies}
                            setCookies={setCookies}
                            formDataParams={formDataParams}
                            setFormDataParams={setFormDataParams}
                            urlEncodedParams={urlEncodedParams}
                            setUrlEncodedParams={setUrlEncodedParams}
                            bodyType={bodyType}
                            setBodyType={setBodyType}
                            bodyContent={bodyContent}
                            setBodyContent={setBodyContent}
                            authConfig={authConfig}
                            setAuthConfig={setAuthConfig}
                            preHook={preHook}
                            setPreHook={setPreHook}
                            postHook={postHook}
                            setPostHook={setPostHook}
                            urlConfig={urlConfig}
                            setUrlConfig={setUrlConfig}
                            t={t}
                        />
                        {/* Vertical Resizer Handle */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-nebula-500 z-50 transition-colors bg-gray-200 dark:bg-gray-700 hover:h-1.5"
                            onMouseDown={() => setIsResizingV(true)}
                        ></div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                        <DebugResultPanel
                            data={debugData}
                            error={debugError}
                            loading={debugLoading}
                            t={t}
                            height="100%"
                        />
                    </div>
                </div>


                {/* Horizontal Resizer Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-nebula-500 z-50 transition-colors bg-transparent hover:w-1.5"
                    style={{ left: `${leftWidth}%` }}
                    onMouseDown={() => setIsResizingH(true)}
                ></div>

                {/* RIGHT COLUMN */}
                <ResponseEditor
                    responseConfigs={responseConfigs}
                    onChange={setResponseConfigs}
                    isEnabled={isTransformEnabled}
                    onToggleEnabled={setIsTransformEnabled}
                    t={t}
                />
            </div>

            {/* Save Confirmation Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                            <h3 className="font-bold text-gray-800 dark:text-white">Confirm Configuration</h3>
                            <div className="text-xs text-gray-500">Check the JSON payload before saving</div>
                        </div>
                        <div className="flex-1 border-b border-gray-200 dark:border-gray-700 relative">
                            <MonacoEditor language="json" value={saveJsonContent} readOnly={true} />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                            <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">{t.cancel}</button>
                            <button onClick={handleConfirmSave} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium flex items-center gap-2">
                                {loading ? t.saving : 'Submit & Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiEditor;
