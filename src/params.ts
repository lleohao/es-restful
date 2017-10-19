import { createError, isType, RestfulErrorType } from './utils';

/**
 * es-resuful error code 
 * 
 * @export
 * @enum {number}
 */
export enum StatusCode {
    REQUIRED_ERROR = 1,
    TYPE_ERRPR = 2,
    CHOICES_ERROR = 3,
    COVER_ERROR = 4,
    CHOICES_RUN_ERROR = 5
}

/**
 * Defined parameter options
 * 
 * @export
 * @interface ParaOptions
 */
export interface ParaOptions {
    /**
     * The default value when the parameter is empty.
     * 
     */
    defaultVal?: any;
    /**
     * Set this value to true when the parameter is required.
     * 
     * @default false
     */
    required?: boolean;
    /**
     * Set this value to true when the argument can be null value. eg: null, undefined, ''.
     * 
     * @default true
     */
    nullabled?: boolean;
    /**
     * Specifies the type of parameter. eg: string, float, int.
     * And you can give a function to conversion parameter.
     * 
     * @example
     * type: (input) => { return input.join('-') };
     * [1,2,3] => 1-2-3
     * 
     */
    type?: 'number' | 'boolean' | 'object' | 'array' | 'any' | 'string' | string;
    /**
     * Optional range of parameters.
     * 
     * @example
     * choices: ['men', 'women']
     * @example
     * choices: function(input) { return ['men', 'women'].indexOf(inpiut) !== -1; }
     * 
     * nomen  => throw error
     * men    => true
     */
    choices?: any[] | ChoicesFun;
    /**
     * Set to true coverets the parameter to lowercase.
     * 
     * @default false
     */
    caseSensitive?: boolean;
    /**
     * Whether to clear the blanks at both ends of the parameter.
     * 
     * @default false
     */
    trim?: boolean;
    /**
     * Customize the conversion function.
     * 
     * @example
     * input = [1,2,3]
     * coveration: function(input) { retuen input.join('-') }
     * // => 1-2-3
     */
    coveration?: (input: any) => any;
    /**
     * The alias of the parameter, you can use this alias instead of the name in request.
     * 
     */
    dset?: string;
}

export interface ParaOptionObject {
    name: string;
    option?: ParaOptions;
}

/**
 * Error callback function.
 */
export type ErrorCb = (err: Error) => void;
export type ChoicesFun = (input: any) => boolean;

/**
 * Parsed out the request data
 * 
 * @export
 * @interface ParsedData
 */
export interface ParsedData {
    [key: string]: any;
}

interface ValidationError {
    code: StatusCode;
    info?: {
        key: string;
        value?: any;
        others?: any
    };
}

const validation = (params: { [name: string]: ParaOptions }, requestData: { [key: string]: any }) => {
    const paramsKeys = Object.keys(params);
    const result = {};
    let error: ValidationError;

    if (params['*'] !== undefined) {
        return requestData;
    }

    const flag = paramsKeys.every((key) => {
        const rule = params[key];
        let value = requestData[key];

        // set default value
        if (rule.defaultVal !== undefined) {
            value = value !== undefined ? value : rule.defaultVal;
        } else {
            // check required
            if (rule.required && value === undefined) {
                error = {
                    code: StatusCode.REQUIRED_ERROR,
                    info: { key }
                };
                return false;
            }
        }

        // check type
        if (rule.type !== 'any' && !isType(value, rule.type)) {
            error = {
                code: StatusCode.TYPE_ERRPR,
                info: {
                    key,
                    value,
                    others: rule.type
                }
            };
            return false;
        }

        // check choices
        if (rule.choices) {
            try {
                if ((typeof rule.choices === 'function') ?
                    !rule.choices(value) :
                    (rule.choices as any[]).indexOf(value) === -1) {
                    error = {
                        code: StatusCode.CHOICES_ERROR,
                        info: {
                            key,
                            value,
                            others: rule.choices
                        }
                    };
                    return false;
                }

            } catch (e) {
                error = {
                    code: StatusCode.CHOICES_RUN_ERROR,
                    info: {
                        key,
                        value,
                        others: e.message
                    }
                };
                return false;
            }
        }

        // value coveration
        if (rule.caseSensitive) {
            if (typeof value === 'string') {
                value = value.toLocaleLowerCase();
            }
        }

        if (rule.trim) {
            if (typeof value === 'string') {
                value = value.trim();
            }
        }

        if (rule.coveration) {
            try {
                value = rule.coveration(value);
            } catch (e) {
                error = {
                    code: StatusCode.COVER_ERROR,
                    info: {
                        key,
                        value,
                        others: e.message
                    }
                };
                return false;
            }
        }

        if (rule.required || value !== undefined) {
            result[rule.dset || key] = value;
        }

        return true;
    });

    if (!flag) {
        const { code, message } = genErrorMsg(error);
        throw createError({
            type: RestfulErrorType.PARAMS,
            code,
            message
        }, ReqParams);
    }

    return result;
};

