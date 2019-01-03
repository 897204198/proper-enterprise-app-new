
category | type | title | subtitle 
| -------- | -----: | :----:|  :----: |
Components | Data Entry | OopSearch | 多功能搜索

有搜索的输入框,扩展静态搜索和字段搜索功能。

- **静态搜索**: 
    - 通过字符串进行比较
    - 不支持`id`、`key`、`_`的column中的列名
    - 可以根据column的配置支持对应的字段
- **动态配置搜索**：
    - 按照输入的值调取数据进行查询，符合条件的值出现在下拉菜单中
    - 点击某一项后再点击```搜索```按钮,列表显示该条数据。


## 何时使用

需要进行搜索,需要配置搜索项时使用。

## API

##### OopSearch

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| placeholder | 输入框提示信息 | string | - |
| enterButtonText | 搜索按钮显示文字 | string\|ReactNode | - |
| onInputChange | 点击单行选中改行并包括所有的子节点元素 | (inputValue: any, filter: any) => void | - |
| extra | 对搜索组件的扩展 | string\|ReactNode | - |

##### OopSearch.onInputChage

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| inputValue | 输入框中输入的值 | string | - |
| filter | 组件内置的过滤方法```filterTableList``` |  (searchValue: any, tableList: any, columns: any) => any | - |
| columns | 自定义的字段配置 | object | - |
| extra | 对搜索组件的扩展 | string\|ReactNode | - |

其余属性与[Input.Search](https://ant.design/components/input-cn/#Input.Search)   一致。

`extra`扩展的组件属性参见对应的组件属性API

 **补充**
- 非静态搜索：需要对该搜索进行数据字典配置
- 静态搜索：静态搜索时如果需要对```boolearn```类型的值，如需要该字段```enable = true```
进行支持该类型的搜索，需要在module中对数据进行预处理，添加字段如enableStatus='已启用'，page中配置columns中添加该字段后，即可支持boolearn类型的字段进行搜索