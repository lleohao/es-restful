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


        it('should return nullabled error', (done) => {
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

    describe('type(int) test', function () {
        let server;

        before(() => {
            server = http.createServer((req, res) => {
                let parser = new Parser();
                parser.addParam('age', {
                    type: 'int'
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


        it('should return type error', (done) => {
            http.get({
                port: 5052,
                path: '/?age=lleohao'
            }, (res) => {
                let data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    data.should.containEql({
                        error: [{
                            type: 3,
                            info: {
                                key: 'age',
                                type: 'number',
                                help: null
                            }
                        }]
                    })
                    done();
                })
            }).end();
        })

        it('should return type ok', (done) => {
            http.get({
                port: 5052,
                path: '/?age=21'
            }, (res) => {
                let data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    data.should.containEql({
                        data: {
                            age: 21
                        }
                    })
                    done();
                })
            }).end();
        })
    })

    describe('type(float) test', function () {
        let server;

        before(() => {
            server = http.createServer((req, res) => {
                let parser = new Parser();
                parser.addParam('weight', {
                    type: 'float'
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


        it('should return type error', (done) => {
            http.get({
                port: 5052,
                path: '/?weight=lleohao'
            }, (res) => {
                let data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    data.should.containEql({
                        error: [{
                            type: 3,
                            info: {
                                key: 'weight',
                                type: 'number',
                                help: null
                            }
                        }]
                    });
                    done();
                })
            }).end();
        })

        it('should return type ok', (done) => {
            http.get({
                port: 5052,
                path: '/?weight=42.5'
            }, (res) => {
                let data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                }).on('end', () => {
                    data = JSON.parse(data.toString());
                    data.should.containEql({
                        data: {
                            weight: 42.5
                        }
                    })
                    done();
                })
            }).end();
        })
    })

    describe('type(lambda) test', function () {
        let server;

        before(() => {
            server = http.createServer((req, res) => {
                let parser = new Parser();
                parser.addParam('join', {
                    type: (value) => {
                        return value.join('-')
                    },
                    help: 'haha'
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

        it('should return type error', (done) => {
            let data = JSON.stringify({
                join: 'lleohao'
            })

            let req = http.request({
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
                        error: [{
                            type: 3,
                            info: {
                                key: 'join',
                                type: 'function',
                                help: 'haha'
                            }
                        }]
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })

        it('should return type error', (done) => {
            let data = JSON.stringify({
                join: ['lleo', 'hao']
            })

            let req = http.request({
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
                        data: {
                            join: 'lleo-hao'
                        }
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })
    })

    describe('choices test', function () {
        let server;

        before(() => {
            server = http.createServer((req, res) => {
                let parser = new Parser();
                parser.addParam('sex', {
                    choices: ['man', 'woman']
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

        it('should return choices error', (done) => {
            let data = JSON.stringify({
                sex: 'lalalal'
            })

            let req = http.request({
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
                        error: [{
                            type: 4,
                            info: {
                                key: 'sex',
                                choices: [
                                    'man',
                                    'woman'
                                ]
                            }
                        }]
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })

        it('should return choices ok', (done) => {
            let data = JSON.stringify({
                sex: 'man'
            })

            let req = http.request({
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
                        data: {
                            sex: 'man'
                        }
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })
    })

    describe('caseSensitive defaultVal test', function () {
        let server;

        before(() => {
            server = http.createServer((req, res) => {
                let parser = new Parser();
                parser.addParam('sex', {
                    defaultVal: 'man',
                    caseSensitive: true
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

        it('should return data {data: {sex: "man" }} with no data', (done) => {
            let data = JSON.stringify({
                sex: ''
            })

            let req = http.request({
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
                        data: {
                            sex: 'man'
                        }
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })

        it('should return {data: { sex:"women" }} with sent sex="WOMEN"', (done) => {
            let data = JSON.stringify({
                sex: 'WOMEN'
            })

            let req = http.request({
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
                        data: {
                            sex: 'women'
                        }
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })
    })

    describe('trim dset test', function () {
        let server_1;
        let server_2;

        before(() => {
            server_1 = http.createServer((req, res) => {
                let parser = new Parser(true);
                parser.addParam('trim_test_false', {
                    trim: false,
                    dset: 'trim'
                })
                parser.addParam('trim_test_normal')

                parser.parse(req, res).on('end', (data) => {
                    res.writeHead(200, {
                        'Content-type': 'application/json'
                    });
                    res.end(JSON.stringify(data));
                })
            }).listen(5052);
            server_2 = http.createServer((req, res) => {
                let parser = new Parser();
                 parser.addParam('trim', {
                    trim: true
                })

                parser.parse(req, res).on('end', (data) => {
                    res.writeHead(200, {
                        'Content-type': 'application/json'
                    });
                    res.end(JSON.stringify(data));
                })
            }).listen(5053);
        })

        after(() => {
            server_1.close();
            server_2.close();
        })

        it('should return {data: {trim: " lleohao ", trim_test_normal: "lleohao"}}', (done) => {
            let data = JSON.stringify({
                trim_test_false: ' lleohao ',
                trim_test_normal: ' lleohao '
            })

            let req = http.request({
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
                        data: {
                            trim: ' lleohao ',
                            trim_test_normal: 'lleohao'
                        }
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })

        it('should return {data: {trim: "lleohao"}}', (done) => {
            let data = JSON.stringify({
                trim: '   lleohao     ',
            })

            let req = http.request({
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
                        data: {
                            trim: 'lleohao'
                        }
                    });
                    done();
                })
            });
            req.write(data);
            req.end();
        })
    })
});