/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/should/index.d.ts" />
import { get, request } from 'http';
import * as should from 'should';
import { Restful, addParser, Parser } from '../lib/index';


describe('Restful tets', () => {
    describe('API test', () => {
        let api: Restful;
        beforeEach(() => {
            api = new Restful(5051);
        })

        it('返回restful实例', () => {
            should(api).instanceOf(Restful);
        })

        it('不添加 resource 抛出 RestfulError', () => {
            should.throws(() => {
                api.start()
            });
        })

        it('错误添加resouce', () => {
            should.throws(() => {
                api.addSource(1, '/books');
                api.start();
            })
        })

        it('添加重复路径 resource 抛出 RestfulError', () => {
            class Todos {
                get() {
                    return 'ok';
                }
            }
            api.addSource(Todos, '/todos');
            should.throws(() => {
                api.addSource(Todos, '/todos');
            })
        })

        it('正确开启服务器', (done) => {
            class Todos {
                get() {
                    return 'ok';
                }
            }
            api.addSource(Todos, '/todos');
            api.start();

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
                        message: 'success',
                        data: 'ok'
                    });
                    done();
                    api.stop();
                })
            })
        })

        it('正确添加 parser 实例', (done) => {
            let parser = new Parser();
            parser.addParam('title');
            class Demo {
                @addParser(parser)
                post({title}) {
                    return title
                }
            }
            api.addSource(Demo, '/demo');
            api.start();
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
                        message: 'success',
                        data: 'demo'
                    });
                    api.stop();
                    done();
                })
            });
            req.write(JSON.stringify({ title: 'demo' }));
            req.end();
        });

        it('正确解析路由参数', (done) => {
            class Books {
                get({id, page}) {
                    return {
                        id: id,
                        page: page
                    }
                }
            }
            api.addSource(Books, '/books/<id>/<page>');
            api.start();
            get({
                hostname: 'localhost',
                port: 5051,
                path: '/books/1/25'
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk)
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 200,
                        message: 'success',
                        data: {
                            id: '1',
                            page: '25'
                        }
                    });
                    api.stop();
                    done();
                })
            })
        })

        it('错误路径测试', (done) => {
            class Books {
                get({id, page}) {
                    return {
                        id: id,
                        page: page
                    }
                }
            }
            api.addSource(Books, '/books/<id>/<page>');
            api.start();
            get({
                hostname: 'localhost',
                port: 5051,
                path: '/book'
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk)
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 404
                    });
                    api.stop();
                    done();
                })
            })
        })

        it('访问未定义方法测试', (done) => {
            class Books {
                get({id, page}) {
                    return {
                        id: id,
                        page: page
                    }
                }
            }
            api.addSource(Books, '/books/<id>/<page>');
            api.start();
            let req = request({
                hostname: 'localhost',
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
                        code: 400,
                        error: {
                            message: 'post method is undefined.'
                        }
                    });
                    api.stop();
                    done();
                })
            })
            req.end();
        })

        it('错误请求方式测试', (done) => {
            let parser = new Parser();
            parser.addParam('id');
            parser.addParam('page');
            class Books {
                @addParser(parser)
                post({id, page}) {
                    return {
                        id: id,
                        page: page
                    }
                }
            }
            api.addSource(Books, '/books');
            api.start();
            let req = request({
                hostname: 'localhost',
                port: 5051,
                path: '/books',
                method: 'post',
                headers: {
                    'Content-Type': 'text/xml'
                }
            }, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk)
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 403,
                        error: { error: { type: 1, info: 'This request method is not supported' } }
                    })
                    api.stop();
                    done();
                })
            })
            req.write(JSON.stringify({ id: 1, page: 22 }))
            req.end();
        })
    })
}) 