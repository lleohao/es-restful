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
    _getResponse(req, routeParams) {
        let method = req.method.toLowerCase();
        return new Promise((reslove, reject) => {
            let handle = this[method];
            // 存在当前请求类型的处理函数
            if (handle) {
                if (handle.parser === undefined) {
                    console.log(handle(routeParams));
                    reslove(handle(routeParams));
                }
                else {
                    let parser = handle.parser;
                    parser.parse(req).once('parseEnd', (data) => {
                        if (data.errorData !== undefined) {
                            reject(data.errorData);
                        }
                        else {
                            reslove(handle(Object.assign(data, routeParams)));
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
    /**
     * 返回处理数据
     *
     * @param {ResourceResult} {data, code = 200}
     *
     * @memberOf Resource
     */
    return({ data, code = 200 }) {
    }
}
exports.Resource = Resource;
//# sourceMappingURL=resource.js.map