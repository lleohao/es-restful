import jsonParser from './jsonParser';
import queryParser from './queryParser';
import rawParser from './rawParser';
import textParser from './textParser';
import urlencodedParser from './urlencodedParser';

export type parserInterface = (rawData: string, callback: (err: Error, data: {}) => void) => void;

export { queryParser, urlencodedParser, jsonParser, textParser, rawParser };
