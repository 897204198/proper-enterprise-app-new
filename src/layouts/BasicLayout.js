import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Layout, Icon, message } from 'antd';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../modules/Base/pages/404';
import { getRoutes } from '../utils/utils';
import logo from '../assets/logo.svg';
import {inject} from '../common/inject';
import styles from './BasicLayout.less'

const { Content } = Layout;
let redirectData = [];
/**
 * 根据菜单取得重定向地址.
 */
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

@inject(['baseUser', 'baseLogin'])
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
  }
  state = {
    isMobile,
    marginLeft: '256px'
  };

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
    };
  }
  componentDidMount() {
    enquireScreen((mobile) => {
      this.setState({
        isMobile: mobile,
      });
    });
    // 从localStorage里查看是否有token
    if (!window.localStorage.getItem('proper-auth-login-token')) {
      this.props.dispatch({
        type: 'baseLogin/logout'
      })
      return
    }
    // 从后台数据库加载菜单并且 按照菜单格式组装路由
    this.props.dispatch({
      type: 'baseUser/fetchMenus',
      payload: this.props.app
    });
    this.props.dispatch({
      type: 'baseUser/fetchCurrent',
    });
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Proper Enterprise App';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Proper Enterprise App`;
    }
    return title;
  }
  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

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
    if (key === 'triggerError') {
      this.props.dispatch(routerRedux.push('/exception/trigger-exception'));
      return;
    }
    if (key === 'logout') {
      this.props.dispatch({
        type: 'baseLogin/logout',
      });
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
  };

  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, routerData, match, location, menus
    } = this.props;
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
            // links={[{
            //   key: 'Pro 首页',
            //   title: 'Pro 首页',
            //   href: 'http://pro.ant.design',
            //   blankTarget: true,
            // }, {
            //   key: 'github',
            //   title: <Icon type="github" />,
            //   href: 'https://github.com/ant-design/ant-design-pro',
            //   blankTarget: true,
            // }, {
            //   key: 'Ant Design',
            //   title: 'Ant Design',
            //   href: 'http://ant.design',
            //   blankTarget: true,
            // }]}
            copyright={
              <div>
                Copyright <Icon type="copyright" /> 2018 普日软件技术有限公司
              </div>
            }
          />
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}
