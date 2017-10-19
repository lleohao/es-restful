import { IncomingMessage } from 'http';
import contentTypeParser, { ContentType } from './helper/contentTypeParser';
import * as parser from './parser';

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

export const requestParse = (req: IncomingMessage, callback: (err: Error, data: RequestData) => void) => {
    const { url, method, headers } = req;

    const query = parser.queryParser(url);

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
            callback(err, null);
        }

        function onEnd() {
            bodyParser(body, (err, data) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, { query, data });
                }
            });
        }
    } else {
        callback(null, { query, data: {} });
    }
};
