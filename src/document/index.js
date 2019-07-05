import React from 'react';
import { Menu, Icon, Layout } from 'antd';
import { addRoutersData, initRouter } from '@framework/common/frameHelper';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { Route, Switch } from 'dva/router';
import styles from './index.less';

const componentNames = ['OopTable', 'OopSearch', 'OopTree', 'OopTreeTable', 'OopForm', 'OopUpload', 'OopOrgEmpPicker', 'OopModal', 'OopCollapse', 'OopAnswer', 'OopTableForm'];
const docuRouters = {};
componentNames.forEach((it)=>{
  docuRouters[`/document/${it.toLowerCase()}`] = {
    component: ()=>import(`@/document/UI${it}`),
    name: it
  }
})
// Pupa doc
docuRouters['/document/pupa/basic'] = {
  component: ()=>import('@/document/UIPupa/Basic'),
  name: '基本使用'
}
docuRouters['/document/pupa/advance'] = {
  component: ()=>import('@/document/UIPupa/Advance'),
  name: '高级用法'
}
docuRouters['/document/pupa/item-demo'] = {
  component: ()=>import('@/document/UIPupa/ItemDemo'),
  name: '高级用法'
}
const routers = initRouter(docuRouters);
addRoutersData(routers);

const { SubMenu } = Menu;
const MenuItemGroup = Menu.ItemGroup;

export default class Document extends React.PureComponent {
  state = {
    selectedKeys: []
  }
  componentDidMount() {
  }

  handleClick = (menu)=>{
    // console.log(menu)
    this.setState({
      selectedKeys: [menu.key]
    })
  }
  render() {
    const { selectedKeys } = this.state;
    console.log(selectedKeys)
    const menu = (
      <Menu
        onClick={this.handleClick}
        style={{ width: 256 }}
        selectedKeys={selectedKeys}
        openKeys={['sub1']}
        mode="inline"
      >
        <SubMenu key="sub1" title={<span><Icon type="snippets" /><span>PEA Developer Guide</span></span>}>
          <MenuItemGroup key="g1" title="Oop组件">
            {
              componentNames.map(it=>(
                <Menu.Item key={it}><a href={`#/document/${it.toLowerCase()}`}>{it}</a></Menu.Item>
              ))
            }
          </MenuItemGroup>
          <MenuItemGroup key="g2" title={<span style={{fontWeight: 'bold'}}>Pupa</span>}>
            <Menu.Item key="3"><a href="#/document/pupa/basic">基本使用</a></Menu.Item>
            <Menu.Item key="4"><a href="#/document/pupa/advance">高级用法</a></Menu.Item>
            <Menu.Item key="5"><a href="#/document/pupa/item-demo">项目中的实例</a></Menu.Item>
            <Menu.Item key="6"><a href="#/document/pupa/api">详细配置</a></Menu.Item>
          </MenuItemGroup>
        </SubMenu>
      </Menu>
    );
    return (
    <PageHeaderLayout>
      <div className={styles.container}>
        {menu}
        <Layout style={{marginLeft: 16}}>
          <Switch>
            {
              Object.keys(routers).map(key=>(
                <Route
                  key={key}
                  path={key}
                  component={routers[key].component}
                  exact={true} />
              ))
            }
          </Switch>
        </Layout>
      </div>
    </PageHeaderLayout>
    )
  }
}
