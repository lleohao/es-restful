/// <reference types="node" />
/// <reference types="bluebird" />
import { ServerResponse } from 'http';
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
/**
 * Resource 基类
 *
 * @export
 * @class Resource
 * @extends {EventEmitter}
 */
export declare class Resource {
    _getResponse(req: ServerResponse): Promise<{}>;
    /**
     * 返回处理数据
     *
     * @param {ResourceResult} {data, code = 200}
     *
     * @memberOf Resource
     */
    return({data, code}: ResourceResult): void;
}
