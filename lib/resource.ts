import { IncomingMessage } from 'http';
import * as Promise from 'bluebird';

import { Parser, ParamData } from './parser';

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

export function async() {
    return function (target: any, propertyKey: string) {
        target[propertyKey].async = true;
    };
}

/**
 * Resource 基类
 * 
 * @export
 * @class Resource
 * @extends {EventEmitter}
 */
export class Resource {
    /**
     * 获取乡音数据
     * 
     * @param {IncomingMessage} req             请求数据
     * @param {Object}          routeParams     路由参数
     * @returns Promise
     * 
     * @memberOf Resource
     */
    _getResponse(req: IncomingMessage, routeParams: Object) {
        let method = req.method.toLowerCase();

        return new Promise((reslove, reject) => {
            let handle = this[method];

            // 存在当前请求类型的处理函数
            if (handle) {
                let parser = <Parser>handle.parser;
                if (parser === undefined) {
                    if (handle['async']) {
                        handle(routeParams, reslove)
                    } else {
                        reslove(handle(routeParams));
                    }
                } else {
                    parser.parse(req).once('parseEnd', (data: ParamData) => {
                        if (data.errorData !== undefined) {
                            reject(data.errorData)
                        } else {
                            if (handle['async']) {
                                handle(routeParams, reslove)
                            } else {
                                reslove(handle(Object.assign(data, routeParams)));
                            }  
                        }
                    });
                }
            } else {
                reject({
                    code: 400,
                    error: {
                        message: `${method} method is undefined.`
                    }
                })
            }
        });
    }
}