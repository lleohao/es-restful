import { addParser, Parser, Restful } from '../lib/index';

const Api = new Restful();

interface todoItem {
    id: number,
    title: string;
    completed: boolean;
    createDate: number;
    updateData?: number;
}

class TodoListResource {
    private todoList: todoItem[];
    private todoId: number;

    constructor() {
        this.todoId = 0;
        this.todoList = [{
            id: this.todoId++,
            title: 'first todo',
            completed: false,
            createDate: Date.now()
        }];
    }

    get() {
        return this.todoList;
    }
}


Api.addSource('/todo', TodoListResource);
Api.start()