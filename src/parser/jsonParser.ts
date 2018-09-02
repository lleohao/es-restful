import { parserInterface } from './index';

const jsonParser: parserInterface = (body, callback) => {
  try {
    callback(null, JSON.parse(body));
  } catch (e) {
    callback(e, null);
  }
};

export default jsonParser;
