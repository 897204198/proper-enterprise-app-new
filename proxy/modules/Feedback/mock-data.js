module.exports = {
  "GET:/admin/feedback": {
    data: [
      {
        "userId": "5a964a623a05002080b28d89",
        "userName": "张三",
        "userTel": "13945678900",
        "statusCode": "0",
        "status": "未反馈",
        "feedBackDocuments": [
          {
            "opinionTime": "2018-02-26 10:22",
            "opinion": "第一次反馈",
            "feedbackId": "1",
            "feedbackTime": "2018-02-26 11:52",
            "feedback": "反馈第一次反馈"
          },
          {
            "opinionTime": "2018-02-27 12:22",
            "opinion": "第二次反馈",
            "feedbackId": "2",
            "feedbackTime": "2018-02-27 14:52",
            "feedback": "反馈第二次反馈"
          },
          {
            "opinionTime": "2018-02-28 14:22",
            "opinion": "最后一次反馈",
            "feedbackId": "5a964a623a05002080b28d89",
            "feedbackTime": "",
            "feedback": ""
          }
        ]
      },
      {
        "userId": "5a964a623a05002080b28d88",
        "userName": "李四",
        "userTel": "13244556677",
        "statusCode": "0",
        "status": "未反馈",
        "feedBackDocuments": [
          {
            "opinionTime": "2018-03-28 14:27",
            "opinion": "testOpinion",
            "feedbackId": "5a964a623a05002080b28d89",
            "feedbackTime": "",
            "feedback": ""
          }
        ]
      },
      {
        "userId": "5a964a623a05002080b28d87",
        "userName": "王武",
        "userTel": "13245980677",
        "statusCode": "1",
        "status": "已反馈",
        "feedBackDocuments": [
          {
            "opinionTime": "2018-01-28 15:21",
            "opinion": "testOpinion",
            "feedbackId": "5a964a623a05002080b28d89",
            "feedbackTime": "2018-02-28 14:21",
            "feedback": "wonderful!"
          }
        ]
      },
      {
        "userId": "5a964a623a05002080b28d86",
        "userName": "赵琦",
        "userTel": "15630234908",
        "statusCode": "2",
        "status": "已关闭",
        "feedBackDocuments": [
          {
            "opinionTime": "2018-05-28 14:21",
            "opinion": "你们做的真是太好了，赞一个！",
            "feedbackId": "5a964a623a05002080b28d89",
            "feedbackTime": "",
            "feedback": ""
          }
        ]
      },
    ]
  },
  "GET:/admin/feedback/:id": [
    {
      "opinionTime": "2018-02-26 10:22",
      "opinion": "第一次反馈",
      "feedbackId": "1",
      "feedbackTime": "2018-02-26 11:52",
      "feedback": "反馈第一次反馈"
    },
    {
      "opinionTime": "2018-02-27 12:22",
      "opinion": "第二次反馈",
      "feedbackId": "2",
      "feedbackTime": "2018-02-27 14:52",
      "feedback": "反馈第二次反馈"
    },
    {
      "opinionTime": "2018-02-28 14:22",
      "opinion": "最后一次反馈",
      "feedbackId": "5a964a623a05002080b28d89",
      "feedbackTime": "",
      "feedback": ""
    }
  ],
  'POST:/admin/feedback/:id': (req , res)=>{
    res.send({
      status: "ok"
    });
  },
  'PUT:/admin/feedback/:id/close': (req , res)=>{
    res.send({
      status: "ok"
    });
  },
}
