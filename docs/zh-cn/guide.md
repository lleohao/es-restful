# 快速指南

> 通过示例一个 todoList 的服务器来快速入门本框架



## 惯例, 先来一个`Hello world`

我们来创建一个简单的服务器, 创建 `server.ts` 文件, 内容如下

```javascript
// 导入相关内容
import { Restful, Resource } from 'es-restful'; 

// 创建服务器
const api = new Restful(); 		        

// 声明一个资源类, 需要继承 Resource 基类
class HelloWorld extends Resource{				 
   // 声明 get 请求处理函数
   get () {
       return {
           data: 'Hello world!'
       }
   }
}

// 添加资源和需要监听的路径
api.addSource(HelloWorld, '/');

// 启动服务器
api.start();
```

然后编译执行, 访问`http://localhsot:5050/`, 可以看到返回的请求

>**`Resource`是`es-restful`中的重要概念. 我们可以将一些相关的数据请求归纳成一个资源.**
>
>**然后通过不同的请求来获取数据.**



## 创建 todoList 服务器

1. 新建`todoApi.ts` 文件, 内容如下

   ```javascript
   import { Restful, Resource } from 'es-restful';

   const api = new Restful();
   ```

2. 我们需要一个地方来存放数据, 暂时就先定义在文件当中

   ```javascript
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
   ```

3. 定义一个`TodoList`

   ```javascript
   class TodoList extends Resource {
       get () {
           return {
               data: TODOS
           }
       }
   }
   ```

4. 添加`TodoList`到服务器中, 这里为了方便区别普通的url, 我们可以选取一个特别点的路径

   ```javascript
   api.addSource(TodoList, '/api/todos');
   api.start();
   ```

我们现在可以通过访问`http://localhost:5050/api/todos`来获取列表中所有的数据

让我们来看看现在放回的数据

```json
{
    "code": 200,
    "message": "success",
    "data": [
        {"id":0,"title":"init todo","completed":false}
    ]
}
```



## 添加新建功能

>新建一个新的`todo`我们需要知道它的`title`
>
>这个需要从请求当中解析出来, 我们可以使用`Parser`类来完成这个操作

1. 引入 `Parser` 类, 用于参数的解析

   ```javascript
   import { Parser } from 'es-restful';
   ```

2. 创建`parser`用来处理参数

   ```javascript
   let parser = new Parser();

   // 通过 addParam 函数添加参数
   // title 代表参数的名称
   // 后面的对象用于对参数进行限定, 具体的可以查阅api文档
   parser.addParam('title', {
       // 代表这个参数是必须的
       required: true
   });
   ```

3. 我们需要有一个`id`来区别不同的`TodoItem`

   ```javascript
   const getId = (function () {
       let count = 0;
       return function() {
           return ++count;
       }
   })();
   ```

4. 通过装饰器将参数与请求方法进行绑定

   ```javascript
   class TodoList extends Resource {
       @Resource.addParser(parser)
       post({title}) {
           let id = getId();
           let item = {
               id: id,
               title: title,
               completed: false

           };
           TODOS.push(item);
           return {
               data: item
           };
       }
   }
   ```

现在我们可以通过`POST`请求来创建一个新的`todo`

>通过`Parser`可以很方便的处理请求数据, 同时解析出来的数据将会作为**请求函数的第一个参数**传入
>
>如果参数有误时, `Parser`还可以自动的处理这些错误, 同时返回响应的错误信息
>
>**同时为了开发的方便, 暂时只支持下面几种请求方式的解析**
>
>1. application/x-www-form-urlencoded
>2. application/json



## 添加删除功能

> 在以往的开发模式中, 如果需要添加删除功能可能使用`POST`方式请求`http://localhost:5050/api/todos/delete`接口来完成 , 在请求的数据中加上需要删除的`id`
>
> 现在可以使用`DELETE`方式进行请求

