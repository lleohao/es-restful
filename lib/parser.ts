import { isArray } from 'util';
import { IncomingMessage } from 'http';
import * as qs from 'querystring';
import { EventEmitter } from 'events';

import {errorCode} from './utils';

/**
 * 参数配置信息
 * 
 * @export
 * @interface Param
 */
export interface Param {
    /**
     * 参数名称
     * 
     * @type {string}
     * @memberOf Param
     */
    name?: string;
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
     * @type {(boolean |)}
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
 * 解析的参数信息
 * 
 * @export
 * @interface Result
 */
export interface Result {
    /**
     * 请求方式
     * 
     * @type {string}
     * @memberOf Result
     */
    method: string;
    /**
     * 是否存在错误
     * 
     * @type {boolean}
     * @memberOf Result
     */
    hasError: boolean;
    /**
     * 错误信息数组
     * 
     * @type {ResultError[]}
     * @memberOf Result
     */
    error?: ResultError[];
    /**
     * 解析参数内容
     * 
     * @type {*}
     * @memberOf Result
     */
    result: any;
}

/**
 * 参数解析错误信息
 * 
 * @export
 * @interface ResultError
 */
export interface ResultError {
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
 * 参数解析类, 自动解析 过滤请求中的参数
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
     * 解析请求参数
     * 
     * @param {IncomingMessage} req
     * @returns {Result}
     * 
     * @memberOf Parser
     */
    parse(req: IncomingMessage) {
        this._parseRequest(req);

        // 只绑定一次
        if (!this.eventNames().length) {
            this.on('parseEnd', (result: Result) => {
                return result;
            });
        }
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
    private _parseRequest(req: IncomingMessage) {
        let isGet = req.method.toLowerCase() === 'get';
        let parsedData: Result = {
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
        } else {
            let contentType: string = req.headers['content-type'];
            let body: any = [];

            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                parsedData['result'] = this._handleBodyData(contentType, body);

                this.emit('parseEnd', this._checkParams(parsedData));
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
        body = body.toString();

        switch (type) {
            case 'application/x-www-form-urlencoded':
                return qs.parse(body);
            case 'application/json':
                return JSON.parse(body);
            default:
                return {
                    error: {
                        type: errorCode.REQUEST_ERROR,
                        info: 'This request method is not supported'
                    }
                };
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
                        type: errorCode.REQUIRED_ERROR,
                        info: key
                    });

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
                        type: errorCode.NULL_ERROR,
                        info: key
                    });

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
                            parseData.hasError = true;
                            parseData.error.push({
                                type: errorCode.CONVER_ERROR,
                                info: { key: key, type: type, help: rule.help }
                            });
                        }
                    } else {
                        conversionVal = conversion(value);
                    }

                    if (!rule.ignore) {
                        if (parseData.hasError) return false;
                        if (type === 'number' && isNaN(conversionVal)) {
                            parseData.hasError = true;
                            parseData.error.push({
                                type: errorCode.CONVER_ERROR,
                                info: { key: key, type: type, help: rule.help }
                            });
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
                    parseData.hasError = true;
                    parseData.error.push({
                        type: errorCode.CHOICES_ERROR,
                        info: { key: key, value: value, choices: rule.choices }
                    });

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
    // private _handleError(errors: ResultError[], emit: EventEmitter) {
    //     let error = errors[0];
    //     let message: string = errorMessages[error.type];
    //     let resCode = error.type === REQUEST_ERROR ? 400 : 403;

    //     errors.forEach((error) => {
    //         switch (error.type) {
    //             case REQUEST_ERROR:
    //                 error['message'] = <string>error.info;
    //                 break;
    //             case REQUIRED_ERROR:
    //                 error['message'] = `The "${error.info}" are required.`;
    //                 break;
    //             case CONVER_ERROR:
    //                 error['message'] =
    //                     error.info['help'] === null ?
    //                         `Can not convert "${error.info['key']}" to ${error.info['type']} type`
    //                         : error.info['help'];
    //                 break;
    //             case CHOICES_ERROR:
    //                 error['message'] = `The ${error.info['key']}: "${error.info['value']}" is not in [${error.info['choices'].toString()}]`;
    //                 break;
    //             case NULL_ERROR:
    //                 error['message'] = `The "${error.info}" does not allow null values`;
    //                 break;
    //         }
    //         ;
    //     });

    //     /**
    //      * fixme: 待开发
    //      * this.errCb();
    //      */

    //     process.nextTick(function () {
    //         emit.emit('end', {
    //             code: resCode,
    //             message: message,
    //             errors: errors
    //         });
    //     });
    // }

    /**
     * 添加参数信息
     *
     *
     * @memberOf Parser
     * @api
     * @param name          参数名称
     * @param options       参数配置
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
            throw new TypeError('The parameter type of name must be a string');
        }

        if (this.params[name]) {
            throw new TypeError(`The parameter name: ${name} already exists`);
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
        });
    }

    /**
     * 设置基本url
     * 当从url中解析数据时会自动去掉baseUrl中的内容
     *
     * @param {string} baseUrl
     */
    setBaseUrl(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
}