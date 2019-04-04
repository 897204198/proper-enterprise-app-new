
category | type | title | subtitle 
| :--------: | :-----: | :----:|  :----: |
Components | Data Entry | OopForm  | 表单设计 |

我们为 OopForm 提供了以下两种排列方式：

-  横向排列：标签和表单控件水平排列；
-  纵向排列：标签和表单控件上下垂直排列；

## 何时使用

对表单进行自定义设计。

## API
#### OopForm

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formJson |  表单模板 | object | - |
| formTitle |  表单标题 | string | - |
| defaultValue |  表单域初始值(formJson中定义initialValue时,defaultValue优先级更高，以defaultValue的值为准) | object | - |
| disabled |  组件禁用 | boolean | false |
| formLayout | 表单布局类型 `horizontal`（横向）和 `vertical`(纵向) | string | `horizontal` |
| formItemLayout | formJson中每个的布局配置 | object | - |
| columnsNum | 表单布局列数 | number | 1 |

其他属性参见[form](https://ant.design/components/form-cn/)
