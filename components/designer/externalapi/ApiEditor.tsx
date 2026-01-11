import React, { useState, useEffect } from 'react';
import { saveApiConfig } from '../../../services/mockService';
import { texts } from './common/texts';
import { Param, StatusCodeConfig, AuthConfig, JavaHookConfig } from './common/types';

import TopToolbar from './parts/TopToolbar';
import RequestPanel from './parts/RequestPanel';
import ResponseEditor from './parts/ResponseEditor';

interface ApiEditorProps {
    file: any;
    lang?: 'zh' | 'en';
}

const ApiEditor: React.FC<ApiEditorProps> = ({ file, lang = 'zh' }) => {
    const [loading, setLoading] = useState(false);
    const [activeReqTab, setActiveReqTab] = useState<'info' | 'path' | 'params' | 'body' | 'headers' | 'cookies' | 'auth' | 'hooks'>('info');

    // Layout Resizing
    const [leftWidth, setLeftWidth] = useState(60); // Percentage
    const [isResizing, setIsResizing] = useState(false);

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
        usage: '' // Added Rich Text content
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
    const [responseConfigs, setResponseConfigs] = useState<StatusCodeConfig[]>([
        {
            code: '200',
            name: '成功',
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
            script: '// Transform response data\nfunction transform(data) {\n  return {\n    success: true,\n    result: data\n  };\n}'
        },
        {
            code: '404',
            name: '记录不存在',
            mode: 'visual',
            schema: [
                {
                    id: 'root_err', targetKey: 'root', type: 'object', required: true, sourcePath: '$', mock: '', desc: 'Error Root', children: [
                        { id: 'e1', targetKey: 'error', type: 'string', required: true, sourcePath: 'err.msg', mock: 'Not Found', desc: 'Error Msg' }
                    ]
                }
            ],
            script: 'return { error: "Not found" }'
        }
    ]);

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

    const handleSave = async () => {
        setLoading(true);
        try {
            await saveApiConfig({
                basicInfo, urlConfig, method, bodyType, authConfig, preHook, postHook,
                params: { path: pathParams, query: queryParams, headers, cookies, body: bodyContent },
                responseConfigs
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-sm overflow-hidden">
            <TopToolbar
                method={method}
                setMethod={setMethod}
                urlConfig={urlConfig}
                setUrlConfig={setUrlConfig}
                handleSave={handleSave}
                loading={loading}
                t={t}
            />

            <div className="flex-1 flex overflow-hidden relative">
                <RequestPanel
                    leftWidth={leftWidth}
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

                {/* Resizer Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-nebula-500 z-50 transition-colors bg-transparent hover:w-1.5"
                    style={{ left: `${leftWidth}%` }}
                    onMouseDown={() => setIsResizing(true)}
                ></div>

                <ResponseEditor
                    responseConfigs={responseConfigs}
                    onChange={setResponseConfigs}
                    t={t}
                />
            </div>
        </div>
    );
};

export default ApiEditor;
