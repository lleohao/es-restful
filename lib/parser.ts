import { IncomingMessage } from 'http';
import * as qs from 'querystring';
import { EventEmitter } from 'events';

import { errorCode, errorMessages } from './utils';

/**
 * 参数配置信息
 * 
 * @export
 * @interface Param
 */
export interface Param {
    /**
     * 是否忽略大小写, 设置为 true 则统一转换为小写
     * 
     * @type {boolean}
     * @default false
     * @memberOf Param
     */
    caseSensitive?: boolean;
    /**
     * 是否允许传递空值
     * 
     * @type {boolean}
     * @default true
     * @memberOf Param
     */
    nullabled?: boolean;
    /**
     * 是否忽略参数自动转换类型发生的错误
     * 
     * @type {boolean}
     * @default false
     * @memberOf Param
     */
    ignore?: boolean;
    /**
     * 当参数为空时的默认值
     * 
     * @type {*}
     * @memberOf Param
     */
    defaultVal?: any;
    /**
     * 参数的别名, 返回的解析值将使用这个名称代替请求中的名称
     * 
     * @type {string}
     * @memberOf Param
     */
    dset?: string;
    /**
     * 是否是必填的值
     * 
     * @type {boolean}
     * @default false
     * @memberOf Param
     */
    required?: boolean;
    /**
     * 指定将参数转换为什么类型的值, 可以传递函数
     * 
     * @type {(['string', 'float', 'int'] | Function)}
     * @memberOf Param
     */
    type?: string | Function;
    /**
     * 是否自动清除参数两端的空白
     * 
     * @type {boolean}
     * @default false
     * @memberOf Param
     */
    trim?: boolean | null;
    /**
     * 参数的可选范围
     * 
     * @type {any[]}
     * @memberOf Param
     */
    choices?: any[];
    /**
     * 当类型转换错误时,指定的返回错误信息
     * 
     * @type {string}
     * @memberOf Param
     */
    help?: string;
}

/**
 * 解析的参数数据
 * 
 * @export
 * @interface ParamData
 */
export interface ParamData {
    /**
     * 解析错误抛出的信息
     * 
     * @type {{
     *         code: number;
     *         message: string;
     *         data: Object;
     *     }}
     * @memberOf ParamData
     */
    errorData?: {
        code: number;
        message: string;
        erros: any[];
    };
    /**
     * 解析正确抛出解析数据
     * 
     * @type {Object}
     * @memberOf ParamData
     */
    data?: Object;
}

/**
 * 解析的参数信息(内部使用)
 * 
 * @export
 * @interface ParamResult
 */
interface ParamResult {
    /**
     * 请求方式
     * 
     * @type {string}
     * @memberOf Result
     */
    method: string;
    /**
     * 错误信息数据
     * 
     * @type {ResultError[]}
     * @memberOf Result
     */
    error?: ParamsResultError;
    /**
     * 解析参数内容
     * 
     * @type {*}
     * @memberOf Result
     */
    result: any;
}

/**
 * 参数解析错误信息(内部使用)
 * 
 * @export
 * @interface ParamsResultError
 */
interface ParamsResultError {
    /**
     * 错误类型
     * 
     * @type {errorCode}
     * @memberOf ResultError
     */
    type?: errorCode;
    /**
     * 错误详细信息
     * 
     * @type {*}
     * @memberOf ResultError
     */
    info?: any;
    /**
     * 错误简略信息
     * 
     * @type {string}
     * @memberOf ResultError
     */
    message?: string;
}

/**
 * 参数解析类
 * 1. 自动处理请求数据中的参数
 * 2. 处理参数中的错误
 * 
 * @export
 * @class Parser
 * @extends {EventEmitter}
 * @version 0.1
 */
export class Parser extends EventEmitter {
    private params: any;
    private trim: boolean;
    private errCb: Function;
    public baseUrl: string = '';

