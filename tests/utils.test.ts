import * as should from 'should';
import { arrHas, getRuleReg } from '../src/utils';


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

    describe('getRuleReg test: 包含参数', () => {
        let path = '/books/<name>/page/<page>';
        let {rule, params} = getRuleReg(path);

        it('rule test', () => {
            should(rule).be.eql(/^\/books\/(\w+)\/page\/(\w+)$/g);
        })
        it('params test', () => {
            should(params).be.eql(['name', 'page']);
        })
    });

    describe('getRuleReg test: 不包含参数', () => {
        let path = '/books';
        let {rule} = getRuleReg(path);

        it('rule test', () => {
            should(rule).be.eql(/^\/books$/g);
        })
    });
});