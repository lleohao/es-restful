"use strict";
const util_1 = require('util');
class Parser {
    constructor(trim = false, errCb) {
        if (typeof (trim) !== 'function') {
            this.trim = !!trim;
            this.errCb = errCb || function () { };
        }
        else {
            this.trim = false;
            this.errCb = trim;
        }
    }
    parse(req, res) {
    }
    addParam(param) {
        let name = param.name;
        if (typeof (param.name) !== 'string') {
            throw new TypeError('The parameter type of name must be a string');
        }
        if (this.arguments[param.name]) {
            throw new TypeError(`The parameter name: ${name} already exists`);
        }
        this.arguments[name] = param;
    }
    removeParams(name) {
        if (typeof (name) !== 'string' || !util_1.isArray(name)) {
            throw new TypeError('The parameter type of name must be a string or string array');
        }
        let names = [].concat(name);
        names.forEach(name => {
            if (this.arguments[name]) {
                delete this.arguments[name];
            }
        });
    }
}
exports.Parser = Parser;
