/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/should/index.d.ts" />
import { get, request } from 'http';
import * as should from 'should';
import { Restful, addParser, Parser } from '../lib/index';


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


        class Todo {
            get({todoId}) {
                todoId = parseInt(todoId);
                let item = TODOS.filter((item) => {
                    return item.id === todoId;
                })

                if (item.length === 0) {
                    return `The item for the id:${todoId} does not exist`
                } else {
                    return item[0];
                }
            }

            delete({todoId}) {
                todoId = parseInt(todoId);
                let index = indexOf(todoId);

                if (index === -1) {
                    return `The item for the id:${todoId} does not exist`
                } else {
                    TODOS.splice(index, 1);
                    return 'success';
                }
            }

            put({todoId}) {
                todoId = parseInt(todoId);
                let index = indexOf(todoId);

                if (index === -1) {
                    return `The item for the id:${todoId} does not exist`
                } else {
                    TODOS[index].completed = !TODOS[index].completed;
                    return 'success';
                }
            }
        }

        class TodoList {
            get() {
                return TODOS;
            }

            @addParser(parser)
            post({title}) {
                let item = {
                    id: ++COUNT_ID,
                    title: title,
                    completed: false

                }
                TODOS.push(item);
                return item;
            }
        }

        api.addSource(TodoList, '/todos')
        api.addSource(Todo, '/todos/<todoId>')
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