import { IncomingMessage } from 'http';
import { ContentType, contentTypeParser } from './helper';
import * as parser from './parser';
import { createError, RestfulErrorType } from './utils';

export interface QueryData {
    [key: string]: string;
}

export interface BodyData {
    [key: string]: any;
}

export interface RequestData {
    query: QueryData;
    data: BodyData | string;
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
                        resolve({ query, data });
                    }
                });
            }
        } else {
            resolve({ query, data: {} });
        }
    });
};
