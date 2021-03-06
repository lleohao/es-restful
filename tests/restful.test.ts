import { get, request, createServer, Server } from 'http';
import { Restful, ReqParams, Resource } from '../src';

describe('Restful', () => {
  describe('API', () => {
    const api = new Restful();

    it('can throw error with not add resource', () => {
      const api = new Restful();
      expect(() => {
        api.start({ port: 5050 });
      }).toThrow(/There can not be any proxied resources\./);
    });

    class Todos extends Resource {
      get(render) {
        render('ok');
      }
    }

    const parser = new ReqParams();
    parser.add('title');

    class Demo extends Resource {
      @Resource.addParser(parser)
      post(render, { title }) {
        render(title);
      }
    }

    api.addSource(Demo, '/demo');
    api.addSource(Todos, '/todos');

    api.start({ port: 5050 });

    it('can throws error with add same path', () => {
      expect(() => {
        api.addSource(Todos, '/todos');
      }).toThrow();
    });

    it('can start server', done => {
      get('http://localhost:5050/todos', res => {
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('can add reqParams', done => {
      let req = request(
        {
          hostname: 'localhost',
          port: 5050,
          method: 'post',
          path: '/demo',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        res => {
          expect(res.statusCode).toEqual(200);
          done();
        }
      );
      req.write(JSON.stringify({ title: 'demo' }));
      req.end();
    });

    afterAll(() => {
      api.stop();
    });

    describe('addSourceMap', () => {
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

      const api = new Restful();

      api.addSourceMap({
        '/test1': Test1,
        '/test2': Test2
      });
      api.start({ port: 5052 });

      it('can correct response path1', done => {
        get(
          {
            port: 5052,
            path: '/test1'
          },
          res => {
            expect(res.statusCode).toEqual(200);
            done();
          }
        );
      });

      it('can correct response path2', done => {
        get(
          {
            port: 5052,
            path: '/test2'
          },
          res => {
            expect(res.statusCode).toEqual(200);
            done();
          }
        );
      });

      afterAll(() => {
        api.stop();
      });
    });
  });

  describe('access undefined resource', () => {
    const api = new Restful();

    class Books extends Resource {
      get(render, { id, page }) {
        render({
          id: id,
          page: page
        });
      }
    }

    api.addSource(Books, '/books/<id>/<page>');
    api.start({ port: 5054 });

    it('access undefined method', done => {
      let req = request(
        {
          port: 5054,
          path: '/books/1/25',
          method: 'post'
        },
        res => {
          expect(res.statusCode).toEqual(403);
          done();
        }
      );
      req.end();
    });

    it('access undefined path', done => {
      let req = get(
        {
          port: 5054,
          path: '/book'
        },
        res => {
          expect(res.statusCode).toEqual(404);
          done();
        }
      );
      req.end();
    });

    afterAll(() => {
      api.stop();
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

    server = <Server>createServer();
    api = new Restful();
    api.addSource(Test, '/api');
    api.bindServer(server);

    server.listen(5055);

    it('can correct response', done => {
      get(
        {
          port: 5055,
          path: '/api'
        },
        res => {
          let data = [];
          res
            .on('data', chunk => {
              data.push(chunk);
            })
            .on('end', () => {
              expect(JSON.parse(data.toString())).toEqual('restful request');
              server.close();
              done();
            });
        }
      );
    });
  });
});
