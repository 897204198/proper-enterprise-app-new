
## 何时使用

1.数据来源于数据字典的Select, Radio, Checkbox。

2.通用的Select, Radio, Checkbox组件。

## API
#### OopDict

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type |  类型 | String | select |
| nodeKey |  展示字段 | String | name |
| multiple |  多选(只在type类型为select时有效) | Boolean | false |
| disabled |  组件禁用 | boolean | false |
| placeholder | 提示文字 | string | 请选择 |
| config | 传入antd组件属性 | object | {} |
| value | 默认值 | Array | [] |
| catalog | 字典项 | String | - |
| urlData | 传入数据项 | Array | - |
| onChange | 选中 option，调用此函数 | function(Array<option>) | - |

其他属性参见[Select, Radio, Checkbox](https://ant.design/index-cn)
