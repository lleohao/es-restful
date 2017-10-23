import { ServerResponse } from 'http';
import { CORSConfig, generateCorsHeaders } from '../helper/cors';

export interface ResponseOption {
    headers?: { [key: string]: any };
    CORS?: boolean | CORSConfig;
}

export class ResponseHandle {
    private headers = {};

    constructor({ headers, CORS }: ResponseOption) {
        headers = headers || {};

        this.headers = Object.assign(this.headers, headers, generateCorsHeaders(CORS));
    }

    private generateErrorData(data: object | string) {
        return {
            error: (typeof data === 'string') ? {
                message: data
            } : data
        };
    }

    private setHeaders(res: ServerResponse, headers) {
        for (const key in headers) {
            res.setHeader(key, headers[key]);
        }
    }

    public finish(res: ServerResponse, data: object | string, status: number, headers = {}) {
        let responesData;
        if (status >= 400) {
            responesData = this.generateErrorData(data);
        } else {
            responesData = data;
        }

        this.setHeaders(res, Object.assign(this.headers, headers));
        res.writeHead(status, { 'Content-Type': 'Application/json' });
        res.write(JSON.stringify(responesData));
        res.end();
    }

    public endOptions(res: ServerResponse) {
        this.setHeaders(res, this.headers);
        res.end();
    }
}
