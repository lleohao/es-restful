import { ReqParams, Resource, Restful } from '../lib';

const api = new Restful();
const TODOS = [{
    id: 0,
    title: 'todo-0',
    completed: false
}];
let COUNT_ID = 0;

const anyParams = new ReqParams();
anyParams.add('*');
class Todo extends Resource {
    get(end, { todoId }) {
        todoId = parseInt(todoId);

        let item = TODOS.find(todo => {
            return todo.id === todoId;
        })

        if (item) {
            end(item);
        } else {
            end(`The item for the id:${todoId} does not exist`, 404);
        }
    }

    delete(end, { todoId }) {
        todoId = parseInt(todoId);
        let index = TODOS.findIndex(todo => {
            return todo.id === todoId;
        });

        if (index !== undefined) {
            TODOS.splice(index, 1);
            end({ data: 'success' });
        } else {
            end(`The item for the id:${todoId} does not exist`, 404);
        }
    }

    @Resource.addParser(anyParams)
    put(end, { todoId }, { completed }) {
        todoId = parseInt(todoId);
        let todo = TODOS.find(todo => {
            return todo.id === todoId;
        });

        if (todo) {
            todo.completed = completed;
            end({ data: 'success' });
        } else {
            end(`The item for the id:${todoId} does not exist`, 404)
        }
    }
}

const postParams = new ReqParams();
postParams.add('title', {
    required: true,
    type: 'string'
});
class TodoList extends Resource {
    get(end) {
        end(TODOS);
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

api.start({ debug: true });

// 
// const server = createServer();
// server.on('request', (req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
//     res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

//     if (req.method.toLowerCase() === 'options') {
//         res.end();
//     }
// });

// api.bindServer(server, { debug: true });
// server.listen(5050);
