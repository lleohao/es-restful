import { parse } from 'url';
import { IncomingMessage, createServer, Server } from 'http';

abstract class Resource{}

export class Restful {
    private resourceMap: Map<string, Resource>;
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


    /**
     * add Resource
     * 
     * @param {string} path
     * @param {Resource} resource
     * 
     * @memberOf Api
     */
    addSource(path: string, resource: Resource) {
        let resourceMap = this.resourceMap;
        if (resourceMap.has(path)) {
            throw SyntaxError(`The path:${path} already exists.`)
        }
        resourceMap.set(path, resource);
    }

    /**
     * start server
     * 
     * 
     * @memberOf Api
     */
    start() {
        if (this.resourceMap.size === 0) {
            console.warn('There can not be any proxied resources')
        }
        let server = this.server;
        let resoureMap = this.resourceMap;

        server = createServer((req, res) => {
            let path = parse(req.url).pathname;
            if (resoureMap.has(path)) {

            } else {
                res.writeHead(404, { 'Content-type': 'application/json' });
                res.end(JSON.stringify({
                    code: 404,
                    message: 'The requested connection does not exist.'
                }));
            }
        });
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
            this.server.close()
        }
    }
}