import React from 'react';
import { Card } from 'antd';
import OopTable from '@pea/components/OopTable';

class App extends React.Component {
  state = {
  }
  handleCreate = ()=>{
    console.log('do your create option here');
  }
  handleEdit = (record)=>{
    console.log('do your edit option here');
  }
  handleRemove = (record)=>{
    console.log('do your remove option here');
  }
  handleBatchRemove = (records)=>{
    console.log('do your batch remove option here');
  }
  render() {
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
        onClick: ()=>{ this.handleCreate }
      },
      {
        text: '删除',
        name: 'batchDelete',
        icon: 'delete',
        display: items=>(items.length > 0),
        onClick: (items)=>{ this.handleBatchRemove }
      },
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.handleEdit },
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record)=>{ this.handleRemove },
      },
    ];
    return (
    <Card>
      <OopTable
        grid={{list}}
        columns={columns}
        topButtons={topButtons}
        rowButtons={rowButtons}
      />
    </Card>
    );
  }
}

ReactDOM.render(<App />, mountNode);
