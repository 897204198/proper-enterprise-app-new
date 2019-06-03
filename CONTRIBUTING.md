# Proper-enterprise-app


普日软件PC管理端一体化平台 （基于[ANT DESIGN PRO](https://pro.ant.design/index-cn)）

![](other/main.png)

- 预览：https://cloud.propersoft.cn/pea/master/


## 模块

- 流程设置
  - 流程设计
  - 流程管理
- 权限管理
  - 用户管理
  - 功能管理
  - 角色管理
  - 用户组管理
- 应用配置管理
  - 应用配置
- 公告通知
  - 公告通知
- 表单管理
  - 表单自定义
  - 表单当前组件设置
- 消息配置管理
  - 应用配置
  - 文案配置
- 开发者工具
  - App版本管理
  - MongoShell GUI
  - JWT 辅助工具
  - 缓存管理
  - 加密解密辅助工具
  - tomcat日志
- PEP 配置管理
  - 数据字典配置
  - App应用配置
  - oopsearch配置
- 其他
  - 常见问题
- 意见反馈
  - 意见反馈

## 准备工作

1.确保您的电脑已经成功安装了[nodejs](https://nodejs.org/en/download/)和[git](https://git-scm.com/downloads) ,保证版本号 node 9.0.0 +    

2.注册[github](https://github.com/ "github")账号，并申请添加到公司组织对应的github组织上

3.联系运维人员申请公司内网映射npm账号

## 使用

#### 配置内网npm账户
```
npm config set registry http://nexus.propersoft.cn:8081/repository/npm-public/  
npm login                 #登录npm公司私服的账号
username: "you username"  #输入你的用户名和密码
password: "you password"
email:     "按下回车键"

```
#### 复制git代码并启动项目
```
$ git clone     https://github.com/propersoft-cn/proper-enterprise-app.git --depth=1  
$ cd proper-enterprise-app        # 进入项目目录中
$ npm install                     # 下载项目依赖
$ npm start                       # 访问项目服务

```
#### 执行mock数据
 
```
 命令行窗口进入项目文件夹下         
 npm run mock                     # 加载 mock 服务

```

## 兼容性

现代浏览器及 IE11。

## 编码规范
```代码结构```
```
- proxy   (--mock数据)
  - modules       (--对应模块使用的mock数据)
    - AntdProDemo 
    - Anth
    ...
- producer  (--代码生成器相关)
  - tpl
  - config.js     
  - main.js      
  - util.js
- publish
  - config.tpl
  - favicon.png
- src                 (-- 源代码)
  - assets              (--静态资源相关)
  - config              (--项目配置)
    - config.js           (--项目参数基本配置)
    - properties.js       (--提示信息或标题的通用配置)
    - sysRouters.js       (--系统默认的路由配置)
    - theme.js            (--项目主体颜色配置)
    - vendor.js           (--公共的、体积大的依赖提出来)
  - framework           (-- 框架)
    - common                (--框架相关)
        - framHelper.js           (--route获取)
        - inject.js               (--model注入)
        - oopUtils.js             (--抽出的工具)
    - components            (-- antdPro提供的基础组件示例)
        - ActiveChart            
        - Authorized          
        - AvatarList
        ... 
    - index                 (-- 项目入口相关)
        - index.ejs            
        - index.js           
        - index.less 
        - router.js
    - layouts               (-- 布局相关设置)
        - BasicLayout.js      (--基本布局)
        - BasicLayout.less        
        - UserLayout.js       (--登录、注册布局)    
        - UserLayout.less 
        - WebAppLayout.js     (--移动端布局)       
        - WebAppLayout.less
      - modules             (--基础业务模块) 
          - Base              (内置模块)
            - models            (--内置的model)
            - pages             (--内置的业务页面)
            - services          (--内置的请求服务接口)             
      - utils               (--纯工具函数库相关)   
          - MongoService.js   (--调用MongoDB的工具类)
          - request.js        (--统一规定的请求标准)
          - utils.js          (--抽象出来的通用方法)
          - utils.less    
  - lib                     (--业务源码)
      - components            (--封装的组件)
      - modules               (--业务模块)
          - Anth                (--用户权限模块)
            - models              (--dva中的model)
            - pages               (--模块对应的业务页面入口)
            - services            (--后台服务接口)
```

- 书写规范
  * 目录规范
      
      按照上述 `代码结构`，在`modules`文件夹中建立不同的业务模块，业务代码会在`modules`下建立`Anth`文件夹表示权限模块。`Anth`的下一层会建立三个子目录，有`models`、 `pages` 、`services` ，分别负责对业务模块，页面逻辑，获取服务等。
      如果有其他需求可按照目录结构自行添加相应文件 **不允许私自建立、修改、删除当前目录结构**
 
  *   命名规范

       `modules`
        文件夹中可以新建不同的功能模块的文件夹，但是子目录的 `文件名称` 必须 `首字母大写`

       `Anth/models`
        文件夹中不允许建立 `文件夹` 并且文件必须是`.js`文件 ,命名方式 `全小写` 或 `驼峰命名`。
        名称应该与相关业务pages下的文件夹与文件夹下的Page文件组成驼峰命名 如 page文件路径 pages/Auth/User.js  那么页面User.js 相应的model名为authUser.js
       
       `Anth/pages` 文件夹的命名必须 `首字母大写` ，名称采用`一个单词`，一般是你业务模块的名称。
        文件夹中`.js`、`.less`文件必须 `首字母大写`。 ###注:`驼峰命名`  时也要求`首字母大写` 。文件夹与`.js`文件名称与你后台菜单管理中的path相对应### 
               
       `Anth/services` 文件夹中的 services 名称 必须以 model名称后+大写的'S'命名 以注明这是一个service文   件 例如：如model名称 authUser.js 那么service名称 authUserS.js
 
  *   引用规范
       项目启动后回生成`webpackAlias.txt`这个文件，里面配置绝对路径
        ```

        @: D:\gitspace\pep-develop\proper-enterprise-app\src
        @framework: D:\gitspace\pep-develop\proper-enterprise-app\src\framework
        @pea: D:\gitspace\pep-develop\proper-enterprise-app\src\lib

        ```
       在实际应用中，一般采用 `绝对路径` ,如果是当前文件模块下的文件可以使用`相对路径`
  *   编码规范
  
        `.js`文件中一律使用`ES5`、`ES6`形式声明类、变量、方法、箭头函数等。
        
        一个`class`文件的结构大概是这样的

        ```
        - /src/modules/Anth/pages/Demo.js
        
        1  import ...;
        2
        3  @inject('demo')
        4  @connect(({demo,loading})=>({...}))
        5  export default class Demo extends React.PureComponent{...}
          
        ```

        以上示例代码中需要注意以下几点以上示例代码中需要注意以下几点
        
        1.最上方写入依赖的信息即`import`引入的信息 。不允许出现 `变量声明` 与 `import` 混写的情况。

        2.根据代码规范`import`其他声明或者注入的代码之间需要`空一行`进行隔断，让代码的解构更清晰。
          
        3.@inject @connect修饰符必须声明在 `class`的上方。不允许在`class`的最后结尾处声明修饰符注入对象的情况。
         
        
          
        `.less` 文件中类名一律`全小写`或 `驼峰命名`。 `:global`覆盖的组件样式，上层必须自定义类名包裹如下:


         ```
            .standardList {
                :global {
                  .ant-card-head {
                    border-bottom: none;
                  }
                }
            }

         ```
