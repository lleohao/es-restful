import jsonParser from './jsonParser';
import queryParser from './queryParser';
import rawParser from './rawParser';
import textParser from './textParser';
import urlencodeParser from './urlencodeParser';

export type parserInterface = (rawData: string, callback: (err: Error, data: {}) => void) => void;

export { queryParser, urlencodeParser, jsonParser, textParser, rawParser };
