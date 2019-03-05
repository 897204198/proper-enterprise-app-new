import React, { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
// import pathToRegexp from 'path-to-regexp';
import { Breadcrumb, Tabs } from 'antd';
import classNames from 'classnames';
import { getMenuData } from '@framework/common/frameHelper';
import styles from './index.less';


const { TabPane } = Tabs;

// function getBreadcrumb(breadcrumbNameMap, url) {
//   let breadcrumb = {};
//   Object.keys(breadcrumbNameMap).forEach((item) => {
//     if (pathToRegexp(item).test(url)) {
//       breadcrumb = breadcrumbNameMap[item];
//     }
//   });
//   return breadcrumb;
// }

export default class PageHeader extends PureComponent {
  static contextTypes = {
    routes: PropTypes.array,
    params: PropTypes.object,
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  onChange = (key) => {
    if (this.props.onTabChange) {
      this.props.onTabChange(key);
    }
  };
  getBreadcrumbProps = () => {
    return {
      routes: this.props.routes || this.context.routes,
      params: this.props.params || this.context.params,
      routerLocation: this.props.location || this.context.location,
      breadcrumbNameMap: this.props.breadcrumbNameMap || this.context.breadcrumbNameMap,
    };
  };
  // Generated according to props
  conversionFromProps= () => {
    const {
      breadcrumbList, linkElement = 'a',
    } = this.props;
    return (
      <Breadcrumb className={styles.breadcrumb}>
        {breadcrumbList.map(item => (
          <Breadcrumb.Item key={item.title}>
            {item.href ? (createElement(linkElement, {
          [linkElement === 'a' ? 'href' : 'to']: item.href,
        }, item.title)) : item.title}
          </Breadcrumb.Item>
      ))}
      </Breadcrumb>
    );
  }
  // conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
  //   if (!routerLocation && !breadcrumbNameMap) {
  //     return null;
  //   }
  //   const { linkElement = 'a' } = this.props;
  //   // Convert the path to an array
  //   const pathSnippets = routerLocation.pathname.split('/').filter(i => i);
  //   // Loop data mosaic routing
  //   const extraBreadcrumbItems = pathSnippets.map((_, index) => {
  //     const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
  //     const currentBreadcrumb = getBreadcrumb(breadcrumbNameMap, url);
  //     const isLinkable = (index !== pathSnippets.length - 1) && currentBreadcrumb.component;
  //     return currentBreadcrumb.name && !currentBreadcrumb.hideInBreadcrumb ? (
  //       <Breadcrumb.Item key={url}>
  //         {createElement(
  //           isLinkable ? linkElement : 'span',
  //           { [linkElement === 'a' ? 'href' : 'to']: url },
  //           currentBreadcrumb.name,
  //         )}
  //       </Breadcrumb.Item>
  //     ) : null;
  //   });
  //   // Add crumbs from the first order menu
  //   const menuData = getMenuData();
  //   if (menuData.length) {
  //     const {pathname, search} = routerLocation;
  //     let path = pathname;
  //     if (path === '/outerIframe') {
  //       path = `${path}${search}`;
  //     }
  //     const menu = menuData.find((item) => {
  //       if (item.route === path) {
  //         return item;
  //       }
  //       return null;
  //     })
  //     if (menu) {
  //       const menuParent = menuData.find((item) => {
  //         if (item.id === menu.parentId) {
  //           return item
  //         }
  //         return null;
  //       })
  //       menuParent && extraBreadcrumbItems.unshift(
  //         <Breadcrumb.Item key="parent">
  //           {createElement('span', {to: '/' }, menuParent.name)}
  //         </Breadcrumb.Item>
  //       );
  //     }
  //   }
  //   // Add home breadcrumbs to your head
  //   extraBreadcrumbItems.unshift(
  //     <Breadcrumb.Item key="home">
  //       {createElement(linkElement, {
  //       [linkElement === 'a' ? 'href' : 'to']: '/' }, '首页')}
  //     </Breadcrumb.Item>
  //   );
  //   return (
  //     <Breadcrumb className={styles.breadcrumb}>
  //       {extraBreadcrumbItems}
  //     </Breadcrumb>
  //   );
  // }
  /**
   * 用menuData实现的Breadcrumb
   * @param routerLocation
   * @param breadcrumbNameMap
   * @returns {*}
   */
  conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
    if (!routerLocation && !breadcrumbNameMap) {
      return null;
    }
    const extraBreadcrumbItems = [];
    const { linkElement = 'a' } = this.props;
    // Add crumbs from the first order menu
    const menuData = getMenuData();
    if (menuData.length) {
      const {pathname, search} = routerLocation;
      let path = pathname;
      if (path === '/outerIframe') {
        path = `${path}${search}`;
      }
      const menu = menuData.find((item) => {
        if (item.route === path) {
          return item;
        }
        return null;
      })
      if (menu) {
        // 最后一级
        extraBreadcrumbItems.unshift(
          <Breadcrumb.Item key="parent">
            {createElement('span', {to: '/' }, menu.name)}
          </Breadcrumb.Item>
        );
        let {parentId} = menu;
        while (parentId) {
          const menuParent = menuData.find((item) => { // eslint-disable-line
            if (item.id === parentId) {
              return item
            }
            return null;
          });
          if (menuParent) {
            // 倒数第二级
            extraBreadcrumbItems.unshift(
              <Breadcrumb.Item key="parent">
                {createElement('span', {to: '/' }, menuParent.name)}
              </Breadcrumb.Item>
            );
            const {parentId: pid} = menuParent;
            parentId = pid;
          } else {
            parentId = null;
          }
        }
      }
    }
    // 第一级根节点
    extraBreadcrumbItems.unshift(
      <Breadcrumb.Item key="home">
        {createElement(linkElement, {
        [linkElement === 'a' ? 'href' : 'to']: '/' }, '首页')}
      </Breadcrumb.Item>
    );
    return (
      <Breadcrumb className={styles.breadcrumb}>
        {extraBreadcrumbItems}
      </Breadcrumb>
    );
  }
  /**
   * 将参数转化为面包屑
   * Convert parameters into breadcrumbs
   */
  conversionBreadcrumbList = () => {
    const { breadcrumbList } = this.props;
    const { routes, params, routerLocation, breadcrumbNameMap } = this.getBreadcrumbProps();
    if (breadcrumbList && breadcrumbList.length) {
      return this.conversionFromProps();
    }
    // 如果传入 routes 和 params 属性
    // If pass routes and params attributes
    if (routes && params) {
      return (
        <Breadcrumb
          className={styles.breadcrumb}
          routes={routes.filter(route => route.breadcrumbName)}
          params={params}
          itemRender={this.itemRender}
        />
      );
    }
    // 根据 location 生成 面包屑
    // Generate breadcrumbs based on location
    if (location && location.pathname) {
      return this.conversionFromLocation(routerLocation, breadcrumbNameMap);
    }
    return null;
  }
  // 渲染Breadcrumb 子节点
  // Render the Breadcrumb child node
  itemRender = (route, params, routes, paths) => {
    const { linkElement = 'a' } = this.props;
    const last = routes.indexOf(route) === routes.length - 1;
    return (last || !route.component)
      ? <span>{route.breadcrumbName}</span>
      : createElement(linkElement, {
        href: paths.join('/') || '/',
        to: paths.join('/') || '/',
      }, route.breadcrumbName);
  }
  renderPageHeader = (props)=>{
    const {
      title, logo, action, content, extraContent, clsString,
      // breadcrumb,
      tabList, activeKeyProps
    } = props;
    if (!logo && !title && !action && !content && !extraContent) {
      return null;
    }
    return (
      <div className={clsString}>
         {/* {breadcrumb} */}
        <div className={styles.detail}>
          {logo && <div className={styles.logo}>{logo}</div>}
          <div className={styles.main}>
            <div className={styles.row}>
              {title && <h1 className={styles.title}>{title}</h1>}
              {action && <div className={styles.action}>{action}</div>}
            </div>
            <div className={styles.row}>
              {content && <div className={styles.content}>{content}</div>}
              {extraContent && <div className={styles.extraContent}>{extraContent}</div>}
            </div>
          </div>
        </div>
        {
          tabList &&
          tabList.length && (
            <Tabs
              className={styles.tabs}
              {...activeKeyProps}
              onChange={this.onChange}
            >
              {
                tabList.map(item => <TabPane tab={item.tab} key={item.key} />)
              }
            </Tabs>
          )
        }
      </div>
    );
  }
  render() {
    const {
      title, logo, action, content, extraContent,
      tabList, className, tabActiveKey,
    } = this.props;
    const clsString = classNames(styles.pageHeader, className);

    let tabDefaultValue;
    if (tabActiveKey !== undefined && tabList) {
      tabDefaultValue = tabList.filter(item => item.default)[0] || tabList[0];
    }
    const breadcrumb = this.conversionBreadcrumbList();
    const activeKeyProps = {
      defaultActiveKey: tabDefaultValue && tabDefaultValue.key,
    };
    if (tabActiveKey !== undefined) {
      activeKeyProps.activeKey = tabActiveKey;
    }

    return this.renderPageHeader({
      tabList, activeKeyProps, title, logo, action, content, extraContent, clsString, breadcrumb
    });
  }
}
