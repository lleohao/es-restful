/// <reference types="node" />
/// <reference types="bluebird" />
import { IncomingMessage } from 'http';
import * as Promise from 'bluebird';
/**
 * 资源返回值类型
 *
 * @export
 * @interface ResourceResult
 */
export interface ResourceResult {
    /**
     * 返回数据
     *
     * @type {*}
     * @memberOf ResourceResult
     */
    data: any;
    /**
     * http code
     *
     * @type {number}
     * @default 200
     * @memberOf ResourceResult
     */
    code?: number;
}
export declare function async(): (target: any, propertyKey: string) => void;
/**
 * Resource 基类
 *
 * @export
 * @class Resource
 * @extends {EventEmitter}
 */
export declare class Resource {
    /**
     * 获取乡音数据
     *
     * @param {IncomingMessage} req             请求数据
     * @param {Object}          routeParams     路由参数
     * @returns Promise
     *
     * @memberOf Resource
     */
    _getResponse(req: IncomingMessage, routeParams: Object): Promise<{}>;
}
