## 具有右键功能的tree

当调用组件后穿 onRightClickConfig 字段，表示配置右键功能，不传则不具备右键功能。例子如下：           onRightClickConfig: {
              menuList,
              rightClick: (data)=>{
                this.rightClick(data)
              },
            }
下面是调用OopTreeTable并增加右键功能。（可参照Dictionary页面）
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

下面具体说明一下各个参数：
1.menuList：是右键弹出框的配置菜单。示例如下：
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
   · icon:图标配置。
   · text:按钮内容配置。
   · name：该按钮名称（标识）。
   · disabled: 是否为禁用状态。
   · onClick: 点击后的处理函数。
   · reader： 点击按钮后，需要使用的form表单。
2.rightClick：右键点击接口(可参照ant design)。    
