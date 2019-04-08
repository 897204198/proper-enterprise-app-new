category | type | title | subtitle 
| -------- | -----: | :----:|  :----: |
Components | Data Display | OopTable | 表格列表|

展示行列数据。

### 何时使用
-  当有大量结构化的数据需要展现时；
-  当需要对数据进行排序、搜索、分页、自定义操作等复杂行为时。


## API

#### OopTable
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| actionColumn | 可以配置组件内置【操作】列的column属性，需注意无论如何配置title，width，render这三个属性会被组件内部重写 | object[] | - |
| checkable | 是否显示多选或单选框 | boolean | true |
| dataDefaultSelectedRowKeys | 已经选中的多选框 | object[] | - |
| grid | 列表数据和分页信息 | object | {list: object[],pagination:object} |
| multiple | 是否多选 | boolean | true |
| onLoad | 与OopSearch联合使用时，切换分页即刷新表格数据 |  (param = {})=> void | - |
| onSelectAll | 用户手动选择/取消选择所有列的回调 | Function(selected, selectedRows, changeRows) | - |
| onRowSelect |设置行的`点击事件`回调函数, 扩展至table.onRow.onClick | Function(record, index) | - |
| rowButtons | 显示在行中的按钮,如编辑，删除。主要对该条数据进行的操作 | object[ ] | - |
| selectTriggerOnRowClick | 用户选中或取消本行的多选框，是否调用它的回调函数，扩展table.onSelect属性 | boolean | false |
| topButtons | 显示在表格外部的按钮，一般为对整个表格数据进行的操作 | object[ ] | - |
| showTableInfo | 显示表格顶部的信息显示栏 | boolean | false |

其他属性详见antd的[Table](https://ant.design/components/table-cn/)组件

#### OopTable.topButtons

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| text | 按钮显示信息 | string\|ReactNode | - |
| name | 按钮唯一的名称 | string\|ReactNode | - |
| type | 设置按钮类型，可选值为 primary dashed danger(版本 2.7 中增加) 或者不设| string | - |
| icon | 设置按钮的图标类型 | string | - |
| onClick | click 事件的 handle | function | - |
| display | 是否现实该按钮 | string\|ReactNode | - |

详细参见 [Popconfirm](https://ant.design/components/popconfirm-cn/)
