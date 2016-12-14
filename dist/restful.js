"use strict";
const url_1 = require('url');
const http_1 = require('http');
function addParser(parser) {
    return function (target, propertyKey, descriptor) {
        descriptor.value.parser = parser;
    };
}
exports.addParser = addParser;
class Restful {
    constructor(port = 5050, hostname = 'localhost') {
        this.errorMessage = {
            400: 'There is no function corresponding to the request method.',
            404: 'The requested connection does not exist.'
        };
        this.port = port;
        this.hostname = hostname;
        this.resourceMap = new Map();
    }
    _handleRes(res, code, data) {
        if (this.errorMessage[code]) {
            let data = {
                code: code,
                message: this.errorMessage[code]
            };
        }
        else {
            data = {
                code: code,
                data: data
            };
        }
        res.writeHead(code, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(data));
        res.end();
    }
    addSource(path, resource) {
        let resourceMap = this.resourceMap;
        if (resourceMap.has(path)) {
            throw SyntaxError(`The path:${path} already exists.`);
        }
        try {
            resource = new resource();
            resourceMap.set(path, resource);
        }
        catch (error) {
            throw error;
        }
    }
    start() {
        if (this.resourceMap.size === 0) {
            console.warn('There can not be any proxied resources');
        }
        let server = this.server;
        let resoureMap = this.resourceMap;
        server = http_1.createServer((req, res) => {
            let path = url_1.parse(req.url).pathname;
            if (resoureMap.has(path)) {
                let resource = resoureMap.get(path);
                let result = null;
                let handle = resource[req.method];
                if (handle) {
                    if (handle.parser === undefined) {
                        this._handleRes(res, 200, handle());
                    }
                    else {
                        handle.parser.on('end', (data) => {
                            this._handleRes(res, 200, handle(result));
                        });
                    }
                }
                else {
                    this._handleRes(res, 400);
                }
            }
            else {
                this._handleRes(res, 404);
            }
        });
        server.listen(this.port, this.hostname);
    }
    stop() {
        if (this.server !== undefined) {
            this.server.close();
        }
    }
}
exports.Restful = Restful;
//# sourceMappingURL=restful.js.map