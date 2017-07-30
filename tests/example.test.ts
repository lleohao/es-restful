import { get, request } from 'http';
import * as should from 'should';
import { Restful, Parser, Resource } from '../src/index';

interface TodoItem {
    id: number,
    title: string;
    completed: boolean;
}

describe('Example tets', () => {
    const api = new Restful(5051);

    before(() => {
        let TODOS: TodoItem[] = [{
            id: 0,
            title: 'todo1',
            completed: false
        }];
        let COUNT_ID = 0;

        let parser = new Parser();
        parser.addParam('title', {
            required: true,
            type: 'string'
        })

        let indexOf = function (todoId: number) {
            let index, len = TODOS.length;
            for (index = 0; index < len; index++) {
                if (TODOS[index].id === todoId) {
                    break;
                }
            }

            if (index === len) {
                return -1;
            } else {
                return index;
            }
        }


        class Todo extends Resource {
            get({ todoId }) {
                todoId = parseInt(todoId);
                let item = TODOS.filter((item) => {
                    return item.id === todoId;
                })

                if (item.length === 0) {
                    return {
                        data: `The item for the id:${todoId} does not exist`,
                        code: 404
                    }
                } else {
                    return {
                        data: item[0]
                    };
                }
            }

            @Resource.async()
            delete({ todoId }, _return) {
                todoId = parseInt(todoId);
                let index = indexOf(todoId);

                if (index === -1) {
                    _return({
                        data: `The item for the id:${todoId} does not exist`,
                        code: 404
                    });
                } else {
                    setTimeout(() => {
                        TODOS.splice(index, 1);
                        _return({
                            data: 'success'
                        });
                    }, 10)
                }
            }

            put({ todoId }) {
                todoId = parseInt(todoId);
                let index = indexOf(todoId);

                if (index === -1) {
                    return {
                        data: `The item for the id:${todoId} does not exist`,
                        code: 404
                    }
                } else {
                    TODOS[index].completed = !TODOS[index].completed;
                    return {
                        data: 'success'
                    };
                }
            }
        }

        class TodoList extends Resource {
            get() {
                return {
                    data: TODOS
                };
            }

            @Resource.async()
            @Resource.addParser(parser)
            post({ title }, _return) {
                setTimeout(() => {
                    let item = {
                        id: ++COUNT_ID,
                        title: title,
                        completed: false

                    }
                    TODOS.push(item);
                    _return({
                        data: item
                    });
                }, 10)
            }
        }

        api.addSource(new TodoList(), '/todos')
        api.addSource(new Todo(), '/todos/<todoId>')
        api.start();
    })

    after(() => {
        api.stop();
    })

    describe('TodoList test', () => {
        let reqOpt = {
            hostname: 'localhost',
            port: 5051,
            path: '/todos',
        };

        it('返回全部列表信息', (done) => {
            get(reqOpt, (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        'code': 200,
                        'message': 'success',
                        'data': [{
                            'id': 0,
                            'title': 'todo1',
                            'completed': false
                        }]
                    })
                    done();
                })
            })
        })

        it('创建todoItem测试', (done) => {
            let data = JSON.stringify({ title: 'add todo' });
            let req = request(Object.assign({ method: 'post' }, reqOpt), (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        'code': 200,
                        'message': 'success',
                        'data': {
                            'id': 1,
                            'title': 'add todo',
                            'completed': false
                        }
                    })
                    done();
                })
            });

            req.setHeader('Content-type', 'application/json')
            req.write(data);
            req.end();
        })
    })

    describe('Todo test', () => {
        let reqOpt = {
            hostname: 'localhost',
            port: 5051,
            headers: {
                'Content-type': 'application/json'
            }
        };

        it('获取 指定id信息', (done) => {
            get(Object.assign({
                path: '/todos/1'
            }, reqOpt), (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        'code': 200,
                        'message': 'success',
                        'data': {
                            'id': 1,
                            'title': 'add todo',
                            'completed': false
                        }
                    })
                    done();
                })
            })
        })

        it('修改 指定id状态', (done) => {
            let req = request(Object.assign({
                path: '/todos/1',
                method: 'put'
            }, reqOpt), (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        'code': 200,
                        'message': 'success',
                        'data': 'success'
                    })
                    done();
                })
            });

            req.end();
        })

        it('删除 指定id', (done) => {
            let req = request(Object.assign({
                path: '/todos/1',
                method: 'delete'
            }, reqOpt), (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        'code': 200,
                        'message': 'success',
                        'data': 'success'
                    })
                    done();
                })
            });

            req.end();
        })

        it('正确返回操作后的列表', (done) => {
            get(Object.assign({
                path: '/todos'
            }, reqOpt), (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        'code': 200,
                        'message': 'success',
                        'data': [{
                            'id': 0,
                            'title': 'todo1',
                            'completed': false
                        }]
                    })
                    done();
                })
            })
        })
    })
})
