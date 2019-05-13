import React from 'react';
import { Switch, Route } from 'dva/router';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import { Layout, Button, Icon } from 'antd';
import { getUuid } from '@framework/common/oopUtils';
// import VConsole from 'vconsole/dist/vconsole.min.js'
import routers from '@/config/sysRouters';
import { getRouterData } from '../common/frameHelper';
import {getParamObj, isApp, isAndroid} from '../utils/utils';
import NotFound from '../components/Exception/404';
import styles from './WebAppLayout.less';

// eslint-disable-next-line
// const vConsole = new VConsole();
const { Content } = Layout;
const webappRouters = Object.keys(routers).map(it=>routers[it].main && it).filter(i=>i !== undefined);
const handleBack = (props)=>{
  // console.log(JSON.stringify(props));
  const {pathname, search} = props.location;
  // 如果传递了这个参数 说明点击返回的时候调用 关闭当前页面
  if (getParamObj(search).close) {
    console.log('关闭当前页面');
    handleCloseBrowser();
    return;
  }
  // 如果webappRouters中包含当前的页面说明是主页 点击返回等于点击 handleHome
  if (webappRouters.includes(pathname)) {
    console.log('主页');
    handleHome();
    return;
  }
  console.log('history.go(-1);')
  history.go(-1);
}
const handleHome = ()=>{
  // 通知上层window此页面为h5的主页 root会触发返回按钮为原生的back事件
  window.parent.postMessage('back', '*');
  window.localStorage.setItem('If_Can_Back', 'back');
}
const handleCloseBrowser = ()=>{
  // 通知上层window关闭当前浏览器
  window.parent.postMessage('close', '*');
  window.localStorage.setItem('If_Can_Back', 'close');
}
const handleChooseImage = (opt, callback)=>{
  // 通知上层window打开手机原生相机或者相册 目前只有安卓下
  const type = 'chooseImage';
  const eventId = `${type}_${getUuid(5)}`;
  opt.type = type;
  opt.id = eventId;
  registerEventQueue(eventId, callback);
  window.parent.postMessage(opt, '*');
}

const queue = {};
const registerEventQueue = (eventId, fn)=>{
  queue[eventId] = fn;
}
const getCallback = (eventId)=>{
  return queue[eventId];
}
const clearCallback = (eventId)=>{
  delete queue[eventId];
}
const messageHandle = (event)=>{
  const {data: {data, id}} = event;
  const fn = getCallback(id);
  if (fn) {
    fn(data);
    setTimeout(()=>{
      clearCallback(id);
    });
  }
}

const Header = (props)=>{
  const {leftButton, rightButton} = props;
  return (
    <div className={`${styles.header} ${isAndroid() ? styles.android : ''}`}>
      <Button type="default" ghost className={styles.backBtn} onClick={leftButton.onClick}>
        <Icon type={leftButton.icon} style={{fontWeight: 'bold'}} />{leftButton.text}
      </Button>
      <h3 className={styles.title}>{props.title}</h3>
      <Button type="default" ghost className={styles.homeBtn} onClick={rightButton.onClick}>
        <Icon type={rightButton.icon} style={{fontSize: '24px'}} />{rightButton.text}
      </Button>
    </div>)
}

@connect()
export default class WebAppLayout extends React.PureComponent {
  static childContextTypes = {
    setHeader: PropTypes.func,
    resetHeader: PropTypes.func,
    goHome: PropTypes.func,
    closeBrowser: PropTypes.func,
    goBack: PropTypes.func,
    chooseImage: PropTypes.func,
  }
  header = {
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
  getChildContext() {
    return {
      chooseImage: (opt, callback)=>{
        handleChooseImage(opt, callback);
      },
      setHeader: (header)=> {
        this.setState({
          header: {
            ...this.state.header,
            ...header
          }
        });
      },
      resetHeader: ()=>{
        this.setState({
          header: {
            ...this.header
          }
        });
      },
      goHome: ()=> {
        handleHome()
      },
      closeBrowser: ()=>{
        handleCloseBrowser();
      },
      goBack: ()=>{
        handleBack(this.props);
      }
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      header: {
        ...this.header
      }
    }
  }
  componentWillMount() {
    window.localStorage.setItem('If_Can_Back', '');
    // window.localStorage.setItem('pea_dynamic_request_prefix', 'https://icmp2.propersoft.cn/icmp/server-dev');
    if (this.props.location.search) {
      const transParams = getParamObj(this.props.location.search);
      if (transParams) {
        if (transParams.token) {
          window.localStorage.setItem('proper-auth-login-token', transParams.token);
        }
        // if (transParams.serviceKey) {
        //   window.localStorage.setItem('proper-auth-service-key', transParams.serviceKey);
        // }
      }
    }
    window.addEventListener('message', messageHandle, false);
  }
  componentWillUnmount() {
    window.removeEventListener('message', messageHandle);
  }
  renderHeader = ()=>{
    const hideHeader = getParamObj(this.props.location.search).hideHeader === 'true';
    // 如果传递了hideHeader 那么把左侧和右侧的图标 隐藏掉
    const {header: {title, headerLeftButton, headerRightButton}} = this.state;
    let hfb = headerLeftButton;
    let hrb = headerRightButton;
    if (hideHeader) {
      hfb = {
        text: '',
        icon: '',
        onClick: ()=>{}
      };
      hrb = {
        text: '',
        icon: '',
        onClick: ()=>{}
      }
    }
    return isApp() ?
      (<Header title={title} leftButton={hfb} rightButton={hrb} />)
      : null
  }
  render() {
    const routerData = getRouterData();
    return (
      <div className={styles.webAppContainer}>
        {this.renderHeader()}
        <Layout style={{paddingTop: this.state.hideHeader ? 0 : (isApp() ? 44 : 0)}}>
          <Content>
            <Switch>
              { // 路径为‘/webapp/*’的页面会被 默认认为是H5的页面 自动加载到WebAppLayout下
                Object.keys(routerData).map(it=>((it.includes('/webapp/')) ?
                  (<Route key={it} exact path={it} component={routerData[it].component} />) : null)
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
