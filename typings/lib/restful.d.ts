/// <reference types="node" />
import { ServerResponse } from 'http';
import { Parser } from './parser';
export declare function addParser(parser: Parser): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare class Restful {
    private resourceMap;
    private port;
    private hostname;
    private server;
    private errorMessage;
    constructor(port?: number, hostname?: string);
    _handleRes(res: ServerResponse, code: number, data?: Object | string): void;
    addSource(path: string, resource: any): void;
    start(): void;
    stop(): void;
}
