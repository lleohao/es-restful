export interface CORSConfig {
    allowOrigin?: string;
    allowMethods?: string[];
    allowHeaders?: string[];
    allowCredentials?: boolean;
    maxAge?: number;
}

export const generateCorsHeaders = (corsOptions: boolean | CORSConfig) => {
    const defaultCorsHeader = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (corsOptions === undefined || !corsOptions) {
        return {};
    }

    if (typeof corsOptions === 'boolean') {
        return defaultCorsHeader;
    }

    const tmp = {};
    if (corsOptions.allowCredentials) {
        tmp['Access-Control-Allow-Credentials'] = true;
    }
    if (corsOptions.allowMethods) {
        tmp['Access-Control-Request-Method'] = corsOptions.allowMethods.map((methods) => {
            return methods.toUpperCase();
        }).join(', ');
    }
    if (corsOptions.allowOrigin) {
        tmp['Access-Control-Allow-Origin'] = corsOptions.allowOrigin;
    }
    if (corsOptions.maxAge) {
        tmp['Access-Control-Max-Age'] = corsOptions.maxAge;
    }
    if (corsOptions.allowHeaders) {
        tmp['Access-Control-Allow-Headers'] = corsOptions.allowHeaders.join(', ');
    }

    return Object.assign(defaultCorsHeader, tmp);
};
