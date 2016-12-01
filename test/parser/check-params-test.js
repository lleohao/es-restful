/// <reference path="../../lib/@types/parser.d.ts" />
let should = require('should');
let Parser = require('../../dist/parser').Parser;
let http = require('http');
let qs = require('querystring');


describe('parser 错误参数检测测试', function () {
    describe('required test', function () {
        let server;

        before(() => {
            server = http.createServer((req, res) => {
                let parser = new Parser();
                parser.addParam('name', {
                    required: true
                });

                parser.parse(req, res).on('end', (data) => {
                    res.writeHead(200, {
                        'Content-type': 'application/json'
                    });
                    res.end(JSON.stringify(data));
                })
            }).listen(5052);
        })

        after(() => {
            server.close();
        })


        it('should return required error', (done) => {
            http.get({
                port: 5052
            }, (res) => {
                var data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    data.should.containEql({
                        error: [{
                            type: 2,
                            info: 'name'
                        }]
                    })
                    done();
                })
            }).end();
        })

        it('should return required success', (done) => {
            http.get({
                port: 5052,
                path: '/?name=lleohao'
            }, (res) => {
                var data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    data.should.containEql({
                        data: {
                            name: 'lleohao'
                        }
                    })
                    done();
                })
            }).end();
        })
    })

    describe('nullabled test', function () {
        let server;

        before(() => {
            server = http.createServer((req, res) => {
                let parser = new Parser();
                parser.addParam('name', {
                    nullabled: false
                });

                parser.parse(req, res).on('end', (data) => {
                    res.writeHead(200, {
                        'Content-type': 'application/json'
                    });
                    res.end(JSON.stringify(data));
                })
            }).listen(5052);
        })

        after(() => {
            server.close();
        })


        it('should return required error', (done) => {
            http.get({
                port: 5052,
                path: '/?name='
            }, (res) => {
                var data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    data.should.containEql({
                        error: [{
                            type: 5,
                            info: 'name'
                        }]
                    })
                    done();
                })
            }).end();
        })
    })
});