import { isArray } from 'util';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import * as qs from 'querystring';
import { EventEmitter } from 'events';

export interface Param {
    name?: string
    caseSensitive?: boolean
    nullabled?: boolean
    ignore?: boolean
    defaultVal?: any
    dset?: string
    required?: boolean
    type?: string | Function
    trim?: boolean | null
    choices?: any[]
    help?: string
}

interface Result {
    method: string
    hasError: boolean
    error?: ResultError[]
    result: any
}

interface ResultError {
    type?: number
    info?: any
    message?: string
}

/**
 * error code
 */
const REQUEST_ERROR = 1;
const REQUIRED_ERROR = 2;
const CONVER_ERROR = 3;
const CHOICES_ERROR = 4;
const NULL_ERROR = 5;


/**
 * error message
 */
const errorMessages: any = {
    1: 'Unable to parse this request.',
    2: 'Missing request parameters.',
    3: 'Parameter type conversion error.',
    4: 'The parameter is not in the selection range.',
    5: 'Parameters are not allowed to be null.'
}

export class Parser extends EventEmitter {
    private params: any
    private trim: boolean
    private errCb: Function
    public baseUrl: string = ''

    /**
     * Creates an instance of Parser.
     * 
     * @param {boolean} [trim=false]
     * @param {Function} [errCb]
     * 
     * @memberOf Parser
     */
    constructor(trim: boolean | Function = false, errCb?: Function) {
        super();

        this.params = {};

        if (typeof (trim) !== 'function') {
            this.trim = !!trim;
            this.errCb = errCb || function () { };
        } else {
            this.trim = false;
            this.errCb = <Function>trim;
        }
    }

    /**
     * parse params
     * 
     * @param {IncomingMessage} req  http request
     * @param {ServerResponse} res   http response
     * @returns
     * 
     * @memberOf Parser
     * @api
     */
    parse(req: IncomingMessage, res: ServerResponse) {
        let _emit = new EventEmitter();

        if (!this.eventNames().length) {
            this.on('parseEnd', (result: Result) => {
                if (!result.hasError) {
                    process.nextTick(function () {
                        _emit.emit('end', { data: result['result'] });
                    })
                } else {
                    this._handleError(result.error, _emit);
                }
            })
        }

        this._parseReqest(req);
        return _emit;
    }

