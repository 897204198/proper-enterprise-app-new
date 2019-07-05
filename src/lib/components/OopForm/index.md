
category | type | title | subtitle 
| :--------: | :-----: | :----:|  :----: |
Components | Data Entry | OopForm  | 表单设计 |

我们为 OopForm 提供了以下两种排列方式：

-  横向排列：标签和表单控件水平排列；
-  纵向排列：标签和表单控件上下垂直排列；

## 何时使用

对表单进行自定义设计。

## API
### OopForm

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formJson |  表单模板 | object[] | - |
| formTitle |  表单标题 | string | - |
| defaultValue |  表单域初始值(formJson中定义initialValue时,initialValue优先级更高，以initialValue的值为准) | object | - |
| disabled |  组件禁用 | boolean | false |
| formLayout | 表单布局类型 `horizontal`（横向）和 `vertical`(纵向) | string | `horizontal` |
| formItemLayout | formJson中每个的布局配置 | object | - |
| columnsNum | 表单布局列数 | number | 1 |

其他属性参见[form](https://ant.design/components/form-cn/)

#### `OopForm.formJson[0]`

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| display |  是否渲染 | boolean | true |
| key |  唯一标识 | string | - |
| label |  字段名称 | string | - |
| component |  组件 | object | - |
| initialValue |  组件的初始值 | any | - |
| name |  同`html`标签的`name` | string | - |
| subscribe | 订阅的数据源 | Array | - |
| rules | 同[form](https://ant.design/components/form-cn/)的rules | Array | - |


#### `OopForm.formJson[0].component`

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name |  组件名称 | string | - |
| props |  组件的props | object | - |
| children | 组件名称 为`Select`,`RadioGroup`,`Checkbox`特有 | Array | - |


##########注 `OopForm.formJson[0].component` 也可以是一个返回`ReactNode`的函数


#### `OopForm.formJson[0].subscribe`


| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name |  订阅数据源的`name` | string | - |
| publish | 关联自己属性的配置  | Array | - |


#### `OopForm.formJson[0].subscribe[0].publish`


| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 设置关联自己属性的值| any | - |
| property | 关联自己属性  | string | - |

例子:
```ecmascript 6
 subscribe: [{
   name: 'convert',
   publish: [{
     value: true,
     property: 'display'
   }]
 }]
```
以上代码配置含义为：`name` 为 `convert` 的字段值发生变化的时候，
当前该字段的 `display` 属性会发生变化，变化逻辑为 `convert` 的字段值
是否等于`true`; 伪代码为：
```ecmascript 6
currentItem.display = getFormFieldValue(`convert`) === true;
```
以上`property`的值还可以配置成如下的形式:
```ecmascript 6
...
value: true,
property: 'component.props.disabled'
}]
```
含义如下，以伪代码表示：
```ecmascript 6
currentItem.component.props.disabled = getFormFieldValue(`convert`) === true;
```

以上`value`的值还可以配置成如下的形式:
```
...
value: function(changeValue, curValue) {
    return \'A,B\'.includes(changeValue) && (curValue.length > 0)
},
property: 'display'
}]
```

含义如下，以伪代码表示：
```ecmascript 6
currentItem.display = value(changeValue, currentValue)
```
