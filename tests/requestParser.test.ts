import { createServer, request, Server, get } from 'http';
import { requestParse } from '../lib/requestParse';
import { stringify } from 'querystring';
import should = require('should');

should['config'].checkProtoEql = false;

const urlencoded = 1;
const json = 2;

describe('RequestParse', () => {
    const cases = [
        {
            path: '/get',
            e: {}
        },
        {
            path: '/get?name',
            e: {
                name: ''
            },
        },
        {
            path: '/get?name=',
            e: {
                name: ''
            }
        },
        {
            path: '/get?name=lleohao',
            e: {
                name: 'lleohao'
            }
        },
        {
            path: '/get?name=lleohao&age=22',
            e: {
                name: 'lleohao',
                age: '22'
            }
        },
        {
            path: '/post/with/x-www-form-urlencoded',
            e: {
                name: 'lleohao'
            },
            type: urlencoded,
        },
        {
            path: '/post/with/json',
            e: {
                name: 'lleohao'
            },
            type: json,
        }
    ];

    cases.forEach(c => {
        it(c.path, () => {
            let server = createServer(async (req, res) => {
                should(requestParse(req)).be.fulfilledWith(c.e);

                res.end();
                server.close()
            });
            server.listen(5050);

            let reqData = c.e;
            let type = c['type'];
            let req = request({ host: '127.0.0.1', port: 5050, path: c.path, method: type !== undefined ? 'POST' : 'GET' });


            if (reqData !== undefined) {
                if (c['type'] === urlencoded) {
                    req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                    reqData = stringify(reqData);
                } else {
                    req.setHeader('Content-Type', 'application/json');
                    reqData = JSON.stringify(reqData);
                }

                req.write(reqData);
            }

            req.end();
        })
    });

    it('post unsupported content-type', () => {
        let server = createServer(async (req, res) => {
            should(requestParse(req)).be.rejectedWith('This request Content-Type: test-ct is not supported.')

            res.end();
            server.close()
        });
        server.listen(5050);

        let req = request({ host: '127.0.0.1', port: 5050, path: '/', method: 'POST' });
        let reqData = {
            name: 'lleohao'
        }
        req.setHeader('Content-Type', 'test-ct');
        req.write(JSON.stringify(reqData));

        req.end();
    })
});
