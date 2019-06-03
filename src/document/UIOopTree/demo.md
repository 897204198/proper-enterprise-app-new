import React from 'react';
import OopTree from '@pea/components/OopTree';

export default class APP extends React.PureComponent {
  state = {

  }
  componentDidMount() {

  }
  handleTableTreeNodeSelect = () => {
    console.log('onTreeNodeSelect');
  }
  handleTreeListAdd = () => {
    console.log('handleTreeListAdd');
  }
  rightClick = () => {
    console.log('rightClick');
  }
  render() {
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
    const tree = {
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
      }
    }
    const menuList = [
      {
        icon: 'folder-add',
        text: '新建',
        name: 'add',
        disabled: false,
        onClick: ()=>{
          this.handleTreeListAdd()
        }
      }
    ];
    const OnRightClick = {
      menuList,
      rightClick: (data)=>{
        this.rightClick(data)
      },
    }
    return (
      <OopTree
        {...tree}
        size="small"
        onTreeNodeSelect={this.handleTableTreeNodeSelect}
        onRightClickConfig = {OnRightClick}
      />
    )
  }
}
