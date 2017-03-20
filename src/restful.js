"use strict";
const http_1 = require("http");
const url_1 = require("url");
const utils_1 = require("./utils");
class Restful {
    constructor(port = 5050, hostname = 'localhost') {
        this.port = port;
        this.hostname = hostname;
        this.resourceList = [];
    }
    _handleError(res, errorData) {
        res.writeHead(errorData.code, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(errorData));
    }
    _handleSuccess(res, data, code = 200) {
        data = {
            code: code,
            message: 'success',
            data: data
        };
        res.writeHead(code, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(data));
    }
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
    addSource(resource, path) {
        let resourceList = this.resourceList;
        if (utils_1.arrHas(resourceList, 'path', path)) {
            throw new utils_1.RestfulError(`The path:${path} already exists.`);
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
    addSourceMap(map) {
        for (let key in map) {
            this.addSource(map[key], key);
        }
    }
    start(options) {
        if (this.resourceList.length === 0) {
            throw new utils_1.RestfulError('There can not be any proxied resources');
        }
        this.server = http_1.createServer();
        this.server.on('request', (req, res) => {
            let { params, resource } = this._route(req);
            if (resource === null) {
                this._handleError(res, { code: 404, message: 'This url does not have a corresponding resource' });
            }
            else {
                resource._getResponse(req, params)
                    .then(({ data, code }) => {
                    this._handleSuccess(res, data, code);
                })
                    .catch((errorData) => {
                    this._handleError(res, errorData);
                });
            }
        });
        options && options['debug'] && console.log(`The server is running ${this.hostname}:${this.port}`);
        this.server.listen(this.port, this.hostname);
    }
    bindServer(server) {
        server.on('request', (req, res) => {
            let { params, resource } = this._route(req);
            if (resource === null) {
                return;
            }
            else {
                resource._getResponse(req, params)
                    .then(({ data, code }) => {
                    this._handleSuccess(res, data, code);
                })
                    .catch((errorData) => {
                    this._handleError(res, errorData);
                });
            }
        });
    }
    stop() {
        if (this.server !== undefined) {
            this.server.close();
        }
    }
}
exports.Restful = Restful;
//# sourceMappingURL=restful.js.map