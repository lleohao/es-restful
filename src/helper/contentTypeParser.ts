const contentTypeRegexp = /^(.*?)\/(.*?)((?:[\t ]*;).*)?$/;
const paramsTrim = /[\t ]*/g;

const contentTypeParser = (contentType: string): { type: string, subType: string, params: any } => {
    const contentTypeMatch = contentTypeRegexp.exec(contentType);
    const [, type, subType, _params] = contentTypeMatch;
    let params;

    if (_params) {
        params = _params.replace(paramsTrim, '').substr(1);
    } else {
        params = null;
    }

    return {
        type, subType, params
    };
};

export default contentTypeParser;
