var should = require('should');
var Parser = require('../lib/parser').Parser;


describe('Parser', function () {
    describe('create test', function () {
        var globalParser;

        beforeEach(function () {
            globalParser = new Parser();
        })

        it('create parser', function () {
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

    describe('add params test', function () {
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

    describe('remove test', function () {
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
})