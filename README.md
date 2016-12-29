# es-restful
> easy & simple nodejs restful server framework

用于快速构建 restful 服务器的框架, 基于typescript开发



## 特性

* 基于typescript开发
* API简单, 可以快速上手
* 源码也简单, 可以随意扩展





## 快速上手

1. 安装 `npm install es-restful`

2. 编写服务器

   ```javascript
   import { Restful } from 'es-restful';

   const api = new Restful();
   // 声明一个resource类
   class SayHello {
       get({name}) {
           return `hello ${name}.`;
       }
   }

   api.addSource(SayHello, '/hello/<name>');
   api.start();
   ```

3. 测试结果

   ```
   curl localhost:5050/hello/lleohao ==> hello lleohao
   ```


## 更完整的例子, 构建一个 todos 服务器

> 代码在 example 文件夹下, 运行前需要先编译

```javascript
import { addParser, Parser, Restful } from '../lib/index';

const api = new Restful();

interface TodoItem {
    id: number;
    title: string;
    completed: boolean;
}

let TODOS: TodoItem[] = [{
    id: 0,
    title: 'init todo',
    completed: false
}];
let COUNT_ID = 0;

let parser = new Parser();
parser.addParam('title', {
    required: true,
    type: 'string'
});

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
};


class Todo {
    get({todoId}) {
        todoId = parseInt(todoId);
        let item = TODOS.filter((item) => {
            return item.id === todoId;
        });

        if (item.length === 0) {
            return `The item for the id:${todoId} does not exist`;
        } else {
            return item[0];
        }
    }

    delete({todoId}) {
        todoId = parseInt(todoId);
        let index = indexOf(todoId);

        if (index === -1) {
            return `The item for the id:${todoId} does not exist`;
        } else {
            TODOS.splice(index, 1);
            return 'success';
        }
    }

    put({todoId}) {
        todoId = parseInt(todoId);
        let index = indexOf(todoId);

        if (index === -1) {
            return `The item for the id:${todoId} does not exist`;
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

        };
        TODOS.push(item);
        return item;
    }
}

api.addSource(TodoList, '/todos');
api.addSource(Todo, '/todos/<todoId>');

api.start({ debug: true });
```

测试结果

```curl
// 获取所有列表
curl localhost:5050/todos 
{"code":200,"message":"success","data":[{"id":0,"title":"init todo","completed":false}]}

// 获取指定id=0的todo详情
curl localhost:5050/todos/0
{"code":200,"message":"success","data":{"id":0,"title":"init todo","completed":false}}

// 新建 todo
curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H "Postman-Token: 3934a3b3-58b2-223 4-30be-6b213c722f23" -d '{ "title": "hh" }' http://localhost:5050/todos
{"code":200,"message":"success","data":{"id":1,"title":"hh","completed":false}}

// 删除id=0的todo
curl -X DELETE localhost:5050/todos/0
{"code":200,"message":"success","data":"success"}

// 更新id=1的todo状态
curl -X PUT localhost:5050/todos/1
{"code":200,"message":"success","data":"success"}
```



## 后续开发

- [ ] 优化请求处理代码
- [ ] 开发中间件功能, 方便接入已有的项目中