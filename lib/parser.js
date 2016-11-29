"use strict";
const util_1 = require('util');
const qs = require('querystring');
class Parser {
    constructor(trim = false, errCb) {
        this.params = {};
        if (typeof (trim) !== 'function') {
            this.trim = !!trim;
            this.errCb = errCb || function () { };
        }
        else {
            this.trim = false;
            this.errCb = trim;
        }
    }
    parse(req, res) {
        let result = {};
        let _result = this._parseReqest(req);
        return result;
    }
    _parseReqest(req) {
        let isPost = req.method.toLowerCase() === 'post';
        let contentType = null;
        let result = {
            method: req.method
        };
        if (isPost) {
            contentType = req.headers['content-type'];
            if (contentType === 'application/json') {
            }
            else {
            }
        }
        else {
            let url = req.url, queryStr = url.substr(url.indexOf('?'));
            result['result'] = qs.parse(queryStr);
        }
        return this._checkParams(result);
    }
    _checkParams(result) {
        return result;
    }
    addParam(param) {
        let name = param.name;
        if (typeof (name) !== 'string') {
            throw new TypeError('The parameter type of name must be a string');
        }
        if (this.params[name]) {
            throw new TypeError(`The parameter name: ${name} already exists`);
        }
        this.params[name] = param;
    }
    removeParams(name) {
        if (typeof (name) !== 'string' && !util_1.isArray(name)) {
            throw new TypeError('The parameter type of name must be a string or string array');
        }
        let names = [].concat(name);
        names.forEach(name => {
            if (this.params[name]) {
                delete this.params[name];
            }
        });
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map