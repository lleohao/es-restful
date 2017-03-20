"use strict";
const qs = require("querystring");
const events_1 = require("events");
const utils_1 = require("./utils");
class Parser extends events_1.EventEmitter {
    _parseRequest(req) {
        let isGet = req.method === 'GET';
        let parsedData = {
            method: req.method,
            result: null,
            error: null
        };
        if (isGet) {
            let url = req.url;
            let index = url.indexOf('?');
            let queryStr = index === -1 ? '' : url.substr(index + 1);
            parsedData['result'] = qs.parse(queryStr);
            this.emit('_endParse', this._checkParams(parsedData));
        }
        else {
            let contentType = req.headers['content-type'];
            let body = [];
            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = body.toString();
                let bodyData = this._handleBodyData(contentType, body);
                if (bodyData['error']) {
                    parsedData['error'] = bodyData;
                }
                else {
                    parsedData['result'] = bodyData;
                }
                this.emit('_endParse', this._checkParams(parsedData));
            });
        }
    }
    _handleBodyData(type, body) {
        let data;
        try {
            switch (type) {
                case 'application/x-www-form-urlencoded':
                    data = qs.parse(body);
                    break;
                case 'application/json':
                    data = JSON.parse(body);
                    break;
                default:
                    data = {
                        error: {
                            type: utils_1.errorCode.REQUEST_ERROR,
                            info: 'This request method is not supported'
                        }
                    };
            }
        }
        catch (e) {
            data = {
                error: {
                    type: utils_1.errorCode.REQUEST_ERROR,
                    info: e.toString()
                }
            };
        }
        return data;
    }
    _checkParams(parseData) {
        let result = parseData.result;
        let params = this.params;
        if (parseData['error'])
            return parseData;
        Object.keys(params).every((key) => {
            let rule = params[key];
            let value = result[key];
            if (rule.required && value === undefined) {
                parseData.error = {
                    type: utils_1.errorCode.REQUIRED_ERROR,
                    info: key
                };
                return false;
            }
            if (rule.defaultVal !== undefined && !value) {
                value = rule.defaultVal;
            }
            if (!rule.nullabled && !value) {
                parseData.error = {
                    type: utils_1.errorCode.NULL_ERROR,
                    info: key
                };
                return false;
            }
            if (rule.type) {
                let conversion;
                let type;
                let conversionVal;
                switch (rule.type) {
                    case 'int':
                        conversion = parseInt;
                        type = 'number';
                        break;
                    case 'float':
                        conversion = parseFloat;
                        type = 'number';
                        break;
                    case 'string':
                        conversion = (val) => {
                            return '' + val;
                        };
                        type = 'string';
                        break;
                    default:
                        conversion = rule.type;
                        type = 'function';
                        break;
                }
                if (type === 'function') {
                    try {
                        conversionVal = conversion(value);
                    }
                    catch (error) {
                        parseData.error = {
                            type: utils_1.errorCode.CONVER_ERROR,
                            info: { key: key, type: type, help: rule.help }
                        };
                    }
                }
                else {
                    conversionVal = conversion(value);
                }
                if (!rule.ignore) {
                    if (parseData.error !== null)
                        return false;
                    if (type === 'number' && isNaN(conversionVal)) {
                        parseData.error = {
                            type: utils_1.errorCode.CONVER_ERROR,
                            info: { key: key, type: type, help: rule.help }
                        };
                        return false;
                    }
                }
                value = conversionVal;
            }
            if (typeof (value) === 'string') {
                if (rule.caseSensitive)
                    value = value.toLowerCase();
                let _trim = rule.trim !== null ? rule.trim : this.trim;
                value = _trim ? value.trim() : value;
            }
            if (rule.choices && rule.choices.indexOf(value) === -1) {
                parseData.error = {
                    type: utils_1.errorCode.CHOICES_ERROR,
                    info: { key: key, value: value, choices: rule.choices }
                };
                return false;
            }
            if (rule.dset) {
                delete result[key];
                result[rule.dset] = value;
            }
            else {
                result[key] = value;
            }
            return true;
        });
        let _tmpData = {};
        Object.keys(params).forEach((key) => {
            key = params[key].dset || key;
            _tmpData[key] = parseData.result[key];
        });
        parseData.result = _tmpData;
        return parseData;
    }
    _getErrorMessage(error) {
        let message = utils_1.errorMessages[error.type];
        let resCode = error.type === utils_1.errorCode.REQUEST_ERROR ? 400 : 403;
        switch (error.type) {
            case utils_1.errorCode.REQUEST_ERROR:
                error['message'] = error.info;
                break;
            case utils_1.errorCode.REQUIRED_ERROR:
                error['message'] = `The "${error.info}" are required.`;
                break;
            case utils_1.errorCode.CONVER_ERROR:
                error['message'] =
                    error.info['help'] === null ?
                        `Can not convert "${error.info['key']}" to ${error.info['type']} type`
                        : error.info['help'];
                break;
            case utils_1.errorCode.CHOICES_ERROR:
                error['message'] = `The ${error.info['key']}: "${error.info['value']}" is not in [${error.info['choices'].toString()}]`;
                break;
            case utils_1.errorCode.NULL_ERROR:
                error['message'] = `The "${error.info}" does not allow null values`;
                break;
        }
        ;
        return {
            code: resCode,
            message: message,
            error: error
        };
    }
    _preParse() {
        this.on('_endParse', (result) => {
            let data = {};
            if (result.error !== null) {
                data['errorData'] = this._getErrorMessage(result.error);
            }
            else {
                data = result.result;
            }
            process.nextTick(() => {
                this.emit('parseEnd', data);
            });
        });
    }
    constructor(trim = false, errCb) {
        super();
        this.params = {};
        if (typeof (trim) !== 'function') {
            this.trim = !!trim;
            this.errCb = errCb || function () { };
        }
        else {
            this.trim = false;
            this.errCb = trim;
        }
        this._preParse();
    }
    addParam(name, options) {
        let baseParam = {
            required: false,
            ignore: false,
            caseSensitive: false,
            nullabled: true,
            trim: null,
            defaultVal: undefined,
            dset: null,
            type: null,
            choices: null,
            help: null
        };
        if (this.params[name]) {
            throw new Error(`The parameter name: ${name} already exists`);
        }
        if (options) {
            if (options.dset && this.params[options.dset]) {
                throw new Error(`The parameter dtet: ${name} already exists`);
            }
            if (options.defaultVal !== undefined && options.required) {
                console.warn('Setting both the required and defaultVal attributes invalidates the required attribute');
            }
        }
        options = Object.assign({ name: name }, baseParam, options);
        this.params[name] = options;
    }
    removeParams(name) {
        let names = [].concat(name);
        names.forEach(name => {
            if (this.params[name]) {
                delete this.params[name];
            }
        });
    }
    parse(req) {
        this._parseRequest(req);
        return this;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map