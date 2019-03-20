module.exports = {
  "GET:/auth/current/user": {
    "id": "b672f5ba-f91b-f10e-08b3-ce77b9885d8e",
    "data": {
      "avatar": "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
      "userId": "00000001",
      "name": "超级管理员",
      "username": "admin"
    }
  },
  "POST:/auth/login": (req, res)=>{
    const { pwd, username } = req.body;
    if(pwd === '123456' && username === 'admin'){
      res.status(200).send('eyJpZCI6ImRjNjU3NjZjLTAxNzYtNGExZS1hZDBlLWRkMDZiYTY0NWM3bCIsIm5hbWUiOiJhZG1pbiJ9.eyJlbXBOYW1lIjpudWxsLCJyb2xlcyI6bnVsbCwiaGFzUm9sZSI6dHJ1ZX0.qFivNCKNAmX8IediHVR5q_GvG7dPmw4BmVzwlR3CPmw');
    }else {
      res.setHeader('X-PEP-ERR-TYPE', 'PEP_BIZ_ERR');
      res.status(500).send('失败');
    }
  },
  "GET:/auth/menus":{data: [
    {"id":"pep-workflow","name":"流程设置","route":"/workflow","sequenceNumber":0,"icon":"database","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"menuCode":null,"parentId":null,"root":true,"leaf":false},
    {"id":"pep-auth","name":"权限管理","route":"/auth","sequenceNumber":1,"icon":"lock","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"menuCode":null,"parentId":null,"root":true,"leaf":false},
    {"id":"pep-auth-users","name":"用户管理","route":"/auth/user","sequenceNumber":0,"icon":"solution","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-auth","root":false,"leaf":true},
    {"id":"pep-auth-functions","name":"功能管理","route":"/auth/func","sequenceNumber":1,"icon":"bars","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-auth","root":false,"leaf":true},
    {"id":"pep-auth-roles","name":"角色管理","route":"/auth/role","sequenceNumber":2,"icon":"skin","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-auth","root":false,"leaf":true},
    {"id":"pep-auth-user-groups","name":"用户组管理","route":"/auth/group","sequenceNumber":3,"icon":"team","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-auth","root":false,"leaf":true},
    {"id":"pep-workflow-designer","name":"流程设计","route":"/workflow/designer","sequenceNumber":0,"icon":"share-alt","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-workflow","root":false,"leaf":true},
    {"id":"pep-devtools","name":"开发者工具","route":"/devtools","sequenceNumber":2,"icon":"tool","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"parentId":null,"menuCode":null,"root":true},
    {"id":"pep-devtools-tomcat","name":"tomcat日志","route":"/devtools/tomcatLog","sequenceNumber":0,"icon":"code-o","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-devtools","menuCode":null,"root":false},
    {"id":"pep-devtools-page-designer","name":"页面设计器","route":"/devtools/page-designer","sequenceNumber":0,"icon":"code-o","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-devtools","menuCode":null,"root":false},
    {"id":"pep-devtools-appver","name":"APP版本管理","route":"/devtools/appver","sequenceNumber":0,"icon":"tag-o","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-devtools","menuCode":null,"root":false},
    {"id":"pep-devtools-cache","name":"缓存管理","route":"/devtools/cache","sequenceNumber":0,"icon":"hdd","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-devtools","menuCode":null,"root":false},
    {"id":"pep-devtools-mongoshell","name":"MongoShell GUI","route":"/devtools/mongoshell","sequenceNumber":0,"icon":"table","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-devtools","menuCode":null,"root":false},
    {"id":"pep-devtools-conversion", "name": "JWT 辅助工具", "route": "devtools/conversion", "sequenceNumber": 0, "icon": "question-circle-o", "description": null, "menuType": {"catalog": "MENU_TYPE", "code": "1" }, "enable": true, "identifier": null, "parentId": "pep-devtools", "menuCode": null, "root": false },
    {"id":"pep-devtools-aes", "name": "加密解密辅助工具", "route": "devtools/aes", "sequenceNumber": 0, "icon":"safety", "description":null,"menuType":{"catalog":"MENU_TYPE","code":"1" },"enable":true,"identifier":null,"parentId": "pep-devtools","menuCode":null,"root":false},
    {"id":"pep-system","name":"PEP配置管理","route":"/system","sequenceNumber":2,"icon":"profile","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"menuCode":null,"parentId":null,"root":true,"leaf":false},
    {"id":"pep-system-config","name":"oopsearch配置","route":"/system/oopsearchConfig","sequenceNumber":0,"icon":"setting","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-system","menuCode":null,"root":false},
    {"id":"pep-system-dictionary","name":"数据字典配置","route":"/system/dictionary","sequenceNumber":0,"icon":"table","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-system","menuCode":null,"root":false},
    {"id":"pep-system-pagePush","name":"APP推送信息配置","route":"/system/pagePush","sequenceNumber":0,"icon":"message","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-system","menuCode":null,"root":false},
    {"id":"pep-feedback","name":"意见反馈","route":"feedback","sequenceNumber":1,"icon":"form","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"parentId":null,"menuCode":null,"root":true},
    {"id":"pep-workflow-manager","name":"流程管理","route":"/workflow/manager","sequenceNumber":0,"icon":"table","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-workflow","root":false,"leaf":true},
    {"id":"pep-message","name":"消息配置管理","route":"/message","sequenceNumber":9,"icon":"appstore","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"menuCode":null,"parentId":null,"root":true,"leaf":false},
    {"id":"pep-message-app","name":"应用配置","route":"/message/client/app","sequenceNumber":0,"icon":"solution","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-message","root":false,"leaf":true},
    {"id":"pep-message-official","name":"文案配置","route":"/message/client/official","sequenceNumber":0,"icon":"solution","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":"pep-message","root":false,"leaf":true},
      // 新菜单 begin
    {"id":"5d20aeb5-763a-4964-ab41-264b71a6d660","name":"新技术新项目","route":"5d20aeb5-763a-4964-ab41-264b71a6d660","sequenceNumber":0,"icon":"folder","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":null,"root":false,"leaf":true},
      {"id":"683357b7-da97-4c47-be48-a125598e1eaf","title":"新技术新项目申请管理","pid":"5d20aeb5-763a-4964-ab41-264b71a6d660","url":"","icon":"folder","data":null,"ptype":"default","closeable":true,"sequenceNumber":1,"route":"683357b7-da97-4c47-be48-a125598e1eaf","parentId":"5d20aeb5-763a-4964-ab41-264b71a6d660","name":"新技术新项目申请管理"},{"id":"ea546845-022a-44e2-ae6b-b963ebcc7abe","title":"新技术新项目开展管理","pid":"5d20aeb5-763a-4964-ab41-264b71a6d660","url":"","icon":"folder","data":null,"ptype":"default","closeable":true,"sequenceNumber":2,"route":"ea546845-022a-44e2-ae6b-b963ebcc7abe","parentId":"5d20aeb5-763a-4964-ab41-264b71a6d660","name":"新技术新项目开展管理"},{"id":"6405a233-54a0-4bdd-b341-b594eb95bc62","title":"新技术新项目结题管理","pid":"5d20aeb5-763a-4964-ab41-264b71a6d660","url":"","icon":"folder","data":null,"ptype":"default","closeable":true,"sequenceNumber":3,"route":"6405a233-54a0-4bdd-b341-b594eb95bc62","parentId":"5d20aeb5-763a-4964-ab41-264b71a6d660","name":"新技术新项目结题管理"},{"id":"46a5c6bc-5e30-4c06-9eea-cad8ac70daf5","title":"新技术结题申请","pid":"6405a233-54a0-4bdd-b341-b594eb95bc62","url":"/home/home/proxyUrl?resourceId=32e6fbbe-0175-4482-bf6d-880e42ac6f48","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":1,"route":"/outerIframe?resourceId=5cf0826f-219f-4b91-9038-40d5c7146919","parentId":"6405a233-54a0-4bdd-b341-b594eb95bc62","name":"新技术结题申请"},{"id":"0ac5f3b3-117f-4ef0-b911-af603262f4f5","title":"新技术新项目病例申报","pid":"ea546845-022a-44e2-ae6b-b963ebcc7abe","url":"/home/home/proxyUrl?resourceId=80b5ec0b-bbf6-416e-b64b-8df79673b440","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":1,"route":"/outerIframe?resourceId=80b5ec0b-bbf6-416e-b64b-8df79673b440","parentId":"ea546845-022a-44e2-ae6b-b963ebcc7abe","name":"新技术新项目病例申报"},{"id":"cac928c9-7721-4f6f-a287-badcc2cb3695","title":"新技术申请","pid":"683357b7-da97-4c47-be48-a125598e1eaf","url":"/home/home/proxyUrl?resourceId=97e31d7d-d817-4cd9-9a8f-9a8a69ab8b48","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":1,"route":"/outerIframe?resourceId=97e31d7d-d817-4cd9-9a8f-9a8a69ab8b48","parentId":"683357b7-da97-4c47-be48-a125598e1eaf","name":"新技术申请"},{"id":"d2a2db36-3211-4b0c-863b-6926581d2b00","title":"伦理审查申请","pid":"683357b7-da97-4c47-be48-a125598e1eaf","url":"/home/home/proxyUrl?resourceId=d5d25f83-5af7-4117-985c-2587674cb218","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":2,"route":"/outerIframe?resourceId=d5d25f83-5af7-4117-985c-2587674cb218","parentId":"683357b7-da97-4c47-be48-a125598e1eaf","name":"伦理审查申请"},{"id":"f6f5bc95-0b86-4f20-bf62-24394161cdaf","title":"新技术病例跟踪","pid":"ea546845-022a-44e2-ae6b-b963ebcc7abe","url":"/home/home/proxyUrl?resourceId=ac9b5be7-5d5c-4cdb-9d87-edace6c39f3c","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":2,"route":"/outerIframe?resourceId=ac9b5be7-5d5c-4cdb-9d87-edace6c39f3c","parentId":"ea546845-022a-44e2-ae6b-b963ebcc7abe","name":"新技术病例跟踪"},{"id":"d30ddb3d-3140-4d51-bb7d-40b5e0102975","title":"新技术项目档案","pid":"6405a233-54a0-4bdd-b341-b594eb95bc62","url":"/home/home/proxyUrl?resourceId=f91ca347-1f41-407b-add8-ab5f7b2ae106","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":2,"route":"/outerIframe?resourceId=f91ca347-1f41-407b-add8-ab5f7b2ae106","parentId":"6405a233-54a0-4bdd-b341-b594eb95bc62","name":"新技术项目档案"},{"id":"e859c7b9-7428-4b4a-b85d-9e041418df97","title":"新技术定期总结","pid":"ea546845-022a-44e2-ae6b-b963ebcc7abe","url":"/home/home/proxyUrl?resourceId=0350afec-df40-43ec-a6cd-710bf8dd1b71","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":3,"route":"/outerIframe?resourceId=0350afec-df40-43ec-a6cd-710bf8dd1b71","parentId":"ea546845-022a-44e2-ae6b-b963ebcc7abe","name":"新技术定期总结"},{"id":"585e0116-4ae3-40f3-ab88-ac05be1d2648","title":"新技术新项目数据字典","pid":"683357b7-da97-4c47-be48-a125598e1eaf","url":"/home/home/proxyUrl?resourceId=d97ad462-da6b-4c12-bc58-3391d35cc2c3","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":3,"route":"/outerIframe?resourceId=d97ad462-da6b-4c12-bc58-3391d35cc2c3","parentId":"683357b7-da97-4c47-be48-a125598e1eaf","name":"新技术新项目数据字典"},{"id":"df0e3455-4925-4737-ba69-b3ca5a51af7a","title":"新技术中止","pid":"ea546845-022a-44e2-ae6b-b963ebcc7abe","url":"/home/home/proxyUrl?resourceId=71ff3842-0e5b-43df-b2ef-7f0b6e912e56","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":4,"route":"/outerIframe?resourceId=71ff3842-0e5b-43df-b2ef-7f0b6e912e56","parentId":"ea546845-022a-44e2-ae6b-b963ebcc7abe","name":"新技术中止"},{"id":"5d742697-531d-456b-9746-b37b2e6be0c5","title":"新技术新项目监管","pid":"ea546845-022a-44e2-ae6b-b963ebcc7abe","url":"/home/home/proxyUrl?resourceId=536e12c7-d29e-4db7-8d4a-899bea43ae92","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":6,"route":"/outerIframe?resourceId=536e12c7-d29e-4db7-8d4a-899bea43ae92","parentId":"ea546845-022a-44e2-ae6b-b963ebcc7abe","name":"新技术新项目监管"},{"id":"a793ec44-7220-4b83-95ea-10c38d863768","title":"新技术新项目科室查询","pid":"ea546845-022a-44e2-ae6b-b963ebcc7abe","url":"/home/home/proxyUrl?resourceId=61a2819d-00b8-46db-844b-45e955663f33","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":7,"route":"/outerIframe?resourceId=61a2819d-00b8-46db-844b-45e955663f33","parentId":"ea546845-022a-44e2-ae6b-b963ebcc7abe","name":"新技术新项目科室查询"},{"id":"5130b4e1-7bd8-42a4-a410-53d8f2119e13","title":"新技术新项目个人查询","pid":"ea546845-022a-44e2-ae6b-b963ebcc7abe","url":"/home/home/proxyUrl?resourceId=6ecd58e4-46cc-4e7e-9443-a27c8599c019","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":8,"route":"/outerIframe?resourceId=6ecd58e4-46cc-4e7e-9443-a27c8599c019","parentId":"ea546845-022a-44e2-ae6b-b963ebcc7abe","name":"新技术新项目个人查询"},
    {"id":"b72e96de-7211-43ec-978f-c5c27236d116","name":"医师电子档案","route":"b72e96de-7211-43ec-978f-c5c27236d116","sequenceNumber":0,"icon":"folder","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"menuCode":null,"parentId":null,"root":false,"leaf":true},
      {"id":"f47b081f-5d41-485b-a17f-4fe8a4c36c51","title":"医师档案管理","pid":"b72e96de-7211-43ec-978f-c5c27236d116","url":"","icon":"folder","data":null,"ptype":"default","closeable":true,"sequenceNumber":1,"route":"f47b081f-5d41-485b-a17f-4fe8a4c36c51","parentId":"b72e96de-7211-43ec-978f-c5c27236d116","name":"医师档案管理"},{"id":"b4f63873-a59e-4ef6-a7a4-bdbbd238ce03","title":"档案查询和分析","pid":"b72e96de-7211-43ec-978f-c5c27236d116","url":"","icon":"folder","data":null,"ptype":"default","closeable":true,"sequenceNumber":2,"route":"b4f63873-a59e-4ef6-a7a4-bdbbd238ce03","parentId":"b72e96de-7211-43ec-978f-c5c27236d116","name":"档案查询和分析"},{"id":"06b3a83c-ec06-48ad-a502-cad936c63255","title":"医师信息管理","pid":"f47b081f-5d41-485b-a17f-4fe8a4c36c51","url":"/home/home/proxyUrl?resourceId=2161ca3f-fbbd-4f5f-9bad-7265c532a4e3","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":1,"route":"/outerIframe?resourceId=2161ca3f-fbbd-4f5f-9bad-7265c532a4e3","parentId":"f47b081f-5d41-485b-a17f-4fe8a4c36c51","name":"医师信息管理"},{"id":"209a0f0d-9767-4def-a062-d538f1425c6b","title":"查询条件管理","pid":"b4f63873-a59e-4ef6-a7a4-bdbbd238ce03","url":"/home/home/proxyUrl?resourceId=7f35b131-3e27-410c-aefe-6ba78a6a2414","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":1,"route":"/outerIframe?resourceId=7f35b131-3e27-410c-aefe-6ba78a6a2414","parentId":"b4f63873-a59e-4ef6-a7a4-bdbbd238ce03","name":"查询条件管理"},{"id":"d5291eee-0bdf-4047-aa03-26bc0887b842","title":"医生信息查询","pid":"b4f63873-a59e-4ef6-a7a4-bdbbd238ce03","url":"/home/home/proxyUrl?resourceId=92d0c2ef-2169-4d55-8319-475c30e6e6a9","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":2,"route":"/outerIframe?resourceId=92d0c2ef-2169-4d55-8319-475c30e6e6a9","parentId":"b4f63873-a59e-4ef6-a7a4-bdbbd238ce03","name":"医生信息查询"},{"id":"25f7d700-0f51-4320-83f2-8fda8e3ffa33","title":"医师档案字典","pid":"f47b081f-5d41-485b-a17f-4fe8a4c36c51","url":"/home/home/proxyUrl?resourceId=8ecd6367-c9fa-451f-9e8c-31b5d6a2c70f","icon":"file","data":null,"ptype":"default","closeable":true,"sequenceNumber":2,"route":"/outerIframe?resourceId=8ecd6367-c9fa-451f-9e8c-31b5d6a2c70f","parentId":"f47b081f-5d41-485b-a17f-4fe8a4c36c51","name":"医师档案字典"}
    ]},
  "GET:/auth/users": {
    "count":100,
    "data":[
      {"id":"1","username":"denggy","password":"123456","name": "邓某某","email": "dengha@qq.com","phone": "15912345678","enable":true,"superuser":false},
      {"id":"2","username":"zhangjianlin","password":"123456","name":"张林","email":"zhanglian@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"3","username":"wanghe","password":"123456","name":"王贺","email":"wanghe@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"4","username":"wanghaopeng","password":"123456","name":"王浩鹏","email":"wanghaopeng@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"5","username":"liyiming","password":"123456","name":"李一鸣","email":"liyiming@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"6","username":"wangyi","password":"123456","name":"王怡","email":"wangyi@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"7","username":"wangwei","password":"123456","name":"王维","email":"wangwei@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"8","username":"shihaoyu","password":"123456","name":"时浩宇","email":"shihaoyu@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"9","username":"buhaiyang","password":"123456","name":"步海洋","email":"buhaiyang@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"10","username":"sunshuai","password":"123456","name":"孙帅","email":"sunshuai@qq.com","phone":"15912345678","enable":true,"superuser":false},
      {"id":"11","username":"xuyang","password":"123456","name":"徐洋","email":"xuyang@qq.com","phone":"15912345678","enable":true,"superuser":false}]
  },
  'GET:/auth/users/:id':{
    "id": "2",
    "username": "admin",
    "password": "123456",
    "name": "66666",
    "email": "276595311@qq.com",
    "phone": "15912345678",
    "avatar": "12345678",
    "enable": true,
    "superuser": false
  },
  'POST:/auth/users/:id/role/:roleId':(req , res)=>{
    res.send('添加成功')
  },
  'DELETE:/auth/users/:id/role/:roleId':(req , res)=>{
    res.send('删除成功')
  },
  'GET:/auth/users/:id/roles':[
    {"id":"1",
    "name":"普通管理员",
    "description": "普通权限管理员",
    "enable": true,
    "parentId": "1",
    "parentName": "父节点1"},
    {"id":"2","name":"住院部功能",
    "enable": true,
    "parentId": "1",
    "parentName": "父节点1"},
    {"id":"3","name":"研发部功能",
    "enable": true,
    "parentId": "1",
    "parentName": "父节点1"},
  ],
  'GET:/auth/roles':[
    {"id":"ggjs","name":"高管角色"},
    {"id":"nqjs","name":"内勤角色"},
    {"id":"glyjs","name":"管理员角色"},
    {"id":"oer2","name":"其他角色"},
    {"id":"oer1","name":"其他角色2"},
  ],
  'GET:/auth/users/:id/user-groups':[
    {"id":"ggjs","name":"高管用户","description": "测试管理用户组","seq": 1,"enable": true},
  ],
  'PUT:/auth/users/:id': (req , res)=>{
    res.send({
      "id": "2",
      "username": "admin",
      "password": "123456",
      "name": "7777",
      "email": "276595311@qq.com",
      "phone": "15912345678",
      "enable": true,
      "superuser": false,
      "avatar": "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
    });
  },
  'POST:/auth/users':(req , res)=>{
    res.send({
      "id": "9",
      "username": "laolaolao",
      "password": "123456",
      "name": "laolaolao",
      "email": "276595311@qq.com",
      "phone": "15912345678",
      "enable": true,
      "superuser": false
    })
  },
  'DELETE:/auth/users':{
    type:"ok"
  },
  'GET:/auth/user-groups':[
    {
      "id": "ggjs",
      "name": "高管用户组",
      "description": "高管角色用户组",
      "seq": 1,
      "enable": true
    },
    {
      "id": "glyjs",
      "name": "管理员用户组",
      "description": "管理员角色用户组",
      "seq": 2,
      "enable": true
    },
    {
      "id": "nqjs",
      "name": "内勤用户组",
      "description": "内勤角色用户组",
      "seq": 3,
      "enable": false
    },
    {
      "id": "oer2",
      "name": "其他用户组",
      "description": "其他角色用户组",
      "seq": 4,
      "enable": false
    },
    {
      "id": "oer1",
      "name": "其他用户组2",
      "description": "其他角色2用户组",
      "seq": 5,
      "enable": false
    }
  ],
  'GET:/auth/user-groups/:id':{
    "id": "ggjs",
    "name": "高管角色",
    "description": "高管角色用户组",
    "seq": 1,
    "enable": true
  },
  'GET:/auth/user-groups/:id/users':[
    {"id":"1","username":"denggy","password":"123456","name":"邓广义","email":"degguangyi@qq.com","phone":"15912345678","enable":true,"superuser":false,"roleName":"yonghujuese"},
    {"id":"2","username":"zhangjianlin","password":"123456","name":"张建林","email":"zhangjianli@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"3","username":"wanghe","password":"123456","name":"王贺","email":"wanghe@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"4","username":"wanghaopeng","password":"123456","name":"王浩鹏","email":"wanghaopeng@qq.com","phone":"15912345678","enable":true,"superuser":false},
  ],
  'PUT:/auth/user-groups':(req , res)=>{
    res.send({
      "id": "ggjs",
      "name": "高管角色",
      "description": "高管角色用户组",
      "seq": 1,
      "enable": false
    });
  },
  'DELETE:/auth/user-groups':(req , res)=>{
    res.setHeader('X-PEP-ERR-TYPE', 'PEP_BIZ_ERR');
    res.status(500).send('失败');
  },
  'DELETE:/auth/user-groups/:id':(req , res)=>{
    res.setHeader('X-PEP-ERR-TYPE', 'PEP_SYS_ERR');
    res.status(500).send('系统异常!');
  },
  'PUT:/auth/user-groups/:id':(req , res)=>{
    res.send({
      "id": "ggjs",
      "name": "高管角色",
      "description": "测试角色用户组",
      "seq": 1,
      "enable": false
    });
  },
  'POST:/auth/user-groups/:id/user/:userId':(req , res)=>{
    res.send({})
  },
  'DELETE:/auth/user-groups/:id/user/:userId':(req , res)=>{
    res.send({})
  },
  'POST:/auth/user-groups/:id/role/:roleId':(req , res)=>{
    res.send('添加成功')
  },
  'DELETE:/auth/user-groups/:id/role/:roleId':(req , res)=>{
    res.send('删除成功')
  },
  'PUT:/auth/user-groups/:id/users':(req , res)=>{
    res.send({})
  },
  'DELETE:/auth/user-groups/:id/users':(req , res)=>{
    res.send({})
  },
  'POST:/auth/user-groups':(req , res)=>{
    res.send({
      "id": "ceshi",
      "name": "测试角色",
      "description": "新的高管角色用户组",
      "seq": 1,
      "enable": false
    })
  },
  'GET:/auth/roles/:id/menus':[
    {"id": "9901001","icon": "icon","name": "用户管理","route": "","enable": true,"root": false,"leaf": true,"parentId": "99010","menuType": {"code": "1"}},
    {"id": "9901003","icon": "icon","name": "角色管理","route": "","enable": true,"root": false,"leaf": true,"parentId": "99010","menuType": {"code": "1"}},
  ],
  'POST:/auth/roles/:id/menus':(req , res)=>{
    res.send({msg: '菜单添加成功'})
  },
  'DELETE:/auth/roles/:id/menus':(req , res)=>{
    res.send({msg: '菜单删除成功'})
  },
  'POST:/auth/roles/:id/resources':(req , res)=>{
    res.send({msg: '资源添加成功'})
  },
  'DELETE:/auth/roles/:id/resources':(req , res)=>{
    res.send({msg: '资源删除成功'})
  },
  'GET:/auth/roles/parents':[
    {"id": "1", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "1", "parentName": "父节点1"},
    {"id": "2", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "2", "parentName": "父节点2"},
    {"id": "3", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "3", "parentName": "父节点3"},
    {"id": "4", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "4", "parentName": "父节点4"},
    {"id": "5", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "5", "parentName": "父节点5"},
  ],
  'GET:/auth/roles/:id/parents':[
    {"id": "1", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "1", "parentName": "父节点1"},
    {"id": "2", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "2", "parentName": "父节点2"},
    {"id": "3", "name": "普通管理员", "description": "普通权限管理员", "enable": true, "parentId": "3", "parentName": "父节点3"},
  ],
  'GET:/auth/roles':[
    {
      "id": "1",
      "name": "普通管理员",
      "description": "普通权限管理员",
      "enable": true,
      "parentId": "1",
      "parentName": "普通权限"
    },
    {
      "id": "2",
      "name": "住院部功能",
      "description": "住院部所有功能",
      "enable": false,
      "parentId": "2",
      "parentName": "XX医院功能"
    },
    {
      "id": "3",
      "name": "研发部功能",
      "description": "研发部所有功能",
      "enable": true,
      "parentId": "3",
      "parentName": "普日基本权限功能1"
    },
    {
      "id": "4",
      "name": "开发部功能",
      "description": "开发部所有功能",
      "enable": false,
      "parentId": "4",
      "parentName": "普日基本权限功能2"
    },
  ],
  'POST:/auth/roles':(req , res)=>{
    res.send({})
  },
  'PUT:/auth/roles':(req , res)=>{
    res.send({})
  },
  'DELETE:/auth/roles':{
    type:"ok"
  },
  'GET:/auth/roles/:id':{
    "id": "1",
    "name": "普通管理员",
    "description": "显示角色信息，普通权限管理员",
    "enable": true,
    "parentId": "4",
    "parentName": "普通权限"
  },
  'PUT:/auth/roles/:id':(req , res)=>{
    res.send({})
  },
  'GET:/auth/roles/:id/users':[
    {"id":"1","username":"denggy","password":"123456","name": "邓某某","email": "dengha@qq.com","phone": "15912345678","enable":true,"superuser":false},
    {"id":"2","username":"zhangjianlin","password":"123456","name":"张林","email":"zhanglian@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"3","username":"wanghe","password":"123456","name":"王贺","email":"wanghe@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"4","username":"wanghaopeng","password":"123456","name":"王浩鹏","email":"wanghaopeng@qq.com","phone":"15912345678","enable":true,"superuser":false},
  ],
  'GET:/auth/roles/:id/user-groups':[
    {"id":"ggjs","name":"高管用户组"},
  ],
  'POST:/auth/menus':{
    "id": "9",
    enable: true,
    menuType: {code: 1}
  },
  'PUT:/auth/menus/:id':{
    "id": "9",
    enable: true,
    menuType: {code: 1}
  },
  'GET:/auth/menus/:id':{
    "id": "pep-auth-users",
    "icon": "icon",
    "name": "用户管理",
    "route": "user",
    "enable": true,
    "root": false,
    "leaf": true,
    "parentId": "pep-auth",
    "sequenceNumber": "3",
    "menuType": {"code": "1"}
  },
  'GET:/auth/menus/parents':[
    {"id":"pep-workflow","name":"流程设置","route":"/workflow","sequenceNumber":0,"icon":"database","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"parentId":null,"menuCode":null,"root":true},
    {"id":"pep-auth","name":"权限管理","route":"/auth","sequenceNumber":1,"icon":"lock","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"parentId":null,"menuCode":null,"root":true}
  ],
  'DELETE:/auth/menus':{
    type:"ok"
  },
  'GET:/auth/menus/:id/resources':[
    {
      id:'1',
      name:'新建',
      identifier:'add',
      enable:true,
    },
    {
      id:'2',
      name:'编辑',
      identifier:'edit',
      enable:true,
    },
    {
      id:'3',
      name:'删除',
      identifier:'delete',
      enable:true,
    }
  ],
  'POST:/auth/menus/:id/resources': {
      id:'4',
      name:'其他',
      identifier:'save',
      enable:true,
  },
  'PUT:/auth/resources/:id':    {
      id:'1',
      name:'新建',
      identifier:'add',
      enable:true,
  },
  'DELETE:/auth/resources/:id':{type:'ok'},
  'POST:/file': (req , res)=>{
    res.send('https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png')
  },
  'PUT:/auth/users/password': (req , res)=>{
    res.send({})
  }
}
