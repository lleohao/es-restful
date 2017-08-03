import { isType } from './utils';

/**
 * es-resuful error code 
 * 
 * @export
 * @enum {number}
 */
export enum StatusCode {
    REQUIRED_ERROR = 1,
    NULL_ERROR = 2,
    TYPE_ERRPR = 3,
    CHOICES_ERROR = 4,
    CONVER_ERROR = 5
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
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
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
    choices?: (input: any) => boolean | any[];
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

/**
 * Error callback function.
 */
export type ErrorCb = (err: Error) => void;

/**
 * Parsed out the request data
 * 
 * @export
 * @interface ParsedData
 */
export interface ParsedData {
    /**
     * The error in parsing
     * 
     */
    error?: {
        /**
         * Error code
         * 
         */
        code: StatusCode;
        /**
         * Error message
         * 
         */
        message: string;
    };
    /**
     * The result of parsing
     * 
     */
    result?: { [key: string]: any };
}

interface ValidationError {
    code: StatusCode;
    info?: {
        key: string;
        value?: any;
        others?: any
    };
}

export class ReqParse {
    private globalOpts: ParaOptions;
    private params: { [name: string]: ParaOptions } = {};
    private trim: boolean = false;
    private errCb: ErrorCb;

    /**
     * Create reqparser instance.
     * 
     * @param [globalOpts={}]   Global settings are overridden by zone settings
     */
    constructor(globalOpts: ParaOptions = {}) {
        const baseOpts = {
            defaultVal: undefined,
            nullabled: true,
            required: false,
            type: 'any',
            choices: null,
            caseSensitive: false,
            trim: false,
            coveration: null,
            dset: null
        };

        this.globalOpts = Object.assign({}, baseOpts, globalOpts)
    }

    /**
     * Add parameters.
     * 
     * @param name      parameter name
     * @param [opts]    parameter options
     */
    add(name: string, opts?: ParaOptions) {
        if (this.params[name]) {
            throw new Error(`The parameter name: ${name} already exists.`);
        }

        if (opts && opts.dset && this.params[opts.dset]) {
            throw new Error(`The parameter dtet: ${name} already exists`);
        }

        opts = Object.assign({ name: name }, this.globalOpts, opts);
        this.params[name] = opts;
    }

    /**
     * Remove parameters.
     * 
     * @param name      parameter name or parameter name array.
     */
    remove(name: (string | string[])) {
        let names = [].concat(name);

        names.forEach(name => {
            if (this.params[name]) {
                delete this.params[name];
            }
        });
    }

    /**
     * 
     * 
     * @param requestData 
     */
    parse(requestData) {
        return this.validation(requestData);
    }

    private validation(requestData) {
        const params = this.params;
        const paramsKeys = Object.keys(params);
        let result = {};
        let parsedData: ParsedData;
        let error: ValidationError;

        const flag = paramsKeys.every((key) => {
            const rule = params[key];
            let value = requestData(params);

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

                // check nullable
                if (rule.nullabled && (value === '' || value === null)) {
                    error = {
                        code: StatusCode.NULL_ERROR,
                        info: { key }
                    };
                    return false;
                }
            }

            // check type
            if (rule.type !== 'any' && isType(value, rule.type)) {
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
            if (rule.choices &&
                ((typeof rule.choices === 'function') ? !rule.choices(value) : (rule.choices as any[]).indexOf(value) === -1)) {
                error = {
                    code: StatusCode.CHOICES_ERROR,
                    info: {
                        key,
                        value,
                        others: rule.coveration
                    }
                };
                return false;
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
                        code: StatusCode.CONVER_ERROR,
                        info: {
                            key,
                            value,
                            others: e.toString()
                        }
                    }
                    return false;
                }
            }

            return true;
        });

        if (!flag) {
            parsedData['error'] = this.genErroeMsg(error);
        } else {
            parsedData['result'] = {};
            paramsKeys.forEach(key => {
                key = params[key].dset || key;
                parsedData['result'][key] = result[key];
            });
        }

        return parsedData;
    }

    private genErroeMsg(error: ValidationError) {
        let message;
        let info = error.info;

        switch (error.code) {
            case StatusCode.REQUIRED_ERROR:
                message = `The "${error.info}" are required.`;
                break;
            case StatusCode.CONVER_ERROR:
                message =
                    error.info['help'] === null ?
                        `Can not convert "${error.info['key']}" to ${error.info['type']} type.`
                        : error.info['help'];
                break;
            case StatusCode.CHOICES_ERROR:
                message = `The ${error.info['key']}: "${error.info['value']}" is not in [${error.info['choices'].toString()}].`;
                break;
            case StatusCode.NULL_ERROR:
                message = `The "${error.info}" does not allow null values.`;
                break;
        }

        return {
            code: error.code,
            message: message
        }
    }
}