const genErrorMsg = (error: ValidationError) => {
    let message;
    const info = error.info;
    const [l, r] = (typeof info.value === 'string') ? ['"', '"'] : (Array.isArray(info.value)) ? ['[', ']'] : ['', ''];

    switch (error.code) {
        case StatusCode.REQUIRED_ERROR:
            message = `The "${info.key}" are required.`;
            break;
        case StatusCode.COVER_ERROR:
            // tslint:disable-next-line:max-line-length
            message = `Corveration function processing {${info.key}: ${l}${info.value}${r}} throws an error: ${info.others}.`;
            break;
        case StatusCode.CHOICES_RUN_ERROR:
            // tslint:disable-next-line:max-line-length
            message = `Choises function processing {${info.key}: ${l}${info.value}${r}} throws an error: ${info.others}.`;
            break;
        case StatusCode.CHOICES_ERROR:
            if (typeof info.others === 'function') {
                message = `The choices function check {${info.key}: ${l}${info.value}${r}} is false.`;
            } else {
                message = `The {${info.key}: ${l}${info.value}${r}} is not in [${info.others.toString()}].`;
            }
            break;
        case StatusCode.TYPE_ERRPR:
            message = `The {${info.key}: ${l}${info.value}${r}} type is not "${info.others}".`;
            break;
    }

    return {
        code: error.code,
        message
    };
};

export class ReqParams {
    private globalOpts: ParaOptions;
    private params: { [name: string]: ParaOptions } = {};

    /**
     * Create reqparser instance.
     * 
     * @param {(ParaOptionObject[] | ParaOptions)}  options             Set parameters or global settings
     *                                                                  global settings are overridden by zone settings
     * @param {ParaOptions}                         [globalOpts={}]     Global settings are overridden by zone settings
     * 
     * @example
     * // normal params
     * const params = new ReqParams();
     * // set global options
     * const params = new ReqParams({defaultVal: 'hh'});
     * // set params
     * const params = new ReqParams([{name: 'name', option: {type: 'string'}}])
     * // set params & global options
     * const params = new ReqParams([{name: 'name', option: {type: 'string'}}], {defaultVal: 'hh'})
     */
    constructor(options: ParaOptionObject[] | ParaOptions = {}, globalOpts: ParaOptions = {}) {
        const baseOpts = {
            caseSensitive: false,
            choices: null,
            coveration: null,
            defaultVal: undefined,
            dset: null,
            nullabled: true,
            required: false,
            trim: false,
            type: 'any'
        };

        if (Array.isArray(options)) {
            this.add(options);
        } else {
            globalOpts = options;
        }

        this.globalOpts = Object.assign({}, baseOpts, globalOpts);
    }

    /**
     * Add parameters.
     * 
     * @param {(string | ParaOptionObject[])}  parameters      parameter name or paraoptions list
     * @param {ParaOptions}                    [opts={}]       parameter options
     * 
     * @example
     * // add one param 
     * reqParams.add('name', {type:'string'});
     * reqParams.add('age', {type:'number'});
     * // add more params
     * reqParam.add([{name: 'name', option: {type: 'string'}}, {name:'age', option:{type:'number'}}])
     */
    public add(parameters: string | ParaOptionObject[], opts: ParaOptions = {}) {
        if (!Array.isArray(parameters)) {
            parameters = [{
                name: parameters,
                option: opts
            }];
        }

        parameters.forEach((parameter) => {
            const { name, option } = parameter;

            if (this.params[name]) {
                throw createError({
                    message: `The parameter name: ${name} already exists.`
                }, ReqParams);
            }

            if (option && option.dset && this.params[option.dset]) {
                throw createError({
                    message: `The parameter name: ${name}, dtet: ${option.dset} already exists.`
                }, ReqParams);
            }

            opts = Object.assign({}, this.globalOpts, option);
            this.params[name] = opts;
        });
    }

    /**
     * Remove parameters.
     * 
     * @param name      parameter name or parameter name array.
     */
    public remove(name: (string | string[])) {
        const names = [].concat(name);

        names.forEach((n) => {
            if (this.params[n]) {
                delete this.params[n];
            }
        });
    }

    /**
     * Return all params
     * 
     * @returns 
     */
    public getParams(): { [name: string]: ParaOptions } {
        return this.params;
    }

    /**
     * Inherit other reqParams
     * @param args 
     */
    public inherit(...args: ReqParams[]) {
        args.forEach((reqParam) => {
            const params = reqParam.getParams();
            for (const key in params) {
                this.add(key, params[key]);
            }
        });
    }
}

export default {
    validation
};
