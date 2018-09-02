import { get, request } from 'http';
import { Restful, ReqParams, Resource } from '../src';

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

describe('Example test', () => {
  const api = new Restful();

  beforeAll(() => {
    const TODO: TodoItem[] = [
      {
        id: 0,
        title: 'todo1',
        completed: false
      }
    ];
    let COUNT_ID = 0;

    const indexOf = (todoId: number) => {
      let index,
        len = TODO.length;
      for (index = 0; index < len; index++) {
        if (TODO[index].id === todoId) {
          break;
        }
      }

      if (index === len) {
        return -1;
      } else {
        return index;
      }
    };

    class Todo extends Resource {
      get(render, { todoId }) {
        todoId = parseInt(todoId);
        let item = TODO.filter(item => {
          return item.id === todoId;
        });

        if (item.length === 0) {
          render(`The item for the id:${todoId} does not exist`, 404);
        } else {
          render(item[0]);
        }
      }

      delete(render, { todoId }) {
        todoId = parseInt(todoId);
        let index = indexOf(todoId);

        if (index === -1) {
          render(`The item for the id:${todoId} does not exist`, 404);
        } else {
          setTimeout(() => {
            TODO.splice(index, 1);
            render('success');
          }, 10);
        }
      }

      put(render, { todoId }) {
        todoId = parseInt(todoId);
        let index = indexOf(todoId);

        if (index === -1) {
          render(`The item for the id:${todoId} does not exist`, 404);
        } else {
          TODO[index].completed = !TODO[index].completed;
          render('success');
        }
      }
    }

    const postParams = new ReqParams();
    postParams.add('title', {
      required: true,
      type: 'string'
    });

    class TodoList extends Resource {
      get(render) {
        render(TODO);
      }

      @Resource.addParser(postParams)
      post(render, { title }) {
        const item = {
          id: ++COUNT_ID,
          title: title,
          completed: false
        };
        TODO.push(item);
        render(item);
      }
    }

    api.addSource(TodoList, '/todos');
    api.addSource(Todo, '/todos/<todoId>');
    api.start({ port: 5051 });
  });

  afterAll(() => {
    api.stop();
  });

  describe('TodoList test', () => {
    let reqOpt = {
      hostname: 'localhost',
      port: 5051,
      path: '/todos'
    };

    it('返回全部列表信息', done => {
      get(reqOpt, res => {
        let data = [];
        res.on('data', chunk => {
          data.push(chunk);
        });
        res.on('end', () => {
          data = JSON.parse(data.toString());
          expect(data).toEqual([
            {
              id: 0,
              title: 'todo1',
              completed: false
            }
          ]);
          done();
        });
      });
    });

    it('创建todoItem测试', done => {
      let data = JSON.stringify({ title: 'add todo' });
      let req = request(Object.assign({ method: 'post' }, reqOpt), res => {
        let data = [];
        res.on('data', chunk => {
          data.push(chunk);
        });
        res.on('end', () => {
          data = JSON.parse(data.toString());
          expect(data).toEqual({
            id: 1,
            title: 'add todo',
            completed: false
          });
          done();
        });
      });

      req.setHeader('Content-type', 'application/json');
      req.write(data);
      req.end();
    });
  });

  describe('Todo test', () => {
    let reqOpt = {
      hostname: 'localhost',
      port: 5051,
      headers: {
        'Content-type': 'application/json'
      }
    };

    it('获取 指定id信息', done => {
      get(
        Object.assign(
          {
            path: '/todos/1'
          },
          reqOpt
        ),
        res => {
          let data = [];
          res.on('data', chunk => {
            data.push(chunk);
          });
          res.on('end', () => {
            data = JSON.parse(data.toString());
            expect(data).toEqual({
              id: 1,
              title: 'add todo',
              completed: false
            });
            done();
          });
        }
      );
    });

    it('修改 指定id状态', done => {
      let req = request(
        Object.assign(
          {
            path: '/todos/1',
            method: 'put',
            header: { 'Content-Type': 'Application/json' }
          },
          reqOpt
        ),
        res => {
          let data = [];
          res.on('data', chunk => {
            data.push(chunk);
          });
          res.on('end', () => {
            data = JSON.parse(data.toString());
            expect(data).toEqual('success');
            done();
          });
        }
      );

      req.write(JSON.stringify({}));
      req.end();
    });

    it('删除 指定id', done => {
      let req = request(
        Object.assign(
          {
            path: '/todos/1',
            method: 'delete',
            header: { 'Content-Type': 'Application/json' }
          },
          reqOpt
        ),
        res => {
          let data = [];
          res.on('data', chunk => {
            data.push(chunk);
          });
          res.on('end', () => {
            data = JSON.parse(data.toString());
            expect(data).toEqual('success');
            done();
          });
        }
      );

      req.end();
    });

    it('正确返回操作后的列表', done => {
      get(
        Object.assign(
          {
            path: '/todos'
          },
          reqOpt
        ),
        res => {
          let data = [];
          res.on('data', chunk => {
            data.push(chunk);
          });
          res.on('end', () => {
            data = JSON.parse(data.toString());
            expect(data).toEqual([
              {
                id: 0,
                title: 'todo1',
                completed: false
              }
            ]);
            done();
          });
        }
      );
    });
  });
});
