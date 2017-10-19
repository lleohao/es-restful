import { parserInterface } from './index';

const rawParser: parserInterface = (body, callback) => {
    callback(null, body);
};

export default rawParser;
