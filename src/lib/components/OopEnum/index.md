
## 何时使用

- 通用的Select, Radio, Checkbox 枚举类型组件。

## API
#### OopEnum

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dropDown |  类型(true时为下拉菜单false时为Radio或Checkbox) | boolean | `true` |
| labelPropName |  展示字段 | string | `'name'` |
| multiple |  多选(只在`dropDown`类型为`true`时有效) | boolean | `false` |
| disabled |  组件禁用 | boolean | `false` |
| value | 默认值 | array | `object[]` |
| onChange | 当发生改变时候，调用此函数 | function | - |


其他属性参见[Select, Radio, Checkbox](https://ant.design/index-cn)
