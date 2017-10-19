import { parse } from 'querystring';
import { parserInterface } from './index';

const urlencodeParser: parserInterface = (body, callback) => {
    callback(null, parse(body));
};

export default urlencodeParser;
