import { parse } from 'querystring';
import { parserInterface } from './index';

const urlencodedParser: parserInterface = (body, callback) => {
  callback(null, parse(body));
};

export default urlencodedParser;
