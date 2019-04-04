
## 何时使用

聊天列表客服反馈时使用

## API
#### OopAnswer

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| mesArray | 聊天信息数组 | ARRAY[] | - |
| width | 自定义宽度 | string | 375px |
| height | 自定义滚动高度 | string | 180px |
| sendMes | 发送回调函数 | function(value) | - |

#### OopAnswer.mesArray

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 聊天id | string | - |
| name | 发送人名称 | string | - |
| time | 聊天时间 | string | - |
| mes | 聊天信息 | string | - |
| owner | 是否为当前人 | boolean | - |

其他属性参见[TextArea](https://ant.design/components/input-cn/)