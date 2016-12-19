/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/should/index.d.ts" />
import * as should from 'should';
import { arrHas, getRuleRegx } from '../lib/utils';


describe('utils.ts test', () => {
    describe('arrHas test', () => {
        let arr = [{
            name: 'ok'
        }];

        it('should return true', () => {
            should(arrHas(arr, 'name', 'ok')).be.eql(true);
        });
        it('should return false', () => {
            should(arrHas(arr, 'name', 'false')).be.eql(false);
        });
    });

    describe('getRuleRegx test', () => {
        let path = '/books/<name>/page/<page>';
        let {rule, params} = getRuleRegx(path);

        it('rule test', () => {
            should(rule).be.eql(/\/books\/(\w+)\/page\/(\w+)/g);
        })
        it('params test', () => {
            should(params).be.eql(['name', 'page']);
        })
    });
});