import { createServer, Server, ServerResponse, IncomingMessage } from 'http';

import { Resource } from './resource';
import { requestParse } from './requestParse';
import { Router } from './router';
import { throwError } from './utils';
import params, { ReqParams, ParsedData } from './params';


export interface RestfulOption {
    debug?: boolean;
    port?: number;
    hostname?: string;
}

const defaultOptions = {
    port: 5050,
    hostname: 'localhost',
    debug: false
};

export class Restful {
    private options: RestfulOption;
    private server: Server;
    private router: Router;

    constructor() {
        this.options = Object.assign({}, defaultOptions);
        this.router = new Router();
    }

    private finish(res: ServerResponse, code: number, data: object | string) {
        const responesData = {
            code: code
        };
        if (code >= 400) {
            responesData['error'] = (typeof data === 'string') ? {
                message: data
            } : data;
        } else {
            responesData['result'] = data;
        }

        res.writeHead(code, { 'Content-Type': 'Application/json' });
        res.write(JSON.stringify(responesData));
        res.end();
    }

    private requestHandle(inside = true) {
        const generateEnd = (response) => {
            return (data: any, code: number = 200) => {
                this.finish(response, code, data);
            };
        };

        return async (request: IncomingMessage, response: ServerResponse) => {
            const { urlPara, resource } = this.router.getResource(request.url);

            if (inside && resource === null) {
                this.finish(response, 404, `This path: "${request.url}" does not have a resource.`);
            } else {
                const processFun = resource.getMethodProcess(request.method);

                if (processFun) {
                    try {
                        const requestData = await requestParse(request);
                        const customParam: ReqParams = processFun['params'];
                        const { error, result } = customParam ? params.validation(customParam.getParams(), requestData) : {
                            error: null,
                            result: null
                        };

                        if (error) {
                            this.finish(response, 400, error);
                            return;
                        }

                        const callArgument: any[] = [generateEnd(response)];
                        if (Object.keys(urlPara).length > 0) {
                            callArgument.push(urlPara);
                        }
                        if (result !== null) {
                            callArgument.push(result);
                        }

                        processFun.apply(null, callArgument);
                    } catch (err) {
                        this.finish(response, 400, `Request parse throws a error: ${err.toString()}.`);
                    }
                } else {
                    this.finish(response, 404, `This path: "${request.url}", method: "${request.method}" is undefined.`)
                }
            }
        }
    }

    public add<T extends Resource>(Resource: { new(): T }, path: string) {
        this.addSource(Resource, path);
    }

    public addSource<T extends Resource>(Resource: { new(): T }, path: string) {
        this.router.addRoute(path, Resource);
    }

    public addSourceMap<T extends Resource>(resourceMap: { [path: string]: { new(): T } }) {
        for (let path in resourceMap) {
            this.addSource(resourceMap[path], path);
        }
    }

    public start(options: RestfulOption = {}) {
        this.options = Object.assign({}, this.options, options);

        if (this.router.isEmpty()) {
            throwError('There can not be any proxied resources.');
        }
        this.server = createServer();
        this.server.on('request', this.requestHandle(true));

        let { port, hostname } = this.options;
        this.server.listen(port, hostname);
        if (options.debug) {
            console.log(`The server is running ${hostname}:${port}`);
        }
    }

    public bindServer(server: Server) {
        server.on('request', this.requestHandle(false));
    }

    public stop() {
        if (this.server !== undefined) {
            this.server.close();
        }
    }
}

