import { get, request } from 'http';
import { Restful, ReqParams, Resource } from '../lib';
import should = require('should');

interface TodoItem {
    id: number,
    title: string;
    completed: boolean;
}

describe('Example tets', () => {
    const api = new Restful();

    before(() => {
        const TODOS: TodoItem[] = [{
            id: 0,
            title: 'todo1',
            completed: false
        }];
        let COUNT_ID = 0;

        const indexOf = (todoId: number) => {
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
        };

        class Todo extends Resource {
            get({ todoId }, render) {
                todoId = parseInt(todoId);
                let item = TODOS.filter((item) => {
                    return item.id === todoId;
                })

                if (item.length === 0) {
                    render(`The item for the id:${todoId} does not exist`, 404);
                } else {
                    render(item[0]);
                }
            }

            delete({ todoId }, render) {
                todoId = parseInt(todoId);
                let index = indexOf(todoId);

                if (index === -1) {

                    render(`The item for the id:${todoId} does not exist`, 404);
                } else {
                    setTimeout(() => {
                        TODOS.splice(index, 1);
                        render('success');
                    }, 10)
                }
            }

            put({ todoId }, render) {
                todoId = parseInt(todoId);
                let index = indexOf(todoId);

                if (index === -1) {

                    render(`The item for the id:${todoId} does not exist`, 404)
                } else {
                    TODOS[index].completed = !TODOS[index].completed;
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
            get({ }, render) {
                render(TODOS);
            }

            @Resource.addParser(postParams)
            post({ }, { title }, render) {
                const item = {
                    id: ++COUNT_ID,
                    title: title,
                    completed: false

                }
                TODOS.push(item);
                render(item);
            }
        }

        api.addSource(TodoList, '/todos')
        api.addSource(Todo, '/todos/<todoId>')
        api.start({ port: 5051 });
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
                        code: 200,
                        result: [{
                            'id': 0,
                            'title': 'todo1',
                            'completed': false
                        }]
                    });
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
                        code: 200,
                        result: {
                            'id': 1,
                            'title': 'add todo',
                            'completed': false
                        }
                    });
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
                        code: 200,
                        result: {
                            'id': 1,
                            'title': 'add todo',
                            'completed': false
                        }
                    });
                    done();
                })
            })
        })

        it('修改 指定id状态', (done) => {
            let req = request(Object.assign({
                path: '/todos/1',
                method: 'put',
                header: { 'Content-Type': 'Application/json' }
            }, reqOpt), (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 200,
                        result: 'success'
                    })
                    done();
                })
            });

            req.end();
        })

        it('删除 指定id', (done) => {
            let req = request(Object.assign({
                path: '/todos/1',
                method: 'delete',
                header: { 'Content-Type': 'Application/json' }
            }, reqOpt), (res) => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                })
                res.on('end', () => {
                    data = JSON.parse(data.toString());
                    should(data).be.eql({
                        code: 200,
                        result: 'success'
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
                        code: 200,
                        result: [{
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
