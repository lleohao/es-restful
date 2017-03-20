"use strict";
var errorCode;
(function (errorCode) {
    errorCode[errorCode["REQUEST_ERROR"] = 1] = "REQUEST_ERROR";
    errorCode[errorCode["REQUIRED_ERROR"] = 2] = "REQUIRED_ERROR";
    errorCode[errorCode["CONVER_ERROR"] = 3] = "CONVER_ERROR";
    errorCode[errorCode["CHOICES_ERROR"] = 4] = "CHOICES_ERROR";
    errorCode[errorCode["NULL_ERROR"] = 5] = "NULL_ERROR";
})(errorCode = exports.errorCode || (exports.errorCode = {}));
exports.errorMessages = {
    1: 'Unable to parse this request.',
    2: 'Missing request parameters.',
    3: 'Parameter type conversion error.',
    4: 'The parameter is not in the selection range.',
    5: 'Parameters are not allowed to be null.'
};
function getRuleReg(path) {
    let ruleRe = /([^<]*)<([a-zA-Z_][a-zA-Z0-9_]*)>/g;
    let params = [];
    let length = path.length;
    let index = 0;
    while (index < length) {
        let result = ruleRe.exec(path);
        if (result !== null) {
            params.push(result[2]);
            index = ruleRe.lastIndex;
        }
        else {
            break;
        }
    }
    params.forEach((name) => {
        path = path.replace(`<${name}>`, '(\\w+)');
    });
    path = '^' + path + '$';
    return {
        rule: new RegExp(path, 'g'),
        params: params
    };
}
exports.getRuleReg = getRuleReg;
function arrHas(arr, key, value) {
    return arr.some((item) => {
        return item[key] === value;
    });
}
exports.arrHas = arrHas;
class RestfulError extends Error {
}
exports.RestfulError = RestfulError;
//# sourceMappingURL=utils.js.map