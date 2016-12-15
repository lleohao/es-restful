import { parse } from 'url';
import { createServer, Server, ServerResponse } from 'http';

import { Parser, ParamData } from './parser';
import { errorMessages } from './utils';

export function addParser(parser: Parser) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value.parser = parser;
    };
}

export class Restful {
    private resourceMap: Map<string, Object>;
    private port: number;
    private hostname: string;
    private server: Server;

    /**
     * Creates an instance of Api.
     * 
     * @param {number} [port=5050]
     * @param {string} [hostname='localhost']
     * 
     * @memberOf Api
     */
    constructor(port: number = 5050, hostname: string = 'localhost') {
        this.port = port;
        this.hostname = hostname;
        this.resourceMap = new Map();
    }

    _handleError(res: ServerResponse, code: number | Object, data: Object | string = {}) {
        if (typeof code === 'number') {
            data = {
                code: code,
                message: errorMessages[code]
            };
        } else {
            data = code;
            code = data['code'];
        }

        res.writeHead(<number>code, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    _handleSuccess(res: ServerResponse, code: number, data: Object | string) {
        data = {
            code: code,
            message: 'success',
            data: data
        };

        res.writeHead(code, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    /**
     * add Resource
     * 
     * @param {string} path
     * @param {Resource} resource
     * 
     * @memberOf Api
     */
    addSource(path: string, resource: any) {
        let resourceMap = this.resourceMap;
        if (resourceMap.has(path)) {
            throw SyntaxError(`The path:${path} already exists.`);
        }
        try {
            resource = new resource();
            resourceMap.set(path, resource);
        } catch (error) {
            throw error;
        }
    }

    /**
     * start server
     * 
     * 
     * @memberOf Api
     */
    start() {
        if (this.resourceMap.size === 0) {
            console.warn('There can not be any proxied resources');
        }
        let server = this.server;
        let resoureMap = this.resourceMap;

        server = createServer((req, res) => {
            let path = parse(req.url).pathname;
            if (resoureMap.has(path)) {
                let resource = resoureMap.get(path);
                let handle = resource[req.method.toLowerCase()];

                // 存在当前请求类型的处理函数
                if (handle) {
                    if (handle.parser === undefined) {
                        this._handleSuccess(res, 200, handle.call(resource));
                    } else {
                        let parser = handle.parser;

                        parser.parse(req, res).on('parseEnd', (data: ParamData) => {
                            if (data.errorData !== undefined) {
                                this._handleError(res, data.errorData);
                            } else {
                                this._handleSuccess(res, 200, handle.call(resource, data));
                            }
                        });
                    }

                } else {
                    this._handleError(res, 400);
                }
            } else {
                this._handleError(res, 404);
            }
        });

        console.log(`The server is running ${this.hostname}:${this.port}`);
        server.listen(this.port, this.hostname);
    }

    /**
     * stop server
     * 
     * 
     * @memberOf Api
     */
    stop() {
        if (this.server !== undefined) {
            this.server.close();
        }
    }
}