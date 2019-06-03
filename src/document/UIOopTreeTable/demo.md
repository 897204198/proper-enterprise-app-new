import React from 'react';
import OopTreeTable from '@pea/components/OopTreeTable';


const gridList = [{
  key: '1',
  name: '流程设置',
  route: '/workflow',
}, {
  key: '2',
  name: '权限设置',
  route: '/auth',
}];
const gridList2 = [{
  key: '1',
  name: '角色设置',
  route: '/role',
}, {
  key: '2',
  name: '信息设置',
  route: '/info',
}];
const gridList3 = [{
  key: '1',
  name: '用户组设置',
  route: '/user',
}, {
  key: '2',
  name: '推送设置',
  route: '/push',
}];

export default class APP extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: gridList,
      filterList: gridList,
      tableLoading: false,
    }
  }
  componentDidMount() {
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
  onLoad = () => {
    console.log('onLoad');
    const currentSelectTreeNode = this.oopTreeTable.getCurrentSelectTreeNode();
    const id = (currentSelectTreeNode && currentSelectTreeNode.key);
    this.setState({
      tableLoading: true
    })
    if (id === 'pep-workflow') {
      this.setState({
        list: gridList2,
        filterList: gridList2
      }, () => {
        this.setState({
          tableLoading: false
        })
      })
    } else if (id === 'pep-auth') {
      this.setState({
        list: gridList3,
        filterList: gridList3
      }, () => {
        this.setState({
          tableLoading: false
        })
      })
    } else {
      this.setState({
        list: gridList,
        filterList: gridList
      }, () => {
        this.setState({
          tableLoading: false
        })
      })
    }
  }
  preciseFiltrationGroups = (inputValue, filter) => {
    const filterList = inputValue ? filter(this.state.list, ['name', 'route']) : this.state.list;
    this.setState({
      filterList
    })
  }
  render() {
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
    const treeData = [
      {
        enable: false,
        icon: 'database',
        id: 'pep-workflow',
        key: 'pep-workflow',
        name: '流程设置',
        parentId: null,
        path: '/workflow',
        route: '/workflow',
        title: '流程设置',
        menuType: {
          catalog: 'MENU_TYPE',
          code: '0'
        }
      },
      {
        enable: false,
        icon: 'lock',
        id: 'pep-auth',
        key: 'pep-auth',
        name: '权限设置',
        parentId: null,
        path: '/auth',
        route: '/auth',
        title: '权限设置',
        menuType: {
          catalog: 'MENU_TYPE',
          code: '0'
        }
      }
    ]
    return (
      <OopTreeTable
        ref={(el)=>{ el && (this.oopTreeTable = el) }}
        table={{
          title: '下级菜单',
          grid: {
            list: this.state.filterList
          },
          columns,
          onLoad: this.onLoad,
          topButtons,
          loading: this.state.tableLoading,
          rowButtons,
          oopSearch: {
            onInputChange: this.preciseFiltrationGroups,
            placeholder: '请输入',
            enterButtonText: '搜索'
          }
        }}
        tree={{
          title: '菜单列表',
          treeLoading: false,
          defaultSelectedKeys: ['-1'],
          defaultExpandedKeys: ['-1'],
          treeData,
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
