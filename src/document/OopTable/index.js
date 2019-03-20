import React from 'react';
import {Card, Icon} from 'antd';
import Markdown from 'react-markdown';
import OopTable from '@pea/components/OopTable';
import styles from './index.less';

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
    onClick: ()=>{ console.log('start a create action!') }
  },
  {
    text: '删除',
    name: 'batchDelete',
    icon: 'delete',
    display: items=>(items.length > 0),
    onClick: (items)=>{ console.log(items) }
  },
];
const rowButtons = [
  {
    text: '编辑',
    name: 'edit',
    icon: 'edit',
    onClick: (record)=>{ console.log(record) },
  },
  {
    text: '删除',
    name: 'delete',
    icon: 'delete',
    confirm: '是否要删除此条信息',
    onClick: (record)=>{ console.log(record) },
  },
];

export default class OopTableUIDOC extends React.PureComponent {
  state = {
    markdown: null,
    showCode: false
  }
  componentDidMount() {
    const {pathname} = this.props.location;
    const {routerData} = this.props;
    const {name} = routerData[pathname];
    console.log(name);
    import(`@/lib/components/${name}/index.md`).then((res)=>{
      const markdownBase64 = res.substring(res.indexOf('base64,') + 7, res.length);
      const source = decodeURIComponent(escape(atob(markdownBase64)));
      console.log(source);
      this.setState({
        markdown: source
      })
    })
  }
  handleShowCode = ()=>{
    this.setState(({showCode})=>({
      showCode: !showCode
    }))
  }
  renderDemo = ()=>{
    const { showCode } = this.state;
    return (
    <div>
      <h1>代码演示</h1>
      <Card>
        <OopTable
          grid={{list}}
          columns={columns}
          topButtons={topButtons}
          rowButtons={rowButtons}
        />
        <div className={styles.tools}>
          <span className={styles.title}>基本用法</span>
          <div><p>一个简单的 loading 状态。</p></div>
          <span className={styles.toggleCode} onClick={this.handleShowCode}>
            {
              showCode ? <Icon type="eye" theme="twoTone" /> : <Icon type="eye-invisible" theme="twoTone" />
            }
          </span>
        </div>
      </Card>
    </div>)
  }
  render() {
    return (
    <div className={styles.container}>
      {
        this.renderDemo()
      }
      <h1>详细介绍</h1>
      <Card>
        <Markdown source={this.state.markdown} />
      </Card>
      </div>)
  }
}
