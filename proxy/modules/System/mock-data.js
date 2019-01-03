module.exports = {
  "POST:/oopsearch/config":(req , res)=>{
    res.status(200).send('');
  },
  "PUT:/oopsearch/config/:id":(req , res)=>{
    res.status(200).send('');
  },
  "DELETE:/oopsearch/config":(req , res)=>{
    res.status(200).send('');
  },
  "PUT:/sys/datadic/:id": (req, res) => {
    res.status(200).send('编辑成功')
  },
  "POST:/sys/datadic": (req, res) => {
    res.status(201).send('创建成功')
  },
  "DELETE:/sys/datadic": (req, res) => {
    // res.setHeader('X-PEP-ERR-TYPE', 'PEP_BIZ_ERR');
    // res.status(500).send('失败');
    res.status(202).send('');
  },
  "GET:/sys/datadic/:id": {
    "id": "23",
    "catalog": "sex",
    "code": "1",
    "name": "男",
    "order": 1,
    "deft": true,
    "dataDicType": "BUSINESS"
  },
  "GET:/sys/datadic/":{
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
  },
  "GET:/push/channels":  {
    "count": 11,
    "data": [{
      "id": "1",
      "name": "aaaaa",
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
      "desc": "bbbbb",
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
      "desc": "ddddd",
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
      "desc": "cccc",
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
      "desc": "rrrrr",
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
  },
  "PUT:/push/channels": (req, res) => {
    res.status(200).send('编辑成功')
  },
  "POST:/push/channels": (req, res) => {
    res.status(201).send('创建成功')
  },
  "DELETE:/push/channels":(req , res)=>{
    res.status(202).send('');
  },
  "GET:/file/12w3e33/meta":{
    "id": "01",
    "fileName": "文件1.p12",
    "fileDescription": "普通文件",
    "fileModule": "pep-sys",
    "fileSize": 1,
    "fileType": ".p12",
    "filePath": "D:\u0007\b"
  },
  "POST:/file": (req , res)=>{
    res.send('123e4rr')
  },
  "DELETE:/file":(req , res)=>{
    // res.status(500).send('文件删除失败');
    res.status(202).send('');
  },
}
