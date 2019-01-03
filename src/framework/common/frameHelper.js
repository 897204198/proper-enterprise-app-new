import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import routersConfig from '../../config/sysRouters';
import app from '../index';

const initRouter = (routerConfig)=>{
  const router = {};
  for (const path in routerConfig) {
    const com = routerConfig[path]
    if (com && com.component) {
      router[path] = {component: dynamicWrapper(com.component)};
    }
  }
  return router
}
// wrapper of dynamic
export const dynamicWrapper = (component) => {
  return dynamic({
    app,
    models: () => [],
    component: () => {
      if (component().then) {
        return component().then((raw) => {
          const Component = raw.default || raw;
          return props => createElement(Component, {
            ...props,
            routerData: getRouterData(),
          });
        });
      } else {
        return (props) => {
          return createElement(component().default, {
            ...props,
            routerData: getRouterData(),
          });
        };
      }
    },
  });
};

let _menuData = [];
let _routerData = initRouter(routersConfig);

export const getRouterData = ()=> _routerData;
export const getMenuData = ()=> _menuData;
export const addRoutersData = (routerData)=> {
  if (routerData) {
    _routerData = Object.assign(_routerData, routerData)
    return _routerData
  }
}
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

