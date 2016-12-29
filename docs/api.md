# API 文档

## Class: Restful

> 创建 restful 服务器

### `constructor` Restful构造函数

```javascript
/**
 * Creates an instance of Api.
 * 
 * @param {number} [port=5050] 服务器开启端口
 * @param {string} [hostname='localhost'] 服务器开启地址
 * 
 * @memberOf Api
 */
constructor(port: number = 5050, hostname: string = 'localhost'):Restful
```

### `addSource` 添加资源类

```javascript
/**
 * add Resource
 * 
 * @param {Resource} resource 资源对应的类, 需要有与HTTP请求方式同名的方法
 * @param {string} path 请求资源对应的路径, 支持路由参数
 * 
 * @memberOf Api
 */
addSource(resource: any, path: string): void
```

> resource类示例

```javascript
class Resource {
  get() {}
}
api.addSource(Resource, '/api/source')
api.start();

// 访问 `<host>/api/source` 的 get 请求将会有 Resource 的 get 方法处理
```

> 路由参数示例

可以使用`<`和`>`包括参数名, 框架将自动解析出路由中的参数, 并会在调对应的处理函数时传入

```javascript
class Resource {
	get ({name, page}) {
    	// 通过对象解析获得参数
	}
}
api.addSource(Resource, '/book/<name>/page/<page>');
```

### `start` 启动服务器

```javascript
/**
 * Start server
 * 
 * 
 * @memberOf Api
 */
start(options?: {}):void
```

options: 可选配置项, 功能待开发

### `stop` 关闭服务器

```javascript
/**
 * Stop server
 * 
 * 
 * @memberOf Restful
 */
stop(): void
```



## Class: Parser

> 参数解析类, 自动处理参数

### `constructor`  Parser构造函数  

```javascript
/**
 * Creates an instance of Parser.
 * 
 * 
 * @param {(boolean | Function)} [trim=false]       是否自动清除参数两端的空白, 可以被参数的单独设置的属性覆盖
 * @param {Function} [errCb]                        错误处理函数
 * 
 * @memberOf Parser
 */
 constructor(trim: boolean | Function = false, errCb?: Function) : Parser;
```

> errCb 函数将会在发生错误时调用, 传入当前的错误数据

### `addParam` 添加参数函数

    /**
     * 添加参数信息
     *
     *
     * @memberOf Parser
     * @api
     * @param name          参数名称
     * @param options       参数配置  
     */
    addParam(name: string, options?: Param): void;
> optiosn 详解

| 参数名           | 类型               | 默认值   | 描叙                                       |
| ------------- | ---------------- | ----- | ---------------------------------------- |
| caseSensitive | boolean          | false | 是否忽略大小写, 设置为 true 则统一转换为小写               |
| nullabled     | boolean          | true  | 是否允许传递空值                                 |
| ignore        | boolean          | false | 是否忽略参数自动转换类型发生的错误                        |
| defaultVal    | any              |       | 当参数为空时的默认值                               |
| dset          | string           |       | 参数的别名, 返回的解析值将使用这个名称代替请求中的名称             |
| required      | boolean          | false | 是否是必填的值                                  |
| type          | string\|Function |       | 指定将参数转换为什么类型(int, float, string)的值, 可以传递函数 |
| trim          | boolean          | false | 是否自动清除参数两端的空白                            |
| choices       | any[]            |       | 参数的可选范围                                  |
| help          | string           |       | 当类型转换错误时,指定的返回错误信息                       |

### `removeParams` 删除参数函数

```javascript
/**
 * 删除参数信息
 * 
 * @param {((string | string[]))} name   参数名称或参数名称数组
 * 
 * @memberOf Parser
 */
removeParams(name: (string | string[])): void;
```

## Decorator: addParser

> 装饰器, 将处理方法与parser绑定

```javascript
// example

let parser = new Parser();
parser.addParam('title', {
    required: true,
    type: 'string'
});

class TodoList {
    // 通过装饰器绑定parser至处理指定的处理方式
  	// 当parser处理完成数据后会传入处理函数中
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
```





