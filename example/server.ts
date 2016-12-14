import { addParser, Parser, Restful } from '../lib/index';

const Api = new Restful();

interface todoItem {
    id: number,
    title: string;
    completed: boolean;
    createDate: number;
    updateData?: number;
}

let postParser = new Parser();
postParser.addParam('title', {
    required: true,
    type: 'string'
})

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

    @addParser(postParser)
    post(params) {
        let todoItem: todoItem = {
            id: this.todoId++,
            title: params.title,
            completed: false,
            createDate: Date.now()
        }
        this.todoList.push(todoItem);

        return 'success';
    }
}


Api.addSource('/todo', TodoListResource);
Api.start()