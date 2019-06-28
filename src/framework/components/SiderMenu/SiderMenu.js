import React, { PureComponent } from 'react';
import { Layout, Menu, Icon, Input, Spin} from 'antd';
import pathToRegexp from 'path-to-regexp';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import * as properties from '@/config/properties';
import { matchInputStrForTargetStr } from '@framework/utils/utils';
import styles from './index.less';

const { Sider } = Layout;
const { SubMenu } = Menu;

const isReactObject = (component)=>{
  return component && component.$$typeof && component.$$typeof.toString() === 'Symbol(react.element)'
}
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

const Search = (props)=>{
  const {menuSearchValue, onSearch, collapsed, onSearchIconClick, self} = props;
  return (<div style={{padding: '12px 20px 4px 20px'}}>
    {collapsed ? <span className={styles.menuSearchIcon} onClick={onSearchIconClick}><Icon type="search" /></span> :
      <Input.Search
        allowClear
        onChange={onSearch}
        placeholder="搜索"
        defaultValue={menuSearchValue}
        ref={(el) => { self.searchInput = el }}
      />
    }
  </div>)
}


export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
      selectedKeys: [],
      menuSearchValue: undefined
    };
  }
  filterMenus = [];
  antMenusNodeCache = [];
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
  getMenuItemPath = (item, name) => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target } = item;
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
        title={name}
      >
        {icon}<span>{name}</span>
      </Link>
    );
  }
  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem=(item) => {
    const { menuSearchValue = '', selectedKeys } = this.state;
    let { name } = item;
    item.display = true;
    if (typeof name === 'string') {
      // 有值 准备过滤
      if (menuSearchValue !== '') {
        const hasValue = matchInputStrForTargetStr(item.name, menuSearchValue)
        if (hasValue) {
          name = (
            <span
              className={styles.primaryColor}
              style={{color: selectedKeys[0] === item.path ? 'black' : ''}}>
              {item.name}
          </span>)
        } else {
          item.display = false;
        }
      }
    }
    if (item.children && item.children.some(child => child.name)) {
      return (
        <SubMenu
          className={isReactObject(name) ? 'filtered' : ''}
          title={
            item.icon ? (
              <span>
                {getIcon(item.icon)}
                <span>{name}</span>
              </span>
            ) : name
          }
          key={item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    } else {
      if (item.display === false) {
        return null;
      }
      return (
        <Menu.Item key={item.path} name={item.name}>
          {this.getMenuItemPath(item, name)}
        </Menu.Item>
      );
    }
  }
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = (menusData, all) => {
    if (!menusData) {
      return [];
    }
    const filterMenus = menusData
      .filter(item => item.name && !item.hideInMenu)
      .map((item) => {
        return this.getSubMenuOrItem(item);
      })
      .filter(item => !!item);
    // 把菜单缓存起来 为搜索的时候用
    if (all) {
      this.filterMenus = filterMenus
    }
    setTimeout(()=>{
      // if (this.antMenusNodeCache.length === 0) {
      //   if (this.props.menuData.length > 0) {
      //     // 隐藏没有子节点的菜单
      //     if (this.state.menuSearchValue) {
      //       this.antMenusNodeCache = document.querySelectorAll('.ant-menu.ant-menu-sub');
      //     }
      //   }
      // }
      document.querySelectorAll('.ant-menu.ant-menu-sub').forEach((node)=>{
        const li = node.parentNode;
        let show = 'block';
        if (li) {
          if (this.state.menuSearchValue) {
            if (!li.className.includes('filtered')) {
              if (node.children.length === 0) {
                show = 'none';
              } else {
                show = Array.from(node.children).every(it=>it.style.display === 'none') ? 'none' : 'block'
              }
            }
          }
          li.style.display = show;
        }
      })
    })
    return filterMenus;
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
  handleOnSearch = (event)=>{
    const {value} = event.target;
    this.handleOnSearchDebounce(value)
  }
  @Debounce(300)
  handleOnSearchDebounce(menuSearchValue) {
    this.setState({
      menuSearchValue
    })
  }
  handleOnSearchIconClick = ()=>{
    const { onCollapse } = this.props;
    onCollapse(false);
    setTimeout(()=>{
      this.searchInput.focus();
    })
  }
  getOpenKeys = ()=>{
    const { openKeys, menuSearchValue } = this.state;
    const { collapsed } = this.props;
    if (!menuSearchValue) {
      return collapsed ? [] : openKeys
    } else {
      const menuItemKeys = [];
      const getKey = (reactNodes)=>{
        React.Children.forEach(reactNodes, (node)=>{
          if (node.type.isSubMenu === 1 || node.type.isMenuItem === 1) {
            menuItemKeys.push(node.key);
            if (node.props.children) {
              getKey(node.props.children)
            }
          }
        })
      }
      getKey(this.filterMenus);
      return menuItemKeys;
    }
  }
  render() {
    const { logo, collapsed, onCollapse } = this.props;
    const { selectedKeys, menuSearchValue } = this.state;
    const openKeys = this.getOpenKeys();
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
        <Search
          menuSearchValue={menuSearchValue}
          onSearch={this.handleOnSearch}
          collapsed={collapsed}
          onSearchIconClick={this.handleOnSearchIconClick}
          self={this}
        />
        <Menu
          key="Menu"
          theme="dark"
          mode="inline"
          {
            ...menuProps
          }
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys.length ? selectedKeys : [openKeys[openKeys.length - 1]]}
          onSelect={this.handleOnSelect}
          style={{ padding: '0 0 16px', width: '100%', height: 'calc(100vh - 104px)', overflowY: 'auto'}} >
          {this.getNavMenuItems(this.props.menuData, true)}
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