1. 这次我们需要创建一个新的`Resource`来管理单个`todo`

   ```javascript
   class Todos extends Resource { }

   api.addSource(Todos, '/api/todos/<todoId>')
   ```

   这里有个特别的地方时我们在路径中使用了`<todoId>`这样的方式在路由中传入参数

   `es-restful`实现了一个简单的路由参数解析, 可以通过`<paramName>`这样的方式传入相关参数

   *在路由参数中设置的名称将作为参数名传入处理函数中. 例如`/todo/<todoId>` 这样的路径, 请求函数中拿到的参数名将为`todoId`*

2. 创建`delete`方法处理请求

   ```javascript
   // 创建一个辅助函数
   const indexOf = function (todoId: number) {
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

   class Todos extends Resource {
       delete({todoId}) {
           todoId = parseInt(todoId);
           let index = indexOf(todoId);

           if (index === -1) {
               return {
                   data: `The item for the id:${todoId} does not exist`,
                   code: 404
               }
           } else {
               TODOS.splice(index, 1);
               return {
                   data: 'success'
               }
           }
       }
   }
   ```

   我们通过一个辅助函数获取指定`id`的`todo`在数组中的位置, 然后从数组中删除.

   还有一个特别的地方是`retrun`的对象有有个`code`属性, 设置的`code`将作为`response`的`http code`返回.



## 添加更新功能

同`DELETE`请求一样, 我们可以使用`PUT`请求来完成数据的更新操作, 但在这里我们加上一点不同的东西.

众所周知的是`Node`的运行环境是单线程的环境, 有很多操作为了不影响主线程的执行都会使用异步来执行, 我们在编写请求函数时, 很多情况下都需要调用数据库或者文件系统, 例如文件系统提供的`api`大多是异步的.

对于这样的需要进行异步操作才能拿到数据的情况, 可以使用一个新的装饰器`@Resource.async()`, 示例如下:

1. 创建`put`请求处理函数

   ```javascript
   class Todos extends Resource {
     	// 使用 async() 装饰器
     	@Resource.async()
       put({todoId}, _return) {	// 参数中将会传入 _return 函数用于返回数据
           todoId = parseInt(todoId);
           let index = indexOf(todoId);
   		
         	// 通过setTimeout 模拟异步操作
           setTimeout(() => {
               if (index === -1) {
                   _return({
                       data: `The item for the id:${todoId} does not exist`,
                       code: 404
                   })
               } else {
                   TODOS[index].completed = !TODOS[index].completed;
                   _return({
                       data: 'success'
                   })
               }
           })
       }
   }
   ```

   任何使用了`@Resource.async()`的请求函数, 将会在函数执行时在**第二个参数传入一个数据返回函数(第一个参数是参数数据, 就算没有参数的话也需要使用占位参数)**

   在异步操作完成后调用`_return`函数返回数据.




## 使用`addSourceMap()`批量添加`Resource`

当我们的项目越来越大时, 手动一个个的添加`Resouce`是一件麻烦的事情.这时我们可以使用`addSourceMap()`来批量添加.

```javascript
// 我们更改下上面的添加方式

api.addSourceMap({
    '/api/todos/<todoId>': Todos,
    '/api/todos': TodoList
})
```

>Tips: 实际开发时我们可以将不通的`Resource`放在不同的文件中, 通过`export`导出相应的配置文件.
>
>在主文件使用`Object.assign()`合并配置文件导入即可.



## 绑定到已有的服务器中

现在的我们是自己启动了一个新的服务器用于处理请求, 在有的情况下你可能不需要一个新的服务器, 而是绑定到一个已有的服务器上.

这个情况下可以使用`Restful.bindServer()`函数

```javascript
import { createServer } from 'http';

const server = createServer();

// 绑定服务器
api.bindServer(server);

// 启动服务器
server.listen(5050)
```

`bindServer`内部将监听了`Server`的`request`事件来完成, 以后会陆续添加主流框架的支持




## 结语

通过快速指南可以学习到本框架的绝大部分功能, 更多详细的`api`信息可以参考[API文档](//lleohao.github.io/restful/#/api)

框架中可能还存在不完善的地方, 欢迎各位提`issure`或者`pull request`

​如果觉得本框架还不错的话, 也希望给个 `star`