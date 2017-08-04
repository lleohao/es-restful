import { ReqParams, Restful, Resource } from '../lib';

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
api.start({ port: 5051 });
