export interface Param {
    id: string;
    key: string;
    type: string;
    required: boolean;
    value: string;
    desc: string;
}

export interface JavaMethod {
    name: string;
    params: string[];
}

export interface JavaClass {
    name: string;
    methods: JavaMethod[];
}

export interface JavaHookConfig {
    enabled: boolean;
    className: string;
    methodName: string;
    args: Record<string, string>;
}

export interface AuthConfig {
    type: string; // bearer, basic, apikey, jwt, oauth2, custom, inherit, none
    config: {
        authKey?: string;
        authSecret?: string;
        apiKey?: { location: 'header' | 'query'; key: string; value: string };
        jwt?: { location: string; algo: string; secret: string; isBase64: boolean; payload: string; headerName?: string; prefix?: string; customHeader?: string };
        oauth2?: { grantType: string; clientId: string; clientSecret: string; authUrl: string; tokenUrl: string; redirectUrl: string; scope: string; username?: string; password?: string };
        customAuth?: JavaHookConfig;
    };
}

export interface ResponseNode {
    id: string;
    targetKey: string; // Final output key
    type: string;
    required: boolean;
    sourcePath: string; // Mapping path from raw response
    mock: string;
    desc: string;
    children?: ResponseNode[];
}

export interface StatusCodeConfig {
    id: string; // Unique Identifier
    name: string; // User defined rule name
    condition: { field: string; operator: string; value: string }; // Trigger comparison
    isDefault: boolean; // First rule is default usually, but explicit flag helps
    code?: string; // Legacy support or just use condition
    mode: 'visual' | 'code';
    schema: ResponseNode[]; // For visual mode
    script: string; // For code mode
}
