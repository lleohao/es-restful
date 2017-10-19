import { IncomingMessage } from 'http';
import { parse } from 'querystring';
import { createError, RestfulError, RestfulErrorType } from './utils';

const queryParser = (url: string): {} => {
    url = decodeURIComponent(url);

    const index = url.indexOf('?');

    const queryStr = index === -1 ? '' : url.substr(index + 1);
    return parse(queryStr);
};

const parseBodyData = (type: string, body: string) => {
    let data;

    switch (type.toLowerCase()) {
        case 'text/plain':
        case 'application/x-www-form-urlencoded':
            data = parse(body);
            break;
        case 'application/json':
            try {
                data = body === '' ? {} : JSON.parse(body);
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
        // GET and DELETE method no body
        if (/get|delete/i.test(req.method)) {
            reslove(queryParser(req.url));
        } else {
            const contentType: string = req.headers['content-type'] || 'application/x-www-form-urlencoded';

            const body: Buffer[] = [];

            req.on('data', (chunk) => {
                body.push(chunk as Buffer);
            }).on('end', () => {
                const bodyData = parseBodyData(contentType, body.toString());

                if (bodyData instanceof RestfulError) {
                    throw bodyData;
                } else {
                    reject(bodyData);
                }
            });
        }
    });
};
