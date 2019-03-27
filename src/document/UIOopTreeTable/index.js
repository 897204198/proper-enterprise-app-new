import React from 'react';
import OopTreeTable from '@pea/components/OopTreeTable';
import UIDocument from '../components/UIDocument';

export default class OopTreeTableUIDOC extends React.PureComponent {
  state = {}
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
  }
  handleTableTreeNodeSelect = () => {
    console.log('onTreeNodeSelect');
  }
  render() {
    const gridList = [{
      key: '1',
      name: '流程设置',
      route: '/workflow',
    }, {
      key: '2',
      name: '权限设置',
      route: '/auth',
    }];
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
      }
    ]
    const component = (
      <OopTreeTable
        ref={(el)=>{ el && (this.oopTreeTable = el) }}
        table={{
          title: '下级菜单',
          grid: {
            list: gridList
          },
          columns,
          onLoad: this.onLoad,
          topButtons,
          rowButtons,
          oopSearch: {
            moduleName: 'authmenus',
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
        size="small"
        onTreeNodeSelect={this.handleTableTreeNodeSelect}
      />
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: 'OopTreeTable用法'},
    ]
    return (<UIDocument name="OopTreeTable" option={option} />)
  }
}
