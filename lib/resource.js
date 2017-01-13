"use strict";
const Promise = require("bluebird");
function async() {
    return function (target, propertyKey) {
        target[propertyKey].async = true;
    };
}
exports.async = async;
/**
 * Resource 基类
 *
 * @export
 * @class Resource
 * @extends {EventEmitter}
 */
class Resource {
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
                                handle(routeParams, reslove);
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