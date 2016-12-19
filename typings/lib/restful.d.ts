/// <reference types="node" />
import { ServerResponse } from 'http';
import { Parser } from './parser';
export declare function addParser(parser: Parser): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare class Restful {
    private resourceList;
    private port;
    private hostname;
    private server;
    constructor(port?: number, hostname?: string);
    _handleError(res: ServerResponse, code: number | Object, data?: Object | string): void;
    _handleSuccess(res: ServerResponse, code: number, data: Object | string): void;
    _route(req: any, res: any): void;
    addSource(path: string, resource: any): void;
    start(): void;
    stop(): void;
}
