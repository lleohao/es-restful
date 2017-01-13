/// <reference types="node" />
import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';
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
export interface ErrorData {
    /**
     * 错误对应的http code
     *
     * @type {number}
     * @memberOf ErrorData
     */
    code: number;
    /**
     * 错误信息概述
     *
     * @type {string}
     * @memberOf ErrorData
     */
    message: string;
    /**
     * 详细错误信息
     *
     * @type {any[]}
     * @memberOf ErrorData
     */
    errors: any[];
}
/**
 * 解析的参数数据
 *
 * @export
 * @interface ParamData
 */
export interface ParamData {
    /**
     * 解析错误时的错误信息
     *
     * @type {ErrorData}
     * @memberOf ParamData
     */
    errorData?: ErrorData;
    /**
     * 解析正确时的参数
     *
     * @type {Object}
     * @memberOf ParamData
     */
    data?: Object;
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
export declare class Parser extends EventEmitter {
    private params;
    private trim;
    private errCb;
    /**
     * parse request
     *
     * @private
     * @param {IncomingMessage} req
     * @returns
     *
     * @memberOf Parser
     */
    private _parseRequest(req);
    /**
     * 处理请求中的body数据
     *
     * @private
     * @param {string} type     请求类型
     * @param {*} body          请求数据主体
     * @returns
     */
    private _handleBodyData(type, body);
    /**
     * 检测参数是否正确
     *
     * @private
     * @param {*} result    解析出来的参数
     * @returns
     */
    private _checkParams(parseData);
    /**
     * 根据错误信息生成错误响应数据
     *
     * @param {ParamsResultError} error
     * @returns
     *
     * @memberOf Parser
     */
    private _getErrorMessage(error);
    /**
     * 绑定一次解析函数
     *
     *
     * @memberOf Parser
     */
    _preParse(): void;
    /**
     * Creates an instance of Parser.
     *
     *
     * @param {(boolean | Function)} [trim=false]       是否自动清除参数两端的空白, 可以被参数的单独设置的属性覆盖
     * @param {Function} [errCb]                        错误处理函数
     *
     * @memberOf Parser
     */
    constructor(trim?: boolean | Function, errCb?: Function);
    /**
     * 添加参数信息
     *
     *
     * @memberOf Parser
     * @api
     * @param name          参数名称
     * @param options       参数配置
     */
    addParam(name: string, options?: Param): void;
    /**
     * 删除参数信息
     *
     * @param {((string | string[]))} name   参数名称或参数名称数组
     *
     * @memberOf Parser
     */
    removeParams(name: (string | string[])): void;
    /**
     * 解析请求参数
     *
     * @param {IncomingMessage} req
     *
     * @memberOf Parser
     * @api
     */
    parse(req: IncomingMessage): this;
}