    /**
     * parse request
     *
     * @private
     * @param {IncomingMessage} req
     * @returns
     *
     * @memberOf Parser
     */
    private _parseRequest(req: IncomingMessage) {
        let isGet = req.method.toLowerCase() === 'get';
        let parsedData: ParamResult = {
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
        } else {
            let contentType: string = req.headers['content-type'];
            let body: any = [];

            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = body.toString();
                let bodyData = this._handleBodyData(contentType, body);
                if (bodyData['error']) {
                    parsedData['error'] = bodyData;
                } else {
                    parsedData['result'] = bodyData;
                }

                this.emit('_endParse', this._checkParams(parsedData));
            });
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
        let data: Object;

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
                            type: errorCode.REQUEST_ERROR,
                            info: 'This request method is not supported'
                        }
                    };
            }
        } catch (e) {
            data = {
                error: {
                    type: errorCode.REQUEST_ERROR,
                    info: e.toString()
                }
            };
        }

        return data;
    }

    /**
     * 检测参数是否正确
     *
     * @private
     * @param {*} result    解析出来的参数
     * @returns
     */
    private _checkParams(parseData: ParamResult) {
        let result = parseData.result;
        let params = this.params;

        // 对于请求方式的错误提前解析返回
        if (parseData['error']) return parseData;

        // 检测参数是否正确
        Object.keys(params).every((key: string) => {
            let rule = <Param>params[key];
            let value = result[key];
            // 1. required
            if (rule.required && value === undefined) {
                parseData.error = {
                    type: errorCode.REQUIRED_ERROR,
                    info: key
                };

                return false;
            }

            // 2. defaultVal
            if (rule.defaultVal !== undefined && !value) {
                value = rule.defaultVal;
            }

            // 3. nullabeld
            if (!rule.nullabled && !value) {
                parseData.error = {
                    type: errorCode.NULL_ERROR,
                    info: key
                };

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
                        conversion = (val: any) => {
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
                    } catch (error) {
                        parseData.error = {
                            type: errorCode.CONVER_ERROR,
                            info: { key: key, type: type, help: rule.help }
                        };
                    }
                } else {
                    conversionVal = conversion(value);
                }

                if (!rule.ignore) {
                    if (parseData.error !== null) return false;
                    if (type === 'number' && isNaN(conversionVal)) {
                        parseData.error = {
                            type: errorCode.CONVER_ERROR,
                            info: { key: key, type: type, help: rule.help }
                        };
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
            if (rule.choices && rule.choices.indexOf(value) === -1) {
                parseData.error = {
                    type: errorCode.CHOICES_ERROR,
                    info: { key: key, value: value, choices: rule.choices }
                };

                return false;
            }

            if (rule.dset) {
                delete result[key];
                result[rule.dset] = value;
            } else {
                result[key] = value;
            }
            return true;
        });

        // 删除不在params中的参数
        let _tmpData = {};
        Object.keys(params).forEach((key) => {
            key = params[key].dset || key;
            _tmpData[key] = parseData.result[key];
        });

        parseData.result = _tmpData;
        return parseData;
    }

    /**
     * 根据错误信息生成错误响应数据
     * 
     * @param {ParamsResultError} error
     * @returns
     * 
     * @memberOf Parser
     */
    private _getErrorMessage(error: ParamsResultError) {
        let message: string = errorMessages[error.type];
        let resCode = error.type === errorCode.REQUEST_ERROR ? 400 : 403;

        switch (error.type) {
            case errorCode.REQUEST_ERROR:
                error['message'] = <string>error.info;
                break;
            case errorCode.REQUIRED_ERROR:
                error['message'] = `The "${error.info}" are required.`;
                break;
            case errorCode.CONVER_ERROR:
                error['message'] =
                    error.info['help'] === null ?
                        `Can not convert "${error.info['key']}" to ${error.info['type']} type`
                        : error.info['help'];
                break;
            case errorCode.CHOICES_ERROR:
                error['message'] = `The ${error.info['key']}: "${error.info['value']}" is not in [${error.info['choices'].toString()}]`;
                break;
            case errorCode.NULL_ERROR:
                error['message'] = `The "${error.info}" does not allow null values`;
                break;
        };

        return {
            code: resCode,
            message: message,
            error: error
        };
    }

    /**
     * Creates an instance of Parser.
     * 
     * 
     * @param {(boolean | Function)} [trim=false]       是否自动清除参数两端的空白, 可以被参数的单独设置的属性覆盖
     * @param {Function} [errCb]                        错误处理函数
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
     * 添加参数信息
     *
     *
     * @memberOf Parser
     * @api
     * @param name          参数名称
     * @param options       参数配置  
     */
    addParam(name: string, options?: Param) {
        let baseParam: Param = {
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

    /**
     * 删除参数信息
     * 
     * @param {((string | string[]))} name   参数名称或参数名称数组
     * 
     * @memberOf Parser
     */
    removeParams(name: (string | string[])) {
        let names = [].concat(name);

        names.forEach(name => {
            if (this.params[name]) {
                delete this.params[name];
            }
        });
    }

    /**
     * 解析请求参数
     * 
     * @param {IncomingMessage} req
     * 
     * @memberOf Parser
     * @api
     */
    parse(req: IncomingMessage) {
        // 只绑定一次处理事件
        if (this.eventNames().length === 0) {
            this.on('_endParse', (result: ParamResult) => {
                let data = {};
                if (result.error !== null) {
                    data['errorData'] = this._getErrorMessage(result.error);
                } else {
                    data = result.result;
                }
                process.nextTick(() => {
                    this.emit('parseEnd', data);
                });
            });
        }

        this._parseRequest(req);
        return this;
    }
}