import { createServer, request, Server, get } from 'http';
import { requestParse } from '../lib/requestParse';
import { stringify } from 'querystring';
import should = require('should');

should['config'].checkProtoEql = false;

const urlencoded = 1;
const json = 2;

describe('RequestParse', () => {
    const haveBodyCases = {
        jsonParserTest: {
            herder: ['application/json'],
            _cases: [
                {
                    path: '/',
                    data: {
                        name: 'lleohao'
                    },
                    e: {
                        query: {},
                        data: {
                            name: 'lleohao'
                        }
                    }
                },
                {
                    path: '/?age=22',
                    data: {
                        name: 'lleohao'
                    },
                    e: {
                        query: {
                            age: '22'
                        },
                        data: {
                            name: 'lleohao'
                        }
                    }
                }
            ]
        },
        textParserTest: {
            herder: ['text/palin', 'text/xml'],
            _cases: [
                {
                    path: '/',
                    data: '<author name="lleohao">',
                    e: {
                        query: {},
                        data: '<author name="lleohao">'
                    }
                },
                {
                    path: '/?age=22',
                    data: '<author name="lleohao">',
                    e: {
                        query: {
                            age: '22'
                        },
                        data: '<author name="lleohao">'
                    }
                }
            ]
        },
        urlencodedParserTest: {
            herder: ['application/x-www-form-urlencoded'],
            _cases: [
                {
                    path: '/',
                    data: 'name=lleohao',
                    e: {
                        query: {},
                        data: {
                            name: 'lleohao'
                        }
                    }
                },
                {
                    path: '/?age=22',
                    data: 'name=lleohao',
                    e: {
                        query: {
                            age: '22'
                        },
                        data: {
                            name: 'lleohao'
                        }
                    }
                }
            ]
        },
        rawParserTest: {
            herder: ['any/any', 'multipart/form-data'],
            _cases: [
                {
                    path: '/',
                    data: 'datatatatatattata',
                    e: {
                        query: {},
                        data: 'datatatatatattata'
                    }
                },
                {
                    path: '/?age=22',
                    data: 'datatatatatattata',
                    e: {
                        query: {
                            age: '22'
                        },
                        data: 'datatatatatattata'
                    }
                }
            ]
        }
    };

    const noBodyCases = [
        {
            method: 'GET',
            path: '/',
            e: {
                query: {},
                data: {}
            }
        },
        {
            method: 'GET',
            path: '/?name=lleohao',
            e: {
                query: {
                    name: 'lleohao'
                },
                data: {}
            }
        },
        {
            method: 'DELETE',
            path: '/',
            e: {
                query: {},
                data: {}
            }
        },
        {
            method: 'DELETE',
            path: '/?name=lleohao',
            e: {
                query: {
                    name: 'lleohao'
                },
                data: {}
            }
        }
    ]

    noBodyCases.forEach(({ method, path, e }) => {
        it(` method: ${method}, path: ${path}`, (done) => {
            let server = createServer((req, res) => {
                requestParse(req, (err, data) => {
                    should(data).be.eql(e);

                    done();
                    res.end();
                    server.close();
                });
            });
            server.listen(5050);

            let req = request({ host: '127.0.0.1', port: 5050, path: path, method });

            req.end();
        });
    });

    for (const testName in haveBodyCases) {
        const { herder, _cases } = haveBodyCases[testName];

        describe(testName, () => {
            _cases.forEach(({ path, e, data }) => {
                herder.forEach((h) => {
                    it(`path: ${path}, header: ${h}`, (done) => {
                        let server = createServer((req, res) => {
                            requestParse(req, (err, data) => {
                                should(data).be.eql(e);

                                done();
                                res.end();
                                server.close();
                            });
                        });
                        server.listen(5050);

                        let req = request({ host: '127.0.0.1', port: 5050, path: path, method: 'POST' });
                        req.setHeader('Content-Type', h);

                        let reqData = data;

                        if (/json/i.test(testName)) {
                            reqData = JSON.stringify(data);
                        }

                        req.write(reqData);

                        req.end();
                    });
                });
            });
        });
    }
});
