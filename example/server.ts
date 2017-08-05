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

const q1 = JSON.parse(readFileSync('./q1.json').toString())['data'];
const q2 = JSON.parse(readFileSync('./q2.json').toString())['data'];

const questionParams = new ReqParams();
questionParams.add('userId');
questionParams.add('nums');
questionParams.add('questionnaireId');
questionParams.add('answers');

class Question extends Resource {
    get(render, { type }) {
        if (type === '01') {
            render(q1);
        } else {
            render(q2);
        }
    }

    @Resource.addParser(questionParams)
    post(render, postData) {
        const req = request({
            hostname: '118.31.44.95',
            port: 8080,
            path: '/dtea/questionnaire/answers',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            const data = [];

            res.on('data', (chunk) => {
                data.push(chunk);
            }).on('end', () => {
                console.log(data.toString());

                render(JSON.parse(data.toString()));
            });
        });

        req.write(JSON.stringify(postData));
        req.end();
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
api.addSource(Question, '/question');
api.addSource(Question, '/question/<type>');

const server = createServer();
server.on('request', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

    if (req.method.toLowerCase() === 'options') {
        res.end();
    }
});

api.bindServer(server);
server.listen(5050);
