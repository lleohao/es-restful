import { createServer, IncomingMessage, Server, ServerResponse } from 'http';

import { ResponseHandle, ResponseOption } from './helper';
import params from './params';
import { requestParse } from './requestParse';
import { Resource } from './resource';
import { Router } from './router';
import { createError, RestfulErrorType } from './utils';

export interface RestfulConstructorOption extends ResponseOption {}

export interface ResultfulRunOption {
  debug?: boolean;
  port?: number;
  hostname?: string;
}

export interface RestfulOption extends RestfulConstructorOption, ResultfulRunOption {}

const defaultOptions = {
  port: 5050,
  hostname: 'localhost',
  debug: false
};

export class Restful {
  private options: RestfulOption;
  private server: Server;
  private router: Router;
  private readonly responseHandle: ResponseHandle;

  constructor(options: RestfulConstructorOption = {}) {
    this.responseHandle = new ResponseHandle(options);
    this.options = Object.assign({}, defaultOptions);
    this.router = new Router();
  }

  private requestHandle(inside = true, next?: () => void) {
    const res = this.responseHandle;
    const generateEnd = response => {
      return (data: any, code = 200, headers = {}) => {
        res.finish(response, data, code, headers);
      };
    };

    return async (request: IncomingMessage, response: ServerResponse) => {
      const { urlPara, resource } = this.router.getResource(request.url);

      if (this.options.debug) {
        console.log(`${new Date()} ${request.method} ${request.url}`);
      }

      if (request.method === 'OPTIONS') {
        res.endOptions(response);
        return;
      }

      if (resource === null) {
        if (inside) {
          res.finish(response, `This path: "${request.url}" does not have a resource.`, 404);
        } else if (next) {
          next();
        }
        return;
      }

      const methodFunction = resource.getMethodProcess(request.method);

      if (methodFunction) {
        try {
          const requestData = await requestParse(request);
          let result;
          if (!requestData.rawData && methodFunction['params']) {
            result = params.validation(methodFunction['params'].getParams(), requestData.data);
          } else {
            result = requestData.rawData;
          }

          const callArgument: any[] = [generateEnd(response), result];

          if (Object.keys(urlPara).length > 0) {
            callArgument.splice(1, 0, urlPara);
          }

          methodFunction.apply(null, callArgument);
        } catch (err) {
          switch (err.type) {
            case RestfulErrorType.PARAMS:
              res.finish(
                response,
                {
                  code: err.code,
                  message: err.message
                },
                400
              );
              break;
            case RestfulErrorType.REQUEST:
              res.finish(response, `Request parse throws a error: ${err.message}.`, err.statusCode);
              break;
          }
        }
      } else {
        res.finish(response, `This path: "${request.url}", method: "${request.method}" is undefined.`, 403);
      }
    };
  }

  public add<T extends Resource>(R: { new (): T }, path: string) {
    this.addSource(R, path);
  }

  public addSource<T extends Resource>(R: { new (): T }, path: string) {
    this.router.addRoute(path, R);
  }

  public addSourceMap<T extends Resource>(resourceMap: { [path: string]: { new (): T } }) {
    for (const path in resourceMap) {
      this.addSource(resourceMap[path], path);
    }
  }

  public start(options: ResultfulRunOption = {}) {
    this.options = Object.assign({}, this.options, options);

    if (this.router.isEmpty()) {
      throw createError(
        {
          message: 'There can not be any proxied resources.'
        },
        this.start
      );
    }
    this.server = createServer();
    this.server.on('request', this.requestHandle(true));

    const { port, hostname } = this.options;
    this.server.listen(port, hostname);
    if (options.debug) {
      console.log(`The server is running ${hostname}:${port}`);
    }
  }

  public bindServer(server: Server, options: ResultfulRunOption = {}) {
    this.options = Object.assign({}, this.options, options);

    server.on('request', this.requestHandle(false));
  }

  public stop() {
    if (this.server !== undefined) {
      this.server.close();
    }
  }

  /**
   * For express middleware
   *
   * @returns
   * @example
   * const app = express();
   * const api = new Restful();
   * app.use(api.ues());
   */
  public use() {
    return (req, res, next: () => void) => {
      this.requestHandle(false, next)(req, res);
    };
  }
}
