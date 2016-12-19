/// <reference types="node" />
import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';
export interface Param {
    name?: string;
    caseSensitive?: boolean;
    nullabled?: boolean;
    ignore?: boolean;
    defaultVal?: any;
    dset?: string;
    required?: boolean;
    type?: string | Function;
    trim?: boolean | null;
    choices?: any[];
    help?: string;
}
export interface ParamData {
    errorData?: {
        code: number;
        message: string;
        erros: any[];
    };
    data?: Object;
}
export declare class Parser extends EventEmitter {
    private params;
    private trim;
    private errCb;
    baseUrl: string;
    private _parseRequest(req);
    private _handleBodyData(type, body);
    private _checkParams(parseData);
    private _getErrorMessage(error);
    constructor(trim?: boolean | Function, errCb?: Function);
    addParam(name: string, options: Param): void;
    removeParams(name: (string | string[])): void;
    setBaseUrl(baseUrl: string): void;
    parse(req: IncomingMessage): this;
}
