# Pupa的高级用法

## Pupa的高级用法即是在`基本使用`的基础上，进行一些细化、复杂的配置

 ### 一.表单:
 #### 1.表单联动 配置一个`兑换时间`字段根据`兑换状态`字段隐藏、显示的表单写法
 ```
{
  label: '兑换时间',
  key: 'DatePicker2',
  component: {
    name: 'DatePicker'
  },
  name: 'convertDate',
  relateBtn: ['create', 'edit'],
  subscribe: [{
    name: 'convert',
    publish: [{
      value: true,
      property: 'display'
    }]
  }],
}
```
```
{
  label: '兑换状态',
  key: 'convert',
  name: 'convert',
  component: {
    name: 'RadioGroup',
    children: [{
      label: '未兑换',
      value: false
    },
    {
      label: '已兑换',
      value: true
    }]
  },
  relateBtn: ['create', 'edit'],
}
```

 #### 2.表单属性配置 配置一个`必填`且带有`正则表达式`的字段
```
{
  label: 'MAC地址',
  key: 'Input_VuC9cXSISI',
  component: {
    name: 'Input',
    props: {
      placeholder: '示例：58-FB-84-7D-33-EE'
    }
  },
  name: 'macaddress',
  relateBtn: ['create', 'edit'],
  rules: [{
    required: 'true',
    message: '此项为必填项'
  },
  {
    pattern: '/^[a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9]$/g',
    message: '输入格式错误'
  }]
}
```
 #### 3.表单关联按钮
  - 每个新建的字段都会有默认的`relateBtn`属性，值为:`['create', 'edit']`;
  - 每个`relateBtn`的值都会对应一个`gridConfig`中按钮的`key`;
  - 如果设置一个字段`relateBtn`的值为`merge`, 那么说明只有`key`为`merge`的按钮才能看到该字段;
  
```
{
  label: '只有标识为merge的按钮能看到我',
  key: 'Input_VuC9cXSISI',
  component: {
    name: 'Input'
  },
  name: 'testRelatBtn',
  relateBtn: ['merge']
}
```
 ### 二.列表:
 #### 1.列为`自定义渲染`
 
 ```
 (text) => {
   const value = text.map(item => item.name).join(',')
   return `<div title=${value} style="width: 200px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${value}</div>`
 }
 ```
 #### 2.列表扩展信息(列表上的蓝色扩展信息)
 ```
  (rowsData)=>`余额: ${rowsData.map(it=>(it.in ? parseInt(it.in) : 0) - (it.out ? parseInt(it.out) : 0)).reduce((pre,cur)=>pre + cur)}`
```
#### 3.列表自定义按钮
 
 | 参数 | 说明 | 类型 | 默认值 |
 | --- | --- | --- | --- |
 | 名称 | 按钮显示名称 | string | - |
 | 唯一标识 | 不可与其他重复 | string | - |
 | 位置 | 在列表上方还是行内 | 下拉菜单 | 顶部按钮 |
 | 类型 | 按钮的样式 | 下拉菜单 | - |
 | 图标 | 按钮的图标 | string | `file` |
 | 功能 | 点击按钮的行为 | string | - |
 | 确认信息 | 按钮点击后的确认信息 | string | - |
 | 显示 | 显示规则 | function | - |
 | 启/停用 | 是否启用 | boolean | true |

``功能`` 主要介绍一下：
 - 可以直接发送请求到后台
 - 可以直接发送redux action
 
 例如
```js
 配置信息为 /auth/getUser
```
那么发送给后台的restful请求为`/auth/getUser`;

```
  配置信息为 @pupaMedal/mergeMedal
```
那么发送`namespace` 为`pupaMedal`的 `model`中，调用`mergeMedal`方法;

#######注： 此处需要了解DVA的相关知识,若需了解请看这里 <https://dvajs.com/guide/>

