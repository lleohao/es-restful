/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
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
export declare class Parser extends EventEmitter {
    private params;
    private trim;
    private errCb;
    baseUrl: string;
    constructor(trim?: boolean | Function, errCb?: Function);
    parse(req: IncomingMessage, res: ServerResponse): EventEmitter;
    private _parseReqest(req);
    private _handleBodyData(type, body);
    private _checkParams(parseData);
    private _handleError(errors, emit);
    addParam(name: string, options: Param): void;
    removeParams(name: (string | string[])): void;
    setBaseUrl(baseUrl: string): void;
}
