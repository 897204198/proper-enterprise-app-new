
category | type | title | subtitle 
| -------- | -----: | :----:|  :----: |
Components | Data Entry | OopSelect | -

带过滤功能的下拉菜单。支持配置过滤的字段。

- **静态搜索**: 
    - 通过字符串进行比较
    - 可以根据配置的属性来过滤对应的字段。


## 何时使用

需要对下拉菜单中的内容进行静态搜索。

## API

##### OopSelect

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 下拉菜单的值 | Array [{label:string,value:string}] | [] |
| optionFilterPropName | `data`中指定过滤的字段 |  string | 'py' |

其余属性与`antd` [Select](https://ant.design/components/select-cn/) 组件  一致。


 **补充**
- 目前不支持`<OopSearch>`标签内部传递的`<Option>`的形式渲染

## 例子

````
const data = [
  {label: '上海', value: 'shanghai', py: 'sh'},
  {label: '北京', value: 'beijing', py: 'bj'},
  {label: '辽宁', value: 'liaoning', py: 'ln'},
  {label: '沈阳', value: 'shenyang', py: 'sy'},
  {label: '大连', value: 'dalian', py: 'dl'},
  {label: '日本', value: 'riben', py: 'rb'},
];
<OopSelect
     style={{ width: 200 }}
     placeholder="Select a person"
     data={data} />
````
 **性能**
  - 大概超过500条数据的静态过滤 页面会有明显卡顿现象
