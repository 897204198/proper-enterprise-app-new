
展示行列数据。

### 何时使用
-  可编辑table


## API

#### OopTableForm
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 可以配置组件列的column属性 | Array | - |
| loading | 加载状态 | boolean | - |
| onChange | table的change事件 | function(type, item) | - |
| value | 列表数据 | Array | - |

#### OopTableForm.columns
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 列标题 | string | - |
| dataIndex | 列数据在数据项中对应的 key | string | - |
| key | React 需要的 key | string | - |
| defaultValue | 默认值 | any | - |
| required | 是否必须存在 | boolean | false |
| render | 生成复杂数据的渲染函数，参数分别为当前行的值，当前行数据，行索引, record.editable配置编辑状态下组件	 | Function(text, record, index) {} | - |

以上属性皆为必须，其他属性详见antd的[Table](https://ant.design/components/table-cn/)组件
