
category | type | title | subtitle 
| :--------: | :-----: | :----:|  :----: |
Components | Data Entry | OopForm  | 表单设计 |

我们为 OopFormDesigner 提供了以下两种排列方式：

-  横向排列：标签和表单控件水平排列；
-  纵向排列：标签和表单控件上下垂直排列；

## 何时使用

对表单进行自定义设计。

## API
#### OopForm

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formJson |  表单模板 | object | - |
| dragable | 是否可以拖动 | boolean | - |
| formLayout | 表单布局类型 `horizontal`（横向）和 `vertical`(纵向) | string | - |
| rowItemClick | 点击单行回调函数 | (name: any) => void | - |
| rowItemIconCopy | 点击图标对组件进行复制的回调函数 |  (event: any, name: any) => void | - |
| rowItemIconDelete | 点击图标执行删除操作的回调函数 |  (event: any, name: any) => void | - |

其他属性参见[form](https://ant.design/components/form-cn/)