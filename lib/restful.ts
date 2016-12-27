import { createServer, Server, ServerResponse, IncomingMessage } from 'http';
import { parse } from 'url';

import { Parser, ParamData } from './parser';
import { errorMessages, getRuleReg, arrHas } from './utils';

export function addParser(parser: Parser) {
    return function (target: any, propertyKey: string) {
        target[propertyKey].parser = parser;
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
    private debug: boolean;

    /**
     * Creates an instance of Api.
     * 
     * @param {number} [port=5050]
     * @param {string} [hostname='localhost']
     * 
     * @memberOf Api
     */
    constructor(port: number = 5050, hostname: string = 'localhost', debug: boolean = false) {
        this.port = port;
        this.hostname = hostname;
        this.resourceList = [];
        this.debug = debug;
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
     * e
     * 
     * @param {IncomingMessage} req
     * @returns
     * 
     * @memberOf Restful
     */
    private _route(req: IncomingMessage) {
        let resourceList = this.resourceList;
        let pathname = parse(req.url).pathname;

        for (let i = 0, len = resourceList.length; i < len; i++) {
            let resource = resourceList[i];
            let rule = resource.rule;
            rule.lastIndex = 0;

            let _params: RegExpExecArray = rule.exec(pathname);
            let params = {};

            if (_params !== null) {
                resource.params.forEach((key, index) => {
                    params[key] = _params[index + 1]
                })
                return {
                    params: params,
                    resource: resource.resource
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
     * @param {Resource} resource
     * @param {string} path
     * 
     * @memberOf Api
     */
    addSource(resource: any, path: string) {
        let resourceList = this.resourceList;

        if (arrHas(resourceList, 'path', path)) {
            throw SyntaxError(`The path:${path} already exists.`);
        }
        try {
            resource = new resource();
            let {rule, params} = getRuleReg(path);

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

                        parser.parse(req, res).once('parseEnd', (data: ParamData) => {
                            if (data.errorData !== undefined) {
                                this._handleError(res, data.errorData);
                            } else {
                                this._handleSuccess(res, 200, handle.call(resource, Object.assign(params, data)));
                            }
                        });
                    }

                } else {
                    this._handleError(res, 400);
                }
            }
        });

        this.debug && console.log(`The server is running ${this.hostname}:${this.port}`);
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