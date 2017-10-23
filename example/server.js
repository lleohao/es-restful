"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const api = new lib_1.Restful();
const TODOS = [{
        id: 0,
        title: 'todo1',
        completed: false
    }];
let COUNT_ID = 0;
const indexOf = (todoId) => {
    let index, len = TODOS.length;
    for (index = 0; index < len; index++) {
        if (TODOS[index].id === todoId) {
            break;
        }
    }
    if (index === len) {
        return -1;
    }
    else {
        return index;
    }
};
class Todo extends lib_1.Resource {
    get(render, { todoId }) {
        todoId = parseInt(todoId);
        let item = TODOS.filter((item) => {
            return item.id === todoId;
        });
        if (item.length === 0) {
            render(`The item for the id:${todoId} does not exist`, 404);
        }
        else {
            render(item[0]);
        }
    }
    delete(render, { todoId }) {
        todoId = parseInt(todoId);
        let index = indexOf(todoId);
        if (index === -1) {
            render(`The item for the id:${todoId} does not exist`, 404);
        }
        else {
            setTimeout(() => {
                TODOS.splice(index, 1);
                render('success');
            }, 10);
        }
    }
    put(render, { todoId }) {
        todoId = parseInt(todoId);
        let index = indexOf(todoId);
        if (index === -1) {
            render(`The item for the id:${todoId} does not exist`, 404);
        }
        else {
            TODOS[index].completed = !TODOS[index].completed;
            render('success');
        }
    }
}
const postParams = new lib_1.ReqParams();
postParams.add('title', {
    required: true,
    type: 'string'
});
class TodoList extends lib_1.Resource {
    get(render) {
        render(TODOS);
    }
    post(render, { title }) {
        const item = {
            id: ++COUNT_ID,
            title: title,
            completed: false
        };
        TODOS.push(item);
        render(item);
    }
}
__decorate([
    lib_1.Resource.addParser(postParams),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TodoList.prototype, "post", null);
api.addSource(TodoList, '/todos');
api.addSource(Todo, '/todos/<todoId>');
api.start();
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
