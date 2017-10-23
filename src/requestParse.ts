import { IncomingMessage } from 'http';
import { ContentType, contentTypeParser } from './helper';
import * as parser from './parser';
import { createError, isType, RestfulErrorType } from './utils';

export interface BodyData {
    [key: string]: any;
}

export interface RequestData {
    data: BodyData;
    rawData: any;
}

const NO_BODY_METHODS = ['GET', 'DELETE'];

function getParser(contentType: ContentType) {
    if (contentType.type === 'text') {
        return parser.textParser;
    }

    if (contentType.subType === 'json') {
        return parser.jsonParser;
    }

    if (contentType.subType === 'x-www-form-urlencoded') {
        return parser.urlencodeParser;
    }

    return parser.rawParser;
}

export const requestParse = (req: IncomingMessage): Promise<RequestData> => {
    const { url, method, headers } = req;
    const query = parser.queryParser(url);

    return new Promise((resolve, reject) => {
        if (NO_BODY_METHODS.indexOf(method) === -1) {
            let body = '';
            const contentType = contentTypeParser(headers['content-type']);
            const bodyParser = getParser(contentType);

            req.on('data', onData);
            req.on('error', onError);
            req.on('end', onEnd);

            function onData(chunk) {
                body += chunk;
            }

            function onError(err) {
                reject(createError({
                    type: RestfulErrorType.REQUEST,
                    message: err.message,
                }, requestParse));
            }

            function onEnd() {
                bodyParser(body, (err, data) => {
                    if (err) {
                        reject(createError({
                            type: RestfulErrorType.REQUEST,
                            message: err.message,
                        }, requestParse));
                    } else {
                        let rawData = null;

                        if (isType(data, 'object')) {
                            data = Object.assign(query, data);
                        } else {
                            rawData = data;
                            data = query;
                        }
                        resolve({ data, rawData });
                    }
                });
            }
        } else {
            resolve({
                data: query,
                rawData: null
            });
        }
    });
};
