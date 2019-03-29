import React from 'react';
import { Menu, Icon, Layout } from 'antd';
import { addRoutersData, initRouter } from '@framework/common/frameHelper';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { Route, Switch } from 'dva/router';
import styles from './index.less';

const componentNames = ['OopTable', 'OopSearch', 'OopTree', 'OopTreeTable', 'OopForm', 'OopUpload'];
const docuRouters = {};
componentNames.forEach((it)=>{
  docuRouters[`/document/${it.toLowerCase()}`] = {
    component: ()=>import(`@/document/UI${it}`),
    name: it
  }
})
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
        defaultSelectedKeys={selectedKeys}
        defaultOpenKeys={['sub1']}
        mode="inline"
      >
        <SubMenu key="sub1" title={<span><Icon type="mail" /><span>Navigation One</span></span>}>
          <MenuItemGroup key="g1" title="数据展示类">
            {
              componentNames.map(it=>(
                <Menu.Item key={it}><a href={`#/document/${it.toLowerCase()}`}>{it}</a></Menu.Item>
              ))
            }
          </MenuItemGroup>
          <MenuItemGroup key="g2" title="Item 2">
            <Menu.Item key="3">Option 3</Menu.Item>
            <Menu.Item key="4">Option 4</Menu.Item>
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
    </PageHeaderLayout>)
  }
}
