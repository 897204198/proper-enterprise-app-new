### 何时使用

- 带搜索的菜单
- 右键功能菜单
- 一般时配合oopTreeTable使用

## API

#### OopTree

| 参数 | 说明 | 类型 | 默认值 |
  | --- | --- | --- | --- |
  | title | 菜单标题 | string | - |
  | treeLoading | 菜单加载loading | boolean | - |
  | treeData | 菜单数据 | [] | - |
  | treeRoot | 根菜单 | object | - |
  | defaultSelectedKeys | 默认选中菜单 | string | - |
  | defaultExpandedKeys | 默认扩展菜单 | string | - |
  | size | 大小 | string | - |
  | onTreeNodeSelect | 菜单选中处理函数 | () => void | - |
  | onRightClickConfig | 右键配置项 | object | - |

#### OopTree.onRightClickConfig

| 参数 | 说明 | 类型 | 默认值 |
  | --- | --- | --- | --- |
  | icon | 图标配置 | string | - |
  | text | 按钮内容配置 | string | - |
  | name | 该按钮名称（标识） | string | - |
  | disabled | 是否为禁用状态 | boolean | - |
  | onClick | 点击后的处理函数 | (record) => void | - |
  | confirm | 组件内置的简单弹框，如有个性化需求请扩展onClick方法已达到个性化效果 | string | - |
  | render | 点击按钮后，需要使用的form表单， 注意：onClick和render 属性不能同时使用会导致两个功能同时失效 | object | - |

  ```
  注意：    
        当有confirm 属性时，onClick 属性此时是弹窗的【确认】回调函数
        当没有confirm 属性时，点击事件还是该菜单的点击事件回调函数
  ```

下面具体说明一下各个参数：
1.menuList：是右键弹出框的配置菜单。示例如下：
```       
        onRightClickConfig: {
          menuList,
          rightClick: (data)=>{
            this.rightClick(data)
          },
        }
        const menuList = [
          {
            icon: 'folder-add',
            text: '增加',
            name: 'add',
            disabled: false,
            onClick: (record) => {
              this.treeListAdd(record)
            },
            render: (
                <TreeForm
                  onSubmit={(values)=>{ this.handlePopoverAddSub(values) }}
                  onCancel={()=>{ this.handlePopoverC() }}
                />)
          }]
```
  
  ### 删除按钮-重写onClick

  ```
    treeListDelete = ()=>{
    const { app: { treeData } } = this.props;
    if (treeData.length > 1) {
      Modal.confirm({
        title: '提示',
        content: '是否确认删除该问题分类',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          console.log('ok')
        }
      });
    } else {
      Modal.info({
        title: '至少要保留一个项目',
        okText: '知道了'
      });
    }
  }
   const menuList = [
        {
          confirm: '确认删除这条信息吗？',
          icon: 'delete',
          text: '删除',
          disabled: deleteDisable,
          name: 'remove',
          onClick: (record) => {
            this.treeListDelete(record)
          }
        }
   ];
  ```
2.rightClick：右键点击接口(可参照ant design)。    
