import { get, request, createServer, Server } from 'http';
import { Restful, ReqParams, Resource } from '../lib';
import should = require('should');


describe('Restful', () => {
    describe('API', () => {
        let api: Restful;
        beforeEach(() => {
            api = new Restful();
        });
        afterEach(() => {
            api.stop();
        })

        it('can throw error with not add resource', () => {
            should.throws(() => {
                api.start({ port: 5051 })
            }, /There can not be any proxied resources\./);
        });

        it('can throws error with add same path', () => {
            class Todos extends Resource {
                get(render) {
                    render('ok');
                }
            }
            api.addSource(Todos, '/todos');
            should.throws(() => {
                api.addSource(Todos, '/todos');
            })
        });

        it('can start server', (done) => {
            class Todos extends Resource {
                get(render) {
                    render('ok');
                }
            }
            api.addSource(Todos, '/todos');
            api.start({ port: 5051 });

            get({
                hostname: 'localhost',
                port: 5051,
                path: '/todos'
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk)
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 200,
                        result: 'ok'
                    });
                    done();
                });
            });
        });

        it('can add reqParams', (done) => {
            let parser = new ReqParams();
            parser.add('title');
            class Demo extends Resource {
                @Resource.addParser(parser)
                post(render, { title }) {
                    render(title);
                }
            }
            api.addSource(Demo, '/demo');
            api.start({ port: 5051 });
            let req = request({
                hostname: 'localhost',
                port: 5051,
                method: 'post',
                path: '/demo',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk)
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 200,
                        result: 'demo'
                    });
                    done();
                })
            });
            req.write(JSON.stringify({ title: 'demo' }));
            req.end();
        });

        describe('addSourceMap', () => {
            let api: Restful;
            class Test1 extends Resource {
                get(render) {
                    render('restful request1');
                }
            }

            class Test2 extends Resource {
                get(render) {
                    render('restful request2');
                }
            }

            before(() => {
                api = new Restful();
                api.addSourceMap({
                    '/test1': Test1,
                    '/test2': Test2,
                })
                api.start({ port: 5051 });
            });

            after(() => {
                api.stop();
            });

            it('can correct response path1', (done) => {
                get({
                    port: 5051,
                    path: '/test1'
                }, (res) => {
                    let data = [];
                    res.on('data', (chunk) => {
                        data.push(chunk);
                    }).on('end', () => {
                        should(JSON.parse(data.toString())).be.eql({
                            code: 200,
                            result: 'restful request1',
                        })
                        done();
                    })
                })
            })

            it('can correct response path2', (done) => {
                get({
                    port: 5051,
                    path: '/test2'
                }, (res) => {
                    let data = [];
                    res.on('data', (chunk) => {
                        data.push(chunk);
                    }).on('end', () => {
                        should(JSON.parse(data.toString())).be.eql({
                            code: 200,
                            result: 'restful request2'
                        })
                        done();
                    })
                })
            })
        })
    });

    describe('access undefind resource', () => {
        let api: Restful;
        beforeEach(() => {
            api = new Restful();
        });
        afterEach(() => {
            api.stop();
        });

        it('access undefined method', (done) => {
            class Books extends Resource {
                get(render, { id, page }) {
                    render({
                        id: id,
                        page: page
                    });
                }
            }
            api.addSource(Books, '/books/<id>/<page>');
            api.start({ port: 5051 });
            let req = request({
                port: 5051,
                path: '/books/1/25',
                method: 'post'
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk)
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 403,
                        error: {
                            message: 'This path: "/books/1/25", method: "POST" is undefined.'
                        }
                    });
                    done();
                })
            })
            req.end();
        });

        it('access undefined path', (done) => {
            class Books extends Resource {
                get(render, { id, page }) {
                    render({
                        id: id,
                        page: page
                    });
                }
            }
            api.addSource(Books, '/books/<id>/<page>');
            api.start({ port: 5051 });

            let req = get({
                port: 5051,
                path: '/book',
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk)
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 404,
                        error: {
                            message: 'This path: "/book" does not have a resource.'
                        }
                    });
                    done();
                })
            });

            req.end();
        });

    });

    describe('bind server', () => {
        let server: Server;
        let api;

        class Test extends Resource {
            get(render) {
                render('restful request');
            }
        }

        before(() => {
            server = <Server>createServer();
            api = new Restful();
            api.addSource(Test, '/api');
            api.bindServer(server);

            server.listen(5052);
        });

        after(() => {
            server.close();
        });

        it('can correct response', (done) => {
            get({
                port: 5052,
                path: '/api'
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                }).on('end', () => {
                    should(JSON.parse(data.toString())).be.eql({
                        code: 200,
                        result: 'restful request'
                    })
                    done();
                })
            })
        })
    });
});
