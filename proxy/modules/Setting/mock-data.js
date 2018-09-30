module.exports = {
  "GET:/setting/MesList":{
    "status":200,
    "data":[
      {
        "type": "sys",
        "app":true,
        "mail":true,
        "message":false
      },
      {
        "type": "overflow",
        "app":true,
        "mail":false,
        "message":false
      },
      {
        "type": "other",
        "app":false,
        "mail":false,
        "message":true
      }
    ]
  }
}