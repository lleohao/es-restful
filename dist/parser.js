"use strict";
const util_1 = require('util');
const qs = require('querystring');
const events_1 = require('events');
const REQUEST_ERROR = 1;
const REQUIRED_ERROR = 2;
const CONVER_ERROR = 3;
const CHOICES_ERROR = 4;
const NULL_ERROR = 5;
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
                    process.nextTick(function () {
                        _emit.emit('end', { data: result['result'] });
                    });
                }
                else {
                    this._handleError(result.error, _emit);
                }
            });
        }
        this._parseReqest(req);
        return _emit;
    }
    _parseReqest(req) {
        let isGet = req.method.toLowerCase() === 'get';
        let parsedData = {
            method: req.method,
            hasError: false,
            result: null
        };
        if (isGet) {
            let url = req.url.substr(this.baseUrl.length);
            let queryStr = url.substr(url.indexOf('?') + 1);
            parsedData['result'] = qs.parse(queryStr);
            this.emit('parseEnd', this._checkParams(parsedData));
        }
        else {
            let contentType = req.headers['content-type'];
            let body = [];
            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                parsedData['result'] = this._handleBodyData(contentType, body);
                this.emit('parseEnd', this._checkParams(parsedData));
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
                        type: REQUEST_ERROR,
                        info: 'This request method is not supported'
                    }
                };
        }
    }
    _checkParams(parseData) {
        let error;
        let result = parseData.result;
        let params = this.params;
        if (result['error']) {
            parseData.hasError = true;
            parseData.error = result['error'];
        }
        else {
            Object.keys(params).every((key) => {
                let rule = params[key];
                let value = result[key];
                if (rule.required && value === undefined) {
                    parseData.hasError = true;
                    parseData.error.push({
                        type: REQUIRED_ERROR,
                        info: key
                    });
                    return false;
                }
                if (rule.defaultVal !== undefined) {
                    value = rule.defaultVal;
                }
                if (rule.nullabeld && !value) {
                    parseData.hasError = true;
                    parseData.error.push({
                        type: NULL_ERROR,
                        info: key
                    });
                    return false;
                }
                if (rule.type) {
                    let conversion;
                    let type;
                    let conversionVal;
                    switch (typeof (rule.type)) {
                        case 'int':
                            conversion = parseInt;
                            type = 'number';
                            break;
                        case 'float':
                            conversion = parseFloat;
                            type = 'number';
                            break;
                        case 'string':
                            conversion = (val) => { return '' + val; };
                            type = 'string';
                        case 'function':
                            conversion = rule.type;
                            type = 'function';
                            break;
                    }
                    if (type === 'function') {
                        try {
                            conversionVal = conversion(value);
                        }
                        catch (error) {
                            parseData.hasError = true;
                            parseData.error.push({
                                type: CONVER_ERROR,
                                info: { key: key, type: type, help: rule.help }
                            });
                        }
                    }
                    else {
                        conversionVal = conversion(value);
                    }
                    if (!rule.ignore) {
                        if (parseData.hasError)
                            return false;
                        if (isNaN(conversionVal)) {
                            parseData.hasError = true;
                            parseData.error.push({
                                type: CONVER_ERROR,
                                info: { key: key, type: type, help: rule.help }
                            });
                            return false;
                        }
                    }
                }
                if (typeof (value) === 'string') {
                    if (rule.caseSensitive)
                        value = value.toLowerCase();
                    if (rule.trim)
                        value = value.trim();
                    else if (this.trim)
                        value = value.trim();
                }
                if (rule.choices && rule.choices.indexOf(value) == -1) {
                    parseData.hasError = true;
                    parseData.error.push({
                        type: CHOICES_ERROR,
                        info: { key: key, choices: rule.choices }
                    });
                    return false;
                }
                if (rule.dset) {
                    delete result[key];
                    result[rule.dset] = value;
                }
                else {
                    result[key] = value;
                }
            });
        }
        return parseData;
    }
    _handleError(error, emit) {
        this.errCb();
        emit.emit('end', { error: 'has error' });
    }
    addParam(name, options) {
        let baseParam = {
            required: false,
            ignore: false,
            caseSensitive: false,
            nullabeld: true,
            trim: false,
            defaultVal: undefined,
            dset: null,
            type: null,
            choices: null,
            help: null
        };
        if (typeof (name) !== 'string') {
            throw new TypeError('The parameter type of name must be a string');
        }
        if (this.params[name]) {
            throw new TypeError(`The parameter name: ${name} already exists`);
        }
        options = Object.assign({ name: name }, baseParam, options);
        this.params[name] = options;
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