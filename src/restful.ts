import { createServer, Server, ServerResponse, IncomingMessage } from 'http';
import { parse } from 'url';

import { Resource, ResourceResult } from './resource';
import { ErrorData } from './parser';
import { getRuleReg, arrHas, throwError } from './utils';

export interface CunstomResource extends Resource {
}

/**
 * 资源类型
 * 
 * @interface ApiResource
 */
interface ApiResource {
    /**
     * 资源对应路径
     * 
     * @type {string}
     * @memberOf ApiResource
     */
    path: string;
    /**
     * 资源对应路径的解析表达式
     * 
     * @type {RegExp}
     * @memberOf ApiResource
     */
    rule: RegExp;
    /**
     * 解析返回的参数信息
     * 
     * @type {string[]}
     * @memberOf ApiResource
     */
    params: string[];
    /**
     * 对应Resource类
     * 
     * @type {Resource}
     * @memberOf ApiResource
     */
    resource: CunstomResource;
}

/**
 * Reousrce map
 * 
 * @export
 * @interface ResourceMap
 */
export interface ResourceMap {
    [path: string]: CunstomResource
}

/**
 * 启动配置项
 * 
 * @export
 * @interface StartOption
 */
export interface StartOption {
    /**
     * open debug
     * 
     * @type {boolean}
     * @memberOf StartOption
     */
    debug?: boolean
}


/**
 * Restful Server class
 * 
 * @export
 * @class Restful
 */
export class Restful {
    private resourceList: ApiResource[];
    private port: number;
    private hostname: string;
    private server: Server;

    /**
     * Creates an instance of Restful.
     * 
     * @param {number} [port=5050]
     * @param {string} [hostname="localhost"]
     * 
     * @memberOf Restful
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
     * @param {ErrorData} errorData          错误信息
     * 
     * @memberOf Restful
     */
    private _handleError(res: ServerResponse, errorData: ErrorData) {
        res.writeHead(errorData.code, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(errorData));
    }

    /**
     * 响应正确数据
     * 
     * @param {ServerResponse}  res
     * @param {any}             data                 需要返回的数据
     * @param {number}          code                 http code
     * 
     * @memberOf Restful
     */
    private _handleSuccess(res: ServerResponse, data: any, code: number = 200) {
        data = {
            code: code,
            message: 'success',
            data: data
        };

        res.writeHead(code, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    /**
     * route
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
     * @param {any} resource
     * @param {string} path
     * 
     * @memberOf Restful
     */
    addSource(resource: CunstomResource, path: string) {
        let resourceList = this.resourceList;

        if (arrHas(resourceList, 'path', path)) {
            throwError(`The path:${path} already exists.`)
        }
        let { rule, params } = getRuleReg(path);

        resourceList.push({
            path: path,
            rule: rule,
            params: params,
            resource: resource
        });
    }


    /**
     * 批量添加 Resource
     * 
     * @param  map
     * 
     * @memberOf Restful
     */
    addSourceMap(resourceMap: ResourceMap) {
        for (let path in resourceMap) {
            this.addSource(resourceMap[path], path);
        }
    }

    /**
     * Start server
     * 
     * 
     * @memberOf Api
     */
    start(options: StartOption = { debug: false }) {
        if (this.resourceList.length === 0) {
            throwError('There can not be any proxied resources');
        }
        this.server = createServer();

        this.server.on('request', (req, res) => {
            let { params, resource } = this._route(req);

            // 存在处理当前数据的 resource
            if (resource === null) {
                this._handleError(res, { code: 404, message: 'This url does not have a corresponding resource' });
            } else {
                resource._getResponse(req, params)
                    .then(({ data, code }: ResourceResult) => {
                        this._handleSuccess(res, data, code);
                    })
                    .catch((errorData: ErrorData) => {
                        this._handleError(res, errorData)
                    });
            }
        });

        if (options.debug) {
            console.log(`The server is running ${this.hostname}:${this.port}`);
        }

        this.server.listen(this.port, this.hostname);
    }

    /**
     * 绑定外部服务器
     * 
     * @param {Server} server
     * 
     * @memberOf Restful
     * @api
     */
    bindServer(server: Server) {
        server.on('request', (req, res) => {
            let { params, resource } = this._route(req);

            // 存在处理当前数据的 resource
            if (resource !== null) {
                resource._getResponse(req, params)
                    .then(({ data, code }: ResourceResult) => {
                        this._handleSuccess(res, data, code);
                    })
                    .catch((errorData: ErrorData) => {
                        this._handleError(res, errorData)
                    });
            }
        })
    }

    /**
     * Stop server
     * 
     * 
     * @memberOf Restful
     */
    stop() {
        if (this.server !== undefined) {
            this.server.close();
        }
    }
}
