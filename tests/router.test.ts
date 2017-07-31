import { Router } from '../lib/router';
import { Resource } from '../lib/resource';
import should = require('should');

const nullResult = {
    params: null,
    resource: null
};
const cases = [
    {
        path: '/only/static',
        c: [
            '/only/static',
            '/only',
            '/only/staticc',
            '/only/static/',
            '/only/static/name'
        ],
        e: [
            {},
            null,
            null,
            null,
            null
        ]
    },
    {
        path: '/dynamic/with/no/type/<hhh>',
        c: [
            '/dynamic/with/no/type/hhh',
            '/dynamic/with/no/type/hhh/ddd',
            '/dynamic/with/no/type',
            '/dynamic/with/no/type/'
        ],
        e: [
            { hhh: 'hhh' },
            null,
            null,
            null
        ]
    },
    {
        path: '/dynamic/with/type/string/<str:s>',
        c: [
            '/dynamic/with/type/string/str',
            '/dynamic/with/type/string/123',
            '/dynamic/with/type/string/1.23',
            '/dynamic/with/type/string/with/path'
        ],
        e: [
            { s: 'str' },
            { s: '123' },
            null,
            null
        ]
    },
    {
        path: '/dynamic/with/type/int/<int:n>',
        c: [
            '/dynamic/with/type/int/str',
            '/dynamic/with/type/int/123',
            '/dynamic/with/type/int/1.23',
            '/dynamic/with/type/int/with/path'
        ],
        e: [
            null,
            { n: '123' },
            null,
            null
        ]
    },
    {
        path: '/dynamic/with/type/float/<float:n>',
        c: [
            '/dynamic/with/type/float/str',
            '/dynamic/with/type/float/123',
            '/dynamic/with/type/float/1.23',
            '/dynamic/with/type/float/with/path'
        ],
        e: [
            null,
            null,
            { n: '1.23' },
            null
        ]
    },
    {
        path: '/dynamic/with/type/path/<path:p>',
        c: [
            '/dynamic/with/type/path/str',
            '/dynamic/with/type/path/123',
            '/dynamic/with/type/path/1.23',
            '/dynamic/with/type/path/with/path'
        ],
        e: [
            { p: 'str' },
            { p: '123' },
            { p: '1.23' },
            { p: 'with/path' }
        ]
    },
    {
        path: '/dynamic/<str:username>/<int:id>/height/<float:height>/other/<path:path>/weight',
        c: [
            '/dynamic/lleohao/22/height/170.5/other/aa/bb/cc/weight',
            '/dynamic/lleohao/2.2/height/170.5/other/aa/bb/cc/weight',
            '/dynamic/lleohao/22/height/170/other/aa/bb/cc/weight'
        ],
        e: [
            {
                username: 'lleohao',
                id: '22',
                height: '170.5',
                path: 'aa/bb/cc'
            },
            null,
            null
        ]

    }
];


class TestResource extends Resource {
}

class ThrowErrResource extends Resource {
    constructor() {
        super();
        throw new Error('Throw constructor error.');
    }
}

class Foo {
}

describe('Router', () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
    });
    afterEach(() => {
        router = null;
    });


    it('add two same path resource', () => {
        should.throws(() => {
            router.addRoute('/same', TestResource);
            router.addRoute('/same', TestResource);
        }, /Source path: \/same used twice./);
    });

    it('add will throw error resource', () => {
        const router = new Router();

        should.throws(() => {
            router.addRoute('/test', ThrowErrResource);
        }, /Throw constructor error./);
    });

    it('add two same varibale in path', () => {
        const router = new Router();

        should.throws(() => {
            router.addRoute('/same/<same>/<same>', TestResource);
        }, /Variable name: same used twice\./);
        should.throws(() => {
            router.addRoute('/same1/<int:same>/<same>', TestResource);
        }, /Variable name: same used twice\./);
        should.throws(() => {
            router.addRoute('/same2/<int:same>/<str:same>', TestResource);
        }, /Variable name: same used twice\./);
    });

    it('add error path', () => {
        const router = new Router();

        should.throws(() => {
            router.addRoute('/error/>', TestResource);
        }, /Malformed url rule: \/error\/> \./);
        should.throws(() => {
            router.addRoute('/error<', TestResource);
        }, /Malformed url rule: \/error< \./);
        should.throws(() => {
            router.addRoute('/error/<name<>>', TestResource);
        }, /Malformed url rule: \/error\/<name<>> \./);
    });

    it('add undefined converter type', () => {
        const router = new Router();

        should.throws(() => {
            router.addRoute('/error/<string:s>', TestResource);
        }, /Converter type: string is undefined\./);
    });

    describe('Parse', () => {
        const router = new Router();

        cases.forEach((c) => {
            describe(c.path, () => {
                router.addRoute(c.path, TestResource);
                c.c.forEach((_c, index) => {
                    it(_c, () => {
                        let result = router.getResource(_c);
                        if (c.e[index] !== null) {
                            should(result.params).be.eql(c.e[index]);
                            should(result.resource).be.instanceOf(TestResource);
                        } else {
                            should(result).be.eql(nullResult);
                        }
                    });
                });
            })
        });
    });
});
