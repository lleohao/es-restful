import { IncomingMessage } from 'http';
import { parse } from 'querystring';
import { createError, RestfulError, RestfulErrorType } from './utils';

const parseBodyData = (type: string, body: string) => {
    let data;

    switch (type) {
        case 'application/x-www-form-urlencoded':
            data = parse(body);
            break;
        case 'application/json':
            try {
                data = body === "" ? {} : JSON.parse(body);
            } catch (error) {
                data = createError({
                    type: RestfulErrorType.REQUEST,
                    message: error.message,
                }, parseBodyData);
            }
            break;
        default:
            data = createError({
                type: RestfulErrorType.REQUEST,
                message: `This request "Content-Type": "${type}" is not supported.`,
                statusCode: 403
            }, parseBodyData);
    }

    return data;
};

export const requestParse = (req: IncomingMessage) => {
    return new Promise((reject, reslove) => {
        if (req.method === 'GET') {
            const url = decodeURIComponent(req.url);
            const index = url.indexOf('?');

            const queryStr = index === -1 ? '' : url.substr(index + 1);
            let data = parse(queryStr);

            reject(data);
        } else {
            let contentType: string = req.headers['content-type'].match(/\b(\w+)\/(\w+)\b/)[0];
            let body: Buffer[] = [];

            req.on('data', (chunk) => {
                body.push(chunk as Buffer);
            }).on('end', () => {
                let bodyData = parseBodyData(contentType, body.toString());

                if (bodyData instanceof RestfulError) {
                    throw bodyData;
                } else {
                    reject(bodyData);
                }
            });
        }
    });
};
