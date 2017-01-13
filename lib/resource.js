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
    _getResponse(req) {
        return new Promise((reslove, reject) => {
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