"use strict";
const http_1 = require("http");
const url_1 = require("url");
const utils_1 = require("./utils");
class RestfulError extends Error {
}
/**
 * (装饰器)给指定请求绑定参数解析
 *
 * @export
 * @param {Parser} parser
 * @returns
 */
function addParser(parser) {
    return function (target, propertyKey) {
        target[propertyKey].parser = parser;
    };
}
exports.addParser = addParser;
/**
 * Restful Server class
 *
 * @export
 * @class Restful
 */
class Restful {
    /**
     * Creates an instance of Api.
     *
     * @param {number} [port=5050]
     * @param {string} [hostname='localhost']
     *
     * @memberOf Api
     */
    constructor(port = 5050, hostname = 'localhost') {
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
    _handleError(res, code, data = {}) {
        if (typeof code === 'number') {
            data = {
                code: code,
                message: utils_1.errorMessages[code]
            };
        }
        else {
            data = code;
            code = data['code'];
        }
        res.writeHead(code, { 'Content-type': 'application/json' });
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
    _handleSuccess(res, code, data) {
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
    _route(req) {
        let resourceList = this.resourceList;
        let pathname = url_1.parse(req.url).pathname;
        for (let i = 0, len = resourceList.length; i < len; i++) {
            let resource = resourceList[i];
            let rule = resource.rule;
            rule.lastIndex = 0;
            let _params = rule.exec(pathname);
            let params = {};
            if (_params !== null) {
                resource.params.forEach((key, index) => {
                    params[key] = _params[index + 1];
                });
                return {
                    params: params,
                    resource: resource.resource
                };
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
    addSource(resource, path) {
        let resourceList = this.resourceList;
        if (utils_1.arrHas(resourceList, 'path', path)) {
            throw new RestfulError(`The path:${path} already exists.`);
        }
        try {
            resource = new resource();
            let { rule, params } = utils_1.getRuleReg(path);
            resourceList.push({
                path: path,
                rule: rule,
                params: params,
                resource: resource
            });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Start server
     *
     *
     * @memberOf Api
     */
    start(options) {
        if (this.resourceList.length === 0) {
            throw new RestfulError('There can not be any proxied resources');
        }
        this.server = http_1.createServer();
        this.server.on('request', (req, res) => {
            let { params, resource } = this._route(req);
            // 存在处理当前数据的 resource
            if (resource === null) {
                this._handleError(res, 404);
            }
            else {
                let handle = resource[req.method.toLowerCase()];
                // 存在当前请求类型的处理函数
                if (handle) {
                    if (handle.parser === undefined) {
                        this._handleSuccess(res, 200, handle.call(resource, params));
                    }
                    else {
                        let parser = handle.parser;
                        parser.parse(req).once('parseEnd', (data) => {
                            if (data.errorData !== undefined) {
                                this._handleError(res, data.errorData);
                            }
                            else {
                                this._handleSuccess(res, 200, handle.call(resource, Object.assign(params, data)));
                            }
                        });
                    }
                }
                else {
                    this._handleError(res, {
                        code: 400,
                        error: {
                            message: `${req.method.toLowerCase()} method is undefined.`
                        }
                    });
                }
            }
        });
        options && options['debug'] && console.log(`The server is running ${this.hostname}:${this.port}`);
        this.server.listen(this.port, this.hostname);
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
    /**
     * 绑定外部服务器
     *
     * @param {Server} server
     *
     * @memberOf Restful
     * @api
     */
    bindServer(server) {
        server.on('request', (req, res) => {
            let { params, resource } = this._route(req);
            // 存在处理当前数据的 resource
            if (resource === null) {
                return;
            }
            else {
                let handle = resource[req.method.toLowerCase()];
                // 存在当前请求类型的处理函数
                if (handle) {
                    if (handle.parser === undefined) {
                        this._handleSuccess(res, 200, handle.call(resource, params));
                    }
                    else {
                        let parser = handle.parser;
                        parser.parse(req).once('parseEnd', (data) => {
                            if (data.errorData !== undefined) {
                                this._handleError(res, data.errorData);
                            }
                            else {
                                this._handleSuccess(res, 200, handle.call(resource, Object.assign(params, data)));
                            }
                        });
                    }
                }
                else {
                    this._handleError(res, {
                        code: 400,
                        error: {
                            message: `${req.method.toLowerCase()} method is undefined.`
                        }
                    });
                }
            }
        });
    }
}
exports.Restful = Restful;
//# sourceMappingURL=restful.js.map