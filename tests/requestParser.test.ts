import { createServer, request } from 'http';
import { requestParse } from '../lib/requestParse';
import should = require('should');

should['config'].checkProtoEql = false;

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
            data: {
              name: 'lleohao'
            },
            rawData: null
          }
        },
        {
          path: '/?age=22',
          data: {
            name: 'lleohao'
          },
          e: {
            rawData: null,
            data: {
              age: '22',
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
            data: {},
            rawData: '<author name="lleohao">'
          }
        },
        {
          path: '/?age=22',
          data: '<author name="lleohao">',
          e: {
            data: {
              age: '22'
            },
            rawData: '<author name="lleohao">'
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
            rawData: null,
            data: {
              name: 'lleohao'
            }
          }
        },
        {
          path: '/?age=22',
          data: 'name=lleohao',
          e: {
            rawData: null,
            data: {
              age: '22',
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
            data: {},
            rawData: 'datatatatatattata'
          }
        },
        {
          path: '/?age=22',
          data: 'datatatatatattata',
          e: {
            data: {
              age: '22'
            },
            rawData: 'datatatatatattata'
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
        data: {},
        rawData: null
      }
    },
    {
      method: 'GET',
      path: '/?name=lleohao',
      e: {
        data: {
          name: 'lleohao'
        },
        rawData: null
      }
    },
    {
      method: 'DELETE',
      path: '/',
      e: {
        rawData: null,
        data: {}
      }
    },
    {
      method: 'DELETE',
      path: '/?name=lleohao',
      e: {
        data: {
          name: 'lleohao'
        },
        rawData: null
      }
    }
  ];

  noBodyCases.forEach(({ method, path, e }, i) => {
    it(` method: ${method}, path: ${path}`, done => {
      const port = 7070 + i;
      let server = createServer(async (req, res) => {
        const data = await requestParse(req);
        res.end();

        should(data).be.deepEqual(e);
        done();
        server.close();
      });
      server.listen(port);

      request({ host: '127.0.0.1', port, path, method }).end();
    });
  });

  for (const testName in haveBodyCases) {
    const { herder, _cases } = haveBodyCases[testName];

    describe(testName, () => {
      _cases.forEach(({ path, e, data }) => {
        herder.forEach((h, i) => {
          const port = 6060 + i;
          it(`path: ${path}, header: ${h}`, done => {
            let server = createServer(async (req, res) => {
              const data = await requestParse(req);
              should(data).be.eql(e);

              done();
              res.end();
              server.close();
            });
            server.listen(port);

            let req = request({ host: '127.0.0.1', port, path: path, method: 'POST' });
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
