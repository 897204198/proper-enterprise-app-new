import React from 'react';
import OopSearch from '@pea/components/OopSearch';
import OopTable from '@pea/components/OopTable';

  const gridList = [
      {id: '1', username: '此条不可以选择，已开启disable属性', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: true},
      {id: '2', username: 'shasha', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '3', username: 'haha', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '4', username: 'wawa', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '5', username: 'guagua', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '6', username: 'lala', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '7', username: 'niuniu', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '8', username: 'jiujiu', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '9', username: 'leilei', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '10', username: 'hahahah', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '11', username: '123123', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
      {id: '12', username: '123123123', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false}
    ];

export default class App extends React.Component {
  componentDidMount() {
    this.onLoad()
  }
  onLoad = (param = {}) => {
    this.oopSearch.load(param);
  }
  render() {
      const { global: { oopSearchGrid } } = this.props;
      const columns = [
        {
          title: '姓名',
          dataIndex: 'username',
          key: 'username',
        }, {
          title: '在职',
          dataIndex: 'enable',
          key: 'enable',
          filters: [{
            text: '在职',
            value: true,
          }, {
            text: '离职',
            value: false,
          }],
          render: (text) => {
            return <span>{text === true ? '在职' : '离职'}</span>
          }
        }, {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
        }, {
          title: '电话',
          dataIndex: 'phone',
          key: 'phone',
          sorter: true
        }
      ];
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
    return (
      <div>
          <OopSearch
              placeholder="请输入"
              enterButtonText="搜索"
              moduleName="authusers"
              ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
            />
            <OopTable
              grid={{...oopSearchGrid,
                list: oopSearchGrid.list.map(item=>({...item, disabled: item.superuser === true}))}}
              columns={columns}
              onLoad={this.onLoad}
              topButtons={topButtons}
              rowButtons={rowButtons}
              showTableInfo
              ref={(el)=>{ this.oopTable = el }}
            />
      </div>
    );
  }
}
