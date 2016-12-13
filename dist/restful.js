"use strict";
const url_1 = require('url');
const http_1 = require('http');
function addParser(parser) {
    return function (target, propertyKey, descriptor) {
        console.log(target, propertyKey, descriptor);
    };
}
exports.addParser = addParser;
class Restful {
    constructor(port = 5050, hostname = 'localhost') {
        this.port = port;
        this.hostname = hostname;
        this.resourceMap = new Map();
    }
    addSource(path, resource) {
        let resourceMap = this.resourceMap;
        if (resourceMap.has(path)) {
            throw SyntaxError(`The path:${path} already exists.`);
        }
        resourceMap.set(path, resource);
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
            }
            else {
                res.writeHead(404, { 'Content-type': 'application/json' });
                res.end(JSON.stringify({
                    code: 404,
                    message: 'The requested connection does not exist.'
                }));
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