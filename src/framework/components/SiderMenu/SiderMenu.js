import React, { PureComponent } from 'react';
import { Layout, Menu, Icon, Spin} from 'antd';
import pathToRegexp from 'path-to-regexp';
import { Link } from 'dva/router';
import * as properties from '@/config/properties';
import styles from './index.less';

const { Sider } = Layout;
const { SubMenu } = Menu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = (icon) => {
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className={styles.icon} />;
  }
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
};

/* 根据pathname + search 查询出 最末级的菜单 menuData
 * 再记录出从root->leaf 之间的路径path
 */
const getMenuOpenPath = (nodePath, menuData = []) =>{
  let result = [];
  for (let i = 0; i < menuData.length; i++) {
    const menu = menuData[i];
    const ifExist = menu.path === nodePath;
    if (!ifExist) {
      if (menu.children) {
        result.push(menu.path);
        const r = getMenuOpenPath(nodePath, menu.children);
        if (r.length) {
          result = result.concat(r);
          break;
        } else {
          result.pop();
        }
      }
    } else {
      result.push(menu.path);
      break;
    }
  }
  return result;
}

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
      selectedKeys: []
    };
  }
  componentWillReceiveProps(nextProps) {
    const {location: {pathname: newPathname, search: newSearch}} = nextProps;
    const {location: {pathname, search}, menuData = []} = this.props;
    const newPath = `${newPathname}${newSearch}`;
    if (`${pathname}${search}` !== newPath || menuData.length > 0) {
      this.setState({
        openKeys: this.getDefaultCollapsedSubMenus(nextProps),
        selectedKeys: newPath === '/' ? [] : [newPath]
      });
    }
  }
  getDefaultCollapsedSubMenus(props) {
    const { location: { pathname, search }, menuData = [] } = props || this.props;
    const openMenuParentPath = getMenuOpenPath(`${pathname}${search}`, menuData);
    // console.log(openMenuParentPath);
    return openMenuParentPath;
  }
  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach((item) => {
      if (item.children) {
        keys.push(item.path);
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      } else {
        keys.push(item.path);
      }
    });
    return keys;
  }
  /**
   * Get selected child nodes
   * /user/chen => /user/:id
   */
  getSelectedMenuKeys = (path) => {
    const flatMenuKeys = this.getFlatMenuKeys(this.props.menuData);
    return flatMenuKeys.filter((item) => {
      return pathToRegexp(`${item}`).test(path);
    });
  }
  /**
  * 判断是否是http链接.返回 Link 或 a
  * Judge whether it is http link.return a or Link
  * @memberof SiderMenu
  */
  getMenuItemPath = (item) => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target, name } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}<span>{name}</span>
        </a>
      );
    }
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === this.props.location.pathname}
        onClick={this.props.isMobile ? () => { this.props.onCollapse(true); } : undefined}
      >
        {icon}<span>{name}</span>
      </Link>
    );
  }
  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem=(item) => {
    if (item.children && item.children.some(child => child.name)) {
      return (
        <SubMenu
          title={
            item.icon ? (
              <span>
                {getIcon(item.icon)}
                <span>{item.name}</span>
              </span>
            ) : item.name
            }
          key={item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    } else {
      return (
        <Menu.Item key={item.path} name={item.name}>
          {this.getMenuItemPath(item)}
        </Menu.Item>
      );
    }
  }
  /**
  * 获得菜单子节点
  * @memberof SiderMenu
  */
  getNavMenuItems = (menusData) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map((item) => {
        return this.getSubMenuOrItem(item);
      })
      .filter(item => !!item);
  }
  // conversion Path
  // 转化路径
  conversionPath=(path) => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  }
  handleOpenChange = (openKeys) => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const isMainMenu = this.props.menuData.some(
      item => lastOpenKey && (item.key === lastOpenKey || item.path === lastOpenKey)
    );
    this.setState({
      openKeys: isMainMenu ? [lastOpenKey] : [...openKeys],
    });
  }
  handleOnSelect = ({ selectedKeys })=>{
    this.setState({
      selectedKeys
    })
  }
  render() {
    const { logo, collapsed, onCollapse } = this.props;
    const { openKeys, selectedKeys } = this.state;
    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed ? {} : {
      openKeys,
    };
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="md"
        onCollapse={onCollapse}
        width={256}
        className={styles.sider}
      >
        <div className={styles.logo} key="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
            <h1>{properties.basicLayoutTitle}</h1>
          </Link>
        </div>
        <Menu
          key="Menu"
          theme="dark"
          mode="inline"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys.length ? selectedKeys : [openKeys[openKeys.length - 1]]}
          onSelect={this.handleOnSelect}
          style={{ padding: '16px 0', width: '100%', height: 'calc(100vh - 64px)', overflowY: 'auto'}} >
          {this.getNavMenuItems(this.props.menuData)}
        </Menu>
        {this.props.showMenusLoading && (
          <div className={styles.menuLoading}>
            <Spin size="large" />
          </div>
        )}
      </Sider>
    );
  }
}
