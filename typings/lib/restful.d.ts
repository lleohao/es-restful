import { Parser } from './parser';
export declare function addParser(parser: Parser): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare class Restful {
    private resourceList;
    private port;
    private hostname;
    private server;
    constructor(port?: number, hostname?: string);
    private _handleError(res, code, data?);
    private _handleSuccess(res, code, data);
    private _route(req);
    addSource(resource: any, path: string): void;
    start(): void;
    stop(): void;
}
