/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
export interface Param {
    name: string;
    defaultVal?: any;
    dset?: string;
    required?: boolean;
    ignore?: boolean;
    type?: string;
    trim?: boolean;
}
export declare class Parser {
    private params;
    private trim;
    private errCb;
    constructor(trim?: boolean | Function, errCb?: Function);
    parse(req: IncomingMessage, res: ServerResponse): {};
    private _parseReqest(req);
    private _checkParams(result);
    addParam(param: Param): void;
    removeParams(name: (string | string[])): void;
}
