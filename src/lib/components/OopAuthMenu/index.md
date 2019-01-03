
category | type | title | subtitle 
| -------- | -----: | :----:|  :----: |
Components | Data Display | OopAuthMenu | 树形菜单 

此组件属于复合组件包括搜索框、树形显示数据、树形选择功能。

- **搜索框**: 依赖Search实现静态搜索，当前搜索关键字如有匹配，及在下面的树形列表中标记对应文字颜色
- **树形显示数据**：依赖Tree组件，可以收缩展示信息。
- **树形选择**：用树形结构展示所属关系，可以进行多层次的选择。


## 何时使用

展示层级的所属关系，需要搜索信息，对展示列表进行操作时使用。

## API

#### OopAuthMenu


| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 树形列表数据 | object | - |
| checkedAllKeys | 所有选中的项的key值 | object | - |
| onCheck | 点击单行选中改行并包括所有的子节点元素 | (checkedKeys, info) => void | - |

#### data
data 数据格式参见[Tree](https://ant.design/components/tree-cn/)  组件的数据格式 
## 其他属性
其他属性参见[Tree](https://ant.design/components/tree-cn/)组件
