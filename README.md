
PEA 在项目关系管理上依赖于 `npm` 
在公司内部[私服](http://nexus.propersoft.cn:8081/)上提供以下几个包：

-  [@pea-cli](http://nexus.propersoft.cn:8081/repository/npm-internal/pea-cli/-/pea-cli-0.5.0.tgz) 初始化项目的脚手架 可以快速生成一个项目目录
-  [@proper/framework](http://nexus.propersoft.cn:8081/repository/npm-internal/@pea/framework/-/framework-0.4.4.tgz) 项目的框架代码
-  [@proper/pea-lib](http://nexus.propersoft.cn:8081/repository/npm-internal/@proper/pea-lib/-/pea-lib-0.6.0-rc.1.tgz) pea平台的业务代码
-  [@proper/icmp-lib](http://nexus.propersoft.cn:8081/repository/npm-internal/@proper/icmp-lib/-/icmp-lib-0.6.0-beta.1.tgz) icmp产品的业务代码


###  如何开始一个项目
##### 以依赖`@proper/pea-lib`为例
- 以下所有操作默认你已登录公司npm私服 [如何登录](https://github.com/propersoft-cn/proper-enterprise-app#%E4%BD%BF%E7%94%A8)
- 运行命令 `npm i pea-cli -g` 全局安装pea-cli脚手架 
- 运行命令 `pea-cli your_project_name` 初始化项目目录结构
- 修改`package.json`  配置最新的 `@proper/framework`依赖版本   ***#若脚手架自带了请忽略#***
- 修改`package.json` 配置最新的  `@proper/pea-lib` 的依赖

    -----------------[查看相应依赖的版本](./LOOKUPVERSION.md)-----------------
- 运行命令 `npm install` 安装项目依赖
- 运行命令 `npm start` 启动项目
- 运行命令 `npm run mock`启动mock服务

*********** 浏览器输入 http://localhost:8000 ******* 账号: admin,密码: 123456 ************

[如何开发一个页面](./CONTRIBUTING.md)

[有哪些组件？](./src/lib/components/COMPONENTS.md)


