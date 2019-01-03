## 具有右键功能的tree

当调用组件后穿 onRightClickConfig 字段，表示配置右键功能，不传则不具备右键功能。例子如下：    
```
       onRightClickConfig: {
              menuList,
              rightClick: (data)=>{
                this.rightClick(data)
              },
            }
```
下面是调用OopTreeTable并增加右键功能。（可参照Dictionary页面）
```
        <OopTreeTable
          ref={(el)=>{ el && (this.oopTreeTable = el) }}
          table={{
            title: `${tableTitle}数据字典`,
            grid: {list: activeTableData},
            columns,
            gridLoading,
            onLoad: this.onLoad,
            topButtons,
            rowButtons,
            oopSearch: {
              onInputChange: this.filterTable,
              placeholder: '请输入',
              enterButtonText: '搜索'
            },
            checkable: false
          }}
          tree={{
            onRightClickConfig: {
              menuList,
              rightClick: (data)=>{
                this.rightClick(data)
              },
            },
            title: '数据字典项',
            treeLoading,
            treeData,
            treeTitle: 'catalogName',
            treeKey: 'id',
            treeRoot: {
              key: '-1',
              title: '所有',
            },
            defaultSelectedKeys: ['-1'],
            defaultExpandedKeys: ['-1'],
          }}
          size={size}
          onTreeNodeSelect={this.handleTableTreeNodeSelect}
        />
```
下面具体说明一下各个参数：
1.menuList：是右键弹出框的配置菜单。示例如下：
```
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

  ### 新建按钮-例子
  ```
   const menuList = [
         {
            icon: 'folder-add',
            text: '新建',
            name: 'add',
            disabled: false,
            onClick: ()=>{
              this.handleTreeListAdd()
            },
          }
   ];
  ```
2.rightClick：右键点击接口(可参照ant design)。    
