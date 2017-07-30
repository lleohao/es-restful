import { createServer, get, request, Server } from 'http';
import * as should from 'should';
import { Parser } from '../src/index';


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
                    });
                });
            });
        });

        describe('removeParams 方法测试', function () {
            let server: Server;

            afterEach(() => {
                server.close();
            });

            it('正确删除单个参数', (done) => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('name');
                    parser.removeParams('name');

                    parser.parse(req).on('parseEnd', (data) => {
                        should(data).be.eql({});
                        res.end();
                        done();
                    });

                });
                server.listen(5052);
                get({
                    port: 5052,
                    path: '/?name=lleohao'
                }, () => {

                });
            });

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
                    });

                });
                server.listen(5052);
                get({
                    port: 5052,
                    path: '/?name=lleohao&age=22'
                }, () => {

                });
            });
        });

        describe('parse 方法测试', function () {
            let server: Server;

            afterEach(() => {
                server.close();
            });

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
                    });

                });
                server.listen(5052);
                get({
                    port: 5052,
                    path: '/?name=lleohao&age=22'
                }, () => {
                });
            });

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
                    });

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
            });
        });
    });

    describe('参数错误验证测试', () => {
        describe('required(参数是否为必须值) 参数测试, 设置 required = true', () => {
            let server: Server;

            before(() => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('name', {
                        required: true
                    });

                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server.listen(5052);
            });

            after(() => {
                server.close();
            });

            it('正确验证 required', (done) => {
                get({
                    port: 5052,
                    path: '/?name=lleohao'
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        should(data).be.eql({
                            name: 'lleohao'
                        });
                        done();
                    });
                });
            });

            it('正确验证 required 错误', (done) => {
                get({
                    port: 5052
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        should(data).be.eql({
                            errorData: {
                                code: 403,
                                message: 'Missing request parameters.',
                                error: { type: 2, info: 'name', message: 'The "name" are required.' }
                            }
                        });
                        done();
                    });
                });
            });


        });

        describe('nullabled(参数是否可以为空) 参数测试, 设置 nullabled = false, 默认值为 true', function () {
            let server;

            before(() => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('name', {
                        nullabled: false
                    });

                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server.listen(5052);
            });

            after(() => {
                server.close();
            });

            it('正确验证 nullabled 错误', (done) => {
                get({
                    port: 5052,
                    path: '/?name='
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            errorData: {
                                code: 403,
                                message: 'Parameters are not allowed to be null.',
                                error: {
                                    type: 5,
                                    info: 'name',
                                    message: 'The "name" does not allow null values'
                                }
                            }
                        });
                        done();
                    });
                });
            });
        });

        describe('参数类型转换测试, int test', function () {
            let server;

            before(() => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('age', {
                        type: 'int'
                    });
                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server.listen(5052);
            });

            after(() => {
                server.close();
            });

            it('正确值测试', (done) => {
                get({
                    port: 5052,
                    path: '/?age=21'
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            age: 21
                        });
                        done();
                    });
                });
            });

            it('错误值测试, 抛出 type error', (done) => {
                get({
                    port: 5052,
                    path: '/?age=lleohao'
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            errorData: {
                                code: 403,
                                message: 'Parameter type conversion error.',
                                error: {
                                    type: 3,
                                    info: {
                                        key: 'age',
                                        type: 'number',
                                        help: null
                                    },
                                    message: 'Can not convert "age" to number type'
                                }
                            }
                        });
                        done();
                    });
                });
            });
        });

        describe('参数类型转换测试, float test', function () {
            let server;

            before(() => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('weight', {
                        type: 'float'
                    });
                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server.listen(5052);
            });

            after(() => {
                server.close();
            });

            it('正确值验证', (done) => {
                get({
                    port: 5052,
                    path: '/?weight=42.5'
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            weight: 42.5
                        });
                        done();
                    });
                });
            });

            it('错误值验证, 抛出 type error', (done) => {
                get({
                    port: 5052,
                    path: '/?weight=lleohao'
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            errorData: {
                                code: 403,
                                message: 'Parameter type conversion error.',
                                error: {
                                    type: 3,
                                    info: {
                                        key: 'weight',
                                        type: 'number',
                                        help: null
                                    },
                                    message: 'Can not convert "weight" to number type'
                                }
                            }
                        });
                        done();
                    });
                });
            });
        });

        describe('参数类型转换测试, 传入转换函数', function () {
            let server;

            before(() => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('join', {
                        type: (value) => {
                            return value.join('-');
                        },
                        help: 'haha'
                    });
                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server.listen(5052);
            });

            after(() => {
                server.close();
            });

            it('正确值验证', (done) => {
                let data = JSON.stringify({
                    join: ['lleo', 'hao']
                });

                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            join: 'lleo-hao'
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });

            it('错误值验证, 抛出 type error', (done) => {
                let data = JSON.stringify({
                    join: 'lleohao'
                });

                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            errorData: {
                                code: 403,
                                message: 'Parameter type conversion error.',
                                error: {
                                    type: 3,
                                    info: {
                                        key: 'join',
                                        type: 'function',
                                        help: 'haha'
                                    },
                                    message: 'haha'
                                }
                            }
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });
        });

        describe('choices 属性测试', function () {
            let server;

            before(() => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('sex', {
                        choices: ['man', 'woman']
                    });
                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server.listen(5052);
            });

            after(() => {
                server.close();
            });

            it('正确值验证', (done) => {
                let data = JSON.stringify({
                    sex: 'man'
                });

                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            sex: 'man'
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });

            it('错误值验证, 抛出 choice error', (done) => {
                let data = JSON.stringify({
                    sex: 'lalalal'
                });

                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            errorData: {
                                code: 403,
                                message: 'The parameter is not in the selection range.',
                                error: {
                                    type: 4,
                                    info: {
                                        key: 'sex',
                                        value: 'lalalal',
                                        choices: ['man', 'woman']
                                    },
                                    message: 'The sex: "lalalal" is not in [man,woman]'
                                }
                            }
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });
        });

        describe('caseSensitive defaultVal 属性测试', function () {
            let server;

            before(() => {
                server = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('sex', {
                        defaultVal: 'man',
                        caseSensitive: true
                    });

                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server.listen(5052);
            });

            after(() => {
                server.close();
            });

            it('不传送参数, 正确填充默认值', (done) => {
                let data = JSON.stringify({
                    sex: ''
                });

                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            sex: 'man'
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });

            it('不传送参数, 正确返回传送的值', (done) => {
                let data = JSON.stringify({
                    sex: 'WOMEN'
                });

                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            sex: 'women'
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });
        });

        describe('trim dset 属性测试', function () {
            let server_1;
            let server_2;

            before(() => {
                server_1 = createServer((req, res) => {
                    let parser = new Parser(true);
                    parser.addParam('trim_test_false', {
                        trim: false,
                        dset: 'trim'
                    });
                    parser.addParam('trim_test_normal');

                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server_1.listen(5052);
                server_2 = createServer((req, res) => {
                    let parser = new Parser();
                    parser.addParam('trim', {
                        trim: true
                    });

                    parser.parse(req).on('parseEnd', (data) => {
                        res.writeHead(200, {
                            'Content-type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                    });
                });
                server_2.listen(5053);
            });

            after(() => {
                server_1.close();
                server_2.close();
            });

            it('should return {data: {trim: " lleohao ", trim_test_normal: "lleohao"}', (done) => {
                let data = JSON.stringify({
                    trim_test_false: ' lleohao ',
                    trim_test_normal: ' lleohao '
                });

                let req = request({
                    port: 5052,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            trim_test_normal: 'lleohao',
                            trim: ' lleohao ',
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });

            it('should return {trim: "lleohao"}', (done) => {
                let data = JSON.stringify({
                    trim: '   lleohao     ',
                });

                let req = request({
                    port: 5053,
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }, (res) => {
                    let data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    }).on('end', () => {
                        data = JSON.parse(data.toString());
                        data.should.containEql({
                            trim: 'lleohao'
                        });
                        done();
                    });
                });
                req.write(data);
                req.end();
            });
        });
    });
});