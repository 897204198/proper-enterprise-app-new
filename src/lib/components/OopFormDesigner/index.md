
category | type | title | subtitle 
| :--------: | :-----: | :----:|  :----: |
Components | Data Entry | OopFormDesigner  | 表单设计 |

我们为 OopFormDesigner 提供了以下两种排列方式：

-  横向排列：标签和表单控件水平排列；
-  纵向排列：标签和表单控件上下垂直排列；

## 何时使用

对表单进行自定义设计。

## API
#### OopFormDesigner

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formDetails | 模态窗口标题 | string | - |

#### OopFormDesigner.formDetails

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formJson | 通过拖拽或点击生成的表单模板 | object[] | - |
| formLayout | 设计表单的布局类型`horizontal`,`vertical` | string | - |

其他属性参见`OopForm`和[form](https://ant.design/components/form-cn/)