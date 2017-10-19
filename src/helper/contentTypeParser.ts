const contentTypeRegexp = /^(.*?)\/(.*?)((?:[\t ]*;).*)?$/;
const paramsTrim = /[\t ]*/g;

export interface ContentType {
    type: string;
    subType: string;
    params: any;
}

const contentTypeParser = (contentType: string = 'text/plain'): ContentType => {
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
