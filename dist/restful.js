"use strict";
const http_1 = require('http');
class Api {
    constructor(port = 5050, hostname = 'localhost') {
        this.port = port;
        this.hostname = hostname;
        this.resourceMap = new Map();
    }
    addSource(path, resource) {
        let resourceMap = this.resourceMap;
        if (resourceMap.has(path)) {
            throw SyntaxError(`The path:${path} already exists`);
        }
        resourceMap.set(path, resource);
    }
    start() {
        if (this.resourceMap.size === 0) {
            console.warn('There can not be any proxied resources');
        }
        this.server = http_1.createServer((req, res) => {
        });
        this.server.listen(this.port, this.hostname);
    }
    stop() {
        if (this.server !== undefined) {
            this.server.close();
        }
    }
}
//# sourceMappingURL=restful.js.map