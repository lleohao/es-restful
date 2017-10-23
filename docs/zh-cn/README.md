# es-restful
> easy & simple nodejs restful server framework
>
> 用于快速构建 restful 服务器的框架, 基于Typescript开发



## 特性

* 以资源（resource）为核心的设计模式，简介、高效的开发restful服务器
* 支持动态路由, 根据不同的请求执行对应的处理逻辑
* 完善的参数处理，帮助开发者从参数的验证、转换中摆脱出来
* 可作为Express中间件使用
* 基于Typescript开发，编码时有完善的自动提示





## 快速入门
### 安装

1. 使用`npm`安装 `npm install es-restful --save`

2. 使用`yarn`安装 `yarn add es-restful`




### 一个最小的API服务器

```javascript
import { Resource, Restful } from 'es-restful';

const api = new Restful();
// 声明一个resource类
class SayHello extends Resource {
    get(end, { name }) {
        end({
            data: `hello ${name}`
        });
    }
}

api.addSource(SayHello, '/hello/<name>');

api.start({ debug: true });
```

将上述代码保存为`api.ts`并使用[ts-node](https://github.com/TypeStrong/ts-node)来执行这个文件。

需要注意的是这里我们开启了调试模式，这个模式下可以查看到服务器请求情况。调式模式绝不能在生产模式中开启。

```
$ ts-node app.ts
The server is running localhost:5050
```

现在通过`curl`测试一下服务器

```shell
$ curl http://localhost:5050/hello/lleohao
{"data":"hello lleohao"}
```



### 更完整的例子, 构建一个代办事项应用程序的服务器


> 代码在 example 文件夹下, 运行前需要先编译

```javascript
import { ReqParams, Resource, Restful } from 'es-restful';

const api = new Restful();
const TODOS = [{
    id: 0,
    title: 'todo-0',
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

    put(render, { todoId }, { completed }) {
        todoId = parseInt(todoId);
        let index = indexOf(todoId);

        if (index === -1) {

            render(`The item for the id:${todoId} does not exist`, 404)
        } else {
            TODOS[index].completed = completed;
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

api.start({ debug: true });
```



测试结果

```curl
// 获取所有列表
curl localhost:5050/todos 
[{"id":0,"title":"todo-0","completed":false}]

// 获取指定id=0的todo详情
curl localhost:5050/todos/0
{"id":0,"title":"todo-0","completed":false}

// 新建 todo
curl -X POST \
  http://localhost:5050/todos \
  -H "Content-Type: application/json" \
  -d '{ "title": "add todo" }' 
{"id":1,"title":"add todo","completed":false}

// 删除id=0的todo
curl -X DELETE localhost:5050/todos/0
{"data":"success"}

// 更新id=1的todo状态
curl -X PUT \
  http://localhost:5050/todos/1 \
  -H 'content-type: application/json' \
  -d '{"completed":true}'
{"data":"success"}
```

更详细的功能可以查阅[快速指南](/zh-cn/guide)
