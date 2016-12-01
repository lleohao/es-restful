let should = require('should');
let Parser = require('../dist/parser').Parser;
let http = require('http');
let qs = require('querystring');


describe('Parser', function () {
    describe('新建parser测试', function () {
        let globalParser;

        beforeEach(function () {
            globalParser = new Parser();
        });

        it('should return parser', function () {
            globalParser.should.be.instanceof(Parser);
        });

        it('should parser.trim is true', function () {
            let parser = new Parser(true);
            parser.trim.should.be.true();
        });

        it('should parser.errCb return undefined', function () {
            should(globalParser.errCb()).be.an.Undefined();
        });

        it('should parser.errCn return 1', function () {
            let parser = new Parser(function () {
                return 1;
            });

            should(parser.errCb()).be.equal(1);
        });
    });

    describe('addParams 方法测试', function () {
        it('should throw name Typerror', function () {
            should.throws(function () {
                let parser = new Parser();
                parser.addParam({
                    name: 1,
                });
            });
        });

        it('should throw name exists Error', function () {
            should.throws(function () {
                let parser = new Parser();
                parser.addParam({
                    name: 'name',
                });
                parser.addParam({
                    name: 'name',
                });
            });
        });

        it('should have params', function () {
            let parser = new Parser();
            parser.addParam({
                name: 'sex',
                required: true,
            });

            let params = parser.params['sex'];

            params.should.have.property('name');
            params.should.have.property('required').with.be.true();

        });
    });

    describe('removeParams 测试', function () {
        it('should throw typerror', function () {
            let parser = new Parser();
            should.throws(function () {
                parser.removeParams(1);
            });
        });

        it('should work with string', function () {
            let parser = new Parser();
            parser.addParam({
                name: 'sex',
            });
            parser.removeParams('sex');

            let params = parser.params;
            should(params['sex']).be.Undefined();
        });

        it('should work with string array', function () {
            let parser = new Parser();
            parser.addParam({
                name: 'sex',
            });
            parser.addParam({
                name: 'age',
            });

            let params = parser.params;

            parser.removeParams(['sex', 'age']);
            should(params['sex']).be.Undefined();
            should(params['age']).be.Undefined();
        });
    });

    describe('parse 方法简单测试', function () {
        let server;

        before(function () {
            server = http.createServer(function (req, res) {
                let parser = new Parser();
                parser.parse(req, res).on('end', function (data) {
                    res.writeHead(200, {
                        'Content-type': 'application/json',
                    });
                    res.end(JSON.stringify(data));
                });
            }).listen(5052);
        });

        after(function () {
            server.close();
        });

        describe('get请求处理', function () {
            it('should return {data: ""}', function (done) {
                http.get({
                    port: 5052,
                }, function (res) {
                    let data = [];
                    res.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        data = JSON.parse(data.toString());
                        data.should.have.property('data');
                        console.log(data);
                        done();
                    });


                }).on('error', function (err) {
                    throw err;
                });
            });

            it('should return {data: {name: "lleohao"}}', function (done) {
                http.get({
                    port: 5052,
                    path: '/?name=lleohao',
                }, function (res) {
                    let data = [];
                    res.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        data = JSON.parse(data.toString()).data;
                        data.should.have.property('name');
                        data['name'].should.be.equal('lleohao');
                        done();
                    });
                }).on('error', function (err) {
                    throw err;
                });
            });
        });

        describe('post put delete 等带有请求数据的请求处理', function () {
            it('should return {data: ""}', (done) => {
                let postData = '';

                let request = http.request({
                    port: 5052,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, function (res) {
                    let data = [];
                    res.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        data = JSON.parse(data.toString());
                        data.should.have.property('data');
                        done();
                    });
                });

                request.write(postData);
                request.end();
            });

            it('should return error message', (done) => {
                let postData = '';

                let request = http.request({
                    port: 5052,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, function (res) {
                    let data = [];
                    res.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        data = JSON.parse(data.toString());
                        data.should.have.property('error');
                        done();
                    });
                });

                request.write(postData);
                request.end();
            });

            it('should return {data: {name: "lleohao"}}', (done) => {
                let postData = JSON.stringify({name: 'lleohao'});

                let request = http.request({
                    port: 5052,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, function (res) {
                    let data = [];
                    res.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        data = JSON.parse(data.toString()).data;
                        data.should.have.property('name');
                        data['name'].should.be.equal('lleohao')
                        done();
                    });
                });

                request.write(postData);
                request.end();
            });
        });
    });
});