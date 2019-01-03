module.exports = {
  "GET:/repository/models": {
    "size":3,
    "total":3,
    "start":0,
    "data":
    [
      {
        "id": "0",
        "name": "测试名字长度测试名字长度测试名字长度费用报销流程",
        "key": "123",
        "description": "费用报销",
        "createdBy": "pep-sysadmin",
        "lastUpdatedBy": "pep-sysadmin",
        "lastUpdated": "2018-01-18T09:45:59.635+0000",
        "deploymentTime": "2018-03-14 13:53:54",
        "created": "2018-01-14 09:34:50",
        "latestVersion": true,
        "processVersion": 1,
        "comment": null,
        "modelType": 0,
        "status": {
          "name": "未部署",
          "code": "UN_DEPLOYED"
        }
      },
      {
        "id": "1",
        "name": "测试名字长度测试名字长度测试名字长度费用报销流程",
        "key": "123",
        "description": "费用报销",
        "createdBy": "pep-sysadmin",
        "lastUpdatedBy": "pep-sysadmin",
        "lastUpdated": "2018-01-18T09:45:59.635+0000",
        "latestVersion": true,
        "processVersion": 1,
        "comment": null,
        "modelType": 0,
        "status": {
          "name": "已部署",
          "code": "DEPLOYED"
        }
      },
      {
        "id": "2",
        "name": "会议申请流程",
        "key": "124",
        "description": "会议申请流程会议申请流程会议申请流程会议申请流程会议申请流程",
        "createdBy": "pep-sysadmin",
        "lastUpdatedBy": "pep-sysadmin",
        "lastUpdated": "2018-01-18T09:45:51.657+0000",
        "latestVersion": true,
        "processVersion": 1,
        "comment": null,
        "modelType": 0,
        "status": {
          "name": "启用",
          "code": "2"
        }
      },
      {
        "id": "3",
        "name": "请假申请流程",
        "key": "125",
        "description": "请假申请流程请假申请流程请假申请流程请假申请流程请假申请流程请假申请流程请假申请流程请假申请流程",
        "createdBy": "pep-sysadmin",
        "lastUpdatedBy": "pep-sysadmin",
        "lastUpdated": "2018-01-18T08:59:59.262+0000",
        "latestVersion": true,
        "processVersion": 1,
        "comment": null,
        "modelType": 0,
        "status": {
          "name": "停用",
          "code": "3"
        }
      }
    ]
  },
  "POST:/repository/models/:id/deployment": {
    "id": "0",
    "processVersion": "2",
    "deploymentTime": "2020-06-17 15:15:15"
  },
  "GET:/workflow/managers/:type": {
    "count": 4,
    "data": [
      {
        "taskId": "1",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "id": "2",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "3",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "4",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "5",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "suspending",
        "status": "审核"
      },
      {
        "id": "6",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "7",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "8",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "9",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "suspending",
        "status": "审核"
      },
      {
        "id": "10",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "11",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      },
      {
        "id": "12",
        "name": "报销流程",
        "created": "2018-05-06 10:23",
        "createdBy": "王某某",
        "updated": "2018-05-06 10:23",
        "type": "solved",
        "status": "批准"
      }
    ]
  },
  "GET:/task": {
    "count": 12,
    "data": [
      {
        "taskId": "1",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "2",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "3",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "4",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "5",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "6",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "7",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "8",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "9",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "10",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "11",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      },
      {
        "taskId": "12",
        "pepProcInstVO": {
          "procInstId": "1",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
        },
      }
    ]
  },
  "GET:/process": {
    "count": 4,
    "data": [
      {
        "procInstId": "1",
        "createTime": "2018-05-06 10:23",
        "endTime": "2018-05-06 10:23",
        "processDefinitionName": "报销流程",
        "startUserName": "王某某",
        "stateCode": "sh",
        "stateValue": "审核"
      },
      {
        "procInstId": "2",
        "createTime": "2018-05-06 10:23",
        "endTime": "2018-05-06 10:23",
        "processDefinitionName": "报销流程",
        "startUserName": "王某某",
        "stateCode": "sh",
        "stateValue": "审核"
      },
      {
        "procInstId": "3",
        "createTime": "2018-05-06 10:23",
        "endTime": "2018-05-06 10:23",
        "processDefinitionName": "报销流程",
        "startUserName": "王某某",
        "stateCode": "sh",
        "stateValue": "审核"
      },
      {
        "procInstId": "4",
          "createTime": "2018-05-06 10:23",
          "endTime": "2018-05-06 10:23",
          "processDefinitionName": "报销流程",
          "startUserName": "王某某",
          "stateCode": "sh",
          "stateValue": "审核"
      }
    ]
  },
}