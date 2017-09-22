import { createServer, IncomingMessage, Server, ServerResponse, } from 'http';

import params, { ParsedData, ReqParams } from './params';
import { requestParse } from './requestParse';
import { Resource } from './resource';
import { Router } from './router';
import { createError, isType, RestfulErrorType } from './utils';

export interface CORS {
    allowOrigin?: string;
    allowMethods?: string[];
    allowHeaders?: string[];
    allowCredentials?: boolean;
    maxAge?: number;
}

export interface RestfulContructonOption {
    headers?: { [key: string]: any };
    CORS?: boolean | CORS;
}

export interface ResultfulRunOption {
    debug?: boolean;
    port?: number;
    hostname?: string;
}

export interface RestfulOption extends RestfulContructonOption, ResultfulRunOption { }

const defaultOptions = {
    port: 5050,
    hostname: 'localhost',
    debug: false,
    header: {}
};

export class Restful {
    private options: RestfulOption;
    private server: Server;
    private router: Router;

    constructor(options: RestfulContructonOption = {}) {
        let headers = options.headers || {};
        headers = Object.assign(headers, this.generateCorsHeaders(options.CORS));

        this.options = Object.assign({}, defaultOptions, {
            headers
        });
        this.router = new Router();
    }

    private generateCorsHeaders(corsOptions: boolean | CORS) {
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
    }

    private setHeaders(res: ServerResponse, headers) {
        for (const key in headers) {
            res.setHeader(key, headers[key]);
        }
    }

    private finish(res: ServerResponse, code: number, data: object | string) {
        const responesData = {
            code
        };
        if (code >= 400) {
            responesData['error'] = (typeof data === 'string') ? {
                message: data
            } : data;
        } else {
            responesData['data'] = data;
        }

        this.setHeaders(res, this.options.headers);
        res.writeHead(code, { 'Content-Type': 'Application/json' });
        res.write(JSON.stringify(responesData));
        res.end();
    }

    private requestHandle(inside = true, next?: () => void) {
        const generateEnd = (response) => {
            return (data: any, code: number = 200) => {
                this.finish(response, code, data);
            };
        };

        return async (request: IncomingMessage, response: ServerResponse) => {
            const { urlPara, resource } = this.router.getResource(request.url);

            if (this.options.debug) {
                console.log(`${new Date()} ${request.method} ${request.url}`);
            }

            if (request.method === 'OPTIONS') {
                this.setHeaders(response, this.options.headers);
                response.end();
                return;
            }

            if (resource === null) {
                if (inside) {
                    this.finish(response, 404, `This path: "${request.url}" does not have a resource.`);
                } else if (next) {
                    next();
                }
                return;
            }

            const methodFunction = resource.getMethodProcess(request.method);
            if (methodFunction) {
                try {
                    const requestData = await requestParse(request);
                    const result = methodFunction['params'] ?
                        params.validation(methodFunction['params'].getParams(), requestData) : {};
                    const callArgument: any[] = [generateEnd(response)];

                    if (Object.keys(urlPara).length > 0) {
                        callArgument.push(urlPara);
                    }
                    if (result !== null) {
                        callArgument.push(result);
                    }

                    methodFunction.apply(null, callArgument);
                } catch (err) {
                    switch (err.type) {
                        case RestfulErrorType.PARAMS:
                            this.finish(response, 400, {
                                code: err.code,
                                message: err.message
                            });
                            break;
                        case RestfulErrorType.REQUEST:
                            this.finish(response, err.statusCode, `Request parse throws a error: ${err.message}.`);
                            break;
                    }
                }
            } else {
                this.finish(response, 403, `This path: "${request.url}", method: "${request.method}" is undefined.`);
            }
        };
    }

    public add<T extends Resource>(R: { new(): T }, path: string) {
        this.addSource(R, path);
    }

    public addSource<T extends Resource>(R: { new(): T }, path: string) {
        this.router.addRoute(path, R);
    }

    public addSourceMap<T extends Resource>(resourceMap: { [path: string]: { new(): T } }) {
        for (const path in resourceMap) {
            this.addSource(resourceMap[path], path);
        }
    }

    public start(options: ResultfulRunOption = {}) {
        this.options = Object.assign({}, this.options, options);

        if (this.router.isEmpty()) {
            throw createError({
                message: 'There can not be any proxied resources.'
            }, this.start);
        }
        this.server = createServer();
        this.server.on('request', this.requestHandle(true));

        const { port, hostname } = this.options;
        this.server.listen(port, hostname);
        if (options.debug) {
            console.log(`The server is running ${hostname}:${port}`);
        }
    }

    public bindServer(server: Server, options: ResultfulRunOption = {}) {
        this.options = Object.assign({}, this.options, options);

        server.on('request', this.requestHandle(false));
    }

    public stop() {
        if (this.server !== undefined) {
            this.server.close();
        }
    }

    public use() {
        return (req, res, next: () => void) => {
            this.requestHandle(false, next)(req, res);
        };
    }
}
