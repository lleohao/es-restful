/// <reference types="node" />
/// <reference types="bluebird" />
import { IncomingMessage } from 'http';
import * as Promise from 'bluebird';
import { Parser } from './parser';
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
/**
 * Resource 基类
 *
 * @export
 * @class Resource
 * @extends {EventEmitter}
 */
export declare class Resource {
    /**
     * (装饰器)指定该函数将以异步的方式返回数据
     *
     * @static
     * @returns
     *
     * @memberOf Resource
     */
    static async(): (target: any, propertyKey: string) => void;
    /**
     * (装饰器)给指定请求绑定参数解析
     *
     * @static
     * @param {Parser} parser
     * @returns
     *
     * @memberOf Resource
     */
    static addParser(parser: Parser): (target: any, propertyKey: string) => void;
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
