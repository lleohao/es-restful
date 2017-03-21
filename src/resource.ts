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

/**
 * Resource 基类
 * 
 * @export
 * @class Resource
 * @extends {EventEmitter}
 */
export class Resource {
    constructor () {

    }
    
    /**
     * (装饰器)指定该函数将以异步的方式返回数据
     * 
     * @static
     * @returns
     * 
     * @memberOf Resource
     */
    static async() {
        return function (target: any, propertyKey: string) {
            target[propertyKey].async = true;
        };
    }


    /**
     * (装饰器)给指定请求绑定参数解析
     * 
     * @static
     * @param {Parser} parser
     * @returns
     * 
     * @memberOf Resource
     */
    static addParser(parser: Parser) {
        return function (target: any, propertyKey: string) {
            target[propertyKey].parser = parser;
        };
    }


    /**
     * 获取响应数据
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
                                handle(Object.assign(data, routeParams), reslove)
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
