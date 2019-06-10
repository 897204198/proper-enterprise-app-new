import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Layout, Icon, message } from 'antd';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import OopWebSocket from '@pea/components/OopWebSocket';
import logo from '@/assets/logo.svg';
import {webImUrl, websocket} from '@/config/config';
import { getMenuData } from '@framework/common/frameHelper';
import * as properties from '@/config/properties';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../components/Exception/404';
import { getRoutes } from '../utils/utils';
import {inject} from '../common/inject';
import styles from './BasicLayout.less';


const { Content } = Layout;
let redirectData = [];
const specialPaths = ['/outerIframe', '/pupa'];
const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};
let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

@inject(['global', 'baseUser', 'baseLogin'])
@connect(({ baseUser, global, loading }) => ({
  currentUser: baseUser.currentUser,
  menus: baseUser.menus,
  routerData: baseUser.routerData,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))
export default class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
    oopWebSocket: PropTypes.object
  }
  state = {
    isMobile,
    marginLeft: '256px',
    showMenusLoading: true,
  };

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
      oopWebSocket: this.oopWebSocket
    };
  }
  componentDidMount() {
    enquireScreen((mobile) => {
      this.setState({
        isMobile: mobile,
      });
    });
    // 从localStorage里查看是否有token
    const token = window.localStorage.getItem('proper-auth-login-token');
    if (!token) {
      this.props.dispatch({
        type: 'baseLogin/logout'
      })
      return
    }
    // 从后台数据库加载菜单并且 按照菜单格式组装路由
    this.props.dispatch({
      type: 'baseUser/fetchMenus',
      payload: this.props.app,
      callback: () => {
        this.setState({
          showMenusLoading: false
        })
      }
    });
    this.props.dispatch({
      type: 'baseUser/fetchCurrent',
    });
  }
  componentWillUnmount() {
    this.oopWebSocket && this.oopWebSocket.disconnect();
  }
  getPageTitle() {
    const { location, routerData } = this.props;
    const menuData = getMenuData();
    const { pathname, search } = location;
    let path = pathname;
    if (specialPaths.includes(path)) {
      path = `${path}${search}`;
    }
    let title = properties.appName;
    const item = menuData.find(it=>it.route === path);
    if (item !== undefined) {
      title = `${item.name} - ${properties.appName}`;
    } else {
      const router = routerData[path];
      title = (router && router.name) ? router.name : title
    }
    return title;
  }
  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href); // eslint-disable-line

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      return '/main';
    }
    return redirect;
  }
  handleMenuCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
    this.setState({
      marginLeft: isMobile ? 0 : (collapsed ? '80px' : '256px')
    })
  }
  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }
  handleMenuClick = ({ key }) => {
    if (key === 'setting') {
      if (this.props.history.location.pathname === '/setting') return;
      this.props.dispatch(routerRedux.push('/setting'));
      return;
    }
    if (key === 'logout') {
      this.props.dispatch({
        type: 'baseLogin/logout',
      });
      return;
    }
    if (key === 'personalCenter') {
      if (this.props.history.location.pathname === '/personal-center') return;
      this.props.dispatch(routerRedux.push('/personal-center'));
    }
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }
  handleMainClick = ()=>{
    this.props.dispatch(routerRedux.push('/main'));
  }
  handleMsgClick = ()=>{
    if (!webImUrl) {
      message.error('请配置webIM地址！');
      return
    }
    let url = null;
    if (webImUrl.includes('?')) {
      url = `${webImUrl}&`
    } else {
      url = `${webImUrl}?`
    }
    const token = window.localStorage.getItem('proper-auth-login-token');
    url = url.concat(`token=${token}`);
    // 如果没有parent 直接打开页面 否则通知上层打开页面
    if (window.parent === window) {
      window.open(
        url,
        'webImBrowser',
        ''
      );
    } else {
      window.parent.postMessage(url, 'file://');
    }
  }
  getRedirect = (menus) => {
    if (redirectData.length > 0) {
      return redirectData;
    } else {
      menus.forEach((item)=>{
        if (item && item.children) {
          if (item.children[0] && item.children[0].path) {
            redirectData.push({
              from: `/${item.path}`,
              to: `/${item.children[0].path}`,
            });
            item.children.forEach((children) => {
              this.getRedirect(children);
            });
          }
        }
      })
      return redirectData
    }
  }
  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, routerData, match, location, menus
    } = this.props;
    const { showMenusLoading } = this.state;
    // console.log('routerData',routerData);
    const bashRedirect = this.getBashRedirect();
    redirectData = this.getRedirect(menus);
    const routes = getRoutes(match.path, routerData);
    // console.log('routes',routes);
    const layout = (
      <Layout className={styles.placeholder}>
        <div style={this.state.isMobile ? {position: 'relative'} : {position: 'fixed', top: 0, left: 0}}>
          <SiderMenu
            logo={logo}
            // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
            // If you do not have the Authorized parameter
            // you will be forced to jump to the 403 interface without permission
            menuData={menus}
            showMenusLoading={showMenusLoading}
            collapsed={collapsed}
            location={location}
            isMobile={this.state.isMobile}
            onCollapse={this.handleMenuCollapse}
            onClick={this.onclick}
          />
        </div>
        <Layout style={{marginLeft: this.state.marginLeft, transform: 'translate3d(0px, 0px, 0px)', minHeight: '100vh'}}>
          <GlobalHeader
            logo={logo}
            currentUser={currentUser}
            fetchingNotices={fetchingNotices}
            notices={notices}
            collapsed={collapsed}
            isMobile={this.state.isMobile}
            onNoticeClear={this.handleNoticeClear}
            onCollapse={this.handleMenuCollapse}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            onMainClick={this.handleMainClick}
            onMsgClick={this.handleMsgClick}
            location={location}
            menuData={menus} // just for render <GlobalHeader/>
          />
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            <Switch>
              {
                redirectData.map(item =>
                  <Redirect key={item.from} exact from={item.from} to={item.to} />
                )
              }
              {
                routes.map(item =>
                  (
                    <Route
                        key={item.key}
                        path={item.path}
                        component={item.component}
                        exact={item.exact} />
                  )
                )
              }
              {
                routes.length && bashRedirect && <Redirect exact from="/" to={bashRedirect} />
              }
              {
                routes.length && <Route render={NotFound} />
              }
            </Switch>
          </Content>
          <GlobalFooter
            copyright={
              <div>
                Copyright <Icon type="copyright" /> {properties.footerTitle}
              </div>
            }
          />
        </Layout>
      </Layout>
    );
    return (
      <div>
        <DocumentTitle title={this.getPageTitle()}>
          <ContainerQuery query={query}>
            {params => <div className={classNames(params)}>{layout}</div>}
          </ContainerQuery>
        </DocumentTitle>
        { websocket === true ? <OopWebSocket ref={ (ws) => { this.oopWebSocket = ws }} /> : null}
      </div>
    );
  }
}
