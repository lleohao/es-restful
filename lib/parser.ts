import { isArray } from 'util';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import * as qs from 'querystring';

export interface Param {
    name: string
    defaultVal?: any
    dset?: string
    required?: boolean
    ignore?: boolean
    type?: string
    trim?: boolean
}

interface Result {
    method: string,
    hasError: boolean,
    error?: [ResultError],
    result: any
}

interface ResultError {
    type: number
    message: string
}

export class Parser {
    private params: any;
    private trim: boolean;
    private errCb: Function;
    public baseUrl: string = '';

    /**
     * Creates an instance of Parser.
     * 
     * @param {boolean} [trim=false]
     * @param {Function} [errCb]
     * 
     * @memberOf Parser
     */
    constructor(trim: boolean | Function = false, errCb?: Function) {
        this.params = {};

        if (typeof (trim) !== 'function') {
            this.trim = !!trim;
            this.errCb = errCb || function() { };
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
        let result: Result = this._parseReqest(req);

        if (!result.hasError) {
            return { data: result['result'] };
        } else {
            this._handleError(result.error, res);
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
    private _parseReqest(req: IncomingMessage) {
        let isGet = req.method.toLowerCase() === 'get';
        let contentType: string | null = null;
        let result: any = {
            method: req.method
        }

        let url = req.url.substr(this.baseUrl.length);

        if (isGet) {
            let queryStr = url.substr(url.indexOf('?') + 1);

            result['result'] = qs.parse(queryStr);
        } else {
            contentType = req.headers['content-type'];

        }

        return this._checkParams(result);
    }

    private _checkParams(result: {}) {
        return <Result>result;
    }

    private _handleError(error: [ResultError], res: ServerResponse) {
        console.log('has error');
    }

    /**
     * add param
     * 
     * @param {Param} param param optins
     * 
     * @memberOf Parser
     * @api
     */
    addParam(param: Param) {
        let name = param.name;
        if (typeof (name) !== 'string') {
            throw new TypeError('The parameter type of name must be a string')
        }

        if (this.params[name]) {
            throw new TypeError(`The parameter name: ${name} already exists`)
        }

        this.params[name] = param;
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