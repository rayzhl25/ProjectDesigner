import { JavaClass } from './types';

export const MOCK_JAVA_CLASSES: JavaClass[] = [
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

export const AUTH_TYPES = [
    { value: 'none', label: 'No Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'apikey', label: 'API Key' },
    { value: 'jwt', label: 'JWT Bearer' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'custom', label: 'Custom (Java)' },
];
