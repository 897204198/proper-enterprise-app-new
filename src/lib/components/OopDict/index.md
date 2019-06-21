
## 何时使用

- 通用的字典组件。

## API
#### OopDict

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| catalog |  数据字典的字典项 | boolean | `true` |
| dropDown |  类型(true时为下拉菜单false时为Radio或Checkbox) | boolean | `true` |
| multiple |  多选(只在`dropDown`类型为`true`时有效) | boolean | `false` |
| disabled |  组件禁用 | boolean | `false` |
| value | 默认值 | array | - |
| listData | 传入的字典对象候选项(注：若传入改属性，那么`catalog`将失效) | array | `Object[]` |
| onChange | 当发生改变时候，调用此函数 | function | - |

其他属性参见[Select, Radio, Checkbox](https://ant.design/index-cn)
