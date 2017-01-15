/// <reference types="node" />
import { Server } from 'http';
/**
 * Restful Server class
 *
 * @export
 * @class Restful
 */
export declare class Restful {
    private resourceList;
    private port;
    private hostname;
    private server;
    /**
     * Creates an instance of Api.
     *
     * @param {number} [port=5050]
     * @param {string} [hostname='localhost']
     *
     * @memberOf Api
     */
    constructor(port?: number, hostname?: string);
    /**
     * 响应错误处理
     *
     * @param {ServerResponse} res
     * @param {(number | Object)} code          http code 或者错误信息对象
     * @param {(Object | string)} [data={}]     错误信息对象
     *
     * @memberOf Restful
     */
    private _handleError(res, errorData);
    /**
     * 响应正确数据
     *
     * @param {ServerResponse}  res
     * @param {any}             data                 需要返回的数据
     * @param {number}          code                 http code
     *
     * @memberOf Restful
     */
    private _handleSuccess(res, data, code?);
    /**
     * e
     *
     * @param {IncomingMessage} req
     * @returns
     *
     * @memberOf Restful
     */
    private _route(req);
    /**
     * add Resource
     *
     * @param {Resource} resource
     * @param {string} path
     *
     * @memberOf Api
     */
    addSource(resource: any, path: string): void;
    /**
     * Start server
     *
     *
     * @memberOf Api
     */
    start(options?: {}): void;
    /**
     * 绑定外部服务器
     *
     * @param {Server} server
     *
     * @memberOf Restful
     * @api
     */
    bindServer(server: Server): void;
    /**
     * Stop server
     *
     *
     * @memberOf Restful
     */
    stop(): void;
}
