import { ReqParams, Restful, Resource } from '../lib';
import { get, createServer, request } from 'http';
import { readFileSync } from 'fs';

const api = new Restful();
const TODOS = [{
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
    get(render, { todoId }) {
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

    delete(render, { todoId }) {
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

    put(render, { todoId }) {
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
    get(render) {
        render(TODOS);
    }

    @Resource.addParser(postParams)
    post(render, { title }) {
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

const server = createServer();
server.on('request', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

    if (req.method.toLowerCase() === 'options') {
        res.end();
    }
});

api.bindServer(server, { debug: true });
server.listen(5050);
