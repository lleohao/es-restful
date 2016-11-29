var should = require('should');
var Parser = require('../dist/parser').Parser;
var http = require('http');


describe('Parser', function () {
    describe('新建parser测试', function () {
        var globalParser;

        beforeEach(function () {
            globalParser = new Parser();
        })

        it('should return parser', function () {
            globalParser.should.be.instanceof(Parser);
        })

        it('should parser.trim is true', function () {
            var parser = new Parser(true);
            parser.trim.should.be.true();
        })

        it('should parser.errCb return undefined', function () {
            should(globalParser.errCb()).be.an.Undefined();
        })

        it('should parser.errCn return 1', function () {
            var parser = new Parser(function () {
                return 1;
            })

            should(parser.errCb()).be.equal(1);
        })
    })

    describe('addParams 方法测试', function () {
        it('should throw name Typerror', function () {
            should.throws(function () {
                var parser = new Parser();
                parser.addParam({
                    name: 1
                });
            })
        })

        it('should throw name exists Error', function () {
            should.throws(function () {
                var parser = new Parser();
                parser.addParam({
                    name: 'name'
                });
                parser.addParam({
                    name: 'name'
                });
            })
        })

        it('should have params', function () {
            var parser = new Parser();
            parser.addParam({
                name: 'sex',
                required: true
            })

            var params = parser.params['sex'];

            params.should.have.property('name');
            params.should.have.property('required').with.be.true();

        })
    })

    describe('removeParams 测试', function () {
        it('should throw typerror', function () {
            var parser = new Parser();
            should.throws(function () {
                parser.removeParams(1);
            })
        })

        it('should work with string', function () {
            var parser = new Parser();
            parser.addParam({
                name: 'sex'
            })
            parser.removeParams('sex')

            var params = parser.params;
            should(params['sex']).be.Undefined();
        })

        it('should work with string array', function () {
            var parser = new Parser();
            parser.addParam({
                name: 'sex'
            })
            parser.addParam({
                name: 'age'
            })

            var params = parser.params;

            parser.removeParams(['sex', 'age']);
            should(params['sex']).be.Undefined();
            should(params['age']).be.Undefined();
        })
    })

    describe('parse 方法测试', function () {
        var server;

        before(function () {
            server = http.createServer(function (req, res) {
                var parser = new Parser();
                let result = parser.parse(req, res);

                res.writeHead(200, {
                    'Content-type': 'application/json'
                });
                res.end(JSON.stringify(result));
            }).listen(3000);
        })

        after(function () {
            server.close();
        })

        describe('get请求处理', function () {
            it('should return {data: ""}', function (done) {
                http.get({
                    port: 3000
                }, function (res) {
                    var data = [];
                    res.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        data = JSON.parse(data.toString());
                        data.should.have.property('data');
                        done();
                    })


                }).on('error', function (err) {
                    console.log(err);
                })
            })

            it('should return {data: {name: "lleohao"}}', function (done) {
                http.get({
                    port: 3000,
                    path: '/?name=lleohao'
                }, function (res) {
                    var data = [];
                    res.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        data = JSON.parse(data.toString()).data;
                        data.should.have.property('name');
                        data['name'].should.be.equal('lleohao')
                        done();
                    })
                }).on('error', function (err) {
                    console.log(err);
                })
            })
        })
    })
})