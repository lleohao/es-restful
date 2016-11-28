import { isArray } from 'util';
import { IncomingMessage, ServerResponse } from 'http'

interface Param {
    name: string;
    defaultVal?: any;
    dset?: string;
    required?: boolean;
    ignore?: boolean;
    type?: string;
    trim?: boolean;
}

export class Parser {
    private params: any;
    private trim: boolean;
    private errCb: Function;

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
            this.errCb = errCb || function () { };
        } else {
            this.trim = false;
            this.errCb = <Function>trim;
        }
    }

    /**
     * parse params
     * 
     * @param {IncomingMessage} req  request
     * @param {ServerResponse} res   response
     * @returns
     * 
     * @memberOf Parser
     */
    parse(req: IncomingMessage, res: ServerResponse) {
        let result = {};


        return result;
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
        if (typeof(name) !== 'string') {
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
     * 
     * @memberOf Parser
     * @api
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
}