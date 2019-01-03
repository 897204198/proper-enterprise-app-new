新版本的PEA 在项目关系管理上依赖于 `npm` 
在公司内部[私服](http://nexus.propersoft.cn:8081/)上提供以下几个包：

-  [@pea-cli](http://nexus.propersoft.cn:8081/repository/npm-internal/pea-cli/-/pea-cli-0.4.5.tgz) pea项目的脚手架 可以快速生成一个项目目录；
-  [@pea-framework](http://nexus.propersoft.cn:8081/repository/npm-internal/@pea/framework/-/framework-0.4.4.tgz) pea项目的框架代码
-  [@pea-lib](http://nexus.propersoft.cn:8081/repository/npm-internal/@pea/lib/-/lib-0.4.4.tgz)/[@icmp-lib](http://nexus.propersoft.cn:8081/repository/npm-internal/@icmp/lib/-/lib-0.4.4.tgz) pea平台/icmp产品的业务代码

## 如何使用

### 新建一个项目

- 运行命令 `npm i pea-cli -g` 全局安装pea-cli脚手架 
- 运行命令 `pea-cli` 初始化项目目录结构
- 修改package.json  配置最新的 @pea-framework依赖版本
- 修改package.json 根据项目需求 安装 @pea-lib/@icmp-lib 的依赖
- 运行命令 `npm install` 安装项目依赖
- 运行命令 `npm init` 初始化项目
- 运行命令 `npm start` 启动项目

### 更新一个项目
- 修改package.json  配置要更新的 @pea-framework依赖版本 或 要更新的@pea-lib 或 @icmp-lib
- 运行命令 `npm install` 安装项目依赖
- 运行命令 `npm init` 初始化项目
- 运行命令 `npm start` 启动项目


