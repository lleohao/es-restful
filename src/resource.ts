import { ReqParams } from './params';

export class Resource {
    public static addParser(params: ReqParams) {
        return (target: any, propertyKey: string) => {
            target[propertyKey].params = params;
        };
    }

    public getMethodProcess(method: string) {
        return this[method.toLowerCase()];
    }
}
