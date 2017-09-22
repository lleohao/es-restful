<a name="2.2.0"></a>
# [2.2.0](https://github.com/lleohao/restful/compare/v2.1.0...v2.2.0) (2017-09-22)


### Bug Fixes

* **restful:** fix cors header error ([6e0e3c5](https://github.com/lleohao/restful/commit/6e0e3c5))


### Features

* **params:** Add params in constructor & change add method ([7917810](https://github.com/lleohao/restful/commit/7917810))
* **reqParams:** Add '*' params name ([9f04e8d](https://github.com/lleohao/restful/commit/9f04e8d))
* **reqParams:** Add inherit function ([8bf70b8](https://github.com/lleohao/restful/commit/8bf70b8))
* **restful:** Add cors and header options ([df6a2c6](https://github.com/lleohao/restful/commit/df6a2c6))
* **restful:** Add express middleware ([5168c72](https://github.com/lleohao/restful/commit/5168c72))
* **restful:** Output access information in debug mode ([94008e2](https://github.com/lleohao/restful/commit/94008e2))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/lleohao/restful/compare/v2.0.0...v2.1.0) (2017-08-07)


### Bug Fixes

* fix npm run example ([106c9d1](https://github.com/lleohao/restful/commit/106c9d1))
* fix something ([963712b](https://github.com/lleohao/restful/commit/963712b))
* test ([76a0778](https://github.com/lleohao/restful/commit/76a0778))
* test ([52f4950](https://github.com/lleohao/restful/commit/52f4950))
* **example:** Fix example bug. ([4d108a7](https://github.com/lleohao/restful/commit/4d108a7))
* **requestParse:** Fix content-type error ([61bf4a1](https://github.com/lleohao/restful/commit/61bf4a1))
* **resuful:** Fix options method error ([9f22b74](https://github.com/lleohao/restful/commit/9f22b74))
* **router:** Fix roter error stack ([e5ce967](https://github.com/lleohao/restful/commit/e5ce967))
* **router:** Fix router test case. ([e46b3d5](https://github.com/lleohao/restful/commit/e46b3d5))


### Features

* **parser:** Add more reqParser options ([5725d05](https://github.com/lleohao/restful/commit/5725d05))
* **parser:** Change error message. ([1b08848](https://github.com/lleohao/restful/commit/1b08848))
* **parser:** Remove nullabled options ([cd52717](https://github.com/lleohao/restful/commit/cd52717))
* **resource:** Remove async options ([bc7b442](https://github.com/lleohao/restful/commit/bc7b442))
* **restful:** Change method function argument ([dc97718](https://github.com/lleohao/restful/commit/dc97718))
* **resuful:** Change api ([11d90ed](https://github.com/lleohao/restful/commit/11d90ed))
* **resuful:** Change Resuful.addResource addSourceMap Api ([195efce](https://github.com/lleohao/restful/commit/195efce))
* **router:** Add dynamic router support. ([53e54be](https://github.com/lleohao/restful/commit/53e54be))
* **utils:** Add global error factory function ([514dd04](https://github.com/lleohao/restful/commit/514dd04))


### Performance Improvements

* **utils:** Improve utils.arrHas Robustness ([ad8a7d0](https://github.com/lleohao/restful/commit/ad8a7d0))



<a name="1.2.2"></a>
## [1.2.2](https://github.com/lleohao/restful/compare/v1.2.0...v1.2.2) (2017-01-17)


### Bug Fixes

* fix package.json ([2fc61b0](https://github.com/lleohao/restful/commit/2fc61b0))
* fix travis ([895234d](https://github.com/lleohao/restful/commit/895234d))


### Features

* **restful:** 添加addSourceMap 函数 ([ce5ddcc](https://github.com/lleohao/restful/commit/ce5ddcc))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/lleohao/restful/compare/v1.1.3...v1.2.0) (2017-01-15)


### Features

* 添加resource._getResponse()方法 ([a063971](https://github.com/lleohao/restful/commit/a063971))
* 添加resource类 ([90b0363](https://github.com/lleohao/restful/commit/90b0363))
* **resource:** 增加异步数据返回支持 ([1f7cfed](https://github.com/lleohao/restful/commit/1f7cfed))


### Performance Improvements

* 增加接口和优化性能 ([33c50e6](https://github.com/lleohao/restful/commit/33c50e6))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/lleohao/restful/compare/v1.1.2...v1.1.3) (2017-01-12)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/lleohao/restful/compare/v1.1.1...v1.1.2) (2017-01-12)



<a name="1.1.1"></a>
## [1.1.1](https://github.com/lleohao/restful/compare/v1.1.0...v1.1.1) (2017-01-12)


### Bug Fixes

* package.main ([0d3345d](https://github.com/lleohao/restful/commit/0d3345d))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/lleohao/restful/compare/v1.0.0...v1.1.0) (2017-01-12)


### Bug Fixes

* **parser:** 修复解析数据不返回 ([f69bf0d](https://github.com/lleohao/restful/commit/f69bf0d))
* **restful:** 修复 writr after end 错误 ([2207865](https://github.com/lleohao/restful/commit/2207865))
* **restful:** 修复调用resource的bug, 增加实例文件 ([c8de696](https://github.com/lleohao/restful/commit/c8de696))
* **router:** 修复解析路由参数bug ([3f5ec93](https://github.com/lleohao/restful/commit/3f5ec93))
* 修复参数解析多次调用的问题 ([461ba47](https://github.com/lleohao/restful/commit/461ba47))


### Features

* **restful:** 增加添加参数解析 装饰器函数 ([399c927](https://github.com/lleohao/restful/commit/399c927))
* **restful:** 完成restful ([feb07e0](https://github.com/lleohao/restful/commit/feb07e0))
* **resuful:** 添加主要api ([8292790](https://github.com/lleohao/restful/commit/8292790))
* **route:** :tada: 完成路由功能 ([491cbd1](https://github.com/lleohao/restful/commit/491cbd1))
* **route:** 添加简单的路由函数 ([ec5b1de](https://github.com/lleohao/restful/commit/ec5b1de))
* 增加绑定外部服务其功能 ([195fe48](https://github.com/lleohao/restful/commit/195fe48))
* 增加路由处理函数 ([8f7996d](https://github.com/lleohao/restful/commit/8f7996d))
* 完善示例程序 ([34e5132](https://github.com/lleohao/restful/commit/34e5132))
* 完成parser todo类容 ([b74f4a3](https://github.com/lleohao/restful/commit/b74f4a3))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/lleohao/restful/compare/668655e...v0.2.0) (2016-12-05)


### Bug Fixes

* **parser:** fix global trim ([162b583](https://github.com/lleohao/restful/commit/162b583))
* **parser:** get请求无法获得数据 ([6ab638a](https://github.com/lleohao/restful/commit/6ab638a))
* **parser:** 修复defaultVal bug, 增加相关测试用例 ([b17178a](https://github.com/lleohao/restful/commit/b17178a))
* **parser:** 修复nullabled参数无效 ([d58f8ba](https://github.com/lleohao/restful/commit/d58f8ba))
* **parser:** 修复trim属性bug  增加相关测试用例 ([e9a58e5](https://github.com/lleohao/restful/commit/e9a58e5))
* **parser:** 修复处理请求数据时发生错误无法给返回值 ([0ad4002](https://github.com/lleohao/restful/commit/0ad4002))
* **parser:** 修复错误提示bug, 增加相关测试用例 ([c49362e](https://github.com/lleohao/restful/commit/c49362e))
* **parser:** 增加parser type属性测试用例, 修复测试中出现的bug ([e5ef38d](https://github.com/lleohao/restful/commit/e5ef38d))


### Features

* 增加对请求数据的解析 ([668655e](https://github.com/lleohao/restful/commit/668655e))
* **parser:** 增加参数属性 ([e533d5b](https://github.com/lleohao/restful/commit/e533d5b))
* **parser:** 完成参数验证 ([ae3d742](https://github.com/lleohao/restful/commit/ae3d742))
* **parser:** 添加错误提示 ([cc79661](https://github.com/lleohao/restful/commit/cc79661))


### Performance Improvements

* **parser:** 增加get请求处理速度 ([e20f0fb](https://github.com/lleohao/restful/commit/e20f0fb))



