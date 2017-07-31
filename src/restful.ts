import { createServer, Server, ServerResponse } from 'http';

import { Resource, ResourceResult } from './resource';
import { ErrorData } from './parser';
import { throwError } from './utils';
import { Router } from './router';

/**
 * 启动配置项
 * 
 * @export
 * @interface RestfulOption
 */
export interface RestfulOption {
    /**
     * open debug
     * 
     */
    debug?: boolean;
    port?: number;
    hostname?: string;
}

const defaultOptions = {
    port: 5050,
    hostname: 'localhost',
    debug: false
};

/**
 * Restful Server class
 * 
 * @export
 * @class Restful
 */
export class Restful {
    private options: RestfulOption;
    private server: Server;
    private router: Router;


    /**
     * Creates an instance of Restful.
     * 
     */
    constructor() {
        this.options = Object.assign({}, defaultOptions);
        this.router = new Router();
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
     * 
     * 
     * @param Resource      class should extend Reource
     * @param path          resource path
     */
    addSource<T extends Resource>(Resource: { new(): T }, path: string) {
        this.router.addRoute(path, Resource);
    }

    add<T extends Resource>(Resource: { new(): T }, path: string) {
        this.addSource(Resource, path);
    }

    /**
     * 批量添加 Resource
     * 
     * @param  map
     * 
     * @memberOf Restful
     */
    addSourceMap<T extends Resource>(resourceMap: { [path: string]: { new(): T } }) {
        for (let path in resourceMap) {
            this.addSource(resourceMap[path], path);
        }
    }

    start(options: RestfulOption = {}) {
        this.options = Object.assign({}, this.options, options);

        if (this.router.isEmpty()) {
            throwError('There can not be any proxied resources');
        }
        this.server = createServer();
        this.server.on('request', (req, res) => {
            let { params, resource } = this.router.getResource(req.url);

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

        let { port, hostname } = this.options;
        this.server.listen(port, hostname);
        if (options.debug) {
            console.log(`The server is running ${hostname}:${port}`);
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
    bindServer(server: Server) {
        server.on('request', (req, res) => {
            let { params, resource } = this.router.getResource(req.url);

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

