import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import routersConfig from '@/config/sysRouters';
import {dependencies} from '@/config/config';
import pathToRegexp from 'path-to-regexp/index';

function firstUpperCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    // hack 后台路径不是以斜线开头
    if (item.route.charAt(0) !== '/') {
      item.route = '/'.concat(item.route);
      item.path = item.route;
    }
    keys[item.route] = { ...item };
    if (item.children) {
      keys = { ...keys, ...getFlatMenuData(item.children) }
    }
  });
  return keys;
}
// 把带url参数的path去掉 列如：a/b?c=1 => a/b
function clearPathParam(path) {
  const index = path.indexOf('?');
  return index > 0 ? path.substr(0, index) : path;
}
// 通过modelUrl解析出modelName
// 如通过authUser解析出Auth
function exchangePath2Router(path) {
  const result = [];
  const paths = path.split('/');
  const emptyStr = paths[0];
  if (emptyStr === '') {
    // 去掉第一个空格
    paths.shift();
  }
  paths.forEach((item) => {
    let it = item;
    if (item.indexOf('?') > 0) {
      it = clearPathParam(item);
    }
    if (it.indexOf('-') > 0) {
      let arr = '';
      it.split('-').forEach((sItem) => {
        arr += firstUpperCase(sItem);
      });
      if (arr) {
        result.push(arr);
      }
    } else {
      result.push(firstUpperCase(it));
    }
  });
  // const routePath = result.join('/');
  const [moduleName, ...pathName] = result;
  return {
    moduleName,
    pathName: pathName.join('/')
  };
}
// wrapper of dynamic
const dynamicWrapper = (component) => {
  return dynamic({
    app: {},
    models: () => [],
    component: () => {
      const result = component();
      if (result) {
        if (result.then) {
          return result.then((raw) => {
            const Component = raw.default || raw;
            return props => createElement(Component, {
              ...props,
              routerData: getRouterData(),
            });
          });
        } else {
          return (props) => {
            return createElement(result.default, {
              ...props,
              routerData: getRouterData(),
            });
          };
        }
      }
    },
  });
};

// 初始化路由数据
export const initRouter = (routerConfig)=>{
  const router = {};
  for (const path in routerConfig) {
    const com = routerConfig[path]
    if (com && com.component) {
      const component = {component: dynamicWrapper(com.component)};
      if (com.name) {
        component.name = com.name
      }
      router[path] = component;
    }
  }
  return router
}

let _menuData = [];
let _routerData = initRouter(routersConfig);

// 获取路由数据
export const getRouterData = ()=> _routerData;

// 获取菜单数据
export const getMenuData = ()=> _menuData;

// 添加路由数据
export const addRoutersData = (routerData)=> {
  if (routerData) {
    _routerData = Object.assign(_routerData, routerData)
    return _routerData
  }
}

// 添加菜单数据
export const addMenuData = (menuData)=> {
  if (menuData) {
    menuData.forEach((item) => {
      if (item.route.charAt(0) !== '/') {
        item.route = '/'.concat(item.route);
      }
    })
    _menuData = Object.assign(_menuData, menuData)
    return _menuData
  }
}

// 通过菜单数据转换路由数据
export const getRouterDataFromMenuData = (res)=>{
  const routerConfig = {};
  const routerData = {};
  const menuData = getFlatMenuData(res);
  for (const k of Object.keys(menuData)) {
    const menu = menuData[k];
    const pathname = clearPathParam(k);
    if (!menu.hideInMenu && (!menu.children || menu.subRoute)) {
      const { moduleName, pathName } = exchangePath2Router(k);
      if (moduleName) {
        const originRouter = getRouterData();
        if (originRouter[`${pathname}`] === undefined) {
          if (pathName) {
            routerConfig[`${pathname}`] = getPageEntryByDependencies(dependencies, moduleName, pathName)
          } else {
            routerConfig[`${pathname}`] = {
              component: dynamicWrapper(()=> import(`@/lib/modules/${moduleName}/pages`))
            };
          }
        }
      }
    }
  }
  // The route matches the menu
  Object.keys(routerConfig).forEach((path) => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name
    };
    routerData[path] = router;
  });
  return routerData;
}

function is404Exception(errMsg) {
  return errMsg.includes('Cannot find module');
}
function handleError(moduleName, pathName, err) {
  if (is404Exception(err.message)) {
    console.error(`No matching page found named '/${moduleName}/${pathName}'`);
    // window.location.replace(`${location.pathname}#/404`);
    return require('../components/Exception/404');
  } else {
    console.error(err);
    return require('../components/Exception/500');
  }
}

// 通过依赖获取页面的入口
function getPageEntryByDependencies(des = [], moduleName, pathName) {
  if (!Array.isArray(des)) {
    console.error('dependencies must be array !');
  }
  const { length } = des;
  const fn = ()=> {
    let route = null;
    try {
      route = require(`@/lib/modules/${moduleName}/pages/${pathName}`);
    } catch (e) {
      if (is404Exception(e.message)) {
        if (length === 0) {
          route = handleError(moduleName, pathName, e);
        } else {
          for (let i = length - 1; i >= 0; i--) {
            try {
              const root = des[i];
              route = require(`@proper/${root}-lib/modules/${moduleName}/pages/${pathName}`);
              break;
            } catch (err) {
              if (!is404Exception(err.message)) {
                route = handleError(moduleName, pathName, err);
                break;
              }
            }
          }
        }
      } else {
        route = handleError(moduleName, pathName, e)
      }
    }
    return route;
  }
  return {
    component: dynamicWrapper(fn)
  }
}
