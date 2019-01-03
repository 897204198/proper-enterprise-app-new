var url = require('url');
module.exports = {
  'GET:/search/inverse':[{"id":"5aab6ea828cc0f09784a0730","con":"用户1","col":"name","tab":"pep_auth_users","des":"name","pri":"pep_dev|pep_auth_users|45f438a3-1af0-4c27-9850-04e046adb6d3"},{"id":"5aab6ea828cc0f09784a0733","con":"用户2","col":"name","tab":"pep_auth_users","des":"name","pri":"pep_dev|pep_auth_users|b18de59a-261a-4df6-9327-30ba7e00f8f1"},{"id":"5aab6ea828cc0f09784a072c","con":"用户3","col":"name","tab":"pep_auth_users","des":"name","pri":"pep_dev|pep_auth_users|000673e6-e87a-4d6b-a641-b2fcf8bb9cb3"}],
  'GET:/search/query':getQueryList,
}
const authUser = {
  "count":11,
  "data": [
    {"id":"1","username":"dengguange","password":"123456","name":"77777","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"2","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"3","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"4","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"5","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"6","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"7","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"8","username":"wewerrrer","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"9","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"10","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false},
    {"id":"11","username":"zhangjianlin","password":"123456","name":"66666","email":"276595311@qq.com","phone":"15912345678","enable":true,"superuser":false}
  ]
};

