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
        let result = this._parseReqest(req);
        if (!result.hasError) {
            return { data: result['result'] };
        }
        else {
            this._handleError(result.error, res);
        }
    }
    _parseReqest(req) {
        let isGet = req.method.toLowerCase() === 'get';
        let contentType = null;
        let result = {
            method: req.method
        };
        let url = req.url.substr(this.baseUrl.length);
        if (isGet) {
            let queryStr = url.substr(url.indexOf('?') + 1);
            result['result'] = qs.parse(queryStr);
        }
        else {
            contentType = req.headers['content-type'];
        }
        return this._checkParams(result);
    }
    _checkParams(result) {
        return result;
    }
    _handleError(error, res) {
        console.log('has error');
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
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map