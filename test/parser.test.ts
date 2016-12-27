/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/should/index.d.ts" />
import * as should from 'should';
import { Parser } from '../lib/index';


describe('Parser test', () => {
    describe('创建实例测试', () => {
        it('正确返回parser实例', () => {
            let parser = new Parser();
            should(parser).be.instanceof(Parser);
        });
    });

    describe('API 测试', () => {
        describe('addParam 方法测试', () => {
            it('添加同名参数会抛出错误', () => {
                should.throws(() => {
                    let parser = new Parser();
                    parser.addParam('name');
                    parser.addParam('name');
                });
            });

            it('添加同名的参数和别名会抛出错误', () => {
                should.throws(() => {
                    let parser = new Parser();
                    parser.addParam('name');
                    parser.addParam('sName', {
                        dset: 'name'
                    })
                })
            })
        })

        describe('removeParams 方法测试', function () {

        })

        describe('removeParams 方法测试', function () {

        })
    });

    describe('错误验证测试', () => {

    })
});