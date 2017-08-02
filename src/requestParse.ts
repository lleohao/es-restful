import { IncomingMessage } from 'http';
import { parse } from 'querystring';

const parseBodyData = (type: string, body: string) => {
    let data;

    switch (type) {
        case 'application/x-www-form-urlencoded':
            data = parse(body);
            break;
        case 'application/json':
            data = JSON.parse(body);
            break;
        default:
            throw new TypeError(`This request Content-Type: ${type} is not supported.`);
    }

    return data;
}

export const requestParse = (req: IncomingMessage) => {
    return new Promise((reject, reslove) => {
        if (req.method === 'GET') {
            const url = decodeURIComponent(req.url);
            const index = url.indexOf('?');

            const queryStr = index === -1 ? '' : url.substr(index + 1);
            let data = parse(queryStr)

            reject(data);
        } else {
            let contentType: string = req.headers['content-type'];
            let body: Buffer[] = [];

            req.on('data', (chunk) => {
                body.push(chunk as Buffer);
            }).on('end', () => {
                let bodyData = body.toString();

                try {
                    reject(parseBodyData(contentType, body.toString()));
                } catch (e) {
                    reslove(e);
                }
            });
        }
    });
}