    /**
     * parse request
     * 
     * @private
     * @param {IncomingMessage} req   http request
     * @returns
     * 
     * @memberOf Parser
     */
    private _parseReqest(req: IncomingMessage) {
        let isGet = req.method.toLowerCase() === 'get';
        let parsedData: Result = {
            method: req.method,
            hasError: false,
            result: null,
            error: []
        }

        if (isGet) {
            let url = req.url.substr(this.baseUrl.length);
            let queryStr = url.substr(url.indexOf('?') + 1);

            parsedData['result'] = qs.parse(queryStr);

            this.emit('parseEnd', this._checkParams(parsedData))
        } else {
            let contentType: string = req.headers['content-type'];
            let body: any = [];

            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                parsedData['result'] = this._handleBodyData(contentType, body);

                this.emit('parseEnd', this._checkParams(parsedData))
            })
        }
    }

    /**
     * 处理请求中的body数据
     * 
     * @private
     * @param {string} type     请求类型
     * @param {*} body          请求数据主体
     * @returns
     */
    private _handleBodyData(type: string, body: any) {
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
                }
        }
    }

    /**
     * 检测参数是否正确
     * 
     * @private
     * @param {*} result    解析出来的参数
     * @returns
     */
    private _checkParams(parseData: Result) {
        let error: any;
        let result = parseData.result;
        let params = this.params;

        // 对于请求方式的错误提前解析返回
        if (result['error']) {
            parseData.hasError = true;
            parseData.error.push(result['error']);
        } else {
            Object.keys(params).every((key: string) => {
                let rule = <Param>params[key];
                let value = result[key];
                // 1. required
                if (rule.required && value === undefined) {
                    parseData.hasError = true;
                    parseData.error.push({
                        type: REQUIRED_ERROR,
                        info: key
                    })

                    return false;
                }

                // 2. defaultVal
                if (rule.defaultVal !== undefined && !value) {
                    value = rule.defaultVal;
                }

                // 3. nullabeld
                if (!rule.nullabled && !value) {
                    parseData.hasError = true;
                    parseData.error.push({
                        type: NULL_ERROR,
                        info: key
                    })

                    return false;
                }

                // 4. type (ignore help)
                if (rule.type) {
                    let conversion: any;
                    let type: string;
                    let conversionVal: any;
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
                            conversion = (val: any) => { return '' + val };
                            type = 'string';
                        default:
                            conversion = rule.type;
                            type = 'function'
                            break;
                    }

                    if (type === 'function') {
                        try {
                            conversionVal = conversion(value);
                        } catch (error) {
                            parseData.hasError = true;
                            parseData.error.push({
                                type: CONVER_ERROR,
                                info: { key: key, type: type, help: rule.help }
                            })
                        }
                    } else {
                        conversionVal = conversion(value);
                    }

                    if (!rule.ignore) {
                        if (parseData.hasError) return false;
                        if (type === 'number' && isNaN(conversionVal)) {
                            parseData.hasError = true;
                            parseData.error.push({
                                type: CONVER_ERROR,
                                info: { key: key, type: type, help: rule.help }
                            })
                            return false;
                        }
                    }
                    value = conversionVal;
                }

                // 5. trim caseSensitive
                if (typeof (value) === 'string') {
                    if (rule.caseSensitive) value = <string>value.toLowerCase();
                    let _trim = rule.trim !== null ? rule.trim : this.trim;
                    value = _trim ? value.trim() : value;
                }

                // 6. choices
                if (rule.choices && rule.choices.indexOf(value) == -1) {
                    parseData.hasError = true;
                    parseData.error.push({
                        type: CHOICES_ERROR,
                        info: { key: key, value: value, choices: rule.choices }
                    })

                    return false;
                }

                if (rule.dset) {
                    delete result[key];
                    result[rule.dset] = value;
                } else {
                    result[key] = value;
                }
                return true;
            })
        }
        return parseData;
    }

    /**
     * 错误处理函数
     * 
     * @private
     * @param {[ResultError]} error
     * @param {EventEmitter} res
     */
    private _handleError(errors: ResultError[], emit: EventEmitter) {
        let error = errors[0];
        let message: string = errorMessages[error.type];
        let resCode = error.type === REQUEST_ERROR ? 400 : 403;

        errors.forEach((error) => {
            switch (error.type) {
                case REQUEST_ERROR:
                    error['message'] = <string>error.info;
                    break;
                case REQUIRED_ERROR:
                    error['message'] = `The "${error.info}" are required.`;
                    break;
                case CONVER_ERROR:
                    error['message'] =
                        error.info['help'] === null ?
                            `Can not convert "${error.info['key']}" to ${error.info['type']} type`
                            : error.info['help'];
                    break;
                case CHOICES_ERROR:
                    error['message'] = `The ${error.info['key']}: "${error.info['value']}" is not in [${error.info['choices'].toString()}]`;
                    break;
                case NULL_ERROR:
                    error['message'] = `The "${error.info}" does not allow null values`
                    break;
            };
        })

        /**
         * fixme: 待开发
         * this.errCb();
         */
        
        process.nextTick(function () {
            emit.emit('end', {
                code: resCode,
                message: message,
                errors: errors
            });
        })
    }

    /**
     * add param
     * 
     * @param {Param} param param optins
     * 
     * @memberOf Parser
     * @api
     */
    addParam(name: string, options: Param) {
        let baseParam: any = {
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
            throw new TypeError('The parameter type of name must be a string')
        }

        if (this.params[name]) {
            throw new TypeError(`The parameter name: ${name} already exists`)
        }

        /**
         * todo: 1. 参数中required和defaultVal同时存在时给出警告
         * todo: 2. dset类型检测
         * todo: 3. 检测dset是否与当前已存在的参数名相同
         */

        options = Object.assign({ name: name }, baseParam, options);
        this.params[name] = options;
    }

    /**
     * delete params
     * 
     * @param {((string | string[]))} name params name
     */
    removeParams(name: (string | string[])) {
        if (typeof (name) !== 'string' && !isArray(name)) {
            throw new TypeError('The parameter type of name must be a string or string array');
        }
        let names = [].concat(name);

        names.forEach(name => {
            if (this.params[name]) {
                delete this.params[name];
            }
        })
    }

    /**
     * 设置基本url
     * 当从url中解析数据时会自动取消baseUrl中的内容
     * 
     * @param {string} baseUrl
     */
    setBaseUrl(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
}