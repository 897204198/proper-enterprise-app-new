
category | type | title | subtitle 
| :--------: | :-----: | :----:|  :----: |
Components | Data Entry | OopModal | 纵向标签页切换模态窗口 |

## 何时使用

展示多个标签页信息时使用

## API
#### OopModal

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 模态窗口标题 | string | - |
| visible | 是否显示此模态窗口 | boolean | false |
| closeConfirm | 关闭模态窗口时的提示信息 | object | - |
| closeConfirm.visible | 是否显示关闭模态窗口时的提示信息 | boolean | false |
| closeConfirmCancel |  | (warningWrapper) => void | - |
| onCancel | 关闭当前窗口 | function | - |
| onOk | 树形列表的所有配置属性 | function | - |
| onDelete | 删除该条数据 | function | - |
| isCreate | 是否为新建窗口 | boolean | true |
| loading | 判断是否显示加载样式 | boolean | false |
| onTabChange | 切换tab标签页  |  (activeKey: any) => void | - |
| tabs | 配置tab标签页属性，详见OopModal.tabs | object[] | - |

#### OopModal.tabs

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | tab 面板的 key | string | - |
| title | tab标题 | string | - |
| main |  | object | - |
| tips | 提示信息 | reactNode | - |
| content | tab标签显示内容 | reactNode | - |

其他属性参见[tabs](https://ant.design/components/tabs-cn/)和[modal](https://ant.design/components/modal-cn/)