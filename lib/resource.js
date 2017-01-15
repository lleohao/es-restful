"use strict";
const Promise = require("bluebird");
/**
 * Resource 基类
 *
 * @export
 * @class Resource
 * @extends {EventEmitter}
 */
class Resource {
    /**
     * (装饰器)指定该函数将以异步的方式返回数据
     *
     * @static
     * @returns
     *
     * @memberOf Resource
     */
    static async() {
        return function (target, propertyKey) {
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
    static addParser(parser) {
        return function (target, propertyKey) {
            target[propertyKey].parser = parser;
        };
    }
    /**
     * 获取乡音数据
     *
     * @param {IncomingMessage} req             请求数据
     * @param {Object}          routeParams     路由参数
     * @returns Promise
     *
     * @memberOf Resource
     */
    _getResponse(req, routeParams) {
        let method = req.method.toLowerCase();
        return new Promise((reslove, reject) => {
            let handle = this[method];
            // 存在当前请求类型的处理函数
            if (handle) {
                let parser = handle.parser;
                if (parser === undefined) {
                    if (handle['async']) {
                        handle(routeParams, reslove);
                    }
                    else {
                        reslove(handle(routeParams));
                    }
                }
                else {
                    parser.parse(req).once('parseEnd', (data) => {
                        if (data.errorData !== undefined) {
                            reject(data.errorData);
                        }
                        else {
                            if (handle['async']) {
                                handle(Object.assign(data, routeParams), reslove);
                            }
                            else {
                                reslove(handle(Object.assign(data, routeParams)));
                            }
                        }
                    });
                }
            }
            else {
                reject({
                    code: 400,
                    error: {
                        message: `${method} method is undefined.`
                    }
                });
            }
        });
    }
}
exports.Resource = Resource;
//# sourceMappingURL=resource.js.map