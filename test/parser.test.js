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
})