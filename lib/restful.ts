import { createServer, Server, ServerResponse } from 'http';
import { parse } from 'url';

import { Parser, ParamData } from './parser';
import { errorMessages, getRuleRegx, arrHas } from './utils';

export function addParser(parser: Parser) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value.parser = parser;
    };
}

interface Resource {
    path: string;
    rule: RegExp;
    params: string[];
    resource: any;
}

export class Restful {
    private resourceList: Resource[];
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
        this.resourceList = [];
    }

    /**
     * 响应错误处理
     * 
     * @param {ServerResponse} res
     * @param {(number | Object)} code          http code 或者错误信息对象
     * @param {(Object | string)} [data={}]     错误信息对象
     * 
     * @memberOf Restful
     */
    private _handleError(res: ServerResponse, code: number | Object, data: Object | string = {}) {
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

    /**
     * 
     * 
     * @param {ServerResponse} res
     * @param {number} code                     http code
     * @param {(Object | string)} data          需要返回的数据
     * 
     * @memberOf Restful
     */
    private _handleSuccess(res: ServerResponse, code: number, data: Object | string) {
        data = {
            code: code,
            message: 'success',
            data: data
        };

        res.writeHead(code, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    /**
     * 
     * 
     * @param {any} req
     * @returns
     * 
     * @memberOf Restful
     */
    private _route(req) {
        let resourceList = this.resourceList;
        let path = parse(req.url).pathname;

        for (let i = 0, len = resourceList.length; i < len; i++) {
            let resource = resourceList[i];
            let params: RegExpExecArray = null;
            params = resource.rule.exec(path);
            if (params !== null) {
                return {
                    params: params,
                    resource: resource
                }
            }
        }

        return {
            params: null,
            resource: null
        };
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
        let resourceList = this.resourceList;

        if (arrHas(resourceList, 'path', path)) {
            throw SyntaxError(`The path:${path} already exists.`);
        }
        try {
            resource = new resource();
            let {rule, params} = getRuleRegx(path);

            resourceList.push({
                path: path,
                rule: rule,
                params: params,
                resource: resource
            });
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
        if (this.resourceList.length === 0) {
            console.warn('There can not be any proxied resources');
        }
        let server = this.server;

        server = createServer();
        server.on('request', (req, res) => {
            let {params, resource} = this._route(req);

            // 存在处理当前数据的 resource
            if (resource === null) {
                this._handleError(res, 404);
            } else {
                let handle = resource[req.method.toLowerCase()];

                // 存在当前请求类型的处理函数
                if (handle) {
                    if (handle.parser === undefined) {
                        this._handleSuccess(res, 200, handle.call(resource, params));
                    } else {
                        let parser = handle.parser;

                        parser.parse(req, res).on('parseEnd', (data: ParamData) => {
                            if (data.errorData !== undefined) {
                                this._handleError(res, data.errorData);
                            } else {
                                this._handleSuccess(res, 200, handle.call(resource, params, data));
                            }
                        });
                    }

                } else {
                    this._handleError(res, 400);
                }
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