const authGroup = {
  "count":12,
  "data": [
    {"id": "1","name": "高管用户","description": "高管角色用户组","seq": 1,"enable": true},
    {"id": "2","name": "管理员用户","description": "管理员角色用户组","seq": 2,"enable": true},
    {"id": "3","name": "内勤用户","description": "内勤角色用户组","seq": 3,"enable": false},
    {"id": "4","name": "其他用户","description": "其他角色用户组","seq": 4,"enable": false},
    {"id": "5","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false},
    { "id": "6","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false},
    {"id": "7","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false},
    {"id": "8","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false},
    {"id": "9","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false},
    {"id": "10","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false},
    {"id": "11","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false},
    {"id": "12","name": "其他用户2","description": "其他角色2用户组","seq": 5,"enable": false}
  ]
};

const authRole = {
  "count":4,
  "data": [
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
    "parentId": "1",
    "parentName": "XX医院功能"
  },
  {
    "id": "3",
    "name": "研发部功能",
    "description": "研发部所有功能",
    "enable": true,
    "parentId": "1",
    "parentName": "普日基本权限功能"
  },
  {
    "id": "4",
    "name": "开发部功能",
    "description": "开发部所有功能",
    "enable": false,
    "parentId": "1",
    "parentName": "普日基本权限功能"
  },
]};

const authMenu = {
  "count":7,
  "data":[
    {"id":"pep-workflow","name":"流程设置","route":"/workflow","sequenceNumber":0,"icon":"database","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"parentId":null,"menuCode":null,"root":true},
    {"id":"pep-auth","name":"权限管理","route":"/auth","sequenceNumber":1,"icon":"lock","description":null,"menuType":{"catalog":"MENU_TYPE","code":"0"},"enable":true,"identifier":null,"parentId":null,"menuCode":null,"root":true},
    {"id":"pep-auth-users","name":"用户管理","route":"/auth/user","sequenceNumber":0,"icon":"solution","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-auth","menuCode":null,"root":false},
    {"id":"pep-auth-functions","name":"功能管理","route":"/auth/func","sequenceNumber":1,"icon":"bars","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-auth","menuCode":null,"root":false},
    {"id":"pep-auth-roles","name":"角色管理","route":"/auth/role","sequenceNumber":2,"icon":"skin","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-auth","menuCode":null,"root":false},
    {"id":"pep-auth-user-groups","name":"用户组管理","route":"/auth/group","sequenceNumber":3,"icon":"team","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-auth","menuCode":null,"root":false},
    {"id":"pep-workflow-designer","name":"流程设计","route":"/workflow/designer","sequenceNumber":0,"icon":"share-alt","description":null,"menuType":{"catalog":"MENU_TYPE","code":"1"},"enable":true,"identifier":null,"parentId":"pep-workflow","menuCode":null,"root":false},
    {"id":"pep-hrm", "name": "组织机构","leaf": false,"root": true,"icon": "team","parentId": null,"enable": true,"route": "/hrm","sequenceNumber": 1},
    {"id":"pep-hrm-employee","name": "人员管理","parentId": "pep-hrm","leaf": true,"root": false,"enable": true,"icon": "contacts","route": "/hrm/employee","sequenceNumber": 2},
    {"id":"pep-hrm-organization","name": "机构管理","parentId": "pep-hrm","leaf": true,"root": false,"enable": true,"icon": "share-alt","route": "/hrm/organization","sequenceNumber": 3},
  ]
};

const systemConfig = {
  "count":12,
  "data": [
    {"id": "1","moduleName": "pepAuth","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "2","moduleName": "hrmpep","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "role","columnDesc": "高管角色用户组","url": "/authusers"},
    {"id": "3","moduleName": "pepAuth","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "4","moduleName": "pepAuth","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/system/config"},
    {"id": "5","moduleName": "hrmpep","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/system"},
    {"id": "6","moduleName": "workflow","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "7","moduleName": "hrmpep","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "8","moduleName": "workflow","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "9","moduleName": "hrmpep","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "10","moduleName": "pepAuth","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "11","moduleName": "workflow","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"},
    {"id": "12","moduleName": "pepAuth","tableName": "pep_system_config","searchColumn": "userName","columnAlias": "user","columnDesc": "高管角色用户组","url": "/config"}
  ]
};

const systemDic = {
  "count": 11,
  "data": [
    {
      "id": "001",
      "catalog": "sex",
      "code": "1",
      "name": "女",
      "order": 1,
      "deft": true,
      "dataDicType": "SYSTEM"
    },
    {
      "id": "002",
      "catalog": "sex",
      "code": "1",
      "name": "名称",
      "order": 2,
      "deft": true,
      "dataDicType": "BUSINESS"
    },
    {
      "id": "003",
      "catalog": "sex",
      "code": "1ss",
      "name": "名称",
      "order": 0,
      "deft": true,
      "dataDicType": "SYSTEM"
    },
    {
      "id": "004",
      "catalog": "sex",
      "code": "1ss",
      "name": "名称",
      "order": 2,
      "deft": true,
      "dataDicType": "BUSINESS"
    },
    {
      "id": "005",
      "catalog": "sex",
      "code": "1",
      "name": "名称",
      "order": 0,
      "deft": true,
      "dataDicType": "SYSTEM"
    },
    {
      "id": "006",
      "catalog": "sex",
      "code": "1ss",
      "name": "名称",
      "order": 2,
      "deft": true,
      "dataDicType": "BUSINESS"
    },
    {
      "id": "007",
      "catalog": "sex",
      "code": "1",
      "name": "名称",
      "order": 0,
      "deft": true,
      "dataDicType": "SYSTEM"
    },
    {
      "id": "008",
     "catalog": "sex",
      "code": "1ss",
      "name": "名称",
      "order": 2,
      "deft": true,
      "dataDicType": "BUSINESS"
    },
    {
      "id": "0018",
      "catalog": "sex",
      "code": "1",
      "name": "名称",
      "order": 0,
      "deft": true,
      "dataDicType": "SYSTEM"
    },
    {
      "id": "009",
     "catalog": "sex",
      "code": "1ss",
      "name": "名称",
      "order": 2,
      "deft": true,
      "dataDicType": "BUSINESS"
    },
    {
      "id": "0010",
      "catalog": "sex",
      "code": "1",
      "name": "名称",
      "order": 0,
      "deft": true,
      "dataDicType": "SYSTEM"
    },
    {
      "id": "0011",
     "catalog": "sex",
      "code": "1ss",
      "name": "名称",
      "order": 2,
      "deft": true,
      "dataDicType": "BUSINESS"
    }
  ]
}

const systePage = {
  "count": 11,
  "data": [{
    "id": "1",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },{
    "id": "2",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": null,
    "ios": { "envProduct": true, "keystorePassword": "1234", "keystoreFilename": "aa_bb_sss.cc", "topic": "sss.sss.sss.sss" },
    "diplomaId": "12w3e33"
  },{
    "id": "3",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX", "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": { "envProduct": true, "keystorePassword": "1234", "keystoreFilename": "aa_bb_sss.cc", "topic": "sss.sss.sss.sss" },
    "diplomaId": "12w3e33"
  },
  {
    "id": "4",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },
  {
    "id": "5",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },
  {
    "id": "6",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },
  {
    "id": "7",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },
  {
    "id": "8",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },
  {
    "id": "9",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },
  {
    "id": "10",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  },
  {
    "id": "11",
    "name": "MobileOA",
    "desc": "xx医院",
    "msgSaveDays": 3,
    "maxSendCount": 5,
    "secretKey": "b2024e00064bc5d8db70fdee087eae4f",
    "android": { "huawei": { "theAppId": "X", "theAppSecret": "XX",  "theAppPackage": "sss.sss.sss.sss"  }, "xiaomi": { "theAppSecret": "XXX", "theAppPackage": "sss.sss.sss.sss" } },
    "ios": null,
    "diplomaId": null
  }]
}
const messageOfficial = {
  "count" : 1,
  "data":[
    {"id":1,"name":"aa","type":"推送","keyboards":"哈哈","set":{"app":true,"email":false,"mes":true},"des":"666","switch":false},
    {"id":2,"name":"bb","type":"推送","keyboards":"哈哈","set":{"app":false,"email":false,"mes":true},"des":"666","switch":true}
  ]
}
function queryList(type) {
  let list = {};
  if (type === 'authusers') {
    list = authUser;
  } else if (type === 'authusergroups') {
    list = authGroup;
  } else if (type === 'authroles') {
    list = authRole;
  } else if (type === 'authmenus') {
    list = authMenu;
  } else if (type === 'systemconfig') {
    list = systemConfig;
  }  else if (type === 'systemdictionary') {
    list = systemDic;
  } else if (type === 'systempagepush') {
    list = systePage;
  } else if (type === 'officialSearch') {
    list = messageOfficial;
  }
  return list;
}

function getQueryList(req, res) {
  const result = queryList(url.parse(req.url, true).query.moduleName);

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
}
