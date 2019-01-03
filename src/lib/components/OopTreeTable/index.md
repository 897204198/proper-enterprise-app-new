
category | type | title | subtitle 
| --- | --- | --- | --- |
Components | Data Display | OopTreeTable | 根据树形列表显示详细信息的复合组件 |


## 何时使用
展示树形数据，并对详细信息进行展示。

## API
#### OopTreeTable

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| table | 对Ooptable和OopSearch子组件的一些属性配置 | object | - |
| tree | 树形列表的所有配置属性 | object | - |
| size | 表格的大小尺寸 | string | - |
| onTableTreeNodeSelect | 传递树节点点击的回调函数 | () => void | - |

#### OopTreeTable.table

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 当前模块的名称 | string | - |
| oopSearch | 对OopSearch子组件进行配置 | object | - |

其他属性参见`OopTable`和`OopSearch`

#### OopTreeTable.tree

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 树形列表的标题 | string | - |
| treeLoading | 树形列表是否加载 | boolean | false |
| treeData | 树形列表显示数据集合 | object[] | - |
| treeTitle |   | string | - |
| treeKey |  | string | - |
| treeRoot | 树形列表的第一级参数配置| object | - |

#### OopTreeTable.tree.treeRoot

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 树节点的key值  | string | - |
| title |  | 树节点标题 | - |
| icon | 图标| string | - |

其他属性详见
- [tree](https://ant.design/components/tree-cn/)
- [table](https://ant.design/components/table-cn/)
- [input](https://ant.design/components/input-cn/)