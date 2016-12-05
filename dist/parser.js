"use strict";
const util_1 = require('util');
const qs = require('querystring');
const events_1 = require('events');
const REQUEST_ERROR = 1;
const REQUIRED_ERROR = 2;
const CONVER_ERROR = 3;
const CHOICES_ERROR = 4;
const NULL_ERROR = 5;
const errorMessages = {
    1: 'Unable to parse this request.',
    2: 'Missing request parameters.',
    3: 'Parameter type conversion error.',
    4: 'The parameter is not in the selection range.',
    5: 'Parameters are not allowed to be null.'
};
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
            result: null,
            error: []
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
            parseData.error.push(result['error']);
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
                if (rule.defaultVal !== undefined && !value) {
                    value = rule.defaultVal;
                }
                if (!rule.nullabled && !value) {
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
                            conversion = (val) => { return '' + val; };
                            type = 'string';
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
                        if (type === 'number' && isNaN(conversionVal)) {
                            parseData.hasError = true;
                            parseData.error.push({
                                type: CONVER_ERROR,
                                info: { key: key, type: type, help: rule.help }
                            });
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
                if (rule.choices && rule.choices.indexOf(value) == -1) {
                    parseData.hasError = true;
                    parseData.error.push({
                        type: CHOICES_ERROR,
                        info: { key: key, value: value, choices: rule.choices }
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
                return true;
            });
        }
        return parseData;
    }
    _handleError(errors, emit) {
        let error = errors[0];
        let message = errorMessages[error.type];
        let resCode = error.type === REQUEST_ERROR ? 400 : 403;
        errors.forEach((error) => {
            switch (error.type) {
                case REQUEST_ERROR:
                    error['message'] = error.info;
                    break;
                case REQUIRED_ERROR:
                    error['message'] = `The ${error.info} are required.`;
                    break;
                case CONVER_ERROR:
                    error['message'] =
                        error.info['help'] === null ?
                            `Can not convert a ${error.info['key']} to a ${error.info['type']} type`
                            : error.info['help'];
                    break;
                case CHOICES_ERROR:
                    error['message'] = `The ${error.info['key']}:${error.info['value']} is not in ${error.info['key'].toString()}`;
                case NULL_ERROR:
                    error['message'] = `The ${error.info} does not allow null values`;
            }
            ;
        });
        process.nextTick(function () {
            emit.emit('end', {
                code: resCode,
                message: message,
                errors: errors
            });
        });
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