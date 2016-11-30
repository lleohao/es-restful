"use strict";
const util_1 = require('util');
const qs = require('querystring');
const events_1 = require('events');
class Parser extends events_1.EventEmitter {
    constructor(trim = false, errCb) {
        super();
        this.baseUrl = '';
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
        let _emit = new events_1.EventEmitter();
        if (!this.eventNames().length) {
            this.on('parseEnd', (result) => {
                if (!result.hasError) {
                    _emit.emit('end', { data: result['result'] });
                }
                else {
                    this._handleError(result.error, res);
                }
            });
        }
        this._parseReqest(req);
        return _emit;
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
            this.emit('parseEnd', this._checkParams(result));
        }
        else {
            contentType = req.headers['content-type'];
            let count = 0;
            let body = [];
            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                result['result'] = this._handleBodyData(contentType, body);
                this.emit('parseEnd', this._checkParams(result));
            });
        }
    }
    _handleBodyData(type, body) {
        body = body.toString();
        switch (type) {
            case 'application/x-www-form-urlencoded':
                return qs.parse(body);
            case 'application/json':
                return JSON.parse(body);
            default:
                return {
                    error: {
                        type: 1,
                        message: 'This request method is not supported'
                    }
                };
        }
    }
    _checkParams(result) {
        return result;
    }
    _handleError(error, res) {
        console.log('has error');
        this.errCb();
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