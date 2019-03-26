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
    return (
    <Card>
      <OopTable
        grid={{list}}
        columns={columns}
        topButtons={topButtons}
      />
    </Card>
    );
  }
}

ReactDOM.render(<App />, mountNode);
