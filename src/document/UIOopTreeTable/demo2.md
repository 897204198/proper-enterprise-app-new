import React from 'react';
import OopTreeTable from '@pea/components/OopTreeTable';

export default class APP extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: gridList,
      treeData2: []
    }
  }
  componentDidMount() {
    this.fetchTreeData();
    this.onLoad2();
  }
  onLoad2 = (param = {}) => {
    const currentSelectTreeNode = this.oopTreeTable2.getCurrentSelectTreeNode();
    let parentId = (currentSelectTreeNode && currentSelectTreeNode.key);
    const {pagination} = param;
    if (!parentId) {
      parentId = -1;
    }
    this.oopTreeTable2.oopSearch.load({
      pagination,
      parentId,
      menuEnable: 'ALL'
    })
  }
  onCreate = () => {
    console.log('onCreate');
  }
  onBatchDelete = () => {
    console.log('onBatchDelete');
  }
  onEdit = () => {
    console.log('onEdit');
  }
  onDelete = () => {
    console.log('onDelete');
  }
  fetchTreeData = () => {
    fetch('/auth/menus/parents').then((res) => {
      this.setState({
        treeData2: res
      })
    })
  }
  render() {
    const {
      loading,
      gridLoading,
      global: { oopSearchGrid }
    } = this.props;
    const columns = [
      {
        title: '菜单名称', dataIndex: 'name'
      },
      {
        title: '前端路径', dataIndex: 'route'
      }
    ]
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.onCreate() }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        onClick: (items)=>{ this.onBatchDelete(items) },
        display: items=>(items.length),
      }
    ]
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.onEdit(record) },
      }, {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此行',
        onClick: (record)=>{ this.onDelete(record) },
      },
    ]
    const { treeData2 } = this.state
    return (
      <OopTreeTable
      ref={(el2)=>{ el2 && (this.oopTreeTable2 = el2) }}
      table={{
        title: '下级菜单',
        grid: oopSearchGrid,
        onLoad: this.onLoad2,
        columns,
        topButtons,
        gridLoading,
        rowButtons,
        oopSearch: {
          moduleName: 'authmenus',
          placeholder: '请输入',
          enterButtonText: '搜索'
        }
      }}
      tree={{
        title: '菜单列表',
        treeLoading: loading,
        defaultSelectedKeys: ['-1'],
        defaultExpandedKeys: ['-1'],
        treeData: treeData2,
        treeTitle: 'name',
        treeKey: 'id',
        treeRoot: {
          key: '-1',
          title: '菜单',
          icon: 'laptop'
        },
      }}
    />
    )
  }
}
