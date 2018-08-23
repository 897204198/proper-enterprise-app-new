import React from 'react';
import { Switch, Route } from 'dva/router';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import { Layout, Button, Icon } from 'antd';
import { getRouterData } from '../common/frameHelper';
import {getParamObj} from '../utils/utils';
import NotFound from '../components/Exception/404';
import routers from '../../config/sysRouters';
import styles from './WebAppLayout.less';

const { Content } = Layout;
const webappRouters = Object.keys(routers).map(it=>routers[it].main && it).filter(i=>i !== undefined);
const handleBack = (props)=>{
  const {pathname} = props.location;
  // 如果webappRouters中包含当前的页面说明是主页 点击返回等于点击 handleHome
  if (webappRouters.includes(pathname)) {
    handleHome();
    return;
  }
  history.go(-1);
}
const handleHome = ()=>{
  // 通知上层window此页面为h5的主页 root会触发返回按钮为原生的back事件
  window.parent.postMessage('back', '*');
  window.localStorage.setItem('If_Can_Back', 'back');
}
const Header = (props)=>{
  const {leftButton, rightButton} = props;
  return (
    <div className={styles.header}>
      <Button type="primary" ghost className={styles.backBtn} onClick={leftButton.onClick}>
        <Icon type={leftButton.icon} style={{fontWeight: 'bold'}} />{leftButton.text}
      </Button>
      <h3 className={styles.title}>{props.title}</h3>
      <Button type="primary" ghost className={styles.homeBtn} onClick={rightButton.onClick}>
        <Icon type={rightButton.icon} style={{fontSize: '24px'}} />{rightButton.text}
      </Button>
    </div>)
}

@connect()
export default class WebAppLayout extends React.PureComponent {
  static childContextTypes = {
    setState: PropTypes.func,
    goHome: PropTypes.func,
  }
  getChildContext() {
    return {
      setState: (state)=> {
        this.setState({
          ...this.state,
          ...state
        });
      },
      goHome: ()=> {
        handleHome()
      },
    };
  }
  state = {
    title: decodeURIComponent(getParamObj(this.props.location.search).title),
    headerLeftButton: {
      text: '返回',
      icon: 'left',
      onClick: ()=>{
        handleBack(this.props);
      }
    },
    headerRightButton: {
      text: '',
      icon: 'home',
      onClick: handleHome
    },
  }
  isAndroid = ()=>{
    const {userAgent} = navigator;
    return userAgent.includes('Android') || userAgent.includes('Adr');
  }
  isIOS = ()=>{
    const {userAgent} = navigator;
    return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  }
  isApp = ()=>{
    return this.isIOS() || this.isAndroid()
  }
  componentWillMount() {
    window.localStorage.setItem('If_Can_Back', '');
    // window.localStorage.setItem('pea_dynamic_request_prefix', 'https://icmp2.propersoft.cn/icmp/server-dev');
    if (this.props.location.search) {
      const transParams = getParamObj(this.props.location.search);
      if (transParams && transParams.token) {
        window.localStorage.setItem('proper-auth-login-token', transParams.token);
      }
    }
  }
  render() {
    const routerData = getRouterData();
    return (
      <div className={styles.webAppContainer}>
        {this.isApp() ?
          (<Header title={this.state.title} leftButton={this.state.headerLeftButton} rightButton={this.state.headerRightButton} />)
        : null}
        <Layout style={{paddingTop: this.isApp() ? 44 : 0}}>
          <Content>
            <Switch>
              { // 路径为‘/webapp/*’的页面会被 默认认为是H5的页面 自动加载到WebAppLayout下
                Object.keys(routerData).map(it=>((it.includes('/webapp/')) ?
                  (<Route key={it} exact path={it} component={routerData[it].component} a={123} />) : null)
                )
              }
              <Route render={NotFound} />
            </Switch>
          </Content>
        </Layout>
      </div>
    );
  }
}
