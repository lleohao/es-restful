/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/should/index.d.ts" />
import { createServer, get, request, Server } from 'http';
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
            let server: Server;

            afterEach(() => {
                server.close();
            })

            it('正确删除单个参数', (done) => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('name');
                    parser.removeParams('name');

                    parser.parse(req).on('parseEnd', (data) => {
                        should(data).be.eql({});
                        res.end();
                        done();
                    })

                });
                server.listen(5052);
                get({
                    port: 5052,
                    path: '/?name=lleohao'
                }, () => {

                })
            })

            it('正确删除多个参数', (done) => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('name');
                    parser.addParam('age');
                    parser.removeParams(['name', 'age']);

                    parser.parse(req).on('parseEnd', (data) => {
                        should(data).be.eql({});
                        res.end();
                        done();
                    })

                });
                server.listen(5052);
                get({
                    port: 5052,
                    path: '/?name=lleohao&age=22'
                }, () => {

                })
            })
        })

        describe('parse 方法测试', function () {
            let server: Server;

            afterEach(() => {
                server.close();
            })

            it('正确解析参数(get请求)', (done) => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('name');
                    parser.addParam('age');

                    parser.parse(req).on('parseEnd', (data) => {
                        should(data).be.eql({
                            age: '22',
                            name: 'lleohao'
                        });
                        res.end();
                        done();
                    })

                });
                server.listen(5052);
                get({
                    port: 5052,
                    path: '/?name=lleohao&age=22'
                }, () => {
                })
            })

            it('正确解析参数(post请求)', (done) => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('name');
                    parser.addParam('age');

                    parser.parse(req).on('parseEnd', (data) => {
                        should(data).be.eql({
                            age: 22,
                            name: 'lleohao'
                        });
                        res.end();
                        done();
                    })

                });
                server.listen(5052);
                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, () => { });

                req.write(JSON.stringify({ name: 'lleohao', age: 22 }));
                req.end();
            })
        })
    });

    describe('错误验证测试', () => {

    })
});