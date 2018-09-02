import { parserInterface } from './index';

const textParser: parserInterface = (body, callback) => {
  callback(null, decodeURIComponent(body));
};

export default textParser;
