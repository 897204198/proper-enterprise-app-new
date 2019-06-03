import React from 'react';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import OopTable from '@pea/components/OopTable';
import OopSearch from '@pea/components/OopSearch';
import UIDocument from '../components/UIDocument';


const gridList = [
  {id: '1', username: '此条不可以选择，已开启disable属性', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: true},
  {id: '2', username: 'shasha', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
  {id: '3', username: 'haha', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
  {id: '4', username: 'wawa', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
  {id: '5', username: 'guagua', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
  {id: '6', username: 'lala', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false},
  {id: '7', username: 'niuniu', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: false, superuser: false},
  {id: '8', username: 'jiujiu', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: false, superuser: false},
  {id: '9', username: 'leilei', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: false, superuser: false},
  {id: '10', username: 'hahahah', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: false, superuser: false},
  {id: '11', username: '123123', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: false, superuser: false},
  {id: '12', username: '123123123', password: '123456', name: '77777', email: '132333232@qq.com', phone: '13236676767', enable: true, superuser: false}
];
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

@inject(['authUser', 'global'])
@connect(({authUser, global, loading}) => ({
  authUser,
  global,
  loading: loading.models.authUser,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class OopTableUIDOC extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: gridList,
      filterList: gridList,
    }
  }
  componentDidMount() {
    this.onLoad()
  }
  onLoad = (param = {}) => {
    this.oopSearch2.load(param);
  }
  render() {
    const { filterList, list } = this.state;
    const { global: { oopSearchGrid } } = this.props;
    const filterSearch = (inputValue, filter) => {
      this.setState({
        filterList: inputValue ? filter(list, ['username', 'phone', 'email']) : list
      })
    }
    const component = (
      <OopTable
        columns={columns}
        grid={{ list: list.map(item=>({...item, disabled: item.superuser === true})) }}
        topButtons={topButtons}
        rowButtons={rowButtons}
      />
    )
    const component2 = (
      <div>
          <OopSearch
              placeholder="请输入"
              enterButtonText="搜索"
              moduleName="authusers"
              ref={(el2)=>{ this.oopSearch2 = el2 && el2.getWrappedInstance() }}
              style={{ marginBottom: 20}}
            />
            <OopTable
              grid={{...oopSearchGrid,
                list: oopSearchGrid.list.map(item=>({...item, disabled: item.superuser === true}))}}
              columns={columns}
              onLoad={this.onLoad}
              topButtons={topButtons}
              rowButtons={rowButtons}
              showTableInfo
              ref={(el2)=>{ this.oopTable2 = el2 }}
            />
      </div>
    )
    const component3 = (
      <div>
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            onInputChange={filterSearch}
            ref={(el) => { this.oopSearch = el && el.getWrappedInstance() }}
            style={{ marginBottom: 20}}
          />
          <OopTable
            grid={{list: filterList.map(item=>({...item, disabled: item.superuser === true})) }}
            columns={columns}
            topButtons={topButtons}
            rowButtons={rowButtons}
          />
      </div>
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: '一个简单的OopTable用法(数据为假数据，筛选排序可查看控制台请求)'},
      {component: component2, fileName: 'demo2.md', title: '基本用法', desc: '一个简单的OopTable的后台分页用法(数据为假数据，筛选排序可查看控制台请求)'},
      {component: component3, fileName: 'demo3.md', title: '高级用法', desc: '一个高级的OopTable静态搜索用法'},
    ]
    return (<UIDocument name="OopTable" option={option} />)
  }
}
