import { addParser, Parser, Restful } from '../lib/index';

const api = new Restful();

interface TodoItem {
    id: number,
    title: string;
    completed: boolean;
    createDate: number;
    updateData?: number;
}

let TODOS: TodoItem[] = [{
    id: 0,
    title: 'init todo',
    completed: false,
    createDate: 1482144872002,
}];


class Todo {
    get({todoId}) {
       return todoId;
    }

    delete(args) {
        return args;
    }

    put(args, params) {
        return [args, params];
    }
}

class TodoList {
    get() {
        return TODOS;
    }

    post(params) {
        return params;
    }
}

api.addSource(TodoList, '/todos')
api.addSource(Todo, '/todos/<todoId>')

api.start();