"use strict";
const should = require("should");
const utils_1 = require("../lib/utils");
describe('utils.ts test', () => {
    describe('arrHas test', () => {
        let arr = [{
                name: 'ok'
            }];
        it('should return true', () => {
            should(utils_1.arrHas(arr, 'name', 'ok')).be.eql(true);
        });
        it('should return false', () => {
            should(utils_1.arrHas(arr, 'name', 'false')).be.eql(false);
        });
    });
    describe('getRuleRegx test', () => {
        let path = '/books/<name>/page/<page>';
        let { rule, params } = utils_1.getRuleRegx(path);
        it('rule test', () => {
            should(rule).be.eql(/\/books\/(\w+)\/page\/(\w+)/g);
        });
        it('params test', () => {
            should(params).be.eql(['name', 'page']);
        });
    });
});
//# sourceMappingURL=utils.test.js.map