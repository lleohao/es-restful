import { parse } from 'url';
import { IncomingMessage, createServer, Server, ServerResponse } from 'http';
import { Parser } from './parser'

export function addParser(parser: Parser) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value.parser = parser;
    }
}

export class Restful {
    private resourceMap: Map<string, Object>;
    private port: number;
    private hostname: string;
    private server: Server;
    private errorMessage: Object = {
        400: 'There is no function corresponding to the request method.',
        404: 'The requested connection does not exist.'
    }

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

    _handleRes(res: ServerResponse, code: number, data?: Object | string) {
        if (this.errorMessage[code]) {
            let data = {
                code: code,
                message: this.errorMessage[code]
            }
        } else {
            data = {
                code: code,
                data: data
            }
        }

        res.writeHead(code, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(data));
        res.end();
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
            throw SyntaxError(`The path:${path} already exists.`)
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
            console.warn('There can not be any proxied resources')
        }
        let server = this.server;
        let resoureMap = this.resourceMap;

        server = createServer((req, res) => {
            let path = parse(req.url).pathname;
            if (resoureMap.has(path)) {
                let resource = resoureMap.get(path);
                let result: string | Object = null;
                let handle = resource[req.method];

                // 存在当前请求类型的处理函数
                if (handle) {
                    if (handle.parser === undefined) {
                        this._handleRes(res, 200, handle());
                    } else {
                        handle.parser.on('end', (data) => {
                            this._handleRes(res, 200, handle(result));
                        })
                    }

                } else {
                    this._handleRes(res, 400);
                }
            } else {
                this._handleRes(res, 404);
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
            this.server.close()
        }
    }
}