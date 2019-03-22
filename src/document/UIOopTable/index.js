import React from 'react';
import OopTable from '@pea/components/OopTable';
import UIDocument from '../components/UIDocument';


const list = [{
  key: '1',
  name: '胡彦斌',
  age: 32,
  address: '西湖区湖底公园1号'
}, {
  key: '2',
  name: '胡彦祖',
  age: 42,
  address: '西湖区湖底公园1号'
}];
const columns = [{
  title: '姓名',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '年龄',
  dataIndex: 'age',
  key: 'age',
}, {
  title: '住址',
  dataIndex: 'address',
  key: 'address',
}];
const topButtons = [
  {
    text: '新建',
    name: 'create',
    type: 'primary',
    icon: 'plus',
    onClick: ()=>{ console.log('do your create option here'); }
  },
  {
    text: '删除',
    name: 'batchDelete',
    icon: 'delete',
    display: items=>(items.length > 0),
    onClick: (items)=>{ console.log('do your batch remove option here', items); }
  },
];
const rowButtons = [
  {
    text: '编辑',
    name: 'edit',
    icon: 'edit',
    onClick: (record)=>{ console.log('do your edit option here', record) },
  },
  {
    text: '删除',
    name: 'delete',
    icon: 'delete',
    confirm: '是否要删除此条信息',
    onClick: (record)=>{ console.log('do your remove option here', record) },
  },
];

export default class OopTableUIDOC extends React.PureComponent {
  state = {
    // markdown: null,
  }
  componentDidMount() {

  }
  render() {
    const component = (
      <OopTable
        grid={{list}}
        columns={columns}
        topButtons={topButtons}
        rowButtons={rowButtons}
      />
    )
    const component2 = (
      <OopTable
        grid={{list}}
        columns={columns}
        topButtons={topButtons}
      />
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: '一个简单的OopTable用法'},
      {component: component2, fileName: 'demo2.md', title: '高级用法', desc: '一个高级的OopTable用法'},
    ]
    return (<UIDocument name="OopTable" option={option} />)
  }
}
