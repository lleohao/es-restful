import { createServer, IncomingMessage, Server, ServerResponse, } from 'http';

import { CORSConfig } from './helper/cors';
import { ResponseHandle, ResponseOption } from './helper/response';
import params, { ParsedData, ReqParams } from './params';
import { requestParse } from './requestParse';
import { Resource } from './resource';
import { Router } from './router';
import { createError, isType, RestfulErrorType } from './utils';

export interface RestfulContructonOption extends ResponseOption { }

export interface ResultfulRunOption {
    debug?: boolean;
    port?: number;
    hostname?: string;
}

export interface RestfulOption extends RestfulContructonOption, ResultfulRunOption { }

const defaultOptions = {
    port: 5050,
    hostname: 'localhost',
    debug: false
};

export class Restful {
    private options: RestfulOption;
    private server: Server;
    private router: Router;
    private responseHandle: ResponseHandle;

    constructor(options: RestfulContructonOption = {}) {
        this.responseHandle = new ResponseHandle(options);
        this.options = Object.assign({}, defaultOptions);
        this.router = new Router();
    }

    private requestHandle(inside = true, next?: () => void) {
        const res = this.responseHandle;
        const generateEnd = (response) => {
            return (data: any, code = 200, headers = {}) => {
                res.finish(response, code, headers, data);
            };
        };

        return (request: IncomingMessage, response: ServerResponse) => {
            const { urlPara, resource } = this.router.getResource(request.url);

            if (this.options.debug) {
                console.log(`${new Date()} ${request.method} ${request.url}`);
            }

            if (request.method === 'OPTIONS') {
                res.endOptions(response);
                return;
            }

            if (resource === null) {
                if (inside) {
                    res.finish(response, 404, `This path: "${request.url}" does not have a resource.`);
                } else if (next) {
                    next();
                }
                return;
            }

            const methodFunction = resource.getMethodProcess(request.method);
            requestParse(request, (err, data) => {
                if (err) {

                } else {

                }
            });

            if (methodFunction) {
                try {
                    // const requestData = requestParse(request);
                    // const result = methodFunction['params'] ?
                    //     params.validation(methodFunction['params'].getParams(), requestData) : {};
                    const callArgument: any[] = [generateEnd(response)];

                    if (Object.keys(urlPara).length > 0) {
                        callArgument.push(urlPara);
                    }
                    // if (result !== null) {
                    //     callArgument.push(result);
                    // }

                    methodFunction.apply(null, callArgument);
                } catch (err) {
                    switch (err.type) {
                        case RestfulErrorType.PARAMS:
                            res.finish(response, 400, {
                                code: err.code,
                                message: err.message
                            });
                            break;
                        case RestfulErrorType.REQUEST:
                            res.finish(response, err.statusCode, `Request parse throws a error: ${err.message}.`);
                            break;
                    }
                }
            } else {
                res.finish(response, 403, `This path: "${request.url}", method: "${request.method}" is undefined.`);
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

    /**
     * For express middleware
     * 
     * @returns 
     * @example
     * const app = express();
     * const api = new Restful();
     * app.use(api.ues());
     */
    public use(express) {
        return (req, res, next: () => void) => {
            this.requestHandle(false, next)(req, res);
        };
    }
}
