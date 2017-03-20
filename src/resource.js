"use strict";
const Promise = require("bluebird");
class Resource {
    static async() {
        return function (target, propertyKey) {
            target[propertyKey].async = true;
        };
    }
    static addParser(parser) {
        return function (target, propertyKey) {
            target[propertyKey].parser = parser;
        };
    }
    _getResponse(req, routeParams) {
        let method = req.method.toLowerCase();
        return new Promise((reslove, reject) => {
            let handle = this[method];
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