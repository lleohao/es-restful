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


    _getResponse(req: IncomingMessage, routeParams: {}) {
        let method = req.method.toLowerCase();

        return new Promise((reslove, reject) => {
            let handle = this[method];

            // 存在当前请求类型的处理函数
            if (handle) {
                if (handle.parser === undefined) {
                    console.log(handle(routeParams));
                    reslove(handle(routeParams))
                    // this._handleSuccess(res, 200, handle.call(resource, routeParams));
                } else {
                    let parser = <Parser>handle.parser;

                    parser.parse(req).once('parseEnd', (data: ParamData) => {
                        if (data.errorData !== undefined) {
                            reject(data.errorData)
                        } else {
                            reslove(handle(Object.assign(data, routeParams)));
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


    /**
     * 返回处理数据
     * 
     * @param {ResourceResult} {data, code = 200}
     * 
     * @memberOf Resource
     */
    return({data, code = 200}: ResourceResult) {

    }
